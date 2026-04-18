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
		register_rest_route( WPMP_REST_NAMESPACE, '/scan/status', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_scan_status' ),
			'permission_callback' => array( $this, 'check_admin_permission' ),
		) );

		register_rest_route( WPMP_REST_NAMESPACE, '/scan/start', array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'start_scan' ),
			'permission_callback' => array( $this, 'check_admin_permission' ),
		) );

		register_rest_route( WPMP_REST_NAMESPACE, '/scan/cancel', array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'cancel_scan' ),
			'permission_callback' => array( $this, 'check_admin_permission' ),
		) );

		register_rest_route( WPMP_REST_NAMESPACE, '/media/unused', array(
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
		) );

		register_rest_route( WPMP_REST_NAMESPACE, '/storage/stats', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_storage_stats' ),
			'permission_callback' => array( $this, 'check_admin_permission' ),
		) );

		register_rest_route( WPMP_REST_NAMESPACE, '/storage/largest', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_largest_files' ),
			'permission_callback' => array( $this, 'check_admin_permission' ),
			'args'                => array(
				'limit' => array(
					'default'           => 20,
					'sanitize_callback' => 'absint',
				),
			),
		) );

		register_rest_route( WPMP_REST_NAMESPACE, '/settings', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_settings' ),
			'permission_callback' => array( $this, 'check_admin_permission' ),
		) );

		register_rest_route( WPMP_REST_NAMESPACE, '/media/trashed', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_trashed_media' ),
			'permission_callback' => array( $this, 'check_admin_permission' ),
			'args'                => array(
				'page'     => array( 'default' => 1, 'sanitize_callback' => 'absint' ),
				'per_page' => array( 'default' => 20, 'sanitize_callback' => 'absint' ),
			),
		) );

		register_rest_route( WPMP_REST_NAMESPACE, '/media/trash', array(
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
		) );

		register_rest_route( WPMP_REST_NAMESPACE, '/media/restore', array(
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
		) );

		register_rest_route( WPMP_REST_NAMESPACE, '/media/whitelist', array(
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
		) );

		register_rest_route( WPMP_REST_NAMESPACE, '/media/duplicates', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_duplicates' ),
			'permission_callback' => array( $this, 'check_admin_permission' ),
		) );

		register_rest_route( WPMP_REST_NAMESPACE, '/media/delete', array(
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
		) );

		register_rest_route( WPMP_REST_NAMESPACE, '/settings', array(
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
		) );
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
			// Add post title and edit URL when we have a post_id
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

		return new WP_REST_Response( array(
			'running'   => (bool) $running,
			'last_run'  => $last_run,
			'progress'  => $running ? (int) get_transient( 'wpmp_scan_progress' ) : 100,
			'phase'     => $running ? (string) get_transient( 'wpmp_scan_phase' ) : 'done',
		), 200 );
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
			return new WP_REST_Response( array(
				'success' => false,
				'message' => __( 'A scan is already running.', 'wp-media-purge' ),
			), 400 );
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

			$url = add_query_arg( array(
				'action' => 'wpmp_run_scan',
				'token'  => $token,
			), admin_url( 'admin-ajax.php' ) );

			wp_remote_post( $url, array(
				'timeout'  => 0.01,
				'blocking' => false,
				'headers'  => array(
					'Cookie' => isset( $_SERVER['HTTP_COOKIE'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_COOKIE'] ) ) : '',
				),
			) );

			return new WP_REST_Response( array(
				'success' => true,
				'message' => __( 'Scan started in background (large library).', 'wp-media-purge' ),
			), 200 );
		}

		do_action( 'wpmp_start_scan' );

		return new WP_REST_Response( array(
			'success' => true,
			'message' => __( 'Scan started.', 'wp-media-purge' ),
		), 200 );
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

		return new WP_REST_Response( array(
			'success' => true,
			'message' => __( 'Scan cancelled.', 'wp-media-purge' ),
		), 200 );
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
		$where_sql  = "WHERE status = 'unused'";
		$args       = array();

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
				$args[] = 'application/pdf';
				$args[] = 'application/msword';
				$args[] = 'text/plain';
				$args[] = 'application/vnd.ms-excel';
				$args[] = 'application/vnd.openxmlformats-officedocument%';
			} elseif ( 'other' === $type ) {
				$where_sql .= ' AND mime_type NOT LIKE %s AND mime_type NOT LIKE %s AND mime_type NOT LIKE %s';
				$args[]     = 'image/%';
				$args[]     = 'video/%';
				$args[]     = 'application/pdf';
			}
		}

		// Build COUNT query.
		if ( $args ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $where_sql is built from a hardcoded allowlist, never user data.
			$total = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$table} {$where_sql}", $args ) );
		} else {
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- static query, no user input.
			$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} {$where_sql}" );
		}

		// Build results query — LIMIT and OFFSET are safe integers, never user strings.
		$args[] = $per_page;
		$args[] = $offset;
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $where_sql is from a hardcoded allowlist.
		$results = $wpdb->get_results(
			$wpdb->prepare( "SELECT * FROM {$table} {$where_sql} ORDER BY file_size DESC LIMIT %d OFFSET %d", $args ),
			ARRAY_A
		);

		foreach ( $results as &$row ) {
			$att_id = (int) $row['attachment_id'];
			$row['thumbnail_url']  = wp_get_attachment_image_url( $att_id, 'thumbnail' );
			$row['attachment_url'] = wp_get_attachment_url( $att_id );
			$row['filename']       = basename( $row['file_path'] );

			// Decode and enrich "Used In" data with post titles/edit links
			$row['used_in_data'] = $this->enrich_used_in( $row['used_in'] );
			unset( $row['used_in'] ); // Don't expose raw JSON
		}

		return new WP_REST_Response( array(
			'items'       => $results,
			'total'       => $total,
			'page'        => $page,
			'per_page'    => $per_page,
			'total_pages' => $total > 0 ? (int) ceil( $total / $per_page ) : 0,
		), 200 );
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
			$att_id = (int) $row['attachment_id'];
			$row['thumbnail_url']  = wp_get_attachment_image_url( $att_id, 'thumbnail' );
			$row['attachment_url'] = wp_get_attachment_url( $att_id );
			$row['filename']       = basename( $row['file_path'] );
			$row['used_in_data']   = $this->enrich_used_in( $row['used_in'] );
			unset( $row['used_in'] );
		}

		return new WP_REST_Response( array(
			'items'       => $results,
			'total'       => $total,
			'page'        => $page,
			'per_page'    => $per_page,
			'total_pages' => $total > 0 ? (int) ceil( $total / $per_page ) : 0,
		), 200 );
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
			return new WP_REST_Response( array(
				'success' => false,
				'message' => __( 'No files selected.', 'wp-media-purge' ),
			), 400 );
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

		return new WP_REST_Response( array(
			'success'  => true,
			'trashed'  => $trashed,
			'saved'    => $saved,
			'message'  => sprintf(
				/* translators: 1: number of files, 2: size saved */
				__( '%1$d file(s) moved to trash. %2$s freed.', 'wp-media-purge' ),
				$trashed,
				size_format( $saved )
			),
		), 200 );
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
			return new WP_REST_Response( array(
				'success' => false,
				'message' => __( 'No files selected.', 'wp-media-purge' ),
			), 400 );
		}

		$restored = 0;

		foreach ( $ids as $attachment_id ) {
			$attachment_id = absint( $attachment_id );
			if ( ! $attachment_id ) {
				continue;
			}

			$post = get_post( $attachment_id );
			if ( ! $post || $post->post_status !== 'trash' ) {
				continue;
			}

			wp_untrash_post( $attachment_id );
			$restored++;

			$wpdb->update(
				$table,
				array( 'status' => 'unused', 'trashed_date' => null ),
				array( 'attachment_id' => $attachment_id ),
				array( '%s', '%s' ),
				array( '%d' )
			);
		}

		return new WP_REST_Response( array(
			'success'  => true,
			'restored' => $restored,
			'message'  => sprintf(
				/* translators: %d: number of files */
				__( '%d file(s) restored.', 'wp-media-purge' ),
				$restored
			),
		), 200 );
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
			return new WP_REST_Response( array(
				'success' => false,
				'message' => __( 'No files selected.', 'wp-media-purge' ),
			), 400 );
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

		return new WP_REST_Response( array(
			'success' => true,
			'deleted' => $deleted,
			'freed'   => $freed,
			'message' => sprintf(
				/* translators: 1: number of files, 2: size freed */
				__( '%1$d file(s) permanently deleted. %2$s freed.', 'wp-media-purge' ),
				$deleted,
				size_format( $freed )
			),
		), 200 );
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
			return new WP_REST_Response( array(
				'success' => false,
				'message' => __( 'No files selected.', 'wp-media-purge' ),
			), 400 );
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

		return new WP_REST_Response( array(
			'success'     => true,
			'whitelisted' => $whitelisted,
			'message'     => sprintf(
				/* translators: %d: number of files */
				__( '%d file(s) whitelisted.', 'wp-media-purge' ),
				$whitelisted
			),
		), 200 );
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

		// Pre-scan fallback
		if ( 0 === $total_count ) {
			$total_count = (int) $wpdb->get_var(
				$wpdb->prepare( "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = %s", 'attachment' )
			);
		}

		// Storage breakdown by mime type group
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

		return new WP_REST_Response( array(
			'total_size'   => $total_size,
			'total_count'  => $total_count,
			'unused_count' => $unused_count,
			'unused_size'  => $unused_size,
			'by_type'      => $by_type,
			'last_scan'    => get_option( 'wpmp_scan_last_run', null ),
		), 200 );
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
			$att_id = (int) $row['attachment_id'];
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
		$params  = $request->get_json_params() ?: $request->get_params();
		$allowed = array( 'recent_upload_days', 'trash_retention_days', 'batch_size', 'scan_woocommerce', 'skip_recent', 'exclude_file_types', 'wizard_seen' );
		$update  = array();

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
			$ids   = array_map( 'absint', explode( ',', $row['ids'] ) );
			$placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
			$rows  = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT attachment_id, file_path, file_size FROM {$table} WHERE attachment_id IN ({$placeholders})",
					...$ids
				),
				ARRAY_A
			);
			$items = array();
			foreach ( $rows as $r ) {
				$items[] = array(
					'attachment_id'   => (int) $r['attachment_id'],
					'thumbnail_url'   => wp_get_attachment_image_url( $r['attachment_id'], 'thumbnail' ),
					'attachment_url'  => wp_get_attachment_url( $r['attachment_id'] ),
					'filename'        => basename( $r['file_path'] ),
					'file_size'       => (int) $r['file_size'],
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

		return new WP_REST_Response( array(
			'groups' => $result,
			'total_groups' => count( $result ),
		), 200 );
	}
}
