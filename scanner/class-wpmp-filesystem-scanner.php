<?php
/**
 * Filesystem Scanner — finds upload files not registered in WordPress.
 *
 * This scanner walks wp-content/uploads/ and compares every file against
 * the _wp_attached_file postmeta table to detect orphaned files that have
 * no attachment record.  Orphan detection is a Phase-2 Pro feature; this
 * class provides the foundation used by the main scanner on activation.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Filesystem_Scanner
 */
class WPMP_Filesystem_Scanner {

/**
 * Absolute path to the uploads base directory.
 *
 * @var string
 */
private $upload_dir;

/**
 * Constructor.
 */
public function __construct() {
$upload_info      = wp_upload_dir();
$this->upload_dir = trailingslashit( $upload_info['basedir'] );
}

/**
 * Return all file paths found on disk under the uploads directory.
 *
 * Skips hidden files, WP-generated thumbnails (files containing a
 * dimension suffix like -300x200), and the uploads index.php drop-in.
 *
 * @return string[] Absolute file paths.
 */
public function get_all_upload_files() {
if ( ! is_dir( $this->upload_dir ) ) {
return array();
}

$iterator = new RecursiveIteratorIterator(
new RecursiveDirectoryIterator( $this->upload_dir, RecursiveDirectoryIterator::SKIP_DOTS ),
RecursiveIteratorIterator::SELF_FIRST
);

$files = array();
foreach ( $iterator as $file ) {
if ( ! $file->isFile() ) {
continue;
}
$path = $file->getRealPath();
/* Skip hidden files */
if ( strpos( basename( $path ), '.' ) === 0 ) {
continue;
}
/* Skip WordPress-generated thumbnail variants (e.g. image-200x150.jpg) */
if ( preg_match( '/-\d+x\d+\.[a-zA-Z0-9]+$/', $path ) ) {
continue;
}
/* Skip the drop-in index.php */
if ( basename( $path ) === 'index.php' ) {
continue;
}
$files[] = $path;
}

return $files;
}

/**
 * Return all file paths that are registered as WordPress attachments.
 *
 * @return string[] Absolute file paths keyed by attachment ID.
 */
public function get_registered_files() {
global $wpdb;

$rows = $wpdb->get_results(
"SELECT post_id, meta_value
 FROM {$wpdb->postmeta}
 WHERE meta_key = '_wp_attached_file'",
ARRAY_A
);

$upload_dir = $this->upload_dir;
$registered = array();
foreach ( $rows as $row ) {
$registered[ (int) $row['post_id'] ] = $upload_dir . ltrim( $row['meta_value'], '/' );
}

return $registered;
}

/**
 * Return files on disk that have no corresponding attachment record.
 *
 * NOTE: This is a preparatory stub — orphaned file management is a
 * Phase-2 feature gated behind the Pro licence.  The return value is
 * intentionally empty in the free tier.
 *
 * @return array[] Each entry: ['path' => string, 'size' => int]
 */
public function get_orphaned_files() {
/* Pro gate — return empty in free tier */
if ( ! apply_filters( 'wpmp_is_pro', false ) ) {
return array();
}

$all_files  = $this->get_all_upload_files();
$registered = array_values( $this->get_registered_files() );

$orphans = array();
foreach ( $all_files as $path ) {
if ( ! in_array( $path, $registered, true ) ) {
$orphans[] = array(
'path' => $path,
'size' => (int) @filesize( $path ),
);
}
}

return $orphans;
}

/**
 * Return the total size (bytes) of all files in the uploads directory.
 *
 * Used by the storage stats endpoint as a cross-check against DB totals.
 *
 * @return int
 */
public function get_total_upload_size() {
$files = $this->get_all_upload_files();
$size  = 0;
foreach ( $files as $path ) {
$size += (int) @filesize( $path );
}
return $size;
}
}