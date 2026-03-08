<?php
/**
 * Plugin Name: WP Media Purge
 * Plugin URI:  https://naqeebulrehman.com
 * Description: Find and safely remove unused images, detect duplicates, and organize your media library with full storage analytics.
 * Version:     1.1.0
 * Author:      Naqeeb Ul Rehman
 * Author URI:  https://naqeebulrehman.com
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: wp-media-purge
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Plugin global constants.
 * Use these throughout the plugin for consistency.
 */
define( 'WPMP_VERSION', '1.1.0' );
define( 'WPMP_PLUGIN_FILE', __FILE__ );
define( 'WPMP_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
define( 'WPMP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPMP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WPMP_PREFIX', 'wpmp_' );
define( 'WPMP_REST_NAMESPACE', 'wpmp/v1' );
define( 'WPMP_DB_VERSION', '1.0' );

/**
 * Check if Pro is active.
 *
 * @return bool
 */
function wpmp_is_pro() {
	return class_exists( 'WPMP_Licensing' ) && WPMP_Licensing::is_pro();
}

/**
 * Activate plugin.
 */
function wpmp_activate() {
	require_once WPMP_PLUGIN_DIR . 'includes/class-wpmp-activator.php';
	WPMP_Activator::activate();
}

/**
 * Deactivate plugin.
 */
function wpmp_deactivate() {
	require_once WPMP_PLUGIN_DIR . 'includes/class-wpmp-deactivator.php';
	WPMP_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'wpmp_activate' );
register_deactivation_hook( __FILE__, 'wpmp_deactivate' );

/**
 * Bootstrap the plugin.
 */
function wpmp_init() {
	// Register custom cron schedules.
	add_filter( 'cron_schedules', 'wpmp_add_cron_schedules' );

	// Load text domain
	load_plugin_textdomain( 'wp-media-purge', false, dirname( WPMP_PLUGIN_BASENAME ) . '/languages' );

	// Core includes
	require_once WPMP_PLUGIN_DIR . 'includes/class-wpmp-loader.php';
	require_once WPMP_PLUGIN_DIR . 'includes/class-wpmp-settings.php';
	require_once WPMP_PLUGIN_DIR . 'includes/class-wpmp-cron.php';
	require_once WPMP_PLUGIN_DIR . 'includes/class-wpmp-licensing.php';

	// Scanners
	require_once WPMP_PLUGIN_DIR . 'scanner/class-wpmp-filesystem-scanner.php';
	require_once WPMP_PLUGIN_DIR . 'scanner/class-wpmp-content-scanner.php';
	require_once WPMP_PLUGIN_DIR . 'scanner/class-wpmp-meta-scanner.php';
	require_once WPMP_PLUGIN_DIR . 'scanner/class-wpmp-options-scanner.php';
	require_once WPMP_PLUGIN_DIR . 'scanner/class-wpmp-pagebuilder-scanner.php';
	require_once WPMP_PLUGIN_DIR . 'scanner/class-wpmp-scanner.php';

	/* Hook the is_pro filter to licensing class */
	add_filter( 'wpmp_is_pro', 'wpmp_is_pro' );

	WPMP_Cron::init();

	// REST API must load on ALL requests (fetch hits frontend, not admin)
	require_once WPMP_PLUGIN_DIR . 'admin/class-wpmp-rest-api.php';
	new WPMP_REST_API();

	if ( is_admin() ) {
		require_once WPMP_PLUGIN_DIR . 'includes/class-wpmp-ajax.php';
		require_once WPMP_PLUGIN_DIR . 'admin/class-wpmp-admin.php';
		WPMP_Ajax::init();
		new WPMP_Admin();
	}

	// Scanner runs on scan start (admin or cron)
	add_action( 'wpmp_start_scan', array( 'WPMP_Scanner', 'run' ) );

	$loader = new WPMP_Loader();
	$loader->run();
}

add_action( 'plugins_loaded', 'wpmp_init' );

/**
 * Add custom cron intervals.
 *
 * @param array $schedules Existing schedules.
 * @return array
 */
function wpmp_add_cron_schedules( $schedules ) {
	if ( ! isset( $schedules['monthly'] ) ) {
		$schedules['monthly'] = array(
			'interval' => 30 * DAY_IN_SECONDS,
			'display'  => __( 'Once Monthly', 'wp-media-purge' ),
		);
	}
	return $schedules;
}
