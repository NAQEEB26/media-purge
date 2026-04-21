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
	const MENU_SLUG = 'media-purge';

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
			__( 'Media Purge', 'media-purge' ),
			__( 'Media Purge', 'media-purge' ),
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

		wp_localize_script(
			'wpmp-admin',
			'wpmpAdmin',
			array(
				'ajaxUrl'          => admin_url( 'admin-ajax.php' ),
				'restUrl'          => rest_url( WPMP_REST_NAMESPACE . '/' ),
				'nonce'            => wp_create_nonce( 'wp_rest' ),
				'adminUrl'         => admin_url( 'admin.php' ),
				'pluginVersion'    => WPMP_VERSION,
				'recentUploadDays' => (int) WPMP_Settings::get( 'recent_upload_days', 30 ),
				'wizardSeen'       => (bool) WPMP_Settings::get( 'wizard_seen', false ),
				'hasWooCommerce'   => class_exists( 'WooCommerce' ),
				'exportCsvUrl'     => wp_nonce_url(
					admin_url( 'admin.php?page=media-purge&action=export_csv' ),
					'wpmp_export_csv'
				),
				'strings'          => array(
					'dashboard'               => __( 'Dashboard', 'media-purge' ),
					'scanner'                 => __( 'Scanner', 'media-purge' ),
					'recovery'                => __( 'Recovery', 'media-purge' ),
					'settings'                => __( 'Settings', 'media-purge' ),
					'duplicates'              => __( 'Duplicates', 'media-purge' ),
					'scanning'                => __( 'Scanning…', 'media-purge' ),
					'scanQueued'              => __( 'Scan queued, starting shortly…', 'media-purge' ),
					'scanComplete'            => __( 'Scan complete', 'media-purge' ),
					'scanFailed'              => __( 'Scan failed. Please try again.', 'media-purge' ),
					'scanRunning'             => __( 'A scan is already running.', 'media-purge' ),
					'runScan'                 => __( 'Run Scan Now', 'media-purge' ),
					'lastScan'                => __( 'Last scan:', 'media-purge' ),
					'never'                   => __( 'Never', 'media-purge' ),
					'viewUnused'              => __( 'View Unused Files', 'media-purge' ),
					'notUsedAnywhere'         => __( 'Not used anywhere', 'media-purge' ),
					'usedIn'                  => __( 'Used in:', 'media-purge' ),
					'trash'                   => __( 'Trash', 'media-purge' ),
					'whitelist'               => __( 'Keep', 'media-purge' ),
					'whitelisted'             => __( 'Whitelisted', 'media-purge' ),
					'restore'                 => __( 'Restore', 'media-purge' ),
					'delete'                  => __( 'Delete Permanently', 'media-purge' ),
					'selectAll'               => __( 'Select All', 'media-purge' ),
					'confirmTrash'            => __( 'Move selected files to trash?', 'media-purge' ),
					'confirmTrashDesc'        => __( 'These files will be moved to trash and can be recovered within your retention period.', 'media-purge' ),
					'confirmDelete'           => __( 'Permanently delete selected files?', 'media-purge' ),
					'confirmDeleteDesc'       => __( 'This action cannot be undone. The files will be permanently removed from your server.', 'media-purge' ),
					'cancel'                  => __( 'Cancel', 'media-purge' ),
					'yesMoveToTrash'          => __( 'Yes, Move to Trash', 'media-purge' ),
					'yesDelete'               => __( 'Yes, Delete Permanently', 'media-purge' ),
					'noFilesSelected'         => __( 'No files selected.', 'media-purge' ),
					'loading'                 => __( 'Loading…', 'media-purge' ),
					'loadMore'                => __( 'Load More', 'media-purge' ),
					'noUnused'                => __( 'No unused files found. Run a scan first.', 'media-purge' ),
					'noTrashed'               => __( 'No trashed files.', 'media-purge' ),
					'noDuplicates'            => __( 'No duplicates found. Run a scan first.', 'media-purge' ),
					'exportCsv'               => __( 'Export CSV', 'media-purge' ),
					'filterAll'               => __( 'All Types', 'media-purge' ),
					'filterImage'             => __( 'Images', 'media-purge' ),
					'filterVideo'             => __( 'Videos', 'media-purge' ),
					'filterDocument'          => __( 'Documents', 'media-purge' ),
					'filterOther'             => __( 'Other', 'media-purge' ),
					'saveSettings'            => __( 'Save Settings', 'media-purge' ),
					'settingsSaved'           => __( 'Settings saved.', 'media-purge' ),
					'settingsFailed'          => __( 'Failed to save settings.', 'media-purge' ),
					/* Tab descriptions for non-tech users */
					'dashboardDesc'           => __( 'Overview of your media library health and storage usage.', 'media-purge' ),
					'scannerDesc'             => __( 'Review files that are not used anywhere on your site. You can safely trash or keep them.', 'media-purge' ),
					'recoveryDesc'            => __( 'Files you previously trashed. Restore them if needed, or delete permanently.', 'media-purge' ),
					'settingsDesc'            => __( 'Configure how Media Purge works for your site.', 'media-purge' ),
					'duplicatesDesc'          => __( 'Groups of identical files wasting disk space.', 'media-purge' ),
					/* How it works steps */
					'howItWorks'              => __( 'How It Works', 'media-purge' ),
					'step1Title'              => __( 'Scan', 'media-purge' ),
					'step1Desc'               => __( 'Analyze your entire media library to find files not used in any post, page, widget, or page builder.', 'media-purge' ),
					'step2Title'              => __( 'Review', 'media-purge' ),
					'step2Desc'               => __( 'Browse the results, check where each file is used, and decide which ones to clean up.', 'media-purge' ),
					'step3Title'              => __( 'Clean', 'media-purge' ),
					'step3Desc'               => __( 'Move unused files to trash or keep them. Nothing is permanently deleted until you say so.', 'media-purge' ),
					/* Tooltips / help */
					'helpTrash'               => __( 'Move this file to trash. You can restore it later from the Recovery tab.', 'media-purge' ),
					'helpWhitelist'           => __( 'Mark this file as "keep" so it won\'t be flagged as unused again in future scans.', 'media-purge' ),
					'helpRestore'             => __( 'Restore this file back to your media library. It will no longer be in trash.', 'media-purge' ),
					'helpPermDelete'          => __( 'Permanently delete this file from your server. This cannot be undone.', 'media-purge' ),
					/* location type labels */
					'locTypePost'             => __( 'Post', 'media-purge' ),
					'locTypePage'             => __( 'Page', 'media-purge' ),
					'locTypeFeatured'         => __( 'Featured Image', 'media-purge' ),
					'locTypeWidget'           => __( 'Widget', 'media-purge' ),
					'locTypeCustomizer'       => __( 'Theme Customizer', 'media-purge' ),
					'locTypeElementor'        => __( 'Elementor', 'media-purge' ),
					'locTypeDivi'             => __( 'Divi', 'media-purge' ),
					'locTypeWpBakery'         => __( 'WPBakery', 'media-purge' ),
					'locTypeBeaver'           => __( 'Beaver Builder', 'media-purge' ),
					/* storage labels */
					'storageUsed'             => __( 'Storage Used', 'media-purge' ),
					'storageUnused'           => __( 'Unused', 'media-purge' ),
					'storageImages'           => __( 'Images', 'media-purge' ),
					'storageVideos'           => __( 'Videos', 'media-purge' ),
					'storageAudio'            => __( 'Audio', 'media-purge' ),
					'storageDocuments'        => __( 'Documents', 'media-purge' ),
					'storageOther'            => __( 'Other', 'media-purge' ),
					/* coming soon */
					'comingSoon'              => __( 'Coming Soon', 'media-purge' ),
					'comingSoonNote'          => __( 'This feature is in development and will be available in a future release.', 'media-purge' ),
					'upcomingFeaturesTitle'   => __( 'Upcoming Features', 'media-purge' ),
					'upcomingFeaturesDesc'    => __( 'Duplicate merge, virtual folders, scheduled auto-cleanup, and advanced analytics — all coming in a future release.', 'media-purge' ),
					/* Settings help */
					'recentDaysHelp'          => __( 'Files uploaded within this period are protected from being flagged as unused. This prevents newly uploaded files from being incorrectly marked.', 'media-purge' ),
					'trashDaysHelp'           => __( 'Files in trash will be automatically and permanently deleted after this many days. Set a longer period if you want more time to recover files.', 'media-purge' ),
					/* Additional UI strings for full i18n */
					'totalMedia'              => __( 'Total Media', 'media-purge' ),
					'potentialSavings'        => __( 'Potential Savings', 'media-purge' ),
					'storageBreakdown'        => __( 'Storage Breakdown', 'media-purge' ),
					'rescan'                  => __( 'Re-scan', 'media-purge' ),
					/* translators: %d: number of unused files found */
					'unusedFilesFound'        => __( '%d unused file(s) found', 'media-purge' ),
					/* translators: %d: number of files in trash */
					'filesInTrash'            => __( '%d file(s) in trash', 'media-purge' ),
					'trashEmpty'              => __( 'Trash is Empty', 'media-purge' ),
					'trashEmptyDesc'          => __( 'No files in trash. When you move unused media to trash from the Scanner tab, they will appear here for recovery.', 'media-purge' ),
					'noDupesTitle'            => __( 'No Duplicates Found', 'media-purge' ),
					'noDupesDesc'             => __( 'Great news! No duplicate files were detected. Run a new scan to check again.', 'media-purge' ),
					'identicalFiles'          => __( 'identical files', 'media-purge' ),
					'save'                    => __( 'Save', 'media-purge' ),
					/* translators: %d: number of duplicate groups */
					'dupGroupsFound'          => __( '%d duplicate group(s) found', 'media-purge' ),
					'scanProtection'          => __( 'Scan Protection', 'media-purge' ),
					'scanProtectionDesc'      => __( 'Control how the scanner identifies unused files to prevent false positives.', 'media-purge' ),
					'trashManagement'         => __( 'Trash Management', 'media-purge' ),
					'trashMgmtDesc'           => __( 'Configure how long trashed files are kept before automatic permanent deletion.', 'media-purge' ),
					'recentDaysLabel'         => __( 'Recent upload protection (days)', 'media-purge' ),
					'trashDaysLabel'          => __( 'Trash retention (days)', 'media-purge' ),
					'saving'                  => __( 'Saving…', 'media-purge' ),
					'pctComplete'             => __( '% complete', 'media-purge' ),
					'scanMayTakeMoment'       => __( 'This may take a moment depending on the size of your media library. Please do not close this page.', 'media-purge' ),
					'scanLibrary'             => __( 'Scan Your Media Library', 'media-purge' ),
					'scanLibraryDesc'         => __( 'Click the button below to analyze your entire media library. The scanner will check every post, page, widget, and page builder to find files that are no longer in use.', 'media-purge' ),
					'safeNote'                => __( 'Safe & non-destructive — nothing is deleted automatically', 'media-purge' ),
					'restoreSelected'         => __( 'Restore Selected', 'media-purge' ),
					'deletePermanently'       => __( 'Delete Permanently', 'media-purge' ),
					'filesSelected'           => __( 'file(s) selected', 'media-purge' ),
					'filesAndSize'            => __( 'file(s)', 'media-purge' ),
					/* Undo toast */
					'movedToTrash'            => __( 'moved to trash', 'media-purge' ),
					'freed'                   => __( 'freed', 'media-purge' ),
					'undo'                    => __( 'Undo', 'media-purge' ),
					'undoing'                 => __( 'Undoing…', 'media-purge' ),
					'undone'                  => __( 'Restored! Files are back in your library.', 'media-purge' ),
					/* Restorable badge */
					'restorableNote'          => __( 'Restorable within 30 days from Recovery tab', 'media-purge' ),
					/* Scan phase labels */
					'scanPhaseContent'        => __( 'Checking post content…', 'media-purge' ),
					'scanPhaseMeta'           => __( 'Checking post meta & featured images…', 'media-purge' ),
					'scanPhaseOptions'        => __( 'Checking widgets & theme customizer…', 'media-purge' ),
					'scanPhaseBuilder'        => __( 'Checking page builders (Elementor, Divi…)…', 'media-purge' ),
					'scanPhaseWriting'        => __( 'Saving results…', 'media-purge' ),
					'scanPhaseDone'           => __( 'Finalising…', 'media-purge' ),
					'phase'                   => __( 'Phase', 'media-purge' ),
					/* Accessibility labels */
					'tabNavLabel'             => __( 'Plugin navigation', 'media-purge' ),
					'selectItem'              => __( 'Select this item', 'media-purge' ),
					'previewImage'            => __( 'Preview image', 'media-purge' ),
					/* New v1.3 strings */
					'quickActions'            => __( 'Quick Actions', 'media-purge' ),
					'lastScanLabel'           => __( 'Last Scan', 'media-purge' ),
					'unusedFiles'             => __( 'Unused Files', 'media-purge' ),
					'startFullScan'           => __( 'Start Full Scan', 'media-purge' ),
					'mediaItems'              => __( 'media items', 'media-purge' ),
					'scanSources'             => __( 'Scan Sources', 'media-purge' ),
					'postContent'             => __( 'Post Content', 'media-purge' ),
					'metaFields'              => __( 'Meta Fields', 'media-purge' ),
					'widgets'                 => __( 'Widgets', 'media-purge' ),
					'elementor'               => __( 'Elementor', 'media-purge' ),
					'diviPro'                 => __( 'Divi', 'media-purge' ),
					'wpBakeryPro'             => __( 'WPBakery', 'media-purge' ),
					'beaverPro'               => __( 'Beaver Builder', 'media-purge' ),
					'moveToTrash'             => __( 'Move to Trash', 'media-purge' ),
					/* translators: %d: number of items to move to trash */
					'moveItems'               => __( 'Move %d item(s) to trash', 'media-purge' ),
					/* translators: 1: number of files moved to trash, 2: size freed (e.g. 1.2 MB) */
					'trashSummary'            => __( '%1$d file(s) moved to trash — %2$s freed.', 'media-purge' ),
					'restoreTrashed'          => __( 'Restore', 'media-purge' ),
					'deselectAll'             => __( 'Deselect', 'media-purge' ),
					'selected'                => __( 'selected', 'media-purge' ),
					'manageStorage'           => __( 'Manage your storage', 'media-purge' ),
					'scanSettings'            => __( 'Scan Settings', 'media-purge' ),
					'scanSettingsDesc'        => __( 'Configure how the scanner identifies unused files.', 'media-purge' ),
					'exclusions'              => __( 'Exclusions', 'media-purge' ),
					'exclusionsDesc'          => __( 'File types and paths that are always skipped during scans.', 'media-purge' ),
					'skipRecentUploads'       => __( 'Skip recent uploads', 'media-purge' ),
					'skipRecentDesc'          => __( 'Protect recently uploaded files from being flagged as unused.', 'media-purge' ),
					'autoTrash'               => __( 'Auto-delete trash', 'media-purge' ),
					'autoTrashDesc'           => __( 'Permanently delete trashed files after the retention period.', 'media-purge' ),
					'deepScan'                => __( 'Deep content scan', 'media-purge' ),
					'deepScanDesc'            => __( 'Scan serialized data and shortcode attributes for media references.', 'media-purge' ),
					'warningTitle'            => __( 'Important', 'media-purge' ),
					'warningDesc'             => __( 'Always review scan results before trashing. Some files may be referenced dynamically.', 'media-purge' ),
					'proUpgradeTitle'         => __( 'Upcoming Features', 'media-purge' ),
					'proUpgradeDesc'          => __( 'Duplicate merge, virtual folders, scheduled cleanup, and more — coming soon.', 'media-purge' ),
					'proScheduledClean'       => __( 'Scheduled Cleanup', 'media-purge' ),
					'proScheduledDesc'        => __( 'Auto-clean on your schedule', 'media-purge' ),
					'proPageBuilders'         => __( 'Page Builders', 'media-purge' ),
					'proBuildersDesc'         => __( 'Divi, Beaver & WPBakery', 'media-purge' ),
					'proVirtFolders'          => __( 'Virtual Folders', 'media-purge' ),
					'proFoldersDesc2'         => __( 'Organize media visually', 'media-purge' ),
					'proDupMerge'             => __( 'Duplicate Merge', 'media-purge' ),
					'proDupMergeDesc'         => __( 'One-click deduplication', 'media-purge' ),
					'help'                    => __( 'Help', 'media-purge' ),
					'documentation'           => __( 'Documentation', 'media-purge' ),
					'support'                 => __( 'Support', 'media-purge' ),
					/* v1.4 — page titles */
					'overview'                => __( 'Overview', 'media-purge' ),
					'storageAnalytics'        => __( 'Storage Analytics', 'media-purge' ),
					'storageDesc'             => __( 'Understand what\u2019s taking up space', 'media-purge' ),
					'folderOrganizer'         => __( 'Folder Organizer', 'media-purge' ),
					'foldersDesc'             => __( 'Organize your media into virtual folders', 'media-purge' ),
					'storageOverview'         => __( 'Storage Overview', 'media-purge' ),
					'storageGrowth'           => __( 'Storage Growth', 'media-purge' ),
					'storageGrowthNote'       => __( 'Estimated trend based on current storage size. Historical tracking is coming in a future release.', 'media-purge' ),
					'unusedFilesSpace'        => __( 'Unused files space', 'media-purge' ),
					'largestFiles'            => __( 'Largest Files', 'media-purge' ),
					'viewStorageDetails'      => __( 'View Storage Details', 'media-purge' ),

					'filesInTrashLabel'       => __( 'file(s) in trash — restorable within 30 days', 'media-purge' ),
					'restoreAll'              => __( 'Restore All', 'media-purge' ),
					'unusedFilesFound2'       => __( 'unused files found', 'media-purge' ),
					'ofWastedStorage'         => __( 'of wasted storage · Safe to clean', 'media-purge' ),
					'proAnalytics'            => __( 'Advanced Analytics', 'media-purge' ),
					'proAnalyticsDesc'        => __( 'Storage trends and cost estimator', 'media-purge' ),
					'proHostingEstimator'     => __( 'Hosting Cost Estimator', 'media-purge' ),
					'proHostingEstimatorDesc' => __( 'Enter your hosting plan cost and see how much unused files cost you.', 'media-purge' ),
					'proFoldersFullDesc'      => __( 'Create folders, drag & drop files, and organize your entire media library.', 'media-purge' ),

					'scanWoo'                 => __( 'Scan WooCommerce galleries', 'media-purge' ),
					'scanWooDesc'             => __( 'Include product gallery images in scans.', 'media-purge' ),
					'autoTrashLabel'          => __( 'Auto-purge trash after', 'media-purge' ),
					'excludeFileTypes'        => __( 'Exclude file types', 'media-purge' ),
					'runScan'                 => __( 'Run New Scan', 'media-purge' ),
					/* Wizard strings */
					'wizardWelcomeTitle'      => __( 'Welcome to MediaPurge!', 'media-purge' ),
					'wizardWelcomeDesc'       => __( 'Let\'s take 30 seconds to set up 2 key preferences for your site.', 'media-purge' ),
					'wizardFeature1'          => __( 'Scans posts, pages, widgets & page builders', 'media-purge' ),
					'wizardFeature2'          => __( 'Nothing is deleted until you confirm', 'media-purge' ),
					'wizardFeature3'          => __( 'All trashed files are recoverable for 30 days', 'media-purge' ),
					'wizardStep2Title'        => __( 'Protect Recent Uploads', 'media-purge' ),
					'wizardStep2Desc'         => __( 'How many days after upload should a file be protected from being flagged as unused?', 'media-purge' ),
					'wizardRecentLabel'       => __( 'Protect files uploaded within the last:', 'media-purge' ),
					'wizardRecentHint'        => __( 'We recommend 30 days to protect files still being rolled out on your site.', 'media-purge' ),
					'wizardStep3Title'        => __( 'Trash Policy', 'media-purge' ),
					'wizardStep3Desc'         => __( 'How long should trashed files stay in the Recovery tab before being permanently deleted?', 'media-purge' ),
					'wizardTrashLabel'        => __( 'Keep trashed files for:', 'media-purge' ),
					'wizardTrashHint'         => __( '30 days gives you a comfortable window to recover anything accidentally trashed.', 'media-purge' ),
					'wizardNext'              => __( 'Next', 'media-purge' ),
					'wizardBack'              => __( '← Back', 'media-purge' ),
					'wizardFinish'            => __( 'Finish Setup', 'media-purge' ),
					'wizardSkip'              => __( 'Skip setup', 'media-purge' ),
					'wizardDone'              => __( 'Setup complete! You\'re ready to run your first scan.', 'media-purge' ),
					/* Recovery tab */
					'emptyTrash'              => __( 'Empty Trash', 'media-purge' ),
					'restore'                 => __( 'Restore', 'media-purge' ),
					/* Scanner: scan-ran-but-clean state */
					'scanCleanTitle'          => __( 'No Unused Files Found', 'media-purge' ),
					'scanCleanDesc'           => __( 'The scanner completed and found no unused files in your media library. Your site looks clean!', 'media-purge' ),
					/* translators: %d: number of days files are protected after upload */
					'scanCleanProtected'      => __( 'Files uploaded within the last %d days are protected from being flagged. On a new site or after recent content imports, this is why results may appear empty.', 'media-purge' ),
					'adjustSettings'          => __( 'Adjust Protection Period', 'media-purge' ),
					/* Status tab */
					'statusTitle'             => __( 'System Status', 'media-purge' ),
					'statusSubtitle'          => __( 'Check that the plugin is working correctly on your site', 'media-purge' ),
					'statusAllGood'           => __( 'Everything looks good! The plugin is healthy and ready to use.', 'media-purge' ),
					'statusHasErrors'         => __( 'critical issue(s) need your attention.', 'media-purge' ),
					'statusHasWarnings'       => __( 'warning(s) found — plugin may not work at full capacity.', 'media-purge' ),
					'statusOk'                => __( 'OK', 'media-purge' ),
					'statusError'             => __( 'Error', 'media-purge' ),
					'statusWarning'           => __( 'Warning', 'media-purge' ),
					'statusInfo'              => __( 'Info', 'media-purge' ),
					'statusRestFailed'        => __( 'REST API is not accessible. This is the most common cause of plugin issues. A security plugin or server configuration may be blocking REST API requests. Check your security plugin settings or contact your hosting provider.', 'media-purge' ),
					/* About tab */
					'aboutTitle'              => __( 'About Media Purge', 'media-purge' ),
					'aboutSubtitle'           => __( 'Built with care for the WordPress community', 'media-purge' ),
					'aboutMission'            => __( 'Our Mission', 'media-purge' ),
					'aboutMissionDesc'        => __( 'Every WordPress site accumulates unused media files over time — old featured images, replaced logos, test uploads, and content that was never published. These files silently eat up your hosting storage and make your media library harder to manage.', 'media-purge' ),
					'aboutMissionDesc2'       => __( 'Media Purge was built to solve this problem the right way: safely, transparently, and without any risk to your content. We believe that cleaning your media library should feel easy and worry-free — not scary.', 'media-purge' ),
					'aboutSafetyTitle'        => __( 'Safety-First Philosophy', 'media-purge' ),
					'aboutSafety1'            => __( 'Nothing is ever deleted automatically — you always review first', 'media-purge' ),
					'aboutSafety2'            => __( 'All trashed files are recoverable for 30 days', 'media-purge' ),
					'aboutSafety3'            => __( 'Recently uploaded files are protected from being flagged', 'media-purge' ),
					'aboutSafety4'            => __( 'Whitelist any file to permanently protect it from cleanup', 'media-purge' ),
					'aboutScanTitle'          => __( 'What We Scan', 'media-purge' ),
					'aboutScan1'              => __( 'All post and page content (including shortcodes)', 'media-purge' ),
					'aboutScan2'              => __( 'Featured images and custom fields', 'media-purge' ),
					'aboutScan3'              => __( 'Widget areas and theme customizer settings', 'media-purge' ),
					'aboutScan4'              => __( 'Page builders: Elementor, Divi, WPBakery, Beaver Builder', 'media-purge' ),
					'aboutScan5'              => __( 'WooCommerce product galleries', 'media-purge' ),
					'aboutScan6'              => __( 'Serialized data and complex meta fields', 'media-purge' ),
					'aboutWorkflowTitle'      => __( 'How It Works', 'media-purge' ),
					'aboutStep1'              => __( 'Scan — Analyze your entire media library against all site content', 'media-purge' ),
					'aboutStep2'              => __( 'Review — See exactly where each file is used (or not used)', 'media-purge' ),
					'aboutStep3'              => __( 'Clean — Move unused files to a safe trash with one click', 'media-purge' ),
					'aboutStep4'              => __( 'Recover — Restore any file within 30 days if you change your mind', 'media-purge' ),
					'aboutBuiltFor'           => __( 'Built For You', 'media-purge' ),
					'aboutBuiltForDesc'       => __( 'Media Purge is designed for bloggers, agency owners, WooCommerce store managers, and anyone who wants a cleaner, faster WordPress site without the complexity.', 'media-purge' ),
					'aboutFree'               => __( '100% Free — No hidden limits, no premium gates on core features', 'media-purge' ),
					'aboutPrivacy'            => __( 'Privacy-First — No external calls, no tracking, no data collection', 'media-purge' ),
					'aboutGpl'                => __( 'Open Source — GPL-2.0+ licensed, community-driven', 'media-purge' ),
					'aboutSupport'            => __( 'Need Help?', 'media-purge' ),
					'aboutSupportDesc'        => __( 'If you have questions, need support, or want to suggest a feature — we are here for you.', 'media-purge' ),
					'aboutVersion'            => __( 'Version', 'media-purge' ),
					'aboutAuthor'             => __( 'Author', 'media-purge' ),
					'aboutLicense'            => __( 'License', 'media-purge' ),
					'aboutRequires'           => __( 'Requires', 'media-purge' ),
				),
			)
		);
	}

	/**
	 * Handle CSV export via GET request.
	 */
	public function handle_export() {
		if ( ! isset( $_GET['page'], $_GET['action'] ) ) {
			return;
		}
		if ( self::MENU_SLUG !== $_GET['page'] || 'export_csv' !== $_GET['action'] ) {
			return;
		}
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to export data.', 'media-purge' ) );
		}
		if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_GET['_wpnonce'] ), 'wpmp_export_csv' ) ) {
			wp_die( esc_html__( 'Security check failed.', 'media-purge' ) );
		}

		global $wpdb;
		$table = $wpdb->prefix . 'wpmp_scan_results';
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
			fputcsv(
				$out,
				array(
					$row['attachment_id'],
					self::csv_safe( $row['file_path'] ),
					$row['file_size'],
					self::csv_safe( $row['mime_type'] ),
					$row['status'],
					self::csv_safe( $row['used_in'] ),
					$row['scan_date'],
				)
			);
		}
		fclose( $out );
		exit;
	}

	/**
	 * Sanitize a CSV cell value against spreadsheet formula injection (OWASP CSV injection).
	 * Any cell beginning with =, +, -, @, tab, or carriage-return is prefixed with a single
	 * apostrophe so that spreadsheet software treats it as a literal string, not a formula.
	 *
	 * @param string|null $value Raw cell value.
	 * @return string Safe cell value.
	 */
	private static function csv_safe( $value ) {
		$value = (string) $value;
		if ( $value !== '' && strpbrk( $value[0], '=+-@' ) !== false ) {
			return "'" . $value;
		}
		// Also handle leading tab or CR which Excel treats as formula prefixes.
		if ( $value !== '' && ( "\t" === $value[0] || "\r" === $value[0] ) ) {
			return "'" . $value;
		}
		return $value;
	}

	/**
	 * Render admin page.
	 */
	public function render_admin_page() {
		?>
		<div class="wpmp-wrap">
			<a class="wpmp-skip-link" href="#wpmp-root"><?php esc_html_e( 'Skip to content', 'media-purge' ); ?></a>
			<div class="wpmp-plugin-header">
				<div class="wpmp-brand">
					<div class="wpmp-brand-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
					</div>
					<span class="wpmp-brand-name"><?php esc_html_e( 'Media', 'media-purge' ); ?><span><?php esc_html_e( 'Purge', 'media-purge' ); ?></span></span>
				</div>
				<nav class="wpmp-tabs" role="tablist" aria-label="<?php esc_attr_e( 'Plugin navigation', 'media-purge' ); ?>">
					<button class="wpmp-tab active" role="tab" aria-selected="true" data-tab="dashboard">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>
						<?php esc_html_e( 'Dashboard', 'media-purge' ); ?>
					</button>
					<button class="wpmp-tab" role="tab" aria-selected="false" data-tab="scanner">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
						<?php esc_html_e( 'Scanner', 'media-purge' ); ?>
					</button>
					<button class="wpmp-tab" role="tab" aria-selected="false" data-tab="storage">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 0-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1m-3 0h6"/></svg>
						<?php esc_html_e( 'Storage', 'media-purge' ); ?>
					</button>
				<button class="wpmp-tab" role="tab" aria-selected="false" data-tab="recovery">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
					<?php esc_html_e( 'Recovery', 'media-purge' ); ?>
					</button>
					<button class="wpmp-tab" role="tab" aria-selected="false" data-tab="settings">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>
						<?php esc_html_e( 'Settings', 'media-purge' ); ?>
					</button>
				<button class="wpmp-tab" role="tab" aria-selected="false" data-tab="status">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
					<?php esc_html_e( 'Status', 'media-purge' ); ?>
				</button>
				<button class="wpmp-tab" role="tab" aria-selected="false" data-tab="about">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
						<?php esc_html_e( 'About', 'media-purge' ); ?>
					</button>
				</nav>
				<div class="wpmp-header-actions">
					<button class="wpmp-help-btn" type="button" onclick="window.open('https://getmediapurge.com/docs','_blank')">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
						<?php esc_html_e( 'Help', 'media-purge' ); ?>
					</button>
				</div>
			</div>
			<div class="wpmp-page-content">
				<div id="wpmp-root" class="wpmp-admin-root">
					<div class="wpmp-loading">
						<span class="spinner is-active"></span>
						<p><?php esc_html_e( 'Loading...', 'media-purge' ); ?></p>
					</div>
				</div>
			</div>
			<div class="wpmp-footer">
				<span>
					MediaPurge v<?php echo esc_html( WPMP_VERSION ); ?>
					&middot;
					<a href="https://getmediapurge.com/docs" target="_blank" rel="noopener"><?php esc_html_e( 'Documentation', 'media-purge' ); ?></a>
					&middot;
					<a href="https://wordpress.org/support/plugin/wp-media-purge/" target="_blank" rel="noopener"><?php esc_html_e( 'Support', 'media-purge' ); ?></a>
				</span>
				<span>
				<?php esc_html_e( 'Free', 'media-purge' ); ?>
				&middot;
				<span style="color:var(--wpmp-gray5)"><?php esc_html_e( 'Pro features coming soon', 'media-purge' ); ?></span>
				</span>
			</div>
			<div class="wpmp-toast-wrap" id="wpmp-toast-wrap"></div>
		</div>
		<?php
	}
}
