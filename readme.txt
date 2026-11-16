=== Media Purge - Unused Media Cleaner & Duplicate Finder ===
Contributors: naqeeb026
Donate link: https://getmediapurge.com/
Tags: unused images, media cleaner, media library, duplicate images, cleanup
Requires at least: 5.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.4.8
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Find unused media, see where each file is used, trash safely with restore, and spot exact duplicate images. Free, no scan limits.

== Description ==

**Media Purge** is a free WordPress media library cleaner. It finds unused images and other media, shows a **Used In** list for every file, moves clutter into a recoverable trash, and groups exact duplicate images by MD5 hash.

Over time every WordPress site collects files nobody needs any more: old product photos, replaced banners, test uploads, and images left behind after deleted posts. They fill disk space, make backups larger, and make the Media Library harder to search. Deleting by hand is risky, because a file can look unused in the library while it still appears in post content, a product gallery, a widget, or Elementor data.

Media Purge keeps the cleanup in four clear steps:

1. **Scan** - a read-only pass over post content, post meta (including featured images and WooCommerce product galleries), widgets, theme Customizer uploads, Gutenberg and classic content, and Elementor data (image widgets, background images and gallery elements).
2. **Review** - every result shows file size and a **Used In** list with links, so you can check a file before you remove it.
3. **Trash** - selected files move to the plugin's own internal trash, not a permanent delete.
4. **Restore** - trashed files stay recoverable for 30 days by default (adjustable), with one-click restore from the Recovery tab.

**Free to use.** Scan, review, trash, restore, CSV export and the duplicate viewer are free. There are no scan limits and no file caps. A paid tier with advanced automation is planned; those features are marked "Coming Soon" inside the plugin. Core cleanup (scan -> review -> trash -> restore) will stay free.

= What Media Purge does =

**Find unused images and media**
Lists media with no detected reference in the places the scanner reads. Results include file size so you can reclaim the largest files first.

**"Used In" display**
Each item shows where it is used (for example, Featured Image on "About Us", or an Elementor image widget on "Home") with a link to edit that content.

**Safe trash and recovery**
Files go to an internal trash first. They remain recoverable for 30 days by default; you can change the retention period in Settings. Permanent deletion happens only when you choose it, or when retention ends.

**Duplicate image finder (view)**
Groups files that are byte-for-byte identical using MD5 hashing, regardless of filename, and shows storage wasted by each group. One-click duplicate merge is planned for a future release ("Coming Soon").

**Elementor data in the free scan**
The free scan reads Elementor image widgets, background images and gallery elements, so those images can show up as in use. For other page builders, check the Used In list by hand and add files you know are used to the Whitelist.

**WooCommerce support**
Product featured images and product gallery images are recognised as in use.

**Whitelist**
Mark any file as Keep so the scanner never flags it again. Use it for files loaded by a theme or plugin the scanner does not read.

**Storage analytics**
See media storage broken down by type (images, videos, audio, documents, other), with totals for media count, unused count, size and potential savings.

**Filters, bulk actions and CSV export**
Filter unused media by type, bulk trash or whitelist, and export the unused list to CSV. Large libraries load in pages with load-more pagination.

**Built for live sites**
The scanner is read-only while it runs. Scans work in small background batches to keep server load low. Nothing changes until you trash a file. A first-run setup wizard covers recent-upload protection, trash retention and WooCommerce scanning.

= Coming in a future release (paid tier) =

These features are in development and labelled "Coming Soon" inside the plugin:

* **One-click duplicate merge** - keep one copy, update references, remove the rest.
* **Scheduled auto-cleanup** - trash unused media older than N days on a schedule, with an optional email summary.
* **Advanced storage analytics** - storage trend history and a hosting cost estimator.
* **Virtual folder organizer** - organise attachments into virtual folders without changing the server directory structure.

= Who is it for? =

* Site owners who want to clean the WordPress media library without FTP or code.
* Bloggers and content sites with years of uploads.
* WooCommerce stores that have replaced product images many times.
* Agencies that manage client sites and need a reviewable cleanup.
* Developers who want to check media usage before removing files.

= Compatibility =

| Plugin / theme | What is scanned |
|---|---|
| **Elementor** | Image widgets, background images and gallery elements in Elementor data |
| **WooCommerce** | Product featured image and product gallery images |
| **Gutenberg / Block Editor** | Image, gallery, cover, media-text and core blocks that store attachment IDs |
| **Classic Editor** | `<img>` tags and `[gallery]` shortcodes in post content |
| **Widgets & Theme Customizer** | Upload URLs stored in widget options or theme mod values |

