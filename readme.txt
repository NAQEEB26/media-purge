=== Media Purge – Unused Media Cleaner & Duplicate Finder ===
Contributors: naqeeb026
Donate link: https://getmediapurge.com/
Tags: unused images, media cleaner, media library, duplicate images, cleanup
Requires at least: 5.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.4.6
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Find unused images and media, see where each file is used, move clutter to a recoverable trash, and detect duplicates. Free, no scan limits.

== Description ==

**Media Purge** is a free WordPress media cleaner that finds unused images and other media files, shows you exactly where every file is used, and lets you clean up your media library safely through a recoverable trash.

Over time every WordPress site collects images nobody uses anymore: old product photos, replaced banners, test uploads, files left behind by deleted posts. They take up disk space and make your backups larger, and they make the media library harder to manage. Deleting them by hand is risky, because a file can look unused in the Media Library while it still appears in a page builder layout, a widget or a product gallery.

Media Purge solves that in four steps:

1. **Scan** – it checks post content, post meta, widgets, theme customizer settings, WooCommerce product galleries and page builder data (Elementor, Divi, WPBakery, Beaver Builder).
2. **Review** – every file shows its size and a **Used In** list with links, so you can check a file before you remove it.
3. **Trash** – unused files move to the plugin's own internal trash, not a permanent delete.
4. **Restore** – trashed files stay recoverable for 30 days by default (adjustable), with one-click restore from the Recovery tab.

**Free to use.** All core cleanup features are free: scan, review, trash, restore and CSV export. There are no scan limits and no file caps. A paid tier with advanced automation is planned; those features are marked "Coming Soon" inside the plugin. Core cleanup (scan → review → trash → restore) will always be free.

= What Media Purge does =

**Find unused images and media**
Detects media files with no reference across post content, post meta (featured images, WooCommerce product galleries), widget areas, theme customizer options and supported page builders. Results show the file size, so you can see how much storage you can reclaim.

**"Used In" display**
Each media item shows where it is used, with the post title, post type and context (for example, Featured Image in "About Us" or an Elementor widget in "Home") and a direct link to edit that post.

**Safe trash and recovery**
Files go to an internal trash first. They remain recoverable for 30 days by default, and you can change the retention period in Settings. The Recovery tab lets you restore single files or bulk-restore, and you permanently delete only when you are ready (or when the retention period ends).

**Duplicate image finder (view)**
Groups files that are byte-for-byte identical using MD5 hashing, regardless of filename, and shows the storage each duplicate group wastes. One-click duplicate merge is planned for a future release.

**Page builder support, free**
Scans Elementor JSON data, Divi module meta, WPBakery shortcodes and Beaver Builder layouts in the free version, so builder images show up as in use.

**WooCommerce support**
Product featured images and product gallery images are recognised as in use.

**Whitelist**
Mark any file as "Keep" so the scanner never flags it again. Use it for files loaded by a theme or plugin the scanner does not read.

**Storage analytics**
See your media storage broken down by type (images, videos, audio, documents, other), with total media count, unused count, total size and potential savings.

**Filters, bulk actions and CSV export**
Filter unused media by file type, bulk trash or bulk whitelist many files at once, and export the unused list to CSV for review or client reporting. Large libraries load 30 items per page with load-more pagination.

**Built for live sites**
The scanner is read-only: it never moves, modifies or deletes anything while scanning. Scans run in the background in small batches to keep server load low. Nothing changes until you choose to trash a file. A first-run setup wizard lets you set recent-upload protection, trash retention and WooCommerce scanning.

= Coming in a future release (paid tier) =

These features are in development and are labelled "Coming Soon" inside the plugin:

* **One-click duplicate merge** – keep one copy, update references, remove the rest.
* **Scheduled auto-cleanup** – trash unused media older than N days on a schedule, with an optional email summary.
* **Advanced storage analytics** – storage trend history and a hosting cost estimator.
* **Virtual folder organizer** – organise attachments into virtual folders without touching the server directory structure.

= Who is it for? =

* Site owners who want to clean up the WordPress media library without FTP or code.
* Bloggers and content sites with years of uploads.
* WooCommerce stores that have replaced product images many times.
* Agencies that manage many client sites and need a safe, auditable cleanup.
* Developers who want to check media usage before removing files.

= Compatibility =

