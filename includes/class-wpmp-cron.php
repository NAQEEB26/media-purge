<?php
/**
 * Cron job handlers.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Cron
 */
class WPMP_Cron {

	/**
	 * Initialize cron handlers.
	 */
	public static function init() {
		add_action( 'wpmp_purge_old_trash', array( __CLASS__, 'purge_old_trash' ) );
	}

	/**
	 * Permanently delete files trashed 30+ days ago.
	 */
	public static function purge_old_trash() {
		global $wpdb;

		$retention_days = (int) WPMP_Settings::get( 'trash_retention_days', 30 );
		$cutoff         = gmdate( 'Y-m-d H:i:s', strtotime( "-{$retention_days} days" ) );
		$table          = $wpdb->prefix . 'wpmp_scan_results';

		$trashed = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT attachment_id, id FROM {$table}
				WHERE status = 'trashed'
				AND trashed_date < %s",
				$cutoff
			),
			ARRAY_A
		);

		foreach ( $trashed as $row ) {
			wp_delete_attachment( (int) $row['attachment_id'], true );
			$wpdb->delete( $table, array( 'id' => $row['id'] ), array( '%d' ) );
		}
	}
}
