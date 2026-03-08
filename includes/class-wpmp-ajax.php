<?php
/**
 * AJAX handlers for background operations.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Ajax
 */
class WPMP_Ajax {

	/**
	 * Init hooks.
	 */
	public static function init() {
		add_action( 'wp_ajax_wpmp_run_scan', array( __CLASS__, 'run_scan' ) );
	}

	/**
	 * Run scan (called via async spawn for large sites).
	 */
	public static function run_scan() {
		$token = isset( $_GET['token'] ) ? sanitize_text_field( wp_unslash( $_GET['token'] ) ) : '';

		if ( empty( $token ) ) {
			wp_die( 'Invalid request', 403 );
		}

		$stored = get_transient( 'wpmp_scan_token' );
		if ( ! $stored || $stored !== $token ) {
			wp_die( 'Invalid or expired token', 403 );
		}

		delete_transient( 'wpmp_scan_token' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Unauthorized', 403 );
		}

		@set_time_limit( 0 );
		do_action( 'wpmp_start_scan' );

		wp_send_json_success( array( 'message' => 'Scan completed' ) );
	}
}
