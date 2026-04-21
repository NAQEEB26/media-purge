<?php
/**
 * Licensing and feature gate.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Licensing
 */
class WPMP_Licensing {

	/**
	 * Check if Pro features are available.
	 *
	 * @return bool
	 */
	public static function is_pro() {
		$license = get_option( 'wpmp_license_key', '' );
		$valid   = get_option( 'wpmp_license_valid', false );
		return ! empty( $license ) && $valid;
	}
}
