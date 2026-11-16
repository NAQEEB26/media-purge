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
		// The background request is a server-side loopback with no login cookies,
		// so it arrives as a logged-out request. The one-time token is the auth.
		add_action( 'wp_ajax_nopriv_wpmp_run_scan', array( __CLASS__, 'run_scan' ) );
	}

	/**
	 * Run scan (called via async spawn for large sites).
	 *
	 * The request is sent by WPMP_REST_API::start_scan() from the server to itself,
	 * after an admin has started the scan through the capability-checked REST route.
	 * It carries no user session, so it is authorised by the single-use token alone.
	 */
	public static function run_scan() {
		// Token-based auth: the scan token is validated with hash_equals() below.
		$token = isset( $_GET['token'] ) ? sanitize_text_field( wp_unslash( $_GET['token'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Authorised by the one-time scan token.

		if ( empty( $token ) ) {
			wp_die( esc_html__( 'Invalid request.', 'media-purge' ), '', array( 'response' => 403 ) );
		}

		$stored = get_transient( 'wpmp_scan_token' );
		if ( ! $stored || ! hash_equals( (string) $stored, $token ) ) {
			wp_die( esc_html__( 'Invalid or expired token.', 'media-purge' ), '', array( 'response' => 403 ) );
		}

		// Mark the scan as owned before the spawned marker goes away, so the
		// status check never mistakes it for an orphaned lock.
		set_transient( 'wpmp_scan_phase', 'content', 3600 );
		delete_transient( 'wpmp_scan_token' );
		delete_transient( 'wpmp_scan_spawned' );

		if ( function_exists( 'set_time_limit' ) ) {
			set_time_limit( 0 );
		}
		do_action( 'wpmp_start_scan' );

		wp_send_json_success( array( 'message' => 'Scan completed' ) );
	}
}
