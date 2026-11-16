<?php
/**
 * Main scan orchestrator.
 *
 * Coordinates all scanners, builds reference set, and writes results.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Scanner
 */
class WPMP_Scanner {

	/**
	 * Run full scan.
	 * Builds rich "used_in" data showing exactly WHERE each file is referenced.
	 */
	public static function run() {
		if ( function_exists( 'set_time_limit' ) ) {
			set_time_limit( 0 );
		}
		set_transient( 'wpmp_scan_running', true, 3600 );
		set_transient( 'wpmp_scan_progress', 0, 3600 );

		global $wpdb;

		require_once WPMP_PLUGIN_DIR . 'scanner/class-wpmp-content-scanner.php';
		require_once WPMP_PLUGIN_DIR . 'scanner/class-wpmp-meta-scanner.php';
		require_once WPMP_PLUGIN_DIR . 'scanner/class-wpmp-options-scanner.php';
		require_once WPMP_PLUGIN_DIR . 'scanner/class-wpmp-pagebuilder-scanner.php';

		$table_results = $wpdb->prefix . 'wpmp_scan_results';
		$table_log     = $wpdb->prefix . 'wpmp_scan_log';

		// Log scan start.
		$wpdb->insert(
			$table_log,
			array(
				'trigger_type' => 'manual',
				'status'       => 'running',
			),
			array( '%s', '%s' )
		);
		$scan_log_id = $wpdb->insert_id;

		// --- Build reference sets from all scanners (with phase tracking) ---
		set_transient( 'wpmp_scan_phase', 'content', 3600 );
		set_transient( 'wpmp_scan_progress', 5, 3600 );
		$content_refs = WPMP_Content_Scanner::get_references();

		set_transient( 'wpmp_scan_phase', 'meta', 3600 );
		set_transient( 'wpmp_scan_progress', 20, 3600 );
		$meta_refs = WPMP_Meta_Scanner::get_references();

		set_transient( 'wpmp_scan_phase', 'options', 3600 );
		set_transient( 'wpmp_scan_progress', 35, 3600 );
		$options_refs = WPMP_Options_Scanner::get_references();

		set_transient( 'wpmp_scan_phase', 'builder', 3600 );
		set_transient( 'wpmp_scan_progress', 50, 3600 );
		$pagebuilder_refs = WPMP_PageBuilder_Scanner::get_references();

		set_transient( 'wpmp_scan_phase', 'writing', 3600 );
		set_transient( 'wpmp_scan_progress', 60, 3600 );

		// Flat reference sets for quick "is used" checks.
		$reference_ids  = array_unique(
			array_merge(
				$content_refs['ids'],
				$meta_refs['ids'],
				$options_refs['ids'],
				$pagebuilder_refs['ids']
			)
		);
		$reference_urls = array_unique(
			array_merge(
				$content_refs['urls'],
				$meta_refs['urls'],
				$options_refs['urls'],
				$pagebuilder_refs['urls']
			)
		);

		// Rich location maps: attachment_id → [ location_data, ... ].
		$id_locations = self::merge_location_maps(
			$content_refs['id_locations'],
			$meta_refs['id_locations'],
			$options_refs['id_locations'],
			$pagebuilder_refs['id_locations']
		);

		// URL → location map: url → [ location_data, ... ].
		$url_post_map = self::merge_location_maps(
			$content_refs['url_post_map'],
			$meta_refs['url_post_map'],
			$options_refs['url_post_map'],
			$pagebuilder_refs['url_post_map']
		);

		// --- Fetch all attachment IDs in batches to protect memory on large libraries ---
		$batch_size  = max( 100, (int) WPMP_Settings::get( 'batch_size', 200 ) );
		$offset      = 0;
		$attachments = array();

		do {
			$batch       = get_posts(
				array(
					'post_type'      => 'attachment',
					'post_status'    => 'any',
					'posts_per_page' => $batch_size,
					'offset'         => $offset,
					'fields'         => 'ids',
					'orderby'        => 'ID',
					'order'          => 'ASC',
				)
			);
			$attachments = array_merge( $attachments, $batch );
			$offset     += $batch_size;
			$batch_count = count( $batch );
		} while ( $batch_count === $batch_size );

		// Index referenced upload paths once, so each attachment is a quick lookup.
		$upload_dir      = wp_get_upload_dir();
		$uploads_path    = (string) wp_parse_url( $upload_dir['baseurl'], PHP_URL_PATH );
		$reference_paths = array();
		$reference_stems = array();
		foreach ( $reference_urls as $ref_url ) {
			$rel_path = self::upload_relative_path( $ref_url, $uploads_path );
			if ( '' === $rel_path ) {
				continue;
			}
			if ( ! isset( $reference_paths[ $rel_path ] ) ) {
				$reference_paths[ $rel_path ] = $ref_url;
			}
			$stem = self::file_stem( $rel_path );
			if ( ! isset( $reference_stems[ $stem ] ) ) {
				$reference_stems[ $stem ] = $ref_url;
			}
		}

		$total         = count( $attachments );
		$recent_days   = (int) WPMP_Settings::get( 'recent_upload_days', 30 );
		$skip_recent   = (bool) WPMP_Settings::get( 'skip_recent', true );
		$cutoff_date   = strtotime( "-{$recent_days} days" );
		$unused_count  = 0;
		$exclude_types = array_map( 'strtolower', (array) WPMP_Settings::get( 'exclude_file_types', array() ) );

		// Preserve whitelisted IDs — these are NEVER cleared.
		$whitelist_rows  = $wpdb->get_col( $wpdb->prepare( "SELECT attachment_id FROM {$table_results} WHERE status = %s", 'whitelisted' ) );
		$whitelisted_ids = array_map( 'absint', array_filter( (array) $whitelist_rows ) );

		// Delete only non-whitelisted previous results. This protects data if the scan
		// fails partway through — whitelisted items survive and old results remain until
		// replaced, preventing a complete data wipe on crash.
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$table_results} WHERE status != %s",
				'whitelisted'
			)
		);

		foreach ( $attachments as $index => $attachment_id ) {
			// Update progress every 5 items — maps scan progress from 60% to 100%.
			if ( 0 === $index % 5 || $index === $total - 1 ) {
				$progress = $total > 0 ? 60 + (int) ( ( $index + 1 ) / $total * 40 ) : 100;
				set_transient( 'wpmp_scan_progress', min( $progress, 100 ), 3600 );
			}

			$file_path = get_attached_file( $attachment_id );
			if ( ! $file_path || ! file_exists( $file_path ) ) {
				continue;
			}

			// Skip excluded file types.
			$file_ext = strtolower( pathinfo( $file_path, PATHINFO_EXTENSION ) );
			if ( ! empty( $exclude_types ) && in_array( $file_ext, $exclude_types, true ) ) {
				continue;
			}

			$file_url  = wp_get_attachment_url( $attachment_id );
			$file_size = filesize( $file_path );
			$mime_type = (string) get_post_mime_type( $attachment_id );
			$uploaded  = get_post_time( 'U', false, $attachment_id );
			$used_in   = array();
			$is_used   = false;

			// --- Safety checks (mark used to protect from deletion) ---

			// 1. User-whitelisted files
			if ( in_array( (int) $attachment_id, $whitelisted_ids, true ) ) {
				$is_used   = true;
				$used_in[] = array(
					'type'  => 'whitelisted',
					'label' => 'Whitelisted by user',
				);
			}

			// 2. Recently uploaded (may not be published yet)
			if ( ! $is_used && $skip_recent && $recent_days > 0 && $uploaded >= $cutoff_date ) {
				$is_used   = true;
				$used_in[] = array(
					'type'  => 'recent_upload',
					'label' => 'Recently uploaded',
				);
			}

			// --- Check by attachment ID ---
			if ( ! $is_used && in_array( (int) $attachment_id, $reference_ids, true ) ) {
				$is_used = true;
				if ( isset( $id_locations[ (int) $attachment_id ] ) ) {
					$used_in = array_merge( $used_in, $id_locations[ (int) $attachment_id ] );
				}
			}

			// --- Check by URL (and thumbnail variants) ---
			if ( ! $is_used && $file_url ) {
				foreach ( $reference_urls as $ref_url ) {
					if ( self::url_matches( $file_url, $ref_url ) ) {
						$is_used = true;
						if ( isset( $url_post_map[ $ref_url ] ) ) {
							$used_in = array_merge( $used_in, $url_post_map[ $ref_url ] );
						}
						break;
					}
				}
			}

			// --- Check every file that belongs to this attachment ---
			// The original upload, each generated size, the pre-scaled/rotated
			// original and edited copies. A hit on any of them keeps them all.
			if ( ! $is_used ) {
				$ref_url = self::find_referenced_variant( (int) $attachment_id, $reference_paths, $reference_stems );
				if ( null !== $ref_url ) {
					$is_used = true;
					if ( isset( $url_post_map[ $ref_url ] ) ) {
						$used_in = array_merge( $used_in, $url_post_map[ $ref_url ] );
					} else {
						$used_in[] = array(
							'type'  => 'thumbnail',
							'label' => 'Used as image size variant',
						);
					}
				}
			}

			// Deduplicate location entries.
			$used_in = self::deduplicate_locations( $used_in );

			$status = $is_used ? 'used' : 'unused';
			if ( in_array( (int) $attachment_id, $whitelisted_ids, true ) ) {
				$status = 'whitelisted';
			}
			if ( 'unused' === $status ) {
				$unused_count++;
			}

			$wpdb->insert(
				$table_results,
				array(
					'attachment_id' => $attachment_id,
					'file_path'     => substr( $file_path, 0, 512 ),
					'file_size'     => (int) $file_size,
					'mime_type'     => substr( $mime_type, 0, 100 ),
					'status'        => $status,
					'used_in'       => wp_json_encode( $used_in ),
					'file_hash'     => md5_file( $file_path ),
				),
				array( '%d', '%s', '%d', '%s', '%s', '%s', '%s' )
			);
		}

		// Update scan log.
		$wpdb->update(
			$table_log,
			array(
				'scan_completed' => current_time( 'mysql' ),
				'total_files'    => $total,
				'unused_found'   => $unused_count,
				'status'         => 'completed',
			),
			array( 'id' => $scan_log_id ),
			array( '%s', '%d', '%d', '%s' ),
			array( '%d' )
		);

		update_option( 'wpmp_scan_last_run', current_time( 'mysql' ) );
		set_transient( 'wpmp_scan_phase', 'done', 60 );
		delete_transient( 'wpmp_scan_running' );
		delete_transient( 'wpmp_scan_progress' );
	}

	/**
	 * Find a reference to any file that belongs to an attachment.
	 *
	 * Matches, in this order:
	 * 1. the exact path (relative to the uploads folder) of the original upload,
	 *    any generated size from the metadata, the original_image kept before
	 *    "-scaled"/"-rotated", or an edited copy from the backup sizes;
	 * 2. the same file name stem in the same folder, once size and edit
	 *    suffixes (-300x200, -scaled, -rotated, -e1234567890) are removed. This
	 *    covers size files that are still on disk and in content but no longer
	 *    listed in the metadata (for example after thumbnails were regenerated).
	 *
	 * Other files that merely share the folder do not count.
	 *
	 * @param int   $attachment_id   Attachment ID.
	 * @param array $reference_paths Relative path => reference URL.
	 * @param array $reference_stems Folder/stem => reference URL.
	 * @return string|null The reference URL that matched, or null.
	 */
	private static function find_referenced_variant( $attachment_id, $reference_paths, $reference_stems ) {
		if ( empty( $reference_paths ) ) {
			return null;
		}

		$attached = (string) get_post_meta( $attachment_id, '_wp_attached_file', true );
		if ( '' === $attached ) {
			return null;
		}

		$dir   = dirname( $attached );
		$dir   = ( '.' === $dir || '' === $dir ) ? '' : trailingslashit( $dir );
		$files = array( $attached );

		$metadata = wp_get_attachment_metadata( $attachment_id );
		if ( is_array( $metadata ) ) {
			if ( ! empty( $metadata['file'] ) && is_string( $metadata['file'] ) ) {
				$files[] = $metadata['file'];
			}
			if ( ! empty( $metadata['original_image'] ) && is_string( $metadata['original_image'] ) ) {
				$files[] = $dir . $metadata['original_image'];
			}
			if ( ! empty( $metadata['sizes'] ) && is_array( $metadata['sizes'] ) ) {
				foreach ( $metadata['sizes'] as $size ) {
					if ( is_array( $size ) && ! empty( $size['file'] ) && is_string( $size['file'] ) ) {
						$files[] = $dir . $size['file'];
					}
				}
			}
		}

		$backup_sizes = get_post_meta( $attachment_id, '_wp_attachment_backup_sizes', true );
		if ( is_array( $backup_sizes ) ) {
			foreach ( $backup_sizes as $backup ) {
				if ( is_array( $backup ) && ! empty( $backup['file'] ) && is_string( $backup['file'] ) ) {
					$files[] = $dir . $backup['file'];
				}
			}
		}

		$stems = array();
		foreach ( $files as $file ) {
			$file = strtolower( ltrim( wp_normalize_path( $file ), '/' ) );
			if ( isset( $reference_paths[ $file ] ) ) {
				return $reference_paths[ $file ];
			}
			$stems[ self::file_stem( $file ) ] = true;
		}

		foreach ( array_keys( $stems ) as $stem ) {
			if ( isset( $reference_stems[ $stem ] ) ) {
				return $reference_stems[ $stem ];
			}
		}

		return null;
	}

	/**
	 * Turn a referenced URL or path into a lowercase path relative to the uploads folder.
	 *
	 * Handles full, protocol-relative and root-relative URLs, query strings,
	 * URL-encoded names, JSON-escaped slashes and srcset leftovers.
	 *
	 * @param string $url          Referenced URL or path.
	 * @param string $uploads_path Path part of the uploads base URL.
	 * @return string Relative path, or '' when it is not inside uploads.
	 */
	private static function upload_relative_path( $url, $uploads_path ) {
		$url = str_replace( '\\/', '/', trim( (string) $url ) );
		$url = preg_replace( '#[?\#].*$#', '', $url );
		$url = rtrim( $url, ',' );

		$path = wp_parse_url( $url, PHP_URL_PATH );
		$path = rawurldecode( is_string( $path ) ? $path : $url );
		$path = wp_normalize_path( $path );

		$base = untrailingslashit( wp_normalize_path( rawurldecode( $uploads_path ) ) ) . '/';
		$pos  = '/' !== $base ? stripos( $path, $base ) : false;
		if ( false !== $pos ) {
			$relative = substr( $path, $pos + strlen( $base ) );
		} else {
			$pos = stripos( $path, '/wp-content/uploads/' );
			if ( false === $pos ) {
				return '';
			}
			$relative = substr( $path, $pos + strlen( '/wp-content/uploads/' ) );
		}

		return strtolower( ltrim( $relative, '/' ) );
	}

	/**
	 * Folder plus file name without extension and without WordPress size or edit suffixes.
	 *
	 * Example: 2026/11/photo-1024x768.webp and 2026/11/photo-scaled.jpg both give 2026/11/photo.
	 *
	 * @param string $relative_path Lowercase path relative to uploads.
	 * @return string
	 */
	private static function file_stem( $relative_path ) {
		$dir  = dirname( $relative_path );
		$name = pathinfo( $relative_path, PATHINFO_FILENAME );

		do {
			$previous = $name;
			$name     = preg_replace( '#-(?:\d+x\d+|scaled|rotated|e\d{10,})$#', '', $name );
		} while ( $name !== $previous && '' !== $name );

		return ( '.' === $dir ? '' : $dir . '/' ) . $name;
	}

	/**
	 * Merge multiple location maps (id/url → [locations]) together.
	 *
	 * @param array ...$maps Maps to merge.
	 * @return array
	 */
	private static function merge_location_maps( ...$maps ) {
		$result = array();
		foreach ( $maps as $map ) {
			if ( ! is_array( $map ) ) {
				continue;
			}
			foreach ( $map as $key => $locs ) {
				if ( ! isset( $result[ $key ] ) ) {
					$result[ $key ] = array();
				}
				$result[ $key ] = array_merge( $result[ $key ], (array) $locs );
			}
		}
		return $result;
	}

	/**
	 * Remove duplicate location entries (same type + post_id).
	 *
	 * @param array $locations Raw location array.
	 * @return array
	 */
	private static function deduplicate_locations( $locations ) {
		$seen   = array();
		$result = array();
		foreach ( $locations as $loc ) {
			if ( ! is_array( $loc ) ) {
				continue;
			}
			$key = ( $loc['type'] ?? '' ) . '|' . ( $loc['post_id'] ?? '' ) . '|' . ( $loc['label'] ?? '' );
			if ( ! isset( $seen[ $key ] ) ) {
				$seen[ $key ] = true;
				$result[]     = $loc;
			}
		}
		return $result;
	}

	/**
	 * Check if attachment URL matches reference URL.
	 *
	 * @param string $file_url   Attachment URL.
	 * @param string $ref_url    Reference URL from content.
	 * @return bool
	 */
	private static function url_matches( $file_url, $ref_url ) {
		$file_url = untrailingslashit( $file_url );
		$ref_url  = untrailingslashit( $ref_url );

		if ( $file_url === $ref_url ) {
			return true;
		}

		// Relative URL.
		if ( 0 === strpos( $ref_url, '/' ) ) {
			$parsed = wp_parse_url( $file_url );
			$path   = isset( $parsed['path'] ) ? $parsed['path'] : '';
			return strpos( $path, $ref_url ) !== false || $path === $ref_url;
		}

		return strpos( $ref_url, $file_url ) !== false || strpos( $file_url, $ref_url ) !== false;
	}
}
