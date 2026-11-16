<?php
/**
 * Options scanner.
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

		// 1. Options containing upload URLs, plus every widget option, since media,
		// gallery and block widgets can store attachment IDs without a URL
		// (exclude transients).
		$option_rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT option_name, option_value FROM {$wpdb->options}
				WHERE ( option_value LIKE %s OR option_value LIKE %s OR option_name LIKE %s )
				AND option_name NOT LIKE %s
				AND option_name NOT LIKE %s
				AND option_name NOT LIKE %s",
				'%' . $wpdb->esc_like( '/wp-content/uploads/' ) . '%',
				'%' . $wpdb->esc_like( '\\/wp-content\\/uploads\\/' ) . '%',
				$wpdb->esc_like( 'widget_' ) . '%',
				$wpdb->esc_like( '_transient' ) . '%',
				$wpdb->esc_like( '_site_transient' ) . '%',
				$wpdb->esc_like( 'theme_mods_' ) . '%'
			)
		);

		foreach ( $option_rows as $row ) {
			$is_widget = strpos( $row->option_name, 'widget_' ) === 0;
			$location  = $is_widget
				? array(
					'type'  => 'widget',
					'label' => 'Widget Area',
				)
				: array(
					'type'  => 'options',
					'label' => 'Site Options (' . esc_html( $row->option_name ) . ')',
				);

			$extracted_urls = self::extract_urls( $row->option_value );
			$extracted_ids  = self::extract_ids( $row->option_value );
			$urls           = array_merge( $urls, $extracted_urls );
			$ids            = array_merge( $ids, $extracted_ids );

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

		// 2. Theme mods (customizer). Custom logo and header image are stored by
		// ID, so every theme's mods are read, not only those with a URL.
		$theme_mod_rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT option_name, option_value FROM {$wpdb->options}
				WHERE option_name LIKE %s",
				$wpdb->esc_like( 'theme_mods_' ) . '%'
			)
		);

		foreach ( $theme_mod_rows as $row ) {
			$location       = array(
				'type'  => 'theme_customizer',
				'label' => 'Theme Customizer',
			);
			$extracted_urls = self::extract_urls( $row->option_value );
			$extracted_ids  = self::extract_ids( $row->option_value );
			$urls           = array_merge( $urls, $extracted_urls );
			$ids            = array_merge( $ids, $extracted_ids );

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

		// 3. Core and WooCommerce options that hold a single attachment ID.
		$id_options = array(
			'site_icon'                     => 'Site Icon',
			'site_logo'                     => 'Site Logo',
			'woocommerce_placeholder_image' => 'WooCommerce Placeholder Image',
		);
		foreach ( $id_options as $option_name => $label ) {
			// Core filters site_logo to follow the custom_logo theme mod, so read the
			// stored row as well as the filtered value and keep both.
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- A scan must read live data.
			$stored = $wpdb->get_var(
				$wpdb->prepare( "SELECT option_value FROM {$wpdb->options} WHERE option_name = %s", $option_name )
			);
			foreach ( array_unique( array( absint( get_option( $option_name ) ), absint( $stored ) ) ) as $att_id ) {
				if ( $att_id > 0 ) {
					$ids[] = $att_id;
					if ( ! isset( $id_locations[ $att_id ] ) ) {
						$id_locations[ $att_id ] = array();
					}
					$id_locations[ $att_id ][] = array(
						'type'  => 'options',
						'label' => $label,
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
	 * Extract URLs from option value.
	 *
	 * @param string $value Option value.
	 * @return string[]
	 */
	private static function extract_urls( $value ) {
		$urls = array();

		if ( is_serialized( $value ) ) {
			// Use allowed_classes=false to block PHP Object Injection via magic methods.
			$value = wp_json_encode( @unserialize( $value, array( 'allowed_classes' => false ) ) );
		}

		// JSON-encoded values escape slashes as \/.
		$value = str_replace( '\\/', '/', (string) $value );

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
		if ( is_serialized( $value ) ) {
			// Use allowed_classes=false to block PHP Object Injection via magic methods.
			$value = wp_json_encode( @unserialize( $value, array( 'allowed_classes' => false ) ) );
		}

		return WPMP_Content_Scanner::extract_ids_from_text( (string) $value );
	}
}
