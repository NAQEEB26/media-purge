<?php
/**
 * Post meta scanner.
 *
 * Scans _thumbnail_id and custom fields for attachment references.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Meta_Scanner
 */
class WPMP_Meta_Scanner {

	/**
	 * Meta keys that usually hold a media attachment ID (MySQL REGEXP).
	 */
	const MEDIA_KEY_PATTERN = '(image|img|photo|picture|logo|icon|banner|background|thumb|gallery|media|attachment|avatar|cover|file|video|audio|pdf|document)';

	/**
	 * Build set of attachment IDs and URLs found in post meta.
	 * Includes rich location data for "Used In" display.
	 *
	 * @return array{ids: int[], urls: string[], id_locations: array, url_post_map: array}
	 */
	public static function get_references() {
		global $wpdb;

		$ids          = array();
		$urls         = array();
		$id_locations = array();
		$url_post_map = array();

		// 1. Featured images — join to get post title in one query
		$thumbnail_rows = $wpdb->get_results(
			"SELECT pm.post_id, pm.meta_value, p.post_title
			FROM {$wpdb->postmeta} pm
			INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
			WHERE pm.meta_key = '_thumbnail_id'
			AND pm.meta_value != ''
			AND pm.meta_value REGEXP '^[0-9]+$'
			AND p.post_status != 'trash'"
		);

		foreach ( $thumbnail_rows as $row ) {
			$att_id = (int) $row->meta_value;
			if ( $att_id > 0 ) {
				$ids[] = $att_id;
				if ( ! isset( $id_locations[ $att_id ] ) ) {
					$id_locations[ $att_id ] = array();
				}
				$id_locations[ $att_id ][] = array(
					'type'       => 'featured_image',
					'post_id'    => (int) $row->post_id,
					'post_title' => $row->post_title ? $row->post_title : '(no title)',
				);
			}
		}

		// 2. Meta values containing upload URLs (plain or JSON-escaped).
		$meta_rows = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT meta_value FROM {$wpdb->postmeta}
				WHERE ( meta_value LIKE %s OR meta_value LIKE %s )
				AND meta_value != ''",
				'%' . $wpdb->esc_like( '/wp-content/uploads/' ) . '%',
				'%' . $wpdb->esc_like( '\\/wp-content\\/uploads\\/' ) . '%'
			)
		);

		foreach ( $meta_rows as $value ) {
			$extracted_urls = self::extract_urls_from_string( $value );
			$extracted_ids  = self::extract_ids_from_string( $value );
			$urls           = array_merge( $urls, $extracted_urls );
			$ids            = array_merge( $ids, $extracted_ids );
			foreach ( $extracted_urls as $url ) {
				if ( ! isset( $url_post_map[ $url ] ) ) {
					$url_post_map[ $url ] = array();
				}
				$url_post_map[ $url ][] = array(
					'type'  => 'post_meta',
					'label' => 'Custom Field / Post Meta',
				);
			}
		}

		// 3. WooCommerce product gallery — with product title. Skipped only when
		// the "Scan WooCommerce galleries" setting is off; product featured
		// images are still read in step 1 either way.
		$gallery_rows = array();
		if ( WPMP_Settings::get( 'scan_woocommerce', true ) ) {
			$gallery_rows = $wpdb->get_results(
				"SELECT pm.post_id, pm.meta_value, p.post_title
				FROM {$wpdb->postmeta} pm
				INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
				WHERE pm.meta_key = '_product_image_gallery'
				AND pm.meta_value != ''
				AND p.post_status != 'trash'"
			);
		}

		foreach ( $gallery_rows as $row ) {
			$gallery_ids = array_filter( array_map( 'absint', explode( ',', $row->meta_value ) ) );
			foreach ( $gallery_ids as $att_id ) {
				if ( $att_id > 0 ) {
					$ids[] = $att_id;
					if ( ! isset( $id_locations[ $att_id ] ) ) {
						$id_locations[ $att_id ] = array();
					}
					$id_locations[ $att_id ][] = array(
						'type'       => 'woocommerce_gallery',
						'post_id'    => (int) $row->post_id,
						'post_title' => $row->post_title ? $row->post_title : '(no title)',
					);
				}
			}
		}

		// 4. Custom fields that store an attachment ID on its own (ACF image, file
		// and gallery fields, theme and plugin options pages saved as post meta).
		// A value counts when its key looks media-related or when ACF has
		// registered the key as a field. Anything matched here is kept as used.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- A scan must read live data.
		$id_meta_rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT pm.post_id, pm.meta_value, p.post_title
				FROM {$wpdb->postmeta} pm
				INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
				WHERE p.post_status != 'trash'
				AND p.post_type != 'attachment'
				AND pm.meta_key NOT IN ('_thumbnail_id', '_product_image_gallery')
				AND pm.meta_key NOT LIKE %s
				AND ( pm.meta_value REGEXP '^[0-9]+(,[0-9]+)*$' OR pm.meta_value LIKE %s )
				AND (
					pm.meta_key REGEXP %s
					OR EXISTS (
						SELECT 1 FROM {$wpdb->postmeta} f
						WHERE f.post_id = pm.post_id
						AND f.meta_key = CONCAT( '_', pm.meta_key )
						AND f.meta_value LIKE %s
					)
				)",
				$wpdb->esc_like( '_wp_' ) . '%',
				'a:%',
				self::MEDIA_KEY_PATTERN,
				$wpdb->esc_like( 'field_' ) . '%'
			)
		);

		foreach ( $id_meta_rows as $row ) {
			foreach ( self::extract_id_list( $row->meta_value ) as $att_id ) {
				$ids[] = $att_id;
				if ( ! isset( $id_locations[ $att_id ] ) ) {
					$id_locations[ $att_id ] = array();
				}
				$id_locations[ $att_id ][] = array(
					'type'       => 'post_meta',
					'post_id'    => (int) $row->post_id,
					'post_title' => $row->post_title ? $row->post_title : '(no title)',
					'label'      => 'Custom Field / Post Meta',
				);
			}
		}

		// 5. Term images (WooCommerce category thumbnails and similar).
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- A scan must read live data.
		$term_rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT tm.meta_value, t.name
				FROM {$wpdb->termmeta} tm
				INNER JOIN {$wpdb->terms} t ON t.term_id = tm.term_id
				WHERE ( tm.meta_value REGEXP '^[0-9]+(,[0-9]+)*$' OR tm.meta_value LIKE %s )
				AND ( tm.meta_key = 'thumbnail_id' OR tm.meta_key REGEXP %s )",
				'a:%',
				self::MEDIA_KEY_PATTERN
			)
		);

		foreach ( $term_rows as $row ) {
			foreach ( self::extract_id_list( $row->meta_value ) as $att_id ) {
				$ids[] = $att_id;
				if ( ! isset( $id_locations[ $att_id ] ) ) {
					$id_locations[ $att_id ] = array();
				}
				$id_locations[ $att_id ][] = array(
					'type'  => 'term_meta',
					'label' => 'Category / Term Image (' . $row->name . ')',
				);
			}
		}

		// 6. User profile images stored by ID (local avatar plugins).
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- A scan must read live data.
		$user_rows = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT meta_value FROM {$wpdb->usermeta}
				WHERE ( meta_value REGEXP '^[0-9]+$' OR meta_value LIKE %s )
				AND meta_key REGEXP %s",
				'a:%',
				'(avatar|photo|picture|profile_image|profile_img)'
			)
		);

		foreach ( $user_rows as $value ) {
			foreach ( self::extract_id_list( $value ) as $att_id ) {
				$ids[] = $att_id;
				if ( ! isset( $id_locations[ $att_id ] ) ) {
					$id_locations[ $att_id ] = array();
				}
				$id_locations[ $att_id ][] = array(
					'type'  => 'user_meta',
					'label' => 'User Profile Image',
				);
			}
		}

		return array(
			'ids'          => array_unique( array_filter( array_map( 'absint', $ids ) ) ),
			'urls'         => array_unique( array_filter( $urls ) ),
			'id_locations' => $id_locations,
			'url_post_map' => $url_post_map,
		);
	}

	/**
	 * Read attachment IDs from a bare ID, a comma list or a serialized array.
	 *
	 * @param string $value Meta value.
	 * @return int[]
	 */
	private static function extract_id_list( $value ) {
		$value = (string) $value;
		$ids   = array();

		if ( is_serialized( $value ) ) {
			// Use allowed_classes=false to block PHP Object Injection via magic methods.
			$data = @unserialize( $value, array( 'allowed_classes' => false ) ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.PHP.DiscouragedPHPFunctions.serialize_unserialize -- Same pattern as the other meta readers; objects are blocked.
			if ( is_array( $data ) ) {
				array_walk_recursive(
					$data,
					function ( $item ) use ( &$ids ) {
						if ( is_int( $item ) || ( is_string( $item ) && ctype_digit( $item ) ) ) {
							$ids[] = (int) $item;
						}
					}
				);
			}
		} elseif ( preg_match( '#^\d+(,\d+)*$#', $value ) ) {
			$ids = array_map( 'intval', explode( ',', $value ) );
		}

		return array_values( array_unique( array_filter( $ids ) ) );
	}

	/**
	 * Extract URLs from a string (serialized or plain).
	 *
	 * @param string $string Meta value.
	 * @return string[]
	 */
	private static function extract_urls_from_string( $string ) {
		$urls = array();

		if ( is_serialized( $string ) ) {
			// Use allowed_classes=false to block PHP Object Injection via magic methods.
			$unserialized = @unserialize( $string, array( 'allowed_classes' => false ) );
			$string       = is_string( $unserialized ) ? $unserialized : wp_json_encode( $unserialized );
		}

		// JSON-encoded values (page builders) escape slashes as \/.
		$string = str_replace( '\\/', '/', (string) $string );

		if ( preg_match_all( '#(https?://[^"\'\s]+/wp-content/uploads/[^"\'\s]+)#i', $string, $matches ) ) {
			$urls = $matches[1];
		}
		if ( preg_match_all( '#(/wp-content/uploads/[^"\'\s\)]+)#i', $string, $matches ) ) {
			$urls = array_merge( $urls, $matches[1] );
		}

		return $urls;
	}

	/**
	 * Extract numeric IDs from a string.
	 *
	 * @param string $string Meta value.
	 * @return int[]
	 */
	private static function extract_ids_from_string( $string ) {
		$ids = array();

		if ( is_serialized( $string ) ) {
			// Use allowed_classes=false to block PHP Object Injection via magic methods.
			$unserialized = @unserialize( $string, array( 'allowed_classes' => false ) );
			$string       = wp_json_encode( $unserialized );
		}

		$ids = array_merge( $ids, WPMP_Content_Scanner::extract_ids_from_text( (string) $string ) );

		return $ids;
	}
}
