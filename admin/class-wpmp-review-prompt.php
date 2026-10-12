<?php
/**
 * Dismissible WordPress.org review notice.
 *
 * Asks for a review only after the site has had two successful cleanups
 * and the plugin has been installed for at least three days. The notice
 * is limited to the Media Purge screen and to users who can manage options.
 * Dismissal is stored per user.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Review_Prompt
 */
class WPMP_Review_Prompt {

	/**
	 * Site option: number of successful cleanups.
	 */
	const OPTION_CLEANUPS = 'mp_cleanups_ok';

	/**
	 * Site option: Unix timestamp of the first recorded install.
	 */
	const OPTION_INSTALLED = 'mp_installed_at';

	/**
	 * User meta: '' | later:<timestamp> | done | never.
	 */
	const META_STATE = 'mp_review_state';

	/**
	 * User meta: how many times this user chose "Maybe later".
	 */
	const META_SNOOZES = 'mp_review_snoozes';

	/**
	 * Cleanups required before the notice can appear.
	 */
	const MIN_CLEANUPS = 2;

	/**
	 * Days after install before the notice can appear.
	 */
	const MIN_DAYS = 3;

	/**
	 * Days to wait after "Maybe later".
	 */
	const SNOOZE_DAYS = 14;

	/**
	 * Maximum "Maybe later" choices. The next one is stored as never.
	 */
	const MAX_SNOOZES = 2;

	/**
	 * WordPress.org review form. Plain outbound link, no tracking parameters.
	 */
	const REVIEW_URL = 'https://wordpress.org/support/plugin/media-purge/reviews/#new-post';

	/**
	 * Admin-ajax action and nonce action.
	 */
	const AJAX_ACTION = 'wpmp_review_prompt';

	/**
	 * Register hooks.
	 *
	 * The cleanup counter must be registered on every request because the
	 * trash endpoint is a REST call, where is_admin() is false.
	 */
	public static function init() {
		add_action( 'wpmp_cleanup_succeeded', array( __CLASS__, 'record_successful_cleanup' ), 10, 1 );
		add_action( 'admin_init', array( __CLASS__, 'maybe_set_installed_at' ) );
		add_action( 'admin_notices', array( __CLASS__, 'render_notice' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ) );
		add_action( 'wp_ajax_' . self::AJAX_ACTION, array( __CLASS__, 'handle_ajax' ) );
		add_filter( 'plugin_row_meta', array( __CLASS__, 'add_row_meta' ), 10, 2 );
	}

