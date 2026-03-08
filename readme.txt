=== WP Media Purge ===

Contributors: naqeebulrehman
Donate link: https://naqeebulrehman.com
Tags: media, media library, cleanup, unused images, duplicates, storage, optimization, media manager
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Find and safely remove unused media, detect duplicates, and reclaim disk space — with a full storage analytics dashboard.

== Description ==

**WP Media Purge** gives you complete visibility into your WordPress media library, surfaces every file that is not used anywhere on your site, and lets you clean it up safely — without any risk of breaking live content.

Whether you have a small blog or a large WooCommerce store, media libraries accumulate hundreds of forgotten files over time.  WP Media Purge makes it effortless to spot them, verify whether they are truly unused, and move them to a recoverable trash — not a permanent delete.

=== Free Features ===

**Smart Unused Media Scanner**
Scans post content, post meta (featured images, WooCommerce product galleries), theme customizer options, widget areas, and all major page builder data (Elementor, Divi, WPBakery, Beaver Builder).  Results show the exact file size so you know how much storage you will reclaim.

**"Used In" Display**
Each media item shows exactly where it is used — post title, post type, and context (e.g. Featured Image in "About Us", Elementor widget in "Home") — with a direct link to edit that post.  Never accidentally delete a file that is still in use.

**Safe Trash Flow**
Files are moved to an internal trash, not permanently deleted.  By default they remain recoverable for 30 days.  The retention window is adjustable in Settings.

**Recovery Tab**
Browse all trashed media, restore individual files to your live library in one click, or bulk-restore.  Permanently delete only when you are ready.

**Storage Analytics Dashboard**
See a visual breakdown of your total media storage by file type (Images / Videos / Audio / Documents / Other) with colour-coded segments.  At-a-glance stats show total media count, total unused count, total storage size, and potential savings.

**Duplicate Detection**
Automatically groups files that are byte-for-byte identical using MD5 hashing.  See every duplicate group with its total wasted storage.

**Type Filter & CSV Export**
Filter unused media by file type (Images, Videos, Documents, Other) in one click.  Export the full unused media list to CSV for offline review or reporting.

**Pagination & Bulk Actions**
Handles large libraries with 30-items-per-page load-more pagination.  Bulk select, bulk trash, and bulk whitelist any number of files at once.

**Whitelist**
Files can be whitelisted so the scanner never flags them again, even if no URL reference is found (useful for email-campaign assets or programmatically served files).

**Page Builder Support (Free)**
Deep scanning of Elementor JSON data, Divi page meta, WPBakery shortcodes, and Beaver Builder layout data ensures no actively-used builder asset is ever flagged as unused.

=== Pro Features ===

* **One-click Duplicate Merge** — keep the first copy, replace all references, delete the rest automatically.
* **Scheduled Auto-Cleanup** — set a cron schedule to automatically trash unused media older than N days.
* **Advanced Storage Analytics** — daily storage trend charts, 90-day history, biggest files list.
* **Virtual Folders** — organise attachments into logical folders without touching the uploads directory.
* **Priority Support**

[Upgrade to WP Media Purge Pro](https://naqeebulrehman.com/wp-media-purge-pro)

=== Who Is This For? ===

- Bloggers and content sites with years of uploaded but unreferenced media
- WooCommerce stores that have updated product images many times
- Agencies managing multiple client sites
- Developers who want a safe, auditable media cleanup workflow

== Installation ==

1. Upload the `wp-media-purge` folder to `/wp-content/plugins/`
   **or** install directly via WordPress → Plugins → Add New → search "WP Media Purge".
2. Activate the plugin through the **Plugins** menu.
3. Navigate to **Media Purge** in the WordPress admin sidebar.
4. Click **Run Scan Now** to perform your first media audit.
5. Review the results, verify "Used In" links for each file, then trash what you no longer need.

== Frequently Asked Questions ==

= Will it permanently delete my files? =
No.  Files are moved to the plugin's internal trash.  They remain there for 30 days (configurable) before permanent deletion.  You can restore any file at any time from the **Recovery** tab.

= Is it safe on live sites? =
Yes.  The scanner is read-only — it never modifies anything until you explicitly click Trash.  The "Used In" column shows every location a file is referenced before you make any decision.

= Does it work with page builders? =
Yes.  Free tier includes deep scanning for Elementor, Divi, WPBakery, and Beaver Builder.  Image IDs and URLs stored inside builder-specific meta and JSON are all checked.

= What if a file is used by a theme or plugin but not in post content? =
Use the **Whitelist** feature.  Whitelisted files are permanently excluded from future scan results.

= Does it work with WooCommerce? =
Yes.  Product featured images and image galleries are scanned via post meta inspection.

= How does duplicate detection work? =
Files are grouped by their MD5 hash.  Byte-for-byte identical files are placed in the same duplicate group regardless of filename.

= Will activating the plugin affect my site's performance? =
No.  Scans run as a background process via WordPress cron (WP-CLI or async AJAX), so normal visitors are unaffected.  The admin dashboard loads data via REST API calls that are independent of the front end.

= Can I export the list of unused files? =
Yes.  Use the **Export CSV** button in the Scanner tab to download a CSV of all unused media with file path, size, MIME type, and usage status.

= What happens if I deactivate the plugin? =
All trashed files are restored, plugin database tables are left intact (so your scan history is preserved), and cron events are cleared.

= What happens if I uninstall the plugin? =
Database tables and all plugin options are fully removed.  This is irreversible.

= Does the free version have any limits? =
The free version scans unlimited media and provides full functionality for scanning, trashing, recovering, and exporting.  Features marked "Pro" (duplicate merge, scheduled cleanup, advanced analytics, virtual folders) require a Pro licence.

== Screenshots ==

1. **Dashboard** — stat cards, storage type breakdown bar, last-scan date, and quick actions.
2. **Scanner — Pre-scan state** — clear call-to-action before the first scan.
3. **Scanner — Results** — media grid with "Used In" post links, type filter dropdown, Export CSV button, and bulk actions bar.
4. **Recovery tab** — grid of trashed files with one-click restore and permanent delete options.
5. **Duplicates tab** — duplicate groups with total savings and Pro upgrade gate.
6. **Settings** — upload protection days, trash retention, and MIME type exclusions.

== Changelog ==

= 1.0.0 =
* Initial public release.
* Smart scanner with content, meta, options, and all major page builder support.
* "Used In" display with clickable post links per media item.
* Safe trash-and-recovery flow with configurable retention.
* Storage analytics dashboard with type breakdown bar.
* Type filter and CSV export in scanner.
* Load-more pagination for large libraries.
* Duplicate detection (view).
* Whitelist support.
* CSV export.
* Full uninstall cleanup.

== Upgrade Notice ==

= 1.0.0 =
First release.  After activation run a full scan to audit your media library.