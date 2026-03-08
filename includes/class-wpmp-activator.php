<?php
/**
 * Plugin activation handler.
 *
 * Creates database tables and sets default options.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Activator
 */
class WPMP_Activator {

	/**
	 * Run activation tasks.
	 */
	public static function activate() {
		self::create_tables();
		self::set_default_options();
		self::schedule_cron_events();
	}

	/**
	 * Create custom database tables.
	 */
	public static function create_tables() {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();
		$table_results   = $wpdb->prefix . 'wpmp_scan_results';
		$table_log       = $wpdb->prefix . 'wpmp_scan_log';

		$sql_results = "CREATE TABLE {$table_results} (
			id            BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			attachment_id BIGINT(20) UNSIGNED NOT NULL,
			file_path     VARCHAR(512) NOT NULL,
			file_size     BIGINT(20) UNSIGNED DEFAULT 0,
			mime_type     VARCHAR(100) DEFAULT '',
			status        ENUM('used','unused','trashed','whitelisted') DEFAULT 'unused',
			used_in       LONGTEXT,
			file_hash     VARCHAR(64) DEFAULT '',
			scan_date     DATETIME DEFAULT CURRENT_TIMESTAMP,
			trashed_date  DATETIME DEFAULT NULL,
			PRIMARY KEY (id),
			KEY attachment_id (attachment_id),
			KEY status (status),
			KEY file_hash (file_hash)
		) {$charset_collate};";

		$sql_log = "CREATE TABLE {$table_log} (
			id              BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			scan_started    DATETIME DEFAULT CURRENT_TIMESTAMP,
			scan_completed  DATETIME DEFAULT NULL,
			total_files     INT(11) DEFAULT 0,
			unused_found    INT(11) DEFAULT 0,
			files_trashed   INT(11) DEFAULT 0,
			storage_saved   BIGINT(20) DEFAULT 0,
			trigger_type    ENUM('manual','cron','auto') DEFAULT 'manual',
			status          ENUM('running','completed','failed') DEFAULT 'running',
			PRIMARY KEY (id)
		) {$charset_collate};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql_results );
		dbDelta( $sql_log );

		update_option( 'wpmp_db_version', WPMP_DB_VERSION );
	}

	/**
	 * Set default plugin options.
	 */
	public static function set_default_options() {
		$defaults = array(
			'recent_upload_days' => 7,
			'trash_retention_days' => 30,
			'batch_size'         => 100,
		);

		if ( false === get_option( 'wpmp_settings' ) ) {
			add_option( 'wpmp_settings', wp_json_encode( $defaults ) );
		}
	}

	/**
	 * Schedule recurring cron events.
	 */
	public static function schedule_cron_events() {
		if ( ! wp_next_scheduled( 'wpmp_purge_old_trash' ) ) {
			wp_schedule_event( time(), 'daily', 'wpmp_purge_old_trash' );
		}
		if ( ! wp_next_scheduled( 'wpmp_reset_monthly_count' ) ) {
			wp_schedule_event( time(), 'monthly', 'wpmp_reset_monthly_count' );
		}
		if ( ! wp_next_scheduled( 'wpmp_storage_snapshot' ) ) {
			wp_schedule_event( time(), 'daily', 'wpmp_storage_snapshot' );
		}
	}
}
