<?php
/**
 * Page builder scanner.
 *
 * Scans Elementor, Divi, WPBakery, Beaver Builder for image references.
 * FREE feature per 80/20 freemium plan.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_PageBuilder_Scanner
 */
class WPMP_PageBuilder_Scanner {

	/**
	 * Build set of attachment IDs and URLs from page builders.
	 * Includes rich location data (post_id, post_title, builder type) for "Used In" display.
	 *
	 * @return array{ids: int[], urls: string[], id_locations: array, url_post_map: array}
	 */
	public static function get_references() {
		$ids          = array();
		$urls         = array();
		$id_locations = array();
		$url_post_map = array();

		$builders = self::detect_active_builders();

		foreach ( $builders as $builder ) {
			$refs = self::scan_builder( $builder );
			$ids  = array_merge( $ids, $refs['ids'] );
			$urls = array_merge( $urls, $refs['urls'] );

			// Merge location data.
			foreach ( $refs['id_locations'] as $att_id => $locs ) {
				if ( ! isset( $id_locations[ $att_id ] ) ) {
					$id_locations[ $att_id ] = array();
				}
				$id_locations[ $att_id ] = array_merge( $id_locations[ $att_id ], $locs );
			}
			foreach ( $refs['url_post_map'] as $url => $locs ) {
				if ( ! isset( $url_post_map[ $url ] ) ) {
					$url_post_map[ $url ] = array();
				}
				$url_post_map[ $url ] = array_merge( $url_post_map[ $url ], $locs );
			}
		}

		return array(
			'ids'          => array_unique( array_filter( array_map( 'absint', $ids ) ) ),
			'urls'         => array_unique( array_filter( $urls ) ),
			'id_locations' => $id_locations,
			'url_post_map' => $url_post_map,
		);
	}

	/**
	 * Detect which page builders are active.
	 *
	 * @return string[]
	 */
	public static function detect_active_builders() {
		$builders = array();

		if ( defined( 'ELEMENTOR_VERSION' ) ) {
			$builders[] = 'elementor';
		}
		if ( defined( 'ET_BUILDER_PLUGIN_VERSION' ) || defined( 'ET_BUILDER_THEME_VERSION' ) ) {
			$builders[] = 'divi';
		}
		if ( defined( 'WPB_VC_VERSION' ) ) {
			$builders[] = 'wpbakery';
		}
		if ( defined( 'FL_BUILDER_VERSION' ) ) {
			$builders[] = 'beaver';
		}

		return $builders;
	}

	/**
	 * Scan a specific page builder.
	 *
	 * @param string $builder Builder slug.
	 * @return array{ids: int[], urls: string[], id_locations: array, url_post_map: array}
	 */
	private static function scan_builder( $builder ) {
		switch ( $builder ) {
			case 'elementor':
				return self::scan_elementor();
			case 'divi':
				return self::scan_divi();
			case 'wpbakery':
				return self::scan_wpbakery();
			case 'beaver':
				return self::scan_beaver();
			default:
				return array(
					'ids'          => array(),
					'urls'         => array(),
					'id_locations' => array(),
					'url_post_map' => array(),
				);
		}
	}

	/**
	 * Scan Elementor _elementor_data post meta.
	 *
	 * @return array{ids: int[], urls: string[], id_locations: array, url_post_map: array}
	 */
	private static function scan_elementor() {
		global $wpdb;

		$ids          = array();
		$urls         = array();
		$id_locations = array();
		$url_post_map = array();

		$rows = $wpdb->get_results(
			"SELECT pm.post_id, pm.meta_value, p.post_title
			FROM {$wpdb->postmeta} pm
			INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
			WHERE pm.meta_key = '_elementor_data'
			AND pm.meta_value != ''
			AND p.post_status != 'trash'",
			ARRAY_A
		);

		foreach ( $rows as $row ) {
			$data = json_decode( $row['meta_value'], true );
			if ( is_array( $data ) ) {
				$found     = self::extract_from_elementor_data( $data );
				$post_info = array(
					'type'       => 'elementor',
					'post_id'    => (int) $row['post_id'],
					'post_title' => $row['post_title'] ? $row['post_title'] : '(no title)',
				);
				foreach ( $found['ids'] as $att_id ) {
					$ids[] = $att_id;
					if ( ! isset( $id_locations[ $att_id ] ) ) {
						$id_locations[ $att_id ] = array();
					}
					$id_locations[ $att_id ][] = $post_info;
				}
				foreach ( $found['urls'] as $url ) {
					$urls[] = $url;
					if ( ! isset( $url_post_map[ $url ] ) ) {
						$url_post_map[ $url ] = array();
					}
					$url_post_map[ $url ][] = $post_info;
				}
			}
		}

		return array(
			'ids'          => $ids,
			'urls'         => $urls,
			'id_locations' => $id_locations,
			'url_post_map' => $url_post_map,
		);
	}

