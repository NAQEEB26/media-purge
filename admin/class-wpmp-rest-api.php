<?php
/**
 * REST API endpoints.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_REST_API
 */
class WPMP_REST_API {

	/**
	 * Initialize REST API.
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST routes.
	 */
	public function register_routes() {
		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/scan/status',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_scan_status' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/scan/start',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'start_scan' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/scan/cancel',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'cancel_scan' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/media/unused',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_unused_media' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
				'args'                => array(
					'page'     => array(
						'default'           => 1,
						'sanitize_callback' => 'absint',
					),
					'per_page' => array(
						'default'           => 30,
						'sanitize_callback' => 'absint',
					),
					'type'     => array(
						'default'           => '',
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/storage/stats',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_storage_stats' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/storage/largest',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_largest_files' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
				'args'                => array(
					'limit' => array(
						'default'           => 20,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/settings',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_settings' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/media/trashed',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_trashed_media' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
				'args'                => array(
					'page'     => array(
						'default'           => 1,
						'sanitize_callback' => 'absint',
					),
					'per_page' => array(
						'default'           => 20,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/media/trash',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'trash_media' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
				'args'                => array(
					'ids' => array(
						'required'          => true,
						'type'              => 'array',
						'items'             => array( 'type' => 'integer' ),
						'sanitize_callback' => array( $this, 'sanitize_id_array' ),
					),
				),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/media/restore',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'restore_media' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
				'args'                => array(
					'ids' => array(
						'required'          => true,
						'type'              => 'array',
						'items'             => array( 'type' => 'integer' ),
						'sanitize_callback' => array( $this, 'sanitize_id_array' ),
					),
				),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/media/whitelist',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'whitelist_media' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
				'args'                => array(
					'ids' => array(
						'required'          => true,
						'type'              => 'array',
						'items'             => array( 'type' => 'integer' ),
						'sanitize_callback' => array( $this, 'sanitize_id_array' ),
					),
				),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/media/duplicates',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_duplicates' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/media/delete',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'delete_media' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
				'args'                => array(
					'ids' => array(
						'required'          => true,
						'type'              => 'array',
						'items'             => array( 'type' => 'integer' ),
						'sanitize_callback' => array( $this, 'sanitize_id_array' ),
					),
				),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/settings',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'update_settings' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
				'args'                => array(
					'recent_upload_days'   => array( 'sanitize_callback' => 'absint' ),
					'trash_retention_days' => array( 'sanitize_callback' => 'absint' ),
					'batch_size'           => array( 'sanitize_callback' => 'absint' ),
					'scan_woocommerce'     => array( 'type' => 'boolean' ),
					'skip_recent'          => array( 'type' => 'boolean' ),
					'exclude_file_types'   => array( 'type' => 'array' ),
				),
			)
		);

		register_rest_route(
			WPMP_REST_NAMESPACE,
			'/health',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_health' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);
	}

	/**
	 * Sanitize array of IDs.
	 *
	 * @param array $ids Raw IDs.
	 * @return int[]
	 */
	public function sanitize_id_array( $ids ) {
		if ( ! is_array( $ids ) ) {
			return array();
		}
		return array_map( 'absint', array_filter( $ids ) );
	}

	/**
	 * Enrich raw used_in JSON with post titles and edit links.
	 *
	 * @param string|null $used_in_json Raw JSON from DB.
	 * @return array
	 */
	private function enrich_used_in( $used_in_json ) {
		if ( empty( $used_in_json ) ) {
			return array();
		}

		$locations = json_decode( $used_in_json, true );
		if ( ! is_array( $locations ) ) {
			return array();
		}

		$enriched = array();
		foreach ( $locations as $loc ) {
			if ( ! is_array( $loc ) ) {
				continue;
			}
			// Add post title and edit URL when we have a post_id.
			if ( ! empty( $loc['post_id'] ) ) {
				$post_id = (int) $loc['post_id'];
				if ( empty( $loc['post_title'] ) ) {
					$loc['post_title'] = get_the_title( $post_id );
				}
				$loc['edit_url'] = esc_url_raw( get_edit_post_link( $post_id, 'raw' ) );
				$loc['post_url'] = esc_url_raw( (string) get_permalink( $post_id ) );
			}
			$enriched[] = $loc;
		}

		return $enriched;
	}

	/**
	 * Check admin permission.
	 *
	 * @return bool
	 */
	public function check_admin_permission() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get scan status.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function get_scan_status( $request ) {
		$last_run = get_option( 'wpmp_scan_last_run', null );
		$running  = get_transient( 'wpmp_scan_running' );

		return new WP_REST_Response(
			array(
				'running'  => (bool) $running,
				'last_run' => $last_run,
				'progress' => $running ? (int) get_transient( 'wpmp_scan_progress' ) : 100,
				'phase'    => $running ? (string) get_transient( 'wpmp_scan_phase' ) : 'done',
			),
			200
		);
	}

	/**
	 * Start scan.
	 * Spawns async for large sites (300+ attachments) to avoid timeouts.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function start_scan( $request ) {
		if ( get_transient( 'wpmp_scan_running' ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'A scan is already running.', 'wp-media-purge' ),
				),
				400
			);
		}

		global $wpdb;
		$total = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = %s",
				'attachment'
			)
		);

		if ( $total > 300 ) {
			$token = wp_generate_password( 32, false );
			set_transient( 'wpmp_scan_token', $token, 120 );
			set_transient( 'wpmp_scan_running', true, 3600 );
			set_transient( 'wpmp_scan_progress', 0, 3600 );

			$url = add_query_arg(
				array(
					'action' => 'wpmp_run_scan',
					'token'  => $token,
				),
				admin_url( 'admin-ajax.php' )
			);

			wp_remote_post(
				$url,
				array(
					'timeout'  => 0.01,
					'blocking' => false,
				)
			);

			return new WP_REST_Response(
				array(
					'success' => true,
					'message' => __( 'Scan started in background (large library).', 'wp-media-purge' ),
				),
				200
			);
		}

		do_action( 'wpmp_start_scan' );

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Scan started.', 'wp-media-purge' ),
			),
			200
		);
	}

	/**
	 * Force-cancel a running scan by removing the lock transient.
	 * Useful when a scan crashes mid-way and the UI is stuck in "Scanning…" state.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function cancel_scan( $request ) {
		delete_transient( 'wpmp_scan_running' );
		delete_transient( 'wpmp_scan_progress' );

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Scan cancelled.', 'wp-media-purge' ),
			),
			200
		);
	}

	/**
	 * Get unused media.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function get_unused_media( $request ) {
		global $wpdb;

		// Clamp page to minimum 1 to prevent negative OFFSET.
		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$per_page = min( 100, max( 1, $request->get_param( 'per_page' ) ) );
		$offset   = ( $page - 1 ) * $per_page;
		$type     = sanitize_key( $request->get_param( 'type' ) );
		$table    = $wpdb->prefix . 'wpmp_scan_results';

		// Build a fully parameterised query using wpdb::prepare().
		// All LIKE patterns come from a hardcoded allowlist — never from user input.
		$where_sql = "WHERE status = 'unused'";
		$args      = array();

		if ( $type ) {
			if ( 'image' === $type ) {
				$where_sql .= ' AND mime_type LIKE %s';
				$args[]     = 'image/%';
			} elseif ( 'video' === $type ) {
				$where_sql .= ' AND mime_type LIKE %s';
				$args[]     = 'video/%';
			} elseif ( 'document' === $type ) {
				$where_sql .= ' AND (
					mime_type LIKE %s OR
					mime_type LIKE %s OR
					mime_type LIKE %s OR
					mime_type LIKE %s OR
					mime_type LIKE %s
				)';
				$args[]     = 'application/pdf';
				$args[]     = 'application/msword';
				$args[]     = 'text/plain';
				$args[]     = 'application/vnd.ms-excel';
				$args[]     = 'application/vnd.openxmlformats-officedocument%';
			} elseif ( 'other' === $type ) {
				$where_sql .= ' AND mime_type NOT LIKE %s AND mime_type NOT LIKE %s AND mime_type NOT LIKE %s';
				$args[]     = 'image/%';
				$args[]     = 'video/%';
				$args[]     = 'application/pdf';
			}
		}

		// Build COUNT query.
		if ( $args ) {
			$total = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$table} {$where_sql}", $args ) );
		} else {
			$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} {$where_sql}" );
		}

		// Build results query — LIMIT and OFFSET are safe integers, never user strings.
		$args[]  = $per_page;
		$args[]  = $offset;
		$results = $wpdb->get_results(
			$wpdb->prepare( "SELECT * FROM {$table} {$where_sql} ORDER BY file_size DESC LIMIT %d OFFSET %d", $args ),
			ARRAY_A
		);

		foreach ( $results as &$row ) {
			$att_id                = (int) $row['attachment_id'];
			$row['thumbnail_url']  = wp_get_attachment_image_url( $att_id, 'thumbnail' );
			$row['attachment_url'] = wp_get_attachment_url( $att_id );
			$row['filename']       = basename( $row['file_path'] );

			// Decode and enrich "Used In" data with post titles/edit links.
			$row['used_in_data'] = $this->enrich_used_in( $row['used_in'] );
			unset( $row['used_in'] ); // Don't expose raw JSON.
		}

		return new WP_REST_Response(
			array(
				'items'       => $results,
				'total'       => $total,
				'page'        => $page,
				'per_page'    => $per_page,
				'total_pages' => $total > 0 ? (int) ceil( $total / $per_page ) : 0,
			),
			200
		);
	}

	/**
	 * Get trashed media (for recovery).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function get_trashed_media( $request ) {
		global $wpdb;

		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$per_page = min( 100, max( 1, $request->get_param( 'per_page' ) ) );
		$offset   = ( $page - 1 ) * $per_page;
		$table    = $wpdb->prefix . 'wpmp_scan_results';

		$total = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$table} WHERE status = %s",
				'trashed'
			)
		);

		$results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE status = 'trashed' ORDER BY trashed_date DESC LIMIT %d OFFSET %d",
				$per_page,
				$offset
			),
			ARRAY_A
		);

		foreach ( $results as &$row ) {
			$att_id                = (int) $row['attachment_id'];
			$row['thumbnail_url']  = wp_get_attachment_image_url( $att_id, 'thumbnail' );
			$row['attachment_url'] = wp_get_attachment_url( $att_id );
			$row['filename']       = basename( $row['file_path'] );
			$row['used_in_data']   = $this->enrich_used_in( $row['used_in'] );
			unset( $row['used_in'] );
		}

		return new WP_REST_Response(
			array(
				'items'       => $results,
				'total'       => $total,
				'page'        => $page,
				'per_page'    => $per_page,
				'total_pages' => $total > 0 ? (int) ceil( $total / $per_page ) : 0,
			),
			200
		);
	}

	/**
	 * Move media to trash.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function trash_media( $request ) {
		global $wpdb;

		$params = $request->get_json_params();
		$ids    = ! empty( $params['ids'] ) ? $this->sanitize_id_array( $params['ids'] ) : $this->sanitize_id_array( (array) $request->get_param( 'ids' ) );
		$table  = $wpdb->prefix . 'wpmp_scan_results';

		if ( empty( $ids ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'No files selected.', 'wp-media-purge' ),
				),
				400
			);
		}

		$trashed = 0;
		$saved   = 0;

		foreach ( $ids as $attachment_id ) {
			$attachment_id = absint( $attachment_id );
			if ( ! $attachment_id ) {
				continue;
			}

			$row = $wpdb->get_row(
				$wpdb->prepare(
					"SELECT * FROM {$table} WHERE attachment_id = %d AND status = 'unused'",
					$attachment_id
				),
				ARRAY_A
			);

			if ( ! $row ) {
				continue;
			}

			wp_trash_post( $attachment_id );
			$saved += (int) $row['file_size'];
			$trashed++;

			$wpdb->update(
				$table,
				array(
					'status'       => 'trashed',
					'trashed_date' => current_time( 'mysql' ),
				),
				array( 'attachment_id' => $attachment_id ),
				array( '%s', '%s' ),
				array( '%d' )
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'trashed' => $trashed,
				'saved'   => $saved,
				'message' => sprintf(
				 /* translators: 1: number of files, 2: size saved */
					__( '%1$d file(s) moved to trash. %2$s freed.', 'wp-media-purge' ),
					$trashed,
					size_format( $saved )
				),
			),
			200
		);
	}

	/**
	 * Restore trashed media.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function restore_media( $request ) {
		global $wpdb;

		$params = $request->get_json_params();
		$ids    = ! empty( $params['ids'] ) ? $this->sanitize_id_array( $params['ids'] ) : $this->sanitize_id_array( (array) $request->get_param( 'ids' ) );
		$table  = $wpdb->prefix . 'wpmp_scan_results';

		if ( empty( $ids ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'No files selected.', 'wp-media-purge' ),
				),
				400
			);
		}

		$restored = 0;

		foreach ( $ids as $attachment_id ) {
			$attachment_id = absint( $attachment_id );
			if ( ! $attachment_id ) {
				continue;
			}

			$post = get_post( $attachment_id );
			if ( ! $post || 'trash' !== $post->post_status ) {
				continue;
			}

			wp_untrash_post( $attachment_id );
			$restored++;

			$wpdb->update(
				$table,
				array(
					'status'       => 'unused',
					'trashed_date' => null,
				),
				array( 'attachment_id' => $attachment_id ),
				array( '%s', '%s' ),
				array( '%d' )
			);
		}

		return new WP_REST_Response(
			array(
				'success'  => true,
				'restored' => $restored,
				'message'  => sprintf(
				 /* translators: %d: number of files */
					__( '%d file(s) restored.', 'wp-media-purge' ),
					$restored
				),
			),
			200
		);
	}

	/**
	 * Permanently delete trashed media.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function delete_media( $request ) {
		global $wpdb;

		$params = $request->get_json_params();
		$ids    = ! empty( $params['ids'] ) ? $this->sanitize_id_array( $params['ids'] ) : $this->sanitize_id_array( (array) $request->get_param( 'ids' ) );
		$table  = $wpdb->prefix . 'wpmp_scan_results';

		if ( empty( $ids ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'No files selected.', 'wp-media-purge' ),
				),
				400
			);
		}

		$deleted = 0;
		$freed   = 0;

		foreach ( $ids as $attachment_id ) {
			$attachment_id = absint( $attachment_id );
			if ( ! $attachment_id ) {
				continue;
			}

			$row = $wpdb->get_row(
				$wpdb->prepare(
					"SELECT file_size FROM {$table} WHERE attachment_id = %d AND status = 'trashed'",
					$attachment_id
				),
				ARRAY_A
			);

			if ( ! $row ) {
				continue;
			}

			wp_delete_attachment( $attachment_id, true );
			$freed += (int) $row['file_size'];
			$deleted++;

			$wpdb->delete( $table, array( 'attachment_id' => $attachment_id ), array( '%d' ) );
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'deleted' => $deleted,
				'freed'   => $freed,
				'message' => sprintf(
				 /* translators: 1: number of files, 2: size freed */
					__( '%1$d file(s) permanently deleted. %2$s freed.', 'wp-media-purge' ),
					$deleted,
					size_format( $freed )
				),
			),
			200
		);
	}

	/**
	 * Whitelist media (exclude from future scans).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function whitelist_media( $request ) {
		global $wpdb;

		$params = $request->get_json_params();
		$ids    = ! empty( $params['ids'] ) ? $this->sanitize_id_array( $params['ids'] ) : $this->sanitize_id_array( (array) $request->get_param( 'ids' ) );
		$table  = $wpdb->prefix . 'wpmp_scan_results';

		if ( empty( $ids ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'No files selected.', 'wp-media-purge' ),
				),
				400
			);
		}

		$whitelisted = 0;

		foreach ( $ids as $attachment_id ) {
			$attachment_id = absint( $attachment_id );
			if ( ! $attachment_id ) {
				continue;
			}

			$updated = $wpdb->update(
				$table,
				array( 'status' => 'whitelisted' ),
				array( 'attachment_id' => $attachment_id ),
				array( '%s' ),
				array( '%d' )
			);

			if ( $updated ) {
				$whitelisted++;
			} else {
				$wpdb->insert(
					$table,
					array(
						'attachment_id' => $attachment_id,
						'file_path'     => get_attached_file( $attachment_id ),
						'file_size'     => 0,
						'status'        => 'whitelisted',
					),
					array( '%d', '%s', '%d', '%s' )
				);
				$whitelisted++;
			}
		}

		return new WP_REST_Response(
			array(
				'success'     => true,
				'whitelisted' => $whitelisted,
				'message'     => sprintf(
				 /* translators: %d: number of files */
					__( '%d file(s) whitelisted.', 'wp-media-purge' ),
					$whitelisted
				),
			),
			200
		);
	}

	/**
	 * Get storage statistics with type breakdown.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function get_storage_stats( $request ) {
		global $wpdb;

		$table = $wpdb->prefix . 'wpmp_scan_results';

		$total_size   = (int) $wpdb->get_var( "SELECT COALESCE(SUM(file_size), 0) FROM {$table}" );
		$total_count  = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" );
		$unused_count = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE status = 'unused'" );
		$unused_size  = (int) $wpdb->get_var(
			$wpdb->prepare( "SELECT COALESCE(SUM(file_size), 0) FROM {$table} WHERE status = %s", 'unused' )
		);

		// Pre-scan fallback.
		if ( 0 === $total_count ) {
			$total_count = (int) $wpdb->get_var(
				$wpdb->prepare( "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = %s", 'attachment' )
			);
		}

		// Storage breakdown by mime type group.
		$type_rows = $wpdb->get_results(
			"SELECT
				CASE
					WHEN mime_type LIKE 'image/%' THEN 'image'
					WHEN mime_type LIKE 'video/%' THEN 'video'
					WHEN mime_type LIKE 'audio/%' THEN 'audio'
					WHEN mime_type IN ('application/pdf','application/msword','text/plain','application/vnd.ms-excel') OR mime_type LIKE 'application/vnd.openxmlformats%' THEN 'document'
					ELSE 'other'
				END AS type_group,
				COUNT(*) AS cnt,
				COALESCE(SUM(file_size), 0) AS total_size
			 FROM {$table}
			 WHERE status != 'trashed'
			 GROUP BY type_group",
			ARRAY_A
		);

		$by_type = array();
		foreach ( (array) $type_rows as $row ) {
			$by_type[ $row['type_group'] ] = array(
				'count' => (int) $row['cnt'],
				'size'  => (int) $row['total_size'],
			);
		}

		return new WP_REST_Response(
			array(
				'total_size'   => $total_size,
				'total_count'  => $total_count,
				'unused_count' => $unused_count,
				'unused_size'  => $unused_size,
				'by_type'      => $by_type,
				'last_scan'    => get_option( 'wpmp_scan_last_run', null ),
			),
			200
		);
	}

	/**
	 * Get top N largest files.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function get_largest_files( $request ) {
		global $wpdb;

		$limit = min( 50, max( 5, (int) $request->get_param( 'limit' ) ) );
		$table = $wpdb->prefix . 'wpmp_scan_results';

		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT attachment_id, file_path, file_size, mime_type, status
				FROM {$table}
				WHERE status IN ('used','unused')
				ORDER BY file_size DESC
				LIMIT %d",
				$limit
			),
			ARRAY_A
		);

		foreach ( $rows as &$row ) {
			$att_id                = (int) $row['attachment_id'];
			$row['thumbnail_url']  = wp_get_attachment_image_url( $att_id, 'thumbnail' );
			$row['attachment_url'] = wp_get_attachment_url( $att_id );
			$row['filename']       = basename( $row['file_path'] );
		}

		return new WP_REST_Response( array( 'items' => $rows ), 200 );
	}

	/**
	 * Get settings.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function get_settings( $request ) {
		return new WP_REST_Response( WPMP_Settings::get_all(), 200 );
	}

	/**
	 * Update settings.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function update_settings( $request ) {
		$json_params = $request->get_json_params();
		$params      = ! empty( $json_params ) ? $json_params : $request->get_params();
		$allowed     = array( 'recent_upload_days', 'trash_retention_days', 'batch_size', 'scan_woocommerce', 'skip_recent', 'exclude_file_types', 'wizard_seen' );
		$update      = array();

		foreach ( $allowed as $key ) {
			if ( ! isset( $params[ $key ] ) ) {
				continue;
			}
			if ( 'recent_upload_days' === $key ) {
				$update[ $key ] = min( 90, max( 0, absint( $params[ $key ] ) ) );
			} elseif ( 'trash_retention_days' === $key ) {
				$update[ $key ] = min( 365, max( 7, absint( $params[ $key ] ) ) );
			} elseif ( 'batch_size' === $key ) {
				$update[ $key ] = min( 500, max( 50, absint( $params[ $key ] ) ) );
			} elseif ( 'scan_woocommerce' === $key || 'skip_recent' === $key || 'wizard_seen' === $key ) {
				$update[ $key ] = (bool) $params[ $key ];
			} elseif ( 'exclude_file_types' === $key && is_array( $params[ $key ] ) ) {
				$update[ $key ] = array_values( array_map( 'sanitize_key', $params[ $key ] ) );
			}
		}

		if ( ! empty( $update ) ) {
			WPMP_Settings::update( $update );
		}

		return new WP_REST_Response( WPMP_Settings::get_all(), 200 );
	}

	/**
	 * Get duplicate files (by file_hash).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function get_duplicates( $request ) {
		global $wpdb;

		$table = $wpdb->prefix . 'wpmp_scan_results';

		$groups = $wpdb->get_results(
			"SELECT file_hash, GROUP_CONCAT(attachment_id) as ids, COUNT(*) as cnt, SUM(file_size) as total_size
			FROM {$table}
			WHERE file_hash != '' AND status IN ('used','unused')
			GROUP BY file_hash
			HAVING cnt > 1
			ORDER BY total_size DESC",
			ARRAY_A
		);

		$result = array();

		foreach ( $groups as $row ) {
			$ids          = array_map( 'absint', explode( ',', $row['ids'] ) );
			$placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
			$rows = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT attachment_id, file_path, file_size FROM {$table} WHERE attachment_id IN ({$placeholders})",
					...$ids
				),
				ARRAY_A
			);
			$items = array();
			foreach ( $rows as $r ) {
				$items[] = array(
					'attachment_id'  => (int) $r['attachment_id'],
					'thumbnail_url'  => wp_get_attachment_image_url( $r['attachment_id'], 'thumbnail' ),
					'attachment_url' => wp_get_attachment_url( $r['attachment_id'] ),
					'filename'       => basename( $r['file_path'] ),
					'file_size'      => (int) $r['file_size'],
				);
			}
			$one_copy_size = ! empty( $items ) ? (int) $items[0]['file_size'] : 0;

			$result[] = array(
				'file_hash'  => $row['file_hash'],
				'count'      => (int) $row['cnt'],
				'total_size' => (int) $row['total_size'],
				'savings'    => (int) $row['total_size'] - $one_copy_size,
				'items'      => $items,
			);
		}

		return new WP_REST_Response(
			array(
				'groups'       => $result,
				'total_groups' => count( $result ),
			),
			200
		);
	}

	/**
	 * System health check endpoint.
	 * Returns an array of checks so the Status tab can display them.
	 *
	 * @return WP_REST_Response
	 */
	public function get_health() {
		global $wpdb;

		$checks = array();

		// 1. REST API — if we reached here, it's working.
		$checks['rest_api'] = array(
			'label'  => 'REST API',
			'status' => 'ok',
			'note'   => 'REST API is accessible. The plugin can communicate with WordPress correctly.',
		);

		// 2. Database tables.
		$tables_needed = array(
			$wpdb->prefix . 'wpmp_scan_results',
			$wpdb->prefix . 'wpmp_scan_log',
			$wpdb->prefix . 'wpmp_storage_snapshots',
		);
		$missing       = array();
		foreach ( $tables_needed as $table ) {
			$exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) );
			if ( ! $exists ) {
				$missing[] = str_replace( $wpdb->prefix, '', $table );
			}
		}
		$checks['db_tables'] = array(
			'label'  => 'Database Tables',
			'status' => empty( $missing ) ? 'ok' : 'error',
			'note'   => empty( $missing )
				? 'All plugin database tables are present.'
				: 'Missing tables: ' . implode( ', ', $missing ) . '. Try deactivating and reactivating the plugin to recreate them.',
		);

		// 3. PHP version.
		$php_version           = phpversion();
		$php_ok                = version_compare( $php_version, '7.4', '>=' );
		$checks['php_version'] = array(
			'label'  => 'PHP Version',
			'status' => $php_ok ? 'ok' : 'error',
			'note'   => 'PHP ' . $php_version . ( $php_ok ? ' — meets the PHP 7.4+ requirement.' : ' — PHP 7.4 or higher is required. Please upgrade PHP.' ),
		);

		// 4. WordPress version.
		$wp_version           = get_bloginfo( 'version' );
		$wp_ok                = version_compare( $wp_version, '5.8', '>=' );
		$checks['wp_version'] = array(
			'label'  => 'WordPress Version',
			'status' => $wp_ok ? 'ok' : 'error',
			'note'   => 'WordPress ' . $wp_version . ( $wp_ok ? ' — meets the WP 5.8+ requirement.' : ' — WordPress 5.8 or higher is required.' ),
		);

		// 5. PHP set_time_limit.
		$checks['set_time_limit'] = array(
			'label'  => 'PHP Execution Time',
			'status' => function_exists( 'set_time_limit' ) ? 'ok' : 'warning',
			'note'   => function_exists( 'set_time_limit' )
				? 'Execution time can be extended. Large media libraries will scan without timing out.'
				: 'set_time_limit() is disabled on your server. Large scans may time out. Contact your hosting provider.',
		);

		// 6. Upload directory writable.
		$upload_dir           = wp_upload_dir();
		$writable             = wp_is_writable( $upload_dir['basedir'] );
		$checks['upload_dir'] = array(
			'label'  => 'Upload Directory',
			'status' => $writable ? 'ok' : 'error',
			'note'   => $writable
				? 'Upload directory is writable (' . $upload_dir['basedir'] . ').'
				: 'Upload directory is not writable. The plugin cannot trash or manage files. Check folder permissions.',
		);

		// 7. WP Cron jobs.
		$cron_hooks   = array(
			'wpmp_purge_old_trash'  => 'Auto-purge trash',
			'wpmp_storage_snapshot' => 'Storage snapshots',
		);
		$cron_notes   = array();
		$cron_missing = array();
		foreach ( $cron_hooks as $hook => $label ) {
			$next = wp_next_scheduled( $hook );
			if ( $next ) {
				$cron_notes[] = $label . ': scheduled';
			} else {
				$cron_missing[] = $label;
				$cron_notes[]   = $label . ': not scheduled';
			}
		}
		$checks['cron'] = array(
			'label'  => 'WP Cron Jobs',
			'status' => empty( $cron_missing ) ? 'ok' : 'warning',
			'note'   => implode( '; ', $cron_notes ) . ( ! empty( $cron_missing ) ? '. If WP Cron is disabled on your server, automatic trash cleanup will not run.' : '' ),
		);

		// 8. PHP memory limit.
		$memory_limit     = ini_get( 'memory_limit' );
		$memory_bytes     = wp_convert_hr_to_bytes( $memory_limit );
		$mem_ok           = ( $memory_bytes >= 134217728 || '-1' === $memory_limit ); // 128MB
		$checks['memory'] = array(
			'label'  => 'PHP Memory Limit',
			'status' => $mem_ok ? 'ok' : 'warning',
			'note'   => 'Memory limit: ' . $memory_limit . ( $mem_ok ? ' — adequate for scanning large libraries.' : ' — 128MB or more recommended. Large libraries may fail to scan.' ),
		);

		// 9. WooCommerce.
		$woo_active            = class_exists( 'WooCommerce' );
		$checks['woocommerce'] = array(
			'label'  => 'WooCommerce',
			'status' => $woo_active ? 'ok' : 'info',
			'note'   => $woo_active
				? 'WooCommerce detected — product gallery images will be scanned.'
				: 'WooCommerce not active. Product gallery scanning is not needed.',
		);

		// 10. Last scan summary.
		$last_run            = get_option( 'wpmp_scan_last_run', null );
		$scan_count          = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}wpmp_scan_results" );
		$checks['last_scan'] = array(
			'label'  => 'Last Scan',
			'status' => $last_run ? 'ok' : 'info',
			'note'   => $last_run
				? 'Last run: ' . $last_run . ' — ' . $scan_count . ' file(s) in results database.'
				: 'No scan has been run yet. Go to the Scanner tab to start your first scan.',
		);

		return new WP_REST_Response( array( 'checks' => $checks ), 200 );
	}
}
