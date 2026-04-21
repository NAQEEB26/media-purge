<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package WP_Media_Purge
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

global $wpdb;

$table_results   = $wpdb->prefix . 'wpmp_scan_results';
$table_log       = $wpdb->prefix . 'wpmp_scan_log';
$table_snapshots = $wpdb->prefix . 'wpmp_storage_snapshots';

// phpcs:ignore WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
$wpdb->query( "DROP TABLE IF EXISTS {$table_results}" );
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
$wpdb->query( "DROP TABLE IF EXISTS {$table_log}" );
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
$wpdb->query( "DROP TABLE IF EXISTS {$table_snapshots}" );

delete_option( 'wpmp_db_version' );
delete_option( 'wpmp_scan_last_run' );
delete_option( 'wpmp_settings' );
delete_option( 'wpmp_license_key' );
delete_option( 'wpmp_license_valid' );
delete_option( 'wpmp_monthly_count' );
delete_option( 'wpmp_monthly_reset' );
delete_option( 'wpmp_storage_snapshots' );

delete_transient( 'wpmp_scan_status' );
delete_transient( 'wpmp_storage_stats' );
delete_transient( 'wpmp_scan_running' );
delete_transient( 'wpmp_scan_progress' );
delete_transient( 'wpmp_scan_phase' );
delete_transient( 'wpmp_scan_token' );

wp_clear_scheduled_hook( 'wpmp_purge_old_trash' );
wp_clear_scheduled_hook( 'wpmp_reset_monthly_count' );
wp_clear_scheduled_hook( 'wpmp_storage_snapshot' );
