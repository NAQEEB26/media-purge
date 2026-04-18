<?php
/**
 * Admin-specific functionality.
 *
 * @package WP_Media_Purge
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WPMP_Admin
 */
class WPMP_Admin {

	/**
	 * Menu slug.
	 */
	const MENU_SLUG = 'wp-media-purge';

	/**
	 * Initialize admin hooks.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'admin_init', array( $this, 'handle_export' ) );
	}

	/**
	 * Add admin menu under Media.
	 */
	public function add_admin_menu() {
		add_media_page(
			__( 'Media Purge', 'wp-media-purge' ),
			__( 'Media Purge', 'wp-media-purge' ),
			'manage_options',
			self::MENU_SLUG,
			array( $this, 'render_admin_page' )
		);
	}

	/**
	 * Enqueue admin assets.
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_assets( $hook ) {
		if ( false === strpos( $hook, self::MENU_SLUG ) ) {
			return;
		}

		// No external font CDN — uses system font stack defined in admin.css
		// to avoid GDPR concerns with Google Fonts and potential WP.org rejection.

		wp_enqueue_style(
			'wpmp-admin',
			WPMP_PLUGIN_URL . 'assets/css/admin.css',
			array(),
			WPMP_VERSION
		);

		wp_enqueue_script(
			'wpmp-admin',
			WPMP_PLUGIN_URL . 'assets/js/admin.js',
			array( 'jquery' ),
			WPMP_VERSION,
			true
		);

		wp_localize_script( 'wpmp-admin', 'wpmpAdmin', array(
			'ajaxUrl'      => admin_url( 'admin-ajax.php' ),
			'restUrl'      => rest_url( WPMP_REST_NAMESPACE . '/' ),
			'nonce'        => wp_create_nonce( 'wp_rest' ),
			'adminUrl'     => admin_url( 'admin.php' ),
			'exportCsvUrl' => wp_nonce_url(
				admin_url( 'admin.php?page=wp-media-purge&action=export_csv' ),
				'wpmp_export_csv'
			),
			'isPro'        => wpmp_is_pro(),
			'upgradeUrl'   => 'https://naqeebulrehman.com/wp-media-purge-pro',
			'strings'      => array(
				'dashboard'          => __( 'Dashboard', 'wp-media-purge' ),
				'scanner'            => __( 'Scanner', 'wp-media-purge' ),
				'recovery'           => __( 'Recovery', 'wp-media-purge' ),
				'settings'           => __( 'Settings', 'wp-media-purge' ),
				'duplicates'         => __( 'Duplicates', 'wp-media-purge' ),
				'scanning'           => __( 'Scanning…', 'wp-media-purge' ),
				'scanQueued'         => __( 'Scan queued, starting shortly…', 'wp-media-purge' ),
				'scanComplete'       => __( 'Scan complete', 'wp-media-purge' ),
				'scanFailed'         => __( 'Scan failed. Please try again.', 'wp-media-purge' ),
				'scanRunning'        => __( 'A scan is already running.', 'wp-media-purge' ),
				'runScan'            => __( 'Run Scan Now', 'wp-media-purge' ),
				'lastScan'           => __( 'Last scan:', 'wp-media-purge' ),
				'never'              => __( 'Never', 'wp-media-purge' ),
				'viewUnused'         => __( 'View Unused Files', 'wp-media-purge' ),
				'notUsedAnywhere'    => __( 'Not used anywhere', 'wp-media-purge' ),
				'usedIn'             => __( 'Used in:', 'wp-media-purge' ),
				'trash'              => __( 'Trash', 'wp-media-purge' ),
				'whitelist'          => __( 'Keep', 'wp-media-purge' ),
				'whitelisted'        => __( 'Whitelisted', 'wp-media-purge' ),
				'restore'            => __( 'Restore', 'wp-media-purge' ),
				'delete'             => __( 'Delete Permanently', 'wp-media-purge' ),
				'selectAll'          => __( 'Select All', 'wp-media-purge' ),
				'confirmTrash'       => __( 'Move selected files to trash?', 'wp-media-purge' ),
				'confirmTrashDesc'   => __( 'These files will be moved to trash and can be recovered within your retention period.', 'wp-media-purge' ),
				'confirmDelete'      => __( 'Permanently delete selected files?', 'wp-media-purge' ),
				'confirmDeleteDesc'  => __( 'This action cannot be undone. The files will be permanently removed from your server.', 'wp-media-purge' ),
				'cancel'             => __( 'Cancel', 'wp-media-purge' ),
				'yesMoveToTrash'     => __( 'Yes, Move to Trash', 'wp-media-purge' ),
				'yesDelete'          => __( 'Yes, Delete Permanently', 'wp-media-purge' ),
				'noFilesSelected'    => __( 'No files selected.', 'wp-media-purge' ),
				'loading'            => __( 'Loading…', 'wp-media-purge' ),
				'loadMore'           => __( 'Load More', 'wp-media-purge' ),
				'noUnused'           => __( 'No unused files found. Run a scan first.', 'wp-media-purge' ),
				'noTrashed'          => __( 'No trashed files.', 'wp-media-purge' ),
				'noDuplicates'       => __( 'No duplicates found. Run a scan first.', 'wp-media-purge' ),
				'exportCsv'          => __( 'Export CSV', 'wp-media-purge' ),
				'filterAll'          => __( 'All Types', 'wp-media-purge' ),
				'filterImage'        => __( 'Images', 'wp-media-purge' ),
				'filterVideo'        => __( 'Videos', 'wp-media-purge' ),
				'filterDocument'     => __( 'Documents', 'wp-media-purge' ),
				'filterOther'        => __( 'Other', 'wp-media-purge' ),
				'saveSettings'       => __( 'Save Settings', 'wp-media-purge' ),
				'settingsSaved'      => __( 'Settings saved.', 'wp-media-purge' ),
				'settingsFailed'     => __( 'Failed to save settings.', 'wp-media-purge' ),
				/* Tab descriptions for non-tech users */
				'dashboardDesc'      => __( 'Overview of your media library health and storage usage.', 'wp-media-purge' ),
				'scannerDesc'        => __( 'Review files that are not used anywhere on your site. You can safely trash or keep them.', 'wp-media-purge' ),
				'recoveryDesc'       => __( 'Files you previously trashed. Restore them if needed, or delete permanently.', 'wp-media-purge' ),
				'settingsDesc'       => __( 'Configure how Media Purge works for your site.', 'wp-media-purge' ),
				'duplicatesDesc'     => __( 'Groups of identical files wasting disk space.', 'wp-media-purge' ),
				/* How it works steps */
				'howItWorks'         => __( 'How It Works', 'wp-media-purge' ),
				'step1Title'         => __( 'Scan', 'wp-media-purge' ),
				'step1Desc'          => __( 'Analyze your entire media library to find files not used in any post, page, widget, or page builder.', 'wp-media-purge' ),
				'step2Title'         => __( 'Review', 'wp-media-purge' ),
				'step2Desc'          => __( 'Browse the results, check where each file is used, and decide which ones to clean up.', 'wp-media-purge' ),
				'step3Title'         => __( 'Clean', 'wp-media-purge' ),
				'step3Desc'          => __( 'Move unused files to trash or keep them. Nothing is permanently deleted until you say so.', 'wp-media-purge' ),
				/* Tooltips / help */
				'helpTrash'          => __( 'Move this file to trash. You can restore it later from the Recovery tab.', 'wp-media-purge' ),
				'helpWhitelist'      => __( 'Mark this file as "keep" so it won\'t be flagged as unused again in future scans.', 'wp-media-purge' ),
				'helpRestore'        => __( 'Restore this file back to your media library. It will no longer be in trash.', 'wp-media-purge' ),
				'helpPermDelete'     => __( 'Permanently delete this file from your server. This cannot be undone.', 'wp-media-purge' ),
				/* location type labels */
				'locTypePost'        => __( 'Post', 'wp-media-purge' ),
				'locTypePage'        => __( 'Page', 'wp-media-purge' ),
				'locTypeFeatured'    => __( 'Featured Image', 'wp-media-purge' ),
				'locTypeWidget'      => __( 'Widget', 'wp-media-purge' ),
				'locTypeCustomizer'  => __( 'Theme Customizer', 'wp-media-purge' ),
				'locTypeElementor'   => __( 'Elementor', 'wp-media-purge' ),
				'locTypeDivi'        => __( 'Divi', 'wp-media-purge' ),
				'locTypeWpBakery'    => __( 'WPBakery', 'wp-media-purge' ),
				'locTypeBeaver'      => __( 'Beaver Builder', 'wp-media-purge' ),
				/* storage labels */
				'storageUsed'        => __( 'Storage Used', 'wp-media-purge' ),
				'storageUnused'      => __( 'Unused', 'wp-media-purge' ),
				'storageImages'      => __( 'Images', 'wp-media-purge' ),
				'storageVideos'      => __( 'Videos', 'wp-media-purge' ),
				'storageAudio'       => __( 'Audio', 'wp-media-purge' ),
				'storageDocuments'   => __( 'Documents', 'wp-media-purge' ),
				'storageOther'       => __( 'Other', 'wp-media-purge' ),
				/* pro gate */
				'proFeature'         => __( 'Pro Feature', 'wp-media-purge' ),
				'upgradeToPro'       => __( 'Upgrade to Pro', 'wp-media-purge' ),
				'proDuplicatesMsg'   => __( 'Merge duplicates and reclaim disk space with one click — available in Pro.', 'wp-media-purge' ),
				'proScheduleMsg'     => __( 'Scheduled automatic cleanup — available in Pro.', 'wp-media-purge' ),
				'proFoldersMsg'      => __( 'Organise media into virtual folders — available in Pro.', 'wp-media-purge' ),
				/* Settings help */
				'recentDaysHelp'     => __( 'Files uploaded within this period are protected from being flagged as unused. This prevents newly uploaded files from being incorrectly marked.', 'wp-media-purge' ),
				'trashDaysHelp'      => __( 'Files in trash will be automatically and permanently deleted after this many days. Set a longer period if you want more time to recover files.', 'wp-media-purge' ),
				/* Additional UI strings for full i18n */
				'totalMedia'         => __( 'Total Media', 'wp-media-purge' ),
				'potentialSavings'   => __( 'Potential Savings', 'wp-media-purge' ),
				'storageBreakdown'   => __( 'Storage Breakdown', 'wp-media-purge' ),
				'rescan'             => __( 'Re-scan', 'wp-media-purge' ),
				'unusedFilesFound'   => __( '%d unused file(s) found', 'wp-media-purge' ),
				'filesInTrash'       => __( '%d file(s) in trash', 'wp-media-purge' ),
				'trashEmpty'         => __( 'Trash is Empty', 'wp-media-purge' ),
				'trashEmptyDesc'     => __( 'No files in trash. When you move unused media to trash from the Scanner tab, they will appear here for recovery.', 'wp-media-purge' ),
				'noDupesTitle'       => __( 'No Duplicates Found', 'wp-media-purge' ),
				'noDupesDesc'        => __( 'Great news! No duplicate files were detected. Run a new scan to check again.', 'wp-media-purge' ),
				'identicalFiles'     => __( 'identical files', 'wp-media-purge' ),
				'save'               => __( 'Save', 'wp-media-purge' ),
				'dupGroupsFound'     => __( '%d duplicate group(s) found', 'wp-media-purge' ),
				'scanProtection'     => __( 'Scan Protection', 'wp-media-purge' ),
				'scanProtectionDesc' => __( 'Control how the scanner identifies unused files to prevent false positives.', 'wp-media-purge' ),
				'trashManagement'    => __( 'Trash Management', 'wp-media-purge' ),
				'trashMgmtDesc'      => __( 'Configure how long trashed files are kept before automatic permanent deletion.', 'wp-media-purge' ),
				'recentDaysLabel'    => __( 'Recent upload protection (days)', 'wp-media-purge' ),
				'trashDaysLabel'     => __( 'Trash retention (days)', 'wp-media-purge' ),
				'saving'             => __( 'Saving…', 'wp-media-purge' ),
				'pctComplete'        => __( '% complete', 'wp-media-purge' ),
				'scanMayTakeMoment'  => __( 'This may take a moment depending on the size of your media library. Please do not close this page.', 'wp-media-purge' ),
				'scanLibrary'        => __( 'Scan Your Media Library', 'wp-media-purge' ),
				'scanLibraryDesc'    => __( 'Click the button below to analyze your entire media library. The scanner will check every post, page, widget, and page builder to find files that are no longer in use.', 'wp-media-purge' ),
				'safeNote'           => __( 'Safe & non-destructive — nothing is deleted automatically', 'wp-media-purge' ),
				'restoreSelected'    => __( 'Restore Selected', 'wp-media-purge' ),
				'deletePermanently'  => __( 'Delete Permanently', 'wp-media-purge' ),
				'filesSelected'      => __( 'file(s) selected', 'wp-media-purge' ),
				'filesAndSize'       => __( 'file(s)', 'wp-media-purge' ),
				/* Undo toast */
				'movedToTrash'       => __( 'moved to trash', 'wp-media-purge' ),
				'freed'              => __( 'freed', 'wp-media-purge' ),
				'undo'               => __( 'Undo', 'wp-media-purge' ),
				'undoing'            => __( 'Undoing…', 'wp-media-purge' ),
				'undone'             => __( 'Restored! Files are back in your library.', 'wp-media-purge' ),
				/* Restorable badge */
				'restorableNote'     => __( 'Restorable within 30 days from Recovery tab', 'wp-media-purge' ),
				/* Scan phase labels */
				'scanPhaseContent'   => __( 'Checking post content…', 'wp-media-purge' ),
				'scanPhaseMeta'      => __( 'Checking post meta & featured images…', 'wp-media-purge' ),
				'scanPhaseOptions'   => __( 'Checking widgets & theme customizer…', 'wp-media-purge' ),
				'scanPhaseBuilder'   => __( 'Checking page builders (Elementor, Divi…)…', 'wp-media-purge' ),
				'scanPhaseWriting'   => __( 'Saving results…', 'wp-media-purge' ),
				'scanPhaseDone'      => __( 'Finalising…', 'wp-media-purge' ),
				'phase'              => __( 'Phase', 'wp-media-purge' ),
				/* Accessibility labels */
				'tabNavLabel'        => __( 'Plugin navigation', 'wp-media-purge' ),
				'selectItem'         => __( 'Select this item', 'wp-media-purge' ),
				'previewImage'       => __( 'Preview image', 'wp-media-purge' ),
				/* New v1.3 strings */
				'quickActions'       => __( 'Quick Actions', 'wp-media-purge' ),
				'lastScanLabel'      => __( 'Last Scan', 'wp-media-purge' ),
				'unusedFiles'        => __( 'Unused Files', 'wp-media-purge' ),
				'startFullScan'      => __( 'Start Full Scan', 'wp-media-purge' ),
				'mediaItems'         => __( 'media items', 'wp-media-purge' ),
				'scanSources'        => __( 'Scan Sources', 'wp-media-purge' ),
				'postContent'        => __( 'Post Content', 'wp-media-purge' ),
				'metaFields'         => __( 'Meta Fields', 'wp-media-purge' ),
				'widgets'            => __( 'Widgets', 'wp-media-purge' ),
				'elementor'          => __( 'Elementor', 'wp-media-purge' ),
				'diviPro'            => __( 'Divi', 'wp-media-purge' ),
				'wpBakeryPro'        => __( 'WPBakery', 'wp-media-purge' ),
				'beaverPro'          => __( 'Beaver Builder', 'wp-media-purge' ),
				'moveToTrash'        => __( 'Move to Trash', 'wp-media-purge' ),
				'moveItems'          => __( 'Move %d item(s) to trash', 'wp-media-purge' ),
				'trashSummary'       => __( '%d file(s) moved to trash — %s freed.', 'wp-media-purge' ),
				'restoreTrashed'     => __( 'Restore', 'wp-media-purge' ),
				'deselectAll'        => __( 'Deselect', 'wp-media-purge' ),
				'selected'           => __( 'selected', 'wp-media-purge' ),
				'manageStorage'      => __( 'Manage your storage', 'wp-media-purge' ),
				'scanSettings'       => __( 'Scan Settings', 'wp-media-purge' ),
				'scanSettingsDesc'   => __( 'Configure how the scanner identifies unused files.', 'wp-media-purge' ),
				'exclusions'         => __( 'Exclusions', 'wp-media-purge' ),
				'exclusionsDesc'     => __( 'File types and paths that are always skipped during scans.', 'wp-media-purge' ),
				'skipRecentUploads'  => __( 'Skip recent uploads', 'wp-media-purge' ),
				'skipRecentDesc'     => __( 'Protect recently uploaded files from being flagged as unused.', 'wp-media-purge' ),
				'autoTrash'          => __( 'Auto-delete trash', 'wp-media-purge' ),
				'autoTrashDesc'      => __( 'Permanently delete trashed files after the retention period.', 'wp-media-purge' ),
				'deepScan'           => __( 'Deep content scan', 'wp-media-purge' ),
				'deepScanDesc'       => __( 'Scan serialized data and shortcode attributes for media references.', 'wp-media-purge' ),
				'warningTitle'       => __( 'Important', 'wp-media-purge' ),
				'warningDesc'        => __( 'Always review scan results before trashing. Some files may be referenced dynamically.', 'wp-media-purge' ),
				'proUpgradeTitle'    => __( 'Upgrade to Pro — $49/year', 'wp-media-purge' ),
				'proUpgradeDesc'     => __( 'Get access to all premium features including page builder support, scheduled cleanup, and more.', 'wp-media-purge' ),
				'proGuarantee'       => __( '30-day money-back guarantee', 'wp-media-purge' ),
				'proScheduledClean'  => __( 'Scheduled Cleanup', 'wp-media-purge' ),
				'proScheduledDesc'   => __( 'Auto-clean on your schedule', 'wp-media-purge' ),
				'proPageBuilders'    => __( 'Page Builders', 'wp-media-purge' ),
				'proBuildersDesc'    => __( 'Divi, Beaver & WPBakery', 'wp-media-purge' ),
				'proVirtFolders'     => __( 'Virtual Folders', 'wp-media-purge' ),
				'proFoldersDesc2'    => __( 'Organize media visually', 'wp-media-purge' ),
				'proDupMerge'        => __( 'Duplicate Merge', 'wp-media-purge' ),
				'proDupMergeDesc'    => __( 'One-click deduplication', 'wp-media-purge' ),
				'help'               => __( 'Help', 'wp-media-purge' ),
				'documentation'      => __( 'Documentation', 'wp-media-purge' ),
				'support'            => __( 'Support', 'wp-media-purge' ),
				/* v1.4 — page titles */
				'overview'           => __( 'Overview', 'wp-media-purge' ),
				'storageAnalytics'   => __( 'Storage Analytics', 'wp-media-purge' ),
				'storageDesc'        => __( 'Understand what\u2019s taking up space', 'wp-media-purge' ),
				'folderOrganizer'    => __( 'Folder Organizer', 'wp-media-purge' ),
				'foldersDesc'        => __( 'Organize your media into virtual folders', 'wp-media-purge' ),
				'storageOverview'    => __( 'Storage Overview', 'wp-media-purge' ),
				'storageGrowth'      => __( 'Storage Growth', 'wp-media-purge' ),
				'unusedFilesSpace'   => __( 'Unused files space', 'wp-media-purge' ),
				'largestFiles'       => __( 'Largest Files', 'wp-media-purge' ),
				'viewStorageDetails' => __( 'View Storage Details', 'wp-media-purge' ),
				'freeMonthlyCleanups' => __( 'Free monthly cleanups', 'wp-media-purge' ),
				'goPro'              => __( 'Go Pro', 'wp-media-purge' ),
				'filesInTrashLabel'  => __( 'file(s) in trash — restorable within 30 days', 'wp-media-purge' ),
				'restoreAll'         => __( 'Restore All', 'wp-media-purge' ),
				'unusedFilesFound2'  => __( 'unused files found', 'wp-media-purge' ),
				'ofWastedStorage'    => __( 'of wasted storage · Safe to clean', 'wp-media-purge' ),
				'freePlan'           => __( 'FREE PLAN', 'wp-media-purge' ),
				'proHostingEstimator'     => __( 'Hosting Cost Estimator', 'wp-media-purge' ),
				'proHostingEstimatorDesc' => __( 'Enter your hosting plan cost and see how much unused files cost you.', 'wp-media-purge' ),
				'proFoldersFullDesc' => __( 'Create folders, drag & drop files, and organize your entire media library.', 'wp-media-purge' ),
				'proUpgradeTitle2'   => __( 'MediaPurge Pro', 'wp-media-purge' ),
				'scanWoo'            => __( 'Scan WooCommerce galleries', 'wp-media-purge' ),
				'scanWooDesc'        => __( 'Include product gallery images in scans.', 'wp-media-purge' ),
				'autoTrashLabel'     => __( 'Auto-purge trash after', 'wp-media-purge' ),
				'excludeFileTypes'   => __( 'Exclude file types', 'wp-media-purge' ),
				'runScan'            => __( 'Run New Scan', 'wp-media-purge' ),
			),
		) );
	}

	/**
	 * Handle CSV export via GET request.
	 */
	public function handle_export() {
		if ( ! isset( $_GET['page'], $_GET['action'] ) ) {
			return;
		}
		if ( $_GET['page'] !== self::MENU_SLUG || $_GET['action'] !== 'export_csv' ) {
			return;
		}
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to export data.', 'wp-media-purge' ) );
		}
		if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_GET['_wpnonce'] ), 'wpmp_export_csv' ) ) {
			wp_die( esc_html__( 'Security check failed.', 'wp-media-purge' ) );
		}

		global $wpdb;
		$table   = $wpdb->prefix . 'wpmp_scan_results';
		$results = $wpdb->get_results(
			"SELECT attachment_id, file_path, file_size, mime_type, status, used_in, scan_date
			 FROM {$table}
			 WHERE status = 'unused'
			 ORDER BY file_size DESC",
			ARRAY_A
		);

		$filename = 'wpmp-unused-media-' . gmdate( 'Y-m-d' ) . '.csv';
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
		header( 'Pragma: no-cache' );
		header( 'Expires: 0' );

		$out = fopen( 'php://output', 'w' );
		fputcsv( $out, array( 'ID', 'File Path', 'File Size (bytes)', 'MIME Type', 'Status', 'Used In', 'Scan Date' ) );
		foreach ( $results as $row ) {
			fputcsv( $out, array(
				$row['attachment_id'],
				$row['file_path'],
				$row['file_size'],
				$row['mime_type'],
				$row['status'],
				$row['used_in'],
				$row['scan_date'],
			) );
		}
		fclose( $out );
		exit;
	}

	/**
	 * Render admin page.
	 */
	public function render_admin_page() {
		?>
		<div class="wpmp-wrap">
			<div class="wpmp-plugin-header">
				<div class="wpmp-brand">
					<div class="wpmp-brand-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
					</div>
					<span class="wpmp-brand-name"><?php esc_html_e( 'Media', 'wp-media-purge' ); ?><span><?php esc_html_e( 'Purge', 'wp-media-purge' ); ?></span></span>
				</div>
				<nav class="wpmp-tabs" role="tablist" aria-label="<?php esc_attr_e( 'Plugin navigation', 'wp-media-purge' ); ?>">
					<button class="wpmp-tab active" role="tab" aria-selected="true" data-tab="dashboard">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>
						<?php esc_html_e( 'Dashboard', 'wp-media-purge' ); ?>
					</button>
					<button class="wpmp-tab" role="tab" aria-selected="false" data-tab="scanner">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
						<?php esc_html_e( 'Scanner', 'wp-media-purge' ); ?>
					</button>
					<button class="wpmp-tab" role="tab" aria-selected="false" data-tab="storage">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 0-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1m-3 0h6"/></svg>
						<?php esc_html_e( 'Storage', 'wp-media-purge' ); ?>
					</button>
					<button class="wpmp-tab" role="tab" aria-selected="false" data-tab="folders">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
						<?php esc_html_e( 'Folders', 'wp-media-purge' ); ?>
						<span class="wpmp-tag-pro"><?php esc_html_e( 'PRO', 'wp-media-purge' ); ?></span>
					</button>
					<button class="wpmp-tab" role="tab" aria-selected="false" data-tab="settings">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>
						<?php esc_html_e( 'Settings', 'wp-media-purge' ); ?>
					</button>
				</nav>
				<div class="wpmp-header-actions">
					<button class="wpmp-help-btn" type="button" onclick="window.open('https://naqeebulrehman.com/wp-media-purge-docs','_blank')">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
						<?php esc_html_e( 'Help', 'wp-media-purge' ); ?>
					</button>
				</div>
			</div>
			<div class="wpmp-page-content">
				<div id="wpmp-root" class="wpmp-admin-root">
					<div class="wpmp-loading">
						<span class="spinner is-active"></span>
						<p><?php esc_html_e( 'Loading...', 'wp-media-purge' ); ?></p>
					</div>
				</div>
			</div>
			<div class="wpmp-footer">
				<span>
					MediaPurge v<?php echo esc_html( WPMP_VERSION ); ?>
					&middot;
					<a href="https://naqeebulrehman.com/wp-media-purge-docs" target="_blank" rel="noopener"><?php esc_html_e( 'Documentation', 'wp-media-purge' ); ?></a>
					&middot;
					<a href="https://wordpress.org/support/plugin/wp-media-purge/" target="_blank" rel="noopener"><?php esc_html_e( 'Support', 'wp-media-purge' ); ?></a>
				</span>
				<span>
					<?php if ( ! wpmp_is_pro() ) : ?>
						<?php esc_html_e( 'Free Plan', 'wp-media-purge' ); ?>
						&middot;
						<a href="https://naqeebulrehman.com/wp-media-purge-pro" target="_blank" rel="noopener"><?php esc_html_e( 'Upgrade to Pro →', 'wp-media-purge' ); ?></a>
					<?php else : ?>
						<?php esc_html_e( 'Pro Plan', 'wp-media-purge' ); ?>
					<?php endif; ?>
				</span>
			</div>
			<div class="wpmp-toast-wrap" id="wpmp-toast-wrap"></div>
		</div>
		<?php
	}
}
