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
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
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

		// 2. Meta values containing upload URLs
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$meta_rows = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT meta_value FROM {$wpdb->postmeta}
				WHERE meta_value LIKE %s
				AND meta_value != ''",
				'%' . $wpdb->esc_like( '/wp-content/uploads/' ) . '%'
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

		// 3. WooCommerce product gallery — with product title
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$gallery_rows = $wpdb->get_results(
			"SELECT pm.post_id, pm.meta_value, p.post_title
			FROM {$wpdb->postmeta} pm
			INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
			WHERE pm.meta_key = '_product_image_gallery'
			AND pm.meta_value != ''
			AND p.post_status != 'trash'"
		);

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

		return array(
			'ids'          => array_unique( array_filter( array_map( 'absint', $ids ) ) ),
			'urls'         => array_unique( array_filter( $urls ) ),
			'id_locations' => $id_locations,
			'url_post_map' => $url_post_map,
		);
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
			$unserialized = maybe_unserialize( $string );
			$string       = is_string( $unserialized ) ? $unserialized : wp_json_encode( $unserialized );
		}

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
			$unserialized = maybe_unserialize( $string );
			$string       = wp_json_encode( $unserialized );
		}

		if ( preg_match_all( '#"id"\s*:\s*(\d+)#', $string, $matches ) ) {
			$ids = array_merge( $ids, $matches[1] );
		}

		return $ids;
	}
}