	/**
	 * Recursively extract IDs and URLs from Elementor data.
	 *
	 * @param array $data Elementor JSON data.
	 * @return array{ids: int[], urls: string[]}
	 */
	private static function extract_from_elementor_data( $data ) {
		$ids  = array();
		$urls = array();

		foreach ( $data as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$settings = isset( $item['settings'] ) && is_array( $item['settings'] ) ? $item['settings'] : array();
			foreach ( array( 'image', 'background_image', 'image_url', 'photo', 'logo' ) as $key ) {
				if ( ! empty( $settings[ $key ] ) ) {
					$val = $settings[ $key ];
					if ( is_array( $val ) ) {
						if ( ! empty( $val['id'] ) && is_numeric( $val['id'] ) ) {
							$ids[] = (int) $val['id'];
						}
						if ( ! empty( $val['url'] ) && is_string( $val['url'] ) ) {
							$urls[] = $val['url'];
						}
					} elseif ( is_string( $val ) && strpos( $val, '/wp-content/uploads/' ) !== false ) {
						$urls[] = $val;
					}
				}
			}
			if ( ! empty( $settings['url'] ) && is_string( $settings['url'] ) && strpos( $settings['url'], '/wp-content/uploads/' ) !== false ) {
				$urls[] = $settings['url'];
			}
			if ( ! empty( $item['elements'] ) ) {
				$child = self::extract_from_elementor_data( $item['elements'] );
				$ids   = array_merge( $ids, $child['ids'] );
				$urls  = array_merge( $urls, $child['urls'] );
			}
		}

		return array(
			'ids'  => $ids,
			'urls' => $urls,
		);
	}

