<?php
/**
 * Plugin settings management.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Settings
 */
class WPMP_Settings {

	/**
	 * Option key.
	 */
	const OPTION_KEY = 'wpmp_settings';

	/**
	 * Default settings.
	 *
	 * @var array
	 */
	private static $defaults = array(
		'recent_upload_days'   => 30,
		'trash_retention_days' => 30,
		'batch_size'           => 100,
		'scan_woocommerce'     => true,
		'skip_recent'          => true,
		'exclude_file_types'   => array( 'svg', 'gif', 'pdf', 'mp4', 'mov' ),
		'wizard_seen'          => false,
	);

	/**
	 * Get all settings.
	 *
	 * @return array
	 */
	public static function get_all() {
		$saved = get_option( self::OPTION_KEY, '' );
		$data  = is_string( $saved ) ? json_decode( $saved, true ) : $saved;
		return wp_parse_args( is_array( $data ) ? $data : array(), self::$defaults );
	}

	/**
	 * Get a single setting.
	 *
	 * @param string $key     Setting key.
	 * @param mixed  $default Default value.
	 * @return mixed
	 */
	public static function get( $key, $default = null ) {
		$settings = self::get_all();
		return isset( $settings[ $key ] ) ? $settings[ $key ] : $default;
	}

	/**
	 * Update settings.
	 *
	 * @param array $settings New settings to merge.
	 * @return bool
	 */
	public static function update( $settings ) {
		$current = self::get_all();
		$merged  = wp_parse_args( $settings, $current );
		return update_option( self::OPTION_KEY, wp_json_encode( $merged ) );
	}
}
