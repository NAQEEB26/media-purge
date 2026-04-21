<?php
/**
 * Post content scanner.
 *
 * Scans post_content for attachment URLs and IDs.
 * Returns rich location data (post_id, post_title, type) for "Used In" display.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Content_Scanner
 */
class WPMP_Content_Scanner {

	/**
	 * Build set of attachment IDs and URLs found in post content.
	 * Also builds rich location data for "Used In" display.
	 *
	 * @return array{ids: int[], urls: string[], id_locations: array, url_post_map: array}
	 */
	public static function get_references() {
		global $wpdb;

		$ids          = array();
		$urls         = array();
		$id_locations = array(); // attachment_id => [ location_data, ... ]
		$url_post_map = array(); // url => [ location_data, ... ]

		// 1. Posts with upload URLs in post_content
		$posts_with_uploads = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ID, post_title FROM {$wpdb->posts}
				WHERE post_content LIKE %s
				AND post_status != %s
				AND post_type NOT IN ('revision', 'nav_menu_item')",
				'%' . $wpdb->esc_like( '/wp-content/uploads/' ) . '%',
				'trash'
			)
		);

		foreach ( $posts_with_uploads as $post_row ) {
			$post = get_post( $post_row->ID );
			if ( ! $post || empty( $post->post_content ) ) {
				continue;
			}

			$post_info = array(
				'post_id'    => (int) $post_row->ID,
				'post_title' => $post_row->post_title ? $post_row->post_title : '(no title)',
				'type'       => 'post_content',
			);

			$extracted_urls = self::extract_urls_from_content( $post->post_content );
			$extracted_ids  = self::extract_attachment_ids_from_content( $post->post_content );

			foreach ( $extracted_urls as $url ) {
				$urls[] = $url;
				if ( ! isset( $url_post_map[ $url ] ) ) {
					$url_post_map[ $url ] = array();
				}
				$url_post_map[ $url ][] = $post_info;
			}

			foreach ( $extracted_ids as $att_id ) {
				$att_id = (int) $att_id;
				if ( $att_id > 0 ) {
					$ids[] = $att_id;
					if ( ! isset( $id_locations[ $att_id ] ) ) {
						$id_locations[ $att_id ] = array();
					}
					$id_locations[ $att_id ][] = $post_info;
				}
			}
		}

		// 2. Gutenberg block IDs (with post tracking)
		$gutenberg_data = self::extract_gutenberg_block_ids_with_posts();
		foreach ( $gutenberg_data as $att_id => $post_infos ) {
			$ids[] = $att_id;
			if ( ! isset( $id_locations[ $att_id ] ) ) {
				$id_locations[ $att_id ] = array();
			}
			$id_locations[ $att_id ] = array_merge( $id_locations[ $att_id ], $post_infos );
		}

		return array(
			'ids'          => array_unique( array_map( 'absint', array_filter( $ids ) ) ),
			'urls'         => array_unique( array_filter( $urls ) ),
			'id_locations' => $id_locations,
			'url_post_map' => $url_post_map,
		);
	}

	/**
	 * Extract upload URLs from content.
	 *
	 * @param string $content Post content.
	 * @return string[]
	 */
	private static function extract_urls_from_content( $content ) {
		$urls = array();

		// Match wp-content/uploads URLs.
		if ( preg_match_all( '#(https?://[^"\'\s]+/wp-content/uploads/[^"\'\s]+)#i', $content, $matches ) ) {
			$urls = $matches[1];
		}

		// Match relative /wp-content/uploads/.
		if ( preg_match_all( '#(/wp-content/uploads/[^"\'\s\)]+)#i', $content, $matches ) ) {
			$urls = array_merge( $urls, $matches[1] );
		}

		return $urls;
	}

	/**
	 * Extract attachment IDs from content (img class, shortcodes, etc).
	 *
	 * @param string $content Post content.
	 * @return int[]
	 */
	private static function extract_attachment_ids_from_content( $content ) {
		$ids = array();

		// Match Gutenberg block JSON: "id":123.
		if ( preg_match_all( '#"id"\s*:\s*(\d+)#', $content, $matches ) ) {
			$ids = array_merge( $ids, $matches[1] );
		}

		// Shortcode pattern: attachment id=123.
		if ( preg_match_all( '#(?:attachment[-_]?id|id)\s*=\s*["\']?(\d+)#i', $content, $matches ) ) {
			$ids = array_merge( $ids, $matches[1] );
		}

		// [gallery ids="1,2,3"]
		if ( preg_match_all( '#ids\s*=\s*["\']([\d,]+)["\']#', $content, $matches ) ) {
			foreach ( $matches[1] as $id_list ) {
				$ids = array_merge( $ids, array_map( 'absint', explode( ',', $id_list ) ) );
			}
		}

		return $ids;
	}

	/**
	 * Extract attachment IDs from Gutenberg blocks, with post attribution.
	 *
	 * @return array attachment_id => [ location_data, ... ]
	 */
	private static function extract_gutenberg_block_ids_with_posts() {
		global $wpdb;

		$result = array();

		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ID, post_title, post_content FROM {$wpdb->posts}
				WHERE post_content LIKE %s
				AND post_status != %s",
				'%<!-- wp:%',
				'trash'
			)
		);

		foreach ( $rows as $post ) {
			if ( preg_match_all( '#"id"\s*:\s*(\d+)#', $post->post_content, $matches ) ) {
				foreach ( $matches[1] as $id ) {
					$id = (int) $id;
					if ( $id > 0 ) {
						if ( ! isset( $result[ $id ] ) ) {
							$result[ $id ] = array();
						}
						$result[ $id ][] = array(
							'type'       => 'post_content',
							'post_id'    => (int) $post->ID,
							'post_title' => $post->post_title ? $post->post_title : '(no title)',
						);
					}
				}
			}
		}

		return $result;
	}
}
