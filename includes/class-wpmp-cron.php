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
		add_action( 'wpmp_storage_snapshot', array( __CLASS__, 'take_storage_snapshot' ) );
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

	/**
	 * Record a daily storage snapshot for trend analytics.
	 * Stores compact data in wpmp_storage_snapshots option (ring-buffer, 90 days).
	 */
	public static function take_storage_snapshot() {
		global $wpdb;

		$table = $wpdb->prefix . 'wpmp_scan_results';

		$row = $wpdb->get_row(
			"SELECT
				SUM(file_size) AS unused_size,
				COUNT(*)       AS unused_count
			 FROM {$table}
			 WHERE status = 'unused'",
			ARRAY_A
		);

		$snapshot = array(
			'date'         => gmdate( 'Y-m-d' ),
			'unused_size'  => (int) ( $row['unused_size'] ?? 0 ),
			'unused_count' => (int) ( $row['unused_count'] ?? 0 ),
		);

		$snapshots = get_option( 'wpmp_storage_snapshots', array() );
		if ( ! is_array( $snapshots ) ) {
			$snapshots = array();
		}

		/* Prevent duplicate entries for the same date */
		foreach ( $snapshots as $i => $s ) {
			if ( isset( $s['date'] ) && $s['date'] === $snapshot['date'] ) {
				$snapshots[ $i ] = $snapshot;
				update_option( 'wpmp_storage_snapshots', $snapshots );
				return;
			}
		}

		/* Keep only 90 days */
		$snapshots[] = $snapshot;
		if ( count( $snapshots ) > 90 ) {
			$snapshots = array_slice( $snapshots, -90 );
		}

		update_option( 'wpmp_storage_snapshots', $snapshots );
	}
}