WordPress 5.8 or higher and PHP 7.4 or higher. Single-site installs only; multisite support is planned.

For builders or plugins the scanner does not read, use the **Whitelist** and verify important pages after cleanup.

= Learn more =

* [Website and guides](https://getmediapurge.com/)
* [How to find unused images in WordPress](https://getmediapurge.com/find-unused-images-wordpress/)
* [How to find and remove duplicate images in WordPress](https://getmediapurge.com/find-duplicate-images-in-wordpress/)
* [Media Cleaner alternative](https://getmediapurge.com/media-cleaner-alternative/)

== Installation ==

1. In your WordPress admin, go to **Plugins -> Add New**, search for "Media Purge", then click **Install Now** and **Activate**. Or upload the `media-purge` folder to `/wp-content/plugins/` and activate it from the **Plugins** menu.
2. Go to **Media -> Media Purge**.
3. Complete the short setup wizard (recent-upload protection, trash retention, WooCommerce scanning), or skip it.
4. Click **Run Scan Now**.
5. Review the results, check the "Used In" links, then trash the files you no longer need. You can restore them from the **Recovery** tab during the retention period.

== Frequently Asked Questions ==

= Is Media Purge a media cleaner / media library cleaner? =
Yes. Media Purge is a free media cleaner for the WordPress Media Library. It finds unused media, shows where each file is used, moves selected files to a recoverable trash, and lists exact duplicate images. There are no scan limits on the free version.

= How do I find unused media or delete unused images in WordPress? =
Install Media Purge, open **Media -> Media Purge**, and run a scan. Review each result's **Used In** list, then trash files you no longer need. Keep a backup before you permanently delete anything. Trashed files stay restorable for 30 days by default.

= Will it permanently delete my files? =
Not automatically, and not until you choose to. Files move to the plugin's internal trash first. They stay there for 30 days by default (adjustable in Settings) and can be restored from the **Recovery** tab. Permanent deletion happens only when you click "Delete Permanently" or when the retention period ends.

= Is it safe on live sites? =
The scanner is read-only. It never moves, modifies or deletes anything while scanning, and nothing changes until you click Trash. As with any cleanup, keep a recent backup before you permanently delete files.

= Does the free version read Elementor data? =
Yes. The free scan reads Elementor image widgets, background images and gallery elements, along with post content, post meta, WooCommerce galleries, widgets and Customizer uploads. For other page builders, check Used In by hand and use the Whitelist for files you know are required.

= What if a theme or plugin uses a file the scanner doesn't know about? =
Use the **Whitelist**. Click Keep on any file in the Scanner tab to exclude it from future results.

= Does it work with WooCommerce? =
Yes. Product featured images and product gallery images are scanned through post meta.

= How does it find duplicate images? =
Files are grouped by MD5 hash, so byte-for-byte identical files land in the same group regardless of filename. Resized copies or edited versions are not treated as duplicates. Viewing duplicates is free; one-click merge is planned ("Coming Soon").

= Will the plugin slow down my site? =
Scans run as a background process in small batches to keep server load low, so visitors should not notice a scan in progress.

= Can I export the list of unused files? =
Yes. Use the **Export CSV** button in the Scanner tab.

= Does the free version have limits? =
No artificial limits: no scan caps, no file-count restrictions and no time limits.

= What happens if I deactivate or uninstall the plugin? =
On deactivation, scheduled events are cleared and plugin tables are kept, so your scan history and whitelist remain if you reactivate. On uninstall, the plugin's database tables and options are fully removed.

== Screenshots ==

1. Dashboard - total media, unused files, storage used, potential savings, storage breakdown by type and quick actions.
2. Scanner before a scan - what will be scanned, with a clear "Start Full Scan" button.
3. Scanner results - thumbnail, filename, file size, "Used In" links, type filter, Export CSV and bulk actions.
4. Recovery tab - trashed files with one-click restore and bulk restore or delete.

== Changelog ==

= 1.4.8 =
* Fixed: Scans on media libraries with more than 300 files no longer stall at 0% on "Checking post content". If the server blocks the background request, the scan now stops after a minute with a clear message instead of hanging.
* Fixed: The "Skip recent uploads" setting now saves, and the scanner respects it.
* Fixed: A file is no longer marked as used just because another file in the same upload folder is used. A file now counts as used only when its ID, its URL or one of its generated sizes is referenced. The scan also reads more places that store media by ID (widgets, site icon, custom logo, term images and media custom fields).
* Fixed: The Media Purge screens now load on sites that use Plain permalinks.
* Fixed: The "Scan WooCommerce galleries" setting now saves and is respected. It stays on by default.

= 1.4.7 =
* Added: Dismissible review notice on the Media Purge screen, for users who can manage options, after 2 successful cleanups and 3 days since the install time was recorded. A successful cleanup is one request that trashed at least one file. An update that does not reactivate the plugin starts that 3-day wait on the next admin page load by a user who can manage options.
* Added: Notice choices are stored per user. Maybe later hides it for 14 days, up to 2 times. Leave a review, I already did, No thanks, and the dismiss button hide it permanently.
* Added: Rate us link on this plugin's row on the Plugins screen. It uses the WordPress.org review form, with no tracking, and it is not limited by the notice rules.
* Fixed: Plugin header Tested up to is 7.1, matching readme.txt. WordPress.org reads the plugin file first, so the listing was showing 7.0.

= 1.4.6 =
* Fixed: Support URL corrected from wp-media-purge to media-purge for proper WP.org forum links.
* Fixed: Storage Analytics subtitle apostrophe display issue.

= 1.4.5 =
* Fixed: Removed storage snapshot database table, daily cron collection, and mock storage growth chart - these were infrastructure for a Coming Soon feature and should not be silently collecting data.
* Fixed: Storage tab now shows Storage Overview (real scan data) and Largest Files only - no mock/estimated charts.
* Fixed: Removed Hosting Cost Estimator Coming Soon gate from Storage tab.

= 1.4.4 =
* Fixed: Rebuilt admin JavaScript from scratch - previous build was corrupted and caused the admin UI to display only a loading spinner

= 1.4.3 =
* Added: System Status tab - one-glance health check covering REST API, DB tables, PHP/WP versions, cron jobs, memory limit, upload directory, and WooCommerce
* Added: REST API health endpoint `GET /wpmp/v1/health`
* Fixed: Scanner no longer shows the "Start Scan" screen after a scan completes with 0 results - new sites now see a clear "No Unused Files Found" message
* Improved: About tab now clearly lists all free features and planned future releases
* Improved: Page builders (Elementor, Divi, WPBakery) correctly show as free - removed incorrect "Pro" badge
* Added: "Adjust Protection Period" shortcut on scan-clean screen links directly to Settings tab

= 1.4.2 =
* Replaced Folders (Coming Soon) tab with functional Recovery tab.
* Added first-run Setup Wizard - configures recent-upload protection, trash retention period, and WooCommerce scan preference on first visit.
* Wizard auto-dismissed after completion; skippable at any step.
* Fixed Help button and footer documentation links to use getmediapurge.com.

= 1.4.1 =
* Security: Rewrote `get_unused_media` query to use `$wpdb->prepare()` - eliminated SQL LIKE injection risk.
* Security: Fixed negative OFFSET vulnerability when `?page=0` was passed to the media endpoint.
* Performance: Scanner now fetches attachment IDs in configurable batches (default 200).
* Reliability: Replaced TRUNCATE with a targeted DELETE that preserves whitelisted entries.
* Reliability: Added `POST /scan/cancel` REST endpoint to force-clear a stuck scan lock.
* GDPR / WP.org compliance: Removed Google Fonts CDN enqueue - admin UI now uses a system font stack.
* Business logic: Removed "(Pro)" label from Divi, WPBakery, and Beaver Builder scanner labels.
* Code hygiene: Removed dead `reset_monthly_count()` cron method.

= 1.3.0 =
* Complete UI overhaul - Navy/Blue premium design system.
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
* Menu moved under Media -> Media Purge.
* Dashboard stat cards, storage breakdown, "How it works" onboarding section.
* Full internationalisation - all UI strings localised.

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

= 1.4.8 =
Fixes scans that stalled at 0% on larger libraries, settings that did not save, and the admin screens on Plain permalinks. Unused-file detection is more accurate, so run a new scan and check the Used In list before you trash anything.

= 1.4.7 =
Review notice on the Media Purge screen after two successful cleanups and three days installed, plus a Rate us link on the Plugins screen. The plugin header now says Tested up to 7.1.

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
