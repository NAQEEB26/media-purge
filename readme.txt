=== WP Media Purge ===

Contributors: naqeebulrehman
Donate link: https://naqeebulrehman.com
Tags: media, media library, cleanup, unused images, duplicates, storage, optimization, media manager
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.4.0
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
3. Navigate to **Media → Media Purge** in the WordPress admin sidebar.
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

= 1.4.0 =
* Security: Rewrote `get_unused_media` query to use `$wpdb->prepare()` — eliminated SQL LIKE injection risk.
* Security: Fixed negative OFFSET vulnerability when `?page=0` was passed to the media endpoint.
* Performance: Scanner now fetches attachment IDs in configurable batches (default 200) instead of loading all IDs into memory at once — prevents PHP memory exhaustion on large libraries.
* Reliability: Replaced TRUNCATE (full data wipe before scan) with a targeted DELETE that preserves whitelisted entries — scan results survive a mid-scan crash.
* Reliability: Added `POST /scan/cancel` REST endpoint to force-clear a stuck scan lock without server access.
* Reliability: Replaced `@set_time_limit(0)` with a `function_exists()` guard to comply with WP Coding Standards (WPCS).
* GDPR / WP.org compliance: Removed Google Fonts CDN enqueue — admin UI now uses a fully system font stack.
* Business logic: Removed "(Pro)" label from Divi, WPBakery, and Beaver Builder scanner labels — page builder scanning is free.
* Code hygiene: Removed dead `reset_monthly_count()` cron method and its hook registration; monthly counter will be enforced by the Pro add-on when ready.

= 1.3.0 =
* Complete UI overhaul — Navy/Blue premium design system matching mediapurge-ui.jsx reference.
* System font stack for modern, distinctive typography (no external font loading).
* SVG icon system replaces WordPress dashicons — crisp at every resolution.
* New navy plugin header bar with integrated tab navigation and brand identity.
* Dashboard stat cards with coloured icon squares, mono-weight values, and storage grid.
* Quick actions card with last-scan indicator and one-click export/scan buttons.
* Scanner pre-scan hero with source badges (free/pro) and large CTA.
* Scan progress component with animated spinner box, gradient bar, and phase step indicators.
* Horizontal media rows replace vertical grid cards — better information density.
* Custom checkbox component with animated check SVG (18px, 5px radius).
* Bottom-right toast notification system replaces WordPress admin notices.
* Confirm modal with square icon (52px, 14px radius), safety box, and amber confirm.
* Undo toast with 8-second countdown integrated into the new toast system.
* Recovery tab with horizontal rows and updated empty state.
* Settings redesigned as two-column card grid with toggle switches.
* Exclusion tags, warning box, and pro features grid in settings.
* Pro gate with purple gradient, feature cards, and 30-day guarantee.
* Footer with version, docs, and support links.
* 9 CSS keyframe animations (fadeUp, fadeIn, spin, barFill, slideIn, scaleIn, modal-in, toast-in, countUp).
* 40+ new localized strings for complete i18n coverage.
* Responsive breakpoints for tablet and mobile views.

= 1.2.0 =
* Undo toast after trash action — 5-second countdown with one-click undo to restore files immediately.
* Scan phase labels during scan progress — shows which step is running (post content, meta, page builders, etc.).
* Elementor page builder scanning moved to Free tier (was Pro) — no Pro licence required.
* "Restorable within 30 days" green badge in trash confirmation modal — reduces user anxiety.
* Full ARIA accessibility — tabs have role, aria-selected, aria-controls; modal has aria-labelledby/describedby; checkboxes have aria-checked; progress bar has progressbar role.
* Selected media items highlight with blue outline and tinted background for clear visual feedback.
* Focus rings on all interactive elements (WCAG 2.1 AA).

= 1.1.0 =
* Complete UI/UX redesign with modern card-based interface and CSS custom properties design system.
* Menu moved under Media → Media Purge (was a top-level menu item).
* New page header with plugin icon, tagline, and version badge.
* Dashboard stat cards with coloured top bars, dashicons, and hover effects.
* Storage breakdown section with visual bar and colour-coded type legend.
* "How it works" onboarding section with three illustrated steps.
* Tab navigation with dashicons and contextual description banners.
* Colour-coded action buttons — red for Trash, green for Keep/Restore.
* Enhanced confirmation modal with file-count badge and animated backdrop.
* Recovery and Duplicates tabs with illustrated empty-state placeholders.
* Settings page redesign with icon headers and inline help text.
* Upgrade-to-Pro banner with gradient styling.
* Full internationalisation — all UI strings localised via wp_localize_script.
* Responsive layout improvements for tablets and smaller screens.
* Pre-scan hero section with safety note.
* Scanner toolbar with dashicon-labeled filter and export buttons.

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

= 1.4.0 =
Security and performance release.  The media scanner now processes attachments in batches (safe for 50k+ libraries), the unused-media REST endpoint is fully parameterised, and a stuck-scan cancel button has been added.  Hard-refresh your browser after updating.

= 1.1.0 =
Major UI/UX redesign.  Modern card-based dashboard, improved navigation under Media menu, full i18n support, and responsive layout.  Hard-refresh your browser after updating to see all changes.

= 1.0.0 =
First release.  After activation run a full scan to audit your media library.