<?php
/**
 * Licensing stub — no licence checking in the free plugin.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Licensing
 */
class WPMP_Licensing {

	/**
	 * Always returns false in the free plugin hosted on WordPress.org.
	 * A future Pro add-on distributed separately may override this.
	 *
	 * @return bool
	 */
	public static function is_pro() {
		return false;
	}
}
