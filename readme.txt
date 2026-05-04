=== Media Purge ===

Contributors: naqeeb026
Donate link: https://getmediapurge.com/
Tags: media, media library, unused media, cleanup, duplicates, storage, page builder, media manager, elementor
Requires at least: 5.8
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.4.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Find and safely remove unused media, detect duplicates, and reclaim disk space — free to use today, with advanced features planned for a future release.

== Description ==

**Media Purge** gives you complete visibility into your WordPress media library, surfaces every file that is not used anywhere on your site, and lets you clean it up safely — without any risk of breaking live content.

Whether you have a small blog or a large WooCommerce store, media libraries accumulate hundreds of forgotten files over time. Media Purge makes it effortless to spot them, verify whether they are truly unused, and move them to a recoverable trash — not a permanent delete.

**Free to use.** All core cleanup features are available at no cost — scan, review, trash, restore, export. No scan limits, no file caps. A paid upgrade tier with advanced automation features is planned for a future release; those features are clearly marked "Coming Soon" inside the plugin.

=== Free Features ===

**Smart Unused Media Scanner**
Scans post content, post meta (featured images, WooCommerce product galleries), theme customizer options, widget areas, and all major page builder data (Elementor, Divi, WPBakery, Beaver Builder). Results show the exact file size so you know how much storage you will reclaim.

**"Used In" Display**
Each media item shows exactly where it is used — post title, post type, and context (e.g. Featured Image in "About Us", Elementor widget in "Home") — with a direct link to edit that post. Never accidentally delete a file that is still in use.

**Safe Trash Flow**
Files are moved to an internal trash, not permanently deleted. By default they remain recoverable for 30 days. The retention window is adjustable in Settings.

**Recovery Tab**
Browse all trashed media, restore individual files to your live library in one click, or bulk-restore. Permanently delete only when you are ready.

**Storage Analytics Dashboard**
See a visual breakdown of your total media storage by file type (Images / Videos / Audio / Documents / Other) with colour-coded segments. At-a-glance stats show total media count, total unused count, total storage size, and potential savings.

**Duplicate Detection (View)**
Automatically groups files that are byte-for-byte identical using MD5 hashing. See every duplicate group with its total wasted storage. One-click duplicate merge is coming in a future release.

**Type Filter & CSV Export**
Filter unused media by file type in one click. Export the full unused media list to CSV for offline review or reporting.

**Pagination & Bulk Actions**
Handles large libraries with 30-items-per-page load-more pagination. Bulk select, bulk trash, and bulk whitelist any number of files at once.

**Whitelist**
Files can be whitelisted so the scanner never flags them again, even if no URL reference is found.

**Page Builder Support (Free)**
Deep scanning of Elementor JSON data, Divi page meta, WPBakery shortcodes, and Beaver Builder layout data.

=== Features Coming in a Future Release ===

The following features are currently in development and will be part of a **paid upgrade tier**. They are clearly labelled "Coming Soon" inside the plugin.

* **One-click Duplicate Merge** — keep the first copy, rewrite all references, delete the rest automatically.
* **Scheduled Auto-Cleanup** — set a recurring schedule to automatically trash unused media older than N days, with optional email summary.
* **Advanced Storage Analytics** — 90-day storage trend history and a hosting cost estimator.
* **Virtual Folder Organizer** — organise attachments into logical virtual folders without touching the server directory structure.

Core cleanup (scan → review → trash → restore) will always be free.

=== Who Is This For? ===

- **Non-technical site owners** — the interface walks you through every step; no FTP, no command line.
- Bloggers and content sites with years of uploaded but unreferenced media.
- WooCommerce stores that have updated product images many times.
- Agencies managing multiple client sites.
- Developers who want a safe, auditable media cleanup workflow.

=== Compatibility ===

**WordPress:** 5.8 or higher (tested up to 6.7).
**PHP:** 7.4 or higher.
**Multisite:** single-site installs only (multisite support is planned).

