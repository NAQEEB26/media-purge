<?php
/**
 * Internationalization functionality.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_I18n
 */
class WPMP_I18n {

	/**
	 * Load plugin text domain.
	 */
	public static function load_textdomain() {
		load_plugin_textdomain(
			'wp-media-purge',
			false,
			dirname( WPMP_PLUGIN_BASENAME ) . '/languages'
		);
	}
}
