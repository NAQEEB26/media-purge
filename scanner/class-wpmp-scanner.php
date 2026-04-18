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
			set_time_limit( 0 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
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

		// Log scan start
		$wpdb->insert(
			$table_log,
			array( 'trigger_type' => 'manual', 'status' => 'running' ),
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

		// Flat reference sets for quick "is used" checks
		$reference_ids = array_unique( array_merge(
			$content_refs['ids'],
			$meta_refs['ids'],
			$options_refs['ids'],
			$pagebuilder_refs['ids']
		) );
		$reference_urls = array_unique( array_merge(
			$content_refs['urls'],
			$meta_refs['urls'],
			$options_refs['urls'],
			$pagebuilder_refs['urls']
		) );

		// Rich location maps: attachment_id → [ location_data, ... ]
		$id_locations = self::merge_location_maps(
			$content_refs['id_locations'],
			$meta_refs['id_locations'],
			$options_refs['id_locations'],
			$pagebuilder_refs['id_locations']
		);

		// URL → location map: url → [ location_data, ... ]
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
			$batch = get_posts( array(
				'post_type'      => 'attachment',
				'post_status'    => 'any',
				'posts_per_page' => $batch_size,
				'offset'         => $offset,
				'fields'         => 'ids',
				'orderby'        => 'ID',
				'order'          => 'ASC',
			) );
			$attachments = array_merge( $attachments, $batch );
			$offset     += $batch_size;
		} while ( count( $batch ) === $batch_size );

		$total        = count( $attachments );
		$recent_days  = (int) WPMP_Settings::get( 'recent_upload_days', 30 );
		$cutoff_date  = strtotime( "-{$recent_days} days" );
		$unused_count = 0;
		$exclude_types = array_map( 'strtolower', (array) WPMP_Settings::get( 'exclude_file_types', array() ) );

		// Preserve whitelisted IDs — these are NEVER cleared.
		$whitelisted_ids = array_map( 'absint', array_filter( (array) $wpdb->get_col(
			$wpdb->prepare( "SELECT attachment_id FROM {$table_results} WHERE status = %s", 'whitelisted' )
		) ) );

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
			// Update progress every 5 items to reduce DB writes
			// Map attachment loop progress from 60% to 100%
			if ( 0 === $index % 5 || $index === $total - 1 ) {
				$progress = $total > 0 ? 60 + (int) ( ( $index + 1 ) / $total * 40 ) : 100;
				set_transient( 'wpmp_scan_progress', min( $progress, 100 ), 3600 );
			}

			$file_path = get_attached_file( $attachment_id );
			if ( ! $file_path || ! file_exists( $file_path ) ) {
				continue;
			}

			// Skip excluded file types
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
				$is_used = true;
				$used_in[] = array( 'type' => 'whitelisted', 'label' => 'Whitelisted by user' );
			}

			// 2. Recently uploaded (may not be published yet)
			if ( ! $is_used && $recent_days > 0 && $uploaded >= $cutoff_date ) {
				$is_used = true;
				$used_in[] = array( 'type' => 'recent_upload', 'label' => 'Recently uploaded' );
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

			// --- Check thumbnails: if any size of this image is referenced, all are used ---
			if ( ! $is_used && $file_url && wp_attachment_is_image( $attachment_id ) ) {
				$metadata = wp_get_attachment_metadata( $attachment_id );
				if ( ! empty( $metadata['file'] ) ) {
					$base_dir = dirname( $file_url );
					foreach ( $reference_urls as $ref_url ) {
						if ( strpos( $ref_url, $base_dir ) !== false ) {
							$is_used = true;
							if ( isset( $url_post_map[ $ref_url ] ) ) {
								$used_in = array_merge( $used_in, $url_post_map[ $ref_url ] );
							} else {
								$used_in[] = array( 'type' => 'thumbnail', 'label' => 'Used as image size variant' );
							}
							break;
						}
					}
				}
			}

			// Deduplicate location entries
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

		// Update scan log
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
	 * Merge multiple location maps (id/url → [locations]) together.
	 *
	 * @param array ...$maps Maps to merge.
	 * @return array
	 */
	private static function merge_location_maps( ...$maps ) {
		$result = array();
		foreach ( $maps as $map ) {
			if ( ! is_array( $map ) ) continue;
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
			if ( ! is_array( $loc ) ) continue;
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

		// Relative URL
		if ( 0 === strpos( $ref_url, '/' ) ) {
			$parsed = wp_parse_url( $file_url );
			$path   = isset( $parsed['path'] ) ? $parsed['path'] : '';
			return strpos( $path, $ref_url ) !== false || $path === $ref_url;
		}

		return strpos( $ref_url, $file_url ) !== false || strpos( $file_url, $ref_url ) !== false;
	}
}