| Plugin / theme | What is scanned |
|---|---|
| **Elementor** | Image widgets, background images and gallery elements in Elementor JSON data |
| **Divi Builder** (plugin or theme) | Images in Divi module meta and layout data |
| **WPBakery Page Builder** | Images referenced in `[vc_*]` shortcode attributes |
| **Beaver Builder** | Images stored in Beaver Builder layout posts |
| **WooCommerce** | Product featured image and all product gallery images |
| **Gutenberg / Block Editor** | Image, gallery, cover, media-text and core blocks that store attachment IDs |
| **Classic Editor** | `<img>` tags and `[gallery]` shortcodes in post content |
| **Widgets & Theme Customizer** | Upload URLs stored in widget options or theme mod values |

WordPress 5.8 or higher and PHP 7.4 or higher. Single-site installs only; multisite support is planned.

= Learn more =

* [Website and guides](https://getmediapurge.com/)
* [How to find unused images in WordPress](https://getmediapurge.com/find-unused-images-wordpress/)
* [How to find and remove duplicate images in WordPress](https://getmediapurge.com/find-duplicate-images-in-wordpress/)

== Installation ==

1. In your WordPress admin, go to **Plugins → Add New**, search for "Media Purge", then click **Install Now** and **Activate**. Or upload the `media-purge` folder to `/wp-content/plugins/` and activate it from the **Plugins** menu.
2. Go to **Media → Media Purge**.
3. Complete the short setup wizard (recent-upload protection, trash retention, WooCommerce scanning), or skip it.
4. Click **Run Scan Now**.
5. Review the results, check the "Used In" links, then trash the files you no longer need. You can restore them from the **Recovery** tab during the retention period.

== Frequently Asked Questions ==

= How do I find unused images in WordPress? =
Install Media Purge, go to Media → Media Purge and run a scan. It lists media files with no detected reference in your content, post meta, widgets, customizer settings or supported page builders, with the file size and a "Used In" check for each one.

= Will it permanently delete my files? =
Not automatically, and not until you choose to. Files move to the plugin's internal trash first. They stay there for 30 days by default (adjustable in Settings) and can be restored at any time from the **Recovery** tab. Permanent deletion happens only when you click "Delete Permanently" or when the retention period ends.

= Is it safe on live sites? =
The scanner is read-only. It never moves, modifies or deletes anything while scanning, and nothing changes on your site until you click a Trash button. As with any cleanup, we recommend a recent backup before you permanently delete files.

= Does the free version scan Elementor and other page builders? =
Yes. Elementor, Divi, WPBakery and Beaver Builder are scanned in the free version. For builders the scanner does not support, use the **Whitelist** to exclude files you know are in use.

= What if a theme or plugin uses a file the scanner doesn't know about? =
Use the **Whitelist**. Click "Keep" on any file in the Scanner tab to exclude it from all future scan results.

= Does it work with WooCommerce? =
Yes. Product featured images and product gallery images are scanned through post meta.

= How does it find duplicate images? =
Files are grouped by their MD5 hash, so byte-for-byte identical files land in the same group regardless of filename. Resized copies or edited versions are not treated as duplicates. Viewing duplicates is free today; one-click merge is planned.

= Will the plugin slow down my site? =
Scans run as a background process in small batches to keep server load low, so visitors should not notice a scan in progress.

= Can I export the list of unused files? =
Yes. Use the **Export CSV** button in the Scanner tab.

= Does the free version have limits? =
No artificial limits: no scan caps, no file-count restrictions and no time limits.

= What happens if I deactivate or uninstall the plugin? =
On deactivation, scheduled events are cleared and plugin tables are kept, so your scan history and whitelist are there if you reactivate. On uninstall, the plugin's database tables and options are fully removed.

== Screenshots ==

1. Dashboard – total media, unused files, storage used, potential savings, storage breakdown by type and quick actions.
2. Scanner before a scan – what will be scanned, with a clear "Start Full Scan" button.
3. Scanner results – thumbnail, filename, file size, "Used In" links, type filter, Export CSV and bulk actions.
4. Recovery tab – trashed files with one-click restore and bulk restore or delete.

== Changelog ==

= 1.4.6 =
* Fixed: Support URL corrected from wp-media-purge to media-purge for proper WP.org forum links.
* Fixed: Storage Analytics subtitle apostrophe display issue.

= 1.4.5 =
* Fixed: Removed storage snapshot database table, daily cron collection, and mock storage growth chart — these were infrastructure for a Coming Soon feature and should not be silently collecting data.
* Fixed: Storage tab now shows Storage Overview (real scan data) and Largest Files only — no mock/estimated charts.
* Fixed: Removed Hosting Cost Estimator Coming Soon gate from Storage tab.

= 1.4.4 =
* Fixed: Rebuilt admin JavaScript from scratch — previous build was corrupted and caused the admin UI to display only a loading spinner

= 1.4.3 =
* Added: System Status tab — one-glance health check covering REST API, DB tables, PHP/WP versions, cron jobs, memory limit, upload directory, and WooCommerce
* Added: REST API health endpoint `GET /wpmp/v1/health`
* Fixed: Scanner no longer shows the "Start Scan" screen after a scan completes with 0 results — new sites now see a clear "No Unused Files Found" message
* Improved: About tab now clearly lists all free features and planned future releases
* Improved: Page builders (Elementor, Divi, WPBakery) correctly show as free — removed incorrect "Pro" badge
* Added: "Adjust Protection Period" shortcut on scan-clean screen links directly to Settings tab

= 1.4.2 =
* Replaced Folders (Coming Soon) tab with functional Recovery tab.
* Added first-run Setup Wizard — configures recent-upload protection, trash retention period, and WooCommerce scan preference on first visit.
* Wizard auto-dismissed after completion; skippable at any step.
* Fixed Help button and footer documentation links to use getmediapurge.com.

= 1.4.1 =
* Security: Rewrote `get_unused_media` query to use `$wpdb->prepare()` — eliminated SQL LIKE injection risk.
* Security: Fixed negative OFFSET vulnerability when `?page=0` was passed to the media endpoint.
* Performance: Scanner now fetches attachment IDs in configurable batches (default 200).
* Reliability: Replaced TRUNCATE with a targeted DELETE that preserves whitelisted entries.
* Reliability: Added `POST /scan/cancel` REST endpoint to force-clear a stuck scan lock.
* GDPR / WP.org compliance: Removed Google Fonts CDN enqueue — admin UI now uses a system font stack.
* Business logic: Removed "(Pro)" label from Divi, WPBakery, and Beaver Builder scanner labels.
* Code hygiene: Removed dead `reset_monthly_count()` cron method.

= 1.3.0 =
* Complete UI overhaul — Navy/Blue premium design system.
* SVG icon system replaces WordPress dashicons.
* New navy plugin header bar with integrated tab navigation.
* Dashboard stat cards, storage grid, and quick actions card.
* Scanner pre-scan hero with source badges and large CTA.
* Scan progress component with animated spinner, gradient bar, and phase step indicators.
* Horizontal media rows with improved information density.
* Bottom-right toast notification system.
* Confirm modal with safety box and amber confirm button.
* Undo toast with 8-second countdown.
* 9 CSS keyframe animations; 40+ new localised strings; responsive breakpoints.

= 1.2.0 =
* Undo toast after trash action with 5-second countdown and one-click undo.
* Scan phase labels during scan progress.
* Elementor scanning moved to Free tier.
* Full ARIA accessibility (WCAG 2.1 AA).
* Selected media items highlight with blue outline and tinted background.

= 1.1.0 =
* Complete UI/UX redesign with modern card-based interface and CSS custom properties.
* Menu moved under Media → Media Purge.
* Dashboard stat cards, storage breakdown, "How it works" onboarding section.
* Full internationalisation — all UI strings localised.

= 1.0.0 =
* Initial public release.
* Smart scanner with content, meta, options, and all major page builder support.
* "Used In" display with clickable post links per media item.
* Safe trash-and-recovery flow with configurable retention.
* Storage analytics dashboard with type breakdown bar.
* Type filter and CSV export.
* Load-more pagination.
* Duplicate detection (view).
* Whitelist support.
* Full uninstall cleanup.

== Upgrade Notice ==

= 1.4.6 =
Fixes the support forum link and a display issue on the Storage Analytics screen.

= 1.4.5 =
Removes background storage-snapshot collection and placeholder charts. The Storage tab now shows only real scan data and your largest files.

= 1.4.4 =
Important fix: the admin screen could show only a loading spinner because of a corrupted JavaScript build. Update to restore the full interface.

= 1.4.3 =
Adds a System Status tab and a clear "No Unused Files Found" message for clean sites. Page builders are correctly shown as free features.

= 1.4.1 =
Security and reliability improvements. Upgrade prompts and the usage meter were removed; advanced features now appear as "Coming Soon" previews.
