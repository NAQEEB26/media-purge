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
		// Token-based auth: the scan token is validated with hash_equals() below.
		$token = isset( $_GET['token'] ) ? sanitize_text_field( wp_unslash( $_GET['token'] ) ) : '';

		if ( empty( $token ) ) {
			wp_die( esc_html__( 'Invalid request.', 'wp-media-purge' ), '', array( 'response' => 403 ) );
		}

		// Capability check must run before token consumption so a low-privileged user
		// cannot burn the one-shot token and prevent the admin's own spawn from running.
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized.', 'wp-media-purge' ), '', array( 'response' => 403 ) );
		}

		$stored = get_transient( 'wpmp_scan_token' );
		if ( ! $stored || ! hash_equals( (string) $stored, $token ) ) {
			wp_die( esc_html__( 'Invalid or expired token.', 'wp-media-purge' ), '', array( 'response' => 403 ) );
		}

		delete_transient( 'wpmp_scan_token' );

		if ( function_exists( 'set_time_limit' ) ) {
			set_time_limit( 0 );
		}
		do_action( 'wpmp_start_scan' );

		wp_send_json_success( array( 'message' => 'Scan completed' ) );
	}
}