	/**
	 * Scan Divi (post_content shortcodes).
	 *
	 * @return array{ids: int[], urls: string[], id_locations: array, url_post_map: array}
	 */
	private static function scan_divi() {
		global $wpdb;

		$ids          = array();
		$urls         = array();
		$id_locations = array();
		$url_post_map = array();

		$posts = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ID, post_title, post_content FROM {$wpdb->posts}
				WHERE post_content LIKE %s
				AND post_status != %s",
				'%et_pb_%',
				'trash'
			)
		);

		foreach ( $posts as $post ) {
			$loc = array(
				'type'       => 'divi',
				'post_id'    => (int) $post->ID,
				'post_title' => $post->post_title ? $post->post_title : '(no title)',
			);

			if ( preg_match_all( '#src=[\'"]([^\'"]+)[\'"]#', $post->post_content, $matches ) ) {
				foreach ( $matches[1] as $url ) {
					if ( strpos( $url, '/wp-content/uploads/' ) !== false ) {
						$urls[] = $url;
						if ( ! isset( $url_post_map[ $url ] ) ) {
							$url_post_map[ $url ] = array();
						}
						$url_post_map[ $url ][] = $loc;
					}
				}
			}
		}

		return array(
			'ids'          => $ids,
			'urls'         => $urls,
			'id_locations' => $id_locations,
			'url_post_map' => $url_post_map,
		);
	}

	/**
	 * Scan WPBakery (vc shortcodes).
	 *
	 * @return array{ids: int[], urls: string[], id_locations: array, url_post_map: array}
	 */
	private static function scan_wpbakery() {
		global $wpdb;

		$ids          = array();
		$urls         = array();
		$id_locations = array();
		$url_post_map = array();

		$posts = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ID, post_title, post_content FROM {$wpdb->posts}
				WHERE (post_content LIKE %s OR post_content LIKE %s)
				AND post_status != %s",
				'%[vc_%',
				'%[vc_single_image%',
				'trash'
			)
		);

		foreach ( $posts as $post ) {
			$loc = array(
				'type'       => 'wpbakery',
				'post_id'    => (int) $post->ID,
				'post_title' => $post->post_title ? $post->post_title : '(no title)',
			);
			if ( preg_match_all( '#image=["\']?(\d+)["\']?#', $post->post_content, $matches ) ) {
				foreach ( $matches[1] as $att_id ) {
					$att_id = (int) $att_id;
					if ( $att_id > 0 ) {
						$ids[] = $att_id;
						if ( ! isset( $id_locations[ $att_id ] ) ) {
							$id_locations[ $att_id ] = array();
						}
						$id_locations[ $att_id ][] = $loc;
					}
				}
			}
			if ( preg_match_all( '#(https?://[^"\'\s]+/wp-content/uploads/[^"\'\s]+)#i', $post->post_content, $matches ) ) {
				foreach ( $matches[1] as $url ) {
					$urls[] = $url;
					if ( ! isset( $url_post_map[ $url ] ) ) {
						$url_post_map[ $url ] = array();
					}
					$url_post_map[ $url ][] = $loc;
				}
			}
		}

		return array(
			'ids'          => $ids,
			'urls'         => $urls,
			'id_locations' => $id_locations,
			'url_post_map' => $url_post_map,
		);
	}

	/**
	 * Scan Beaver Builder _fl_builder_data.
	 *
	 * @return array{ids: int[], urls: string[], id_locations: array, url_post_map: array}
	 */
	private static function scan_beaver() {
		global $wpdb;

		$ids          = array();
		$urls         = array();
		$id_locations = array();
		$url_post_map = array();

		$rows = $wpdb->get_results(
			"SELECT pm.post_id, pm.meta_value, p.post_title
			FROM {$wpdb->postmeta} pm
			INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
			WHERE pm.meta_key = '_fl_builder_data'
			AND pm.meta_value != ''
			AND p.post_status != 'trash'",
			ARRAY_A
		);

		foreach ( $rows as $row ) {
			$data = maybe_unserialize( $row['meta_value'] );
			if ( is_array( $data ) ) {
				$found     = self::extract_from_beaver_data( $data );
				$post_info = array(
					'type'       => 'beaver',
					'post_id'    => (int) $row['post_id'],
					'post_title' => $row['post_title'] ? $row['post_title'] : '(no title)',
				);
				foreach ( $found['ids'] as $att_id ) {
					$ids[] = $att_id;
					if ( ! isset( $id_locations[ $att_id ] ) ) {
						$id_locations[ $att_id ] = array();
					}
					$id_locations[ $att_id ][] = $post_info;
				}
				foreach ( $found['urls'] as $url ) {
					$urls[] = $url;
					if ( ! isset( $url_post_map[ $url ] ) ) {
						$url_post_map[ $url ] = array();
					}
					$url_post_map[ $url ][] = $post_info;
				}
			}
		}

		return array(
			'ids'          => $ids,
			'urls'         => $urls,
			'id_locations' => $id_locations,
			'url_post_map' => $url_post_map,
		);
	}

	/**
	 * Recursively extract from Beaver Builder data.
	 *
	 * @param array $data Beaver data.
	 * @return array{ids: int[], urls: string[]}
	 */
	private static function extract_from_beaver_data( $data ) {
		$ids  = array();
		$urls = array();

		foreach ( $data as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			foreach ( array( 'photo', 'photo_src', 'bg_image', 'image' ) as $key ) {
				if ( ! empty( $item[ $key ] ) && is_string( $item[ $key ] ) ) {
					if ( strpos( $item[ $key ], '/wp-content/uploads/' ) !== false ) {
						$urls[] = $item[ $key ];
					}
				}
				if ( ! empty( $item[ $key ] ) && is_numeric( $item[ $key ] ) ) {
					$ids[] = (int) $item[ $key ];
				}
			}
			if ( ! empty( $item['nodes'] ) ) {
				$child = self::extract_from_beaver_data( $item['nodes'] );
				$ids   = array_merge( $ids, $child['ids'] );
				$urls  = array_merge( $urls, $child['urls'] );
			}
		}

		return array(
			'ids'  => $ids,
			'urls' => $urls,
		);
	}
}
