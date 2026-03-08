<?php
/**
 * wp_options scanner.
 *
 * Scans widgets, theme customizer, and options for media references.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Options_Scanner
 */
class WPMP_Options_Scanner {

	/**
	 * Build set of attachment IDs and URLs found in wp_options.
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

		// 1. Options containing upload URLs (exclude transients)
		$option_rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT option_name, option_value FROM {$wpdb->options}
				WHERE option_value LIKE %s
				AND option_name NOT LIKE %s
				AND option_name NOT LIKE %s",
				'%' . $wpdb->esc_like( '/wp-content/uploads/' ) . '%',
				$wpdb->esc_like( '_transient' ) . '%',
				$wpdb->esc_like( '_site_transient' ) . '%'
			)
		);

		foreach ( $option_rows as $row ) {
			$is_widget = strpos( $row->option_name, 'widget_' ) === 0;
			$location  = $is_widget
				? array( 'type' => 'widget', 'label' => 'Widget Area' )
				: array( 'type' => 'options', 'label' => 'Site Options (' . esc_html( $row->option_name ) . ')' );

			$extracted_urls = self::extract_urls( $row->option_value );
			$extracted_ids  = self::extract_ids( $row->option_value );
			$urls = array_merge( $urls, $extracted_urls );
			$ids  = array_merge( $ids, $extracted_ids );

			foreach ( $extracted_urls as $url ) {
				if ( ! isset( $url_post_map[ $url ] ) ) {
					$url_post_map[ $url ] = array();
				}
				$url_post_map[ $url ][] = $location;
			}
			foreach ( $extracted_ids as $att_id ) {
				$att_id = (int) $att_id;
				if ( $att_id > 0 ) {
					if ( ! isset( $id_locations[ $att_id ] ) ) {
						$id_locations[ $att_id ] = array();
					}
					$id_locations[ $att_id ][] = $location;
				}
			}
		}

		// 2. Theme mods (customizer)
		$theme_mod_rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT option_name, option_value FROM {$wpdb->options}
				WHERE option_name LIKE %s
				AND option_value LIKE %s",
				$wpdb->esc_like( 'theme_mods_' ) . '%',
				'%' . $wpdb->esc_like( '/wp-content/uploads/' ) . '%'
			)
		);

		foreach ( $theme_mod_rows as $row ) {
			$location        = array( 'type' => 'theme_customizer', 'label' => 'Theme Customizer' );
			$extracted_urls  = self::extract_urls( $row->option_value );
			$extracted_ids   = self::extract_ids( $row->option_value );
			$urls = array_merge( $urls, $extracted_urls );
			$ids  = array_merge( $ids, $extracted_ids );

			foreach ( $extracted_urls as $url ) {
				if ( ! isset( $url_post_map[ $url ] ) ) {
					$url_post_map[ $url ] = array();
				}
				$url_post_map[ $url ][] = $location;
			}
			foreach ( $extracted_ids as $att_id ) {
				$att_id = (int) $att_id;
				if ( $att_id > 0 ) {
					if ( ! isset( $id_locations[ $att_id ] ) ) {
						$id_locations[ $att_id ] = array();
					}
					$id_locations[ $att_id ][] = $location;
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
	 * Extract URLs from option value.
	 *
	 * @param string $value Option value.
	 * @return string[]
	 */
	private static function extract_urls( $value ) {
		$urls = array();

		if ( is_serialized( $value ) ) {
			$value = wp_json_encode( @unserialize( $value ) );
		}

		if ( preg_match_all( '#(https?://[^"\'\s]+/wp-content/uploads/[^"\'\s]+)#i', $value, $matches ) ) {
			$urls = $matches[1];
		}
		if ( preg_match_all( '#(/wp-content/uploads/[^"\'\s\)]+)#i', $value, $matches ) ) {
			$urls = array_merge( $urls, $matches[1] );
		}

		return $urls;
	}

	/**
	 * Extract attachment IDs from option value.
	 *
	 * @param string $value Option value.
	 * @return int[]
	 */
	private static function extract_ids( $value ) {
		$ids = array();

		if ( is_serialized( $value ) ) {
			$value = wp_json_encode( @unserialize( $value ) );
		}

		if ( preg_match_all( '#"attachment_id"|"id"\s*:\s*(\d+)#', $value, $matches ) ) {
			if ( ! empty( $matches[1] ) ) {
				$ids = $matches[1];
			}
		}

		return $ids;
	}
}