	/**
	 * Remember the first time the plugin is installed.
	 *
	 * Existing installs that update without reactivation get a timestamp
	 * on the next privileged admin request, so the three-day wait starts
	 * then instead of treating them as brand new.
	 */
	public static function maybe_set_installed_at() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		self::ensure_installed_at();
	}

	/**
	 * Store the install timestamp once.
	 *
	 * Reactivation does not overwrite it.
	 */
	public static function ensure_installed_at() {
		if ( false !== get_option( self::OPTION_INSTALLED, false ) ) {
			return;
		}

		add_option( self::OPTION_INSTALLED, time(), '', 'no' );
	}

	/**
	 * Increment the successful-cleanup counter.
	 *
	 * One increment per cleanup that trashed at least one file.
	 * Restores do not call this.
	 *
	 * @param int $trashed Number of attachments trashed without an error.
	 */
	public static function record_successful_cleanup( $trashed ) {
		if ( absint( $trashed ) < 1 ) {
			return;
		}

		$count = absint( get_option( self::OPTION_CLEANUPS, 0 ) );
		update_option( self::OPTION_CLEANUPS, $count + 1, false );
	}

	/**
	 * Delete review-prompt options and per-user state.
	 */
	public static function uninstall() {
		delete_option( self::OPTION_CLEANUPS );
		delete_option( self::OPTION_INSTALLED );
		delete_metadata( 'user', 0, self::META_STATE, '', true );
		delete_metadata( 'user', 0, self::META_SNOOZES, '', true );
	}

	/**
	 * Print the notice on the Media Purge screen.
	 *
	 * Rendered with admin_notices so it stays outside .wpmp-wrap.
	 * Notices inside that wrapper are hidden by the plugin stylesheet.
	 */
	public static function render_notice() {
		if ( ! self::is_plugin_admin_screen() || ! self::should_show_for_current_user() ) {
			return;
		}

		?>
		<div class="notice notice-info is-dismissible" id="wpmp-review-notice">
			<p>
				<?php
				esc_html_e(
					'You\'ve cleaned up your media library with Media Purge twice now. If it helped, would you leave a quick review on WordPress.org? It helps other site owners find a free option.',
					'media-purge'
				);
				?>
			</p>
			<p class="wpmp-review-actions">
				<a class="button button-primary" href="<?php echo esc_url( self::REVIEW_URL ); ?>" target="_blank" rel="noopener noreferrer" data-wpmp-review="done">
					<?php esc_html_e( 'Leave a review', 'media-purge' ); ?>
				</a>
				<button type="button" class="button" data-wpmp-review="later">
					<?php esc_html_e( 'Maybe later', 'media-purge' ); ?>
				</button>
				<button type="button" class="button" data-wpmp-review="done">
					<?php esc_html_e( 'I already did', 'media-purge' ); ?>
				</button>
				<button type="button" class="button" data-wpmp-review="never">
					<?php esc_html_e( 'No thanks', 'media-purge' ); ?>
				</button>
			</p>
		</div>
		<?php
	}

	/**
	 * Enqueue the dismiss script only when the notice is shown.
	 *
	 * @param string $hook Current admin page hook.
	 */
	public static function enqueue_assets( $hook ) {
		if ( ! self::is_plugin_hook( $hook ) || ! self::should_show_for_current_user() ) {
			return;
		}

		wp_enqueue_script(
			'wpmp-review-prompt',
			WPMP_PLUGIN_URL . 'assets/js/review-prompt.js',
			array(),
			WPMP_VERSION,
			true
		);

		wp_localize_script(
			'wpmp-review-prompt',
			'wpmpReview',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( self::AJAX_ACTION ),
				'action'  => self::AJAX_ACTION,
			)
		);
	}

	/**
	 * Save Later, Already did, or Never for the current user.
	 */
	public static function handle_ajax() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error(
				array(
					'message' => __( 'You do not have permission to do that.', 'media-purge' ),
				),
				403
			);
		}

		check_ajax_referer( self::AJAX_ACTION, 'nonce' );

		$choice = isset( $_POST['choice'] ) ? sanitize_key( wp_unslash( $_POST['choice'] ) ) : '';

		if ( ! in_array( $choice, array( 'later', 'done', 'never' ), true ) ) {
			wp_send_json_error(
				array(
					'message' => __( 'Invalid request.', 'media-purge' ),
				),
				400
			);
		}

		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			wp_send_json_error(
				array(
					'message' => __( 'You do not have permission to do that.', 'media-purge' ),
				),
				403
			);
		}

		self::persist_choice( $user_id, $choice );

		wp_send_json_success();
	}

	/**
	 * Add a Rate us link on the Plugins list.
	 *
	 * This is a plain link in the plugin row, not an admin notice.
	 *
	 * @param string[] $links Existing row meta.
	 * @param string   $file  Plugin basename.
	 * @return string[]
	 */
	public static function add_row_meta( $links, $file ) {
		if ( WPMP_PLUGIN_BASENAME !== $file ) {
			return $links;
		}

		$links[] = sprintf(
			'<a href="%1$s" target="_blank" rel="noopener noreferrer">%2$s</a>',
			esc_url( self::REVIEW_URL ),
			esc_html__( 'Rate us', 'media-purge' )
		);

		return $links;
	}

	/**
	 * Whether the current user should see the notice, ignoring the screen.
	 *
	 * @return bool
	 */
	public static function should_show_for_current_user() {
		if ( ! is_user_logged_in() || ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		$user_id = get_current_user_id();

		return self::notice_is_due(
			(int) get_option( self::OPTION_CLEANUPS, 0 ),
			(int) get_option( self::OPTION_INSTALLED, 0 ),
			self::get_state( $user_id ),
			time()
		);
	}

	/**
	 * Pure check for the trigger rules.
	 *
	 * @param int    $cleanups     Successful cleanup count.
	 * @param int    $installed_at Install timestamp.
	 * @param string $state        User review state.
	 * @param int    $now          Current timestamp.
	 * @return bool
	 */
	public static function notice_is_due( $cleanups, $installed_at, $state, $now ) {
		if ( (int) $cleanups < self::MIN_CLEANUPS ) {
			return false;
		}

		$installed_at = (int) $installed_at;
		if ( $installed_at <= 0 ) {
			return false;
		}

		$min_age = self::MIN_DAYS * self::day_in_seconds();
		if ( ( (int) $now - $installed_at ) < $min_age ) {
			return false;
		}

		return self::state_allows_prompt( $state, (int) $now );
	}

	/**
	 * Whether this stored state still allows the notice.
	 *
	 * @param string $state User review state.
	 * @param int    $now   Current timestamp.
	 * @return bool
	 */
	public static function state_allows_prompt( $state, $now ) {
		$state = is_string( $state ) ? $state : '';

		if ( '' === $state ) {
			return true;
		}

		if ( 'done' === $state || 'never' === $state ) {
			return false;
		}

		if ( 0 === strpos( $state, 'later:' ) ) {
			$until = (int) substr( $state, strlen( 'later:' ) );
			return $until > 0 && $until <= (int) $now;
		}

		return false;
	}

	/**
	 * Next state after a button click.
	 *
	 * @param string $state   Current state.
	 * @param int    $snoozes Times the user has already snoozed.
	 * @param string $choice  later, done, or never.
	 * @param int    $now     Current timestamp.
	 * @return array{state:string,snoozes:int}
	 */
	public static function reduce_choice( $state, $snoozes, $choice, $now ) {
		$state   = is_string( $state ) ? $state : '';
		$snoozes = (int) $snoozes;
		$now     = (int) $now;

		if ( 'done' === $choice ) {
			return array(
				'state'   => 'done',
				'snoozes' => $snoozes,
			);
		}

		if ( 'never' === $choice ) {
			return array(
				'state'   => 'never',
				'snoozes' => $snoozes,
			);
		}

		if ( 'later' === $choice ) {
			++$snoozes;
			if ( $snoozes > self::MAX_SNOOZES ) {
				return array(
					'state'   => 'never',
					'snoozes' => $snoozes,
				);
			}

			return array(
				'state'   => 'later:' . ( $now + ( self::SNOOZE_DAYS * self::day_in_seconds() ) ),
				'snoozes' => $snoozes,
			);
		}

		return array(
			'state'   => $state,
			'snoozes' => $snoozes,
		);
	}

	/**
	 * Write the chosen state for one user.
	 *
	 * @param int    $user_id User ID.
	 * @param string $choice  later, done, or never.
	 */
	private static function persist_choice( $user_id, $choice ) {
		$user_id = absint( $user_id );
		if ( ! $user_id ) {
			return;
		}

		$next = self::reduce_choice(
			self::get_state( $user_id ),
			self::get_snooze_count( $user_id ),
			$choice,
			time()
		);

		update_user_meta( $user_id, self::META_STATE, $next['state'] );
		update_user_meta( $user_id, self::META_SNOOZES, (int) $next['snoozes'] );
	}

	/**
	 * Read the review state for a user.
	 *
	 * @param int $user_id User ID.
	 * @return string
	 */
	private static function get_state( $user_id ) {
		$state = get_user_meta( absint( $user_id ), self::META_STATE, true );
		return is_string( $state ) ? $state : '';
	}

	/**
	 * Read how many times the user has snoozed.
	 *
	 * @param int $user_id User ID.
	 * @return int
	 */
	private static function get_snooze_count( $user_id ) {
		$count = get_user_meta( absint( $user_id ), self::META_SNOOZES, true );
		return is_numeric( $count ) ? (int) $count : 0;
	}

	/**
	 * Whether the current admin screen is Media → Media Purge.
	 *
	 * @return bool
	 */
	private static function is_plugin_admin_screen() {
		if ( ! function_exists( 'get_current_screen' ) ) {
			return false;
		}

		$screen = get_current_screen();
		if ( ! is_object( $screen ) || empty( $screen->id ) ) {
			return false;
		}

		return self::is_plugin_hook( $screen->id );
	}

	/**
	 * Whether an admin hook suffix belongs to this plugin's screen.
	 *
	 * @param string $hook Hook suffix or screen ID.
	 * @return bool
	 */
	private static function is_plugin_hook( $hook ) {
		if ( ! is_string( $hook ) || ! class_exists( 'WPMP_Admin', false ) ) {
			return false;
		}

		return ( 'media_page_' . WPMP_Admin::MENU_SLUG ) === $hook;
	}

	/**
	 * Seconds in a day. Uses the WordPress constant when it is defined.
	 *
	 * @return int
	 */
	private static function day_in_seconds() {
		return defined( 'DAY_IN_SECONDS' ) ? (int) DAY_IN_SECONDS : 86400;
	}
}