| Plugin / Theme | What is scanned |
|---|---|
| **Elementor** | All image widgets, background images, and gallery elements inside Elementor JSON data |
| **Divi Builder** (plugin or theme) | Images embedded in Divi module meta and layout data |
| **WPBakery Page Builder** | Images referenced inside `[vc_*]` shortcode attributes |
| **Beaver Builder** | Images stored in Beaver Builder layout posts |
| **WooCommerce** | Product featured image and all product gallery images |
| **Gutenberg / Block Editor** | Image, gallery, cover, media-text, and all core blocks that store attachment IDs |
| **Classic Editor** | All `<img>` tags and `[gallery]` shortcodes in post content |
| **Widgets & Theme Customizer** | Any upload URLs stored in widget options or theme mod values |

== Installation ==

1. Upload the `media-purge` folder to `/wp-content/plugins/`
   **or** install directly via WordPress → Plugins → Add New → search "Media Purge".
2. Activate the plugin through the **Plugins** menu.
3. Navigate to **Media → Media Purge** in the WordPress admin sidebar.
4. Click **Run Scan Now** to perform your first media audit.
5. Review the results, verify "Used In" links for each file, then trash what you no longer need.

== Frequently Asked Questions ==

= Will it permanently delete my files? =
No — not automatically, and not until you choose to. Files are moved to the plugin's internal trash first. They remain there for 30 days by default (adjustable in Settings) and can be restored at any time from the **Recovery** tab. Permanent deletion only happens when you click "Delete Permanently" yourself, or when the retention period expires.

= Is it safe on live sites? =
Yes. The scanner is completely read-only — it never moves, modifies, or deletes anything while scanning. Nothing changes on your site until you explicitly click a Trash button.

= Does it work with page builders? =
Yes. Elementor, Divi, WPBakery, and Beaver Builder are all scanned automatically. For unsupported builders, use the **Whitelist** feature to exclude files you know are in use.

= What if a file is used by a theme or plugin the scanner doesn't know about? =
Use the **Whitelist** feature. Click "Keep" on any file in the Scanner tab to permanently exclude it from all future scan results.

= Does it work with WooCommerce? =
Yes. Product featured images and image galleries are scanned via post meta inspection.

= How does duplicate detection work? =
Files are grouped by their MD5 hash. Byte-for-byte identical files are placed in the same duplicate group regardless of filename.

= Will activating the plugin affect my site's performance? =
No. Scans run as a background async process — normal visitors are unaffected even while a scan is in progress.

= Can I export the list of unused files? =
Yes. Use the **Export CSV** button in the Scanner tab.

= What happens if I deactivate the plugin? =
Cron events are cleared immediately. Plugin database tables are left intact so your scan history and whitelist are preserved if you reactivate.

= What happens if I uninstall the plugin? =
Database tables and all plugin options are fully removed.

= Does the free version have any limits? =
No artificial limits. There are no scan caps, no file-count restrictions, and no time limits. All core features are fully available at no cost.

== Screenshots ==

1. **Dashboard** — stat cards (total media, unused files, storage used, potential savings), storage breakdown by type, last-scan date, and quick action buttons.
2. **Scanner — Pre-scan state** — clear "Start Full Scan" call-to-action with source badges showing what will be scanned.
3. **Scanner — Results** — media rows with thumbnail, filename, file size, "Used In" post links, type filter, Export CSV, and bulk-action toolbar.
4. **Recovery tab** — trashed files with one-click restore per file and bulk restore/delete options.
5. **Duplicates tab** — duplicate groups showing each copy, total wasted space, and "Coming Soon" card for one-click merge.
6. **Settings** — recent-upload protection days, trash retention days, WooCommerce toggle, and file-type exclusions.
7. **Folders tab** — virtual folder organizer preview with "Coming Soon" card.

== Changelog ==

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

= 1.4.3 =
System Status tab added. Scanner now shows a clear "No Unused Files Found" message for clean sites. Page builders correctly shown as free features.

= 1.4.1 =
Security and reliability improvements. Upgrade prompts and the artificial usage meter have been removed. Advanced features are now shown as "Coming Soon" previews.

= 1.0.0 =
First release. After activation run a full scan to audit your media library.