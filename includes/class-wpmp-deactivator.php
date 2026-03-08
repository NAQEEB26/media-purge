<?php
/**
 * Plugin deactivation handler.
 *
 * Cleans up cron jobs. Does NOT drop tables or options (preserved for re-activation).
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Deactivator
 */
class WPMP_Deactivator {

	/**
	 * Run deactivation tasks.
	 */
	public static function deactivate() {
		self::clear_cron_events();
	}

	/**
	 * Clear all scheduled cron events.
	 */
	public static function clear_cron_events() {
		wp_clear_scheduled_hook( 'wpmp_purge_old_trash' );
		wp_clear_scheduled_hook( 'wpmp_reset_monthly_count' );
		wp_clear_scheduled_hook( 'wpmp_storage_snapshot' );
		wp_clear_scheduled_hook( 'wpmp_auto_scan' );
	}
}
