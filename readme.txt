=== WP Media Purge ===

Contributors: naqeebulrehman
Donate link: https://getmediapurge.com/
Tags: media, media library, unused media, cleanup, duplicates, storage, page builder, media manager, elementor
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.4.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Find and safely remove unused media, detect duplicates, and reclaim disk space — free to use today, with advanced features planned for a future release.

== Description ==

**WP Media Purge** gives you complete visibility into your WordPress media library, surfaces every file that is not used anywhere on your site, and lets you clean it up safely — without any risk of breaking live content.

Whether you have a small blog or a large WooCommerce store, media libraries accumulate hundreds of forgotten files over time.  WP Media Purge makes it effortless to spot them, verify whether they are truly unused, and move them to a recoverable trash — not a permanent delete.

**Free to use.** All core cleanup features are available at no cost — scan, review, trash, restore, export.  No scan limits, no file caps.  A paid upgrade tier with advanced automation features is planned for a future release; those features are clearly marked "Coming Soon" inside the plugin.

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

**Duplicate Detection (View)**
Automatically groups files that are byte-for-byte identical using MD5 hashing.  See every duplicate group with its total wasted storage.  One-click duplicate *merge* (keep one copy, remove the rest) is coming in a future release and clearly marked as such in the plugin.

**Type Filter & CSV Export**
Filter unused media by file type (Images, Videos, Documents, Other) in one click.  Export the full unused media list to CSV for offline review or reporting.

**Pagination & Bulk Actions**
Handles large libraries with 30-items-per-page load-more pagination.  Bulk select, bulk trash, and bulk whitelist any number of files at once.

**Whitelist**
Files can be whitelisted so the scanner never flags them again, even if no URL reference is found (useful for email-campaign assets or programmatically served files).

**Page Builder Support (Free)**
Deep scanning of Elementor JSON data, Divi page meta, WPBakery shortcodes, and Beaver Builder layout data ensures no actively-used builder asset is ever flagged as unused.

=== Features Coming in a Future Release ===

The following features are currently in development.  When ready, they will be part of a **paid upgrade tier**.  They are clearly labelled "Coming Soon" inside the plugin — no guessing about what is free and what is not.

* **One-click Duplicate Merge** — keep the first copy, rewrite all references, delete the rest automatically.
* **Scheduled Auto-Cleanup** — set a recurring schedule to automatically trash unused media older than N days, with optional email summary.
* **Advanced Storage Analytics** — 90-day storage trend history and a hosting cost estimator.
* **Virtual Folder Organizer** — organise attachments into logical virtual folders without touching the server directory structure.

Core cleanup (scan → review → trash → restore) will always be free.

=== Who Is This For? ===

- **Non-technical site owners** — the interface walks you through every step; no FTP, no command line, nothing to configure before you can start.
- Bloggers and content sites with years of uploaded but unreferenced media.
- WooCommerce stores that have updated product images many times.
- Agencies managing multiple client sites.
- Developers who want a safe, auditable media cleanup workflow.

=== Compatibility ===

**WordPress:** 5.8 or higher (tested up to 6.7).
**PHP:** 7.4 or higher.
**Multisite:** single-site installs only (multisite support is planned).

**Works alongside (no configuration needed):**

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

**Does not yet scan** (planned):
- Bricks Builder, Oxygen Builder, Zion Builder, Breakdance
- ACF Image/Gallery fields that use URLs instead of attachment IDs
- Files referenced only in CSS/JS (theme stylesheets etc.)
- WPML / Polylang translated attachments

If a file is only referenced by a theme or custom plugin not listed above, use the **Whitelist** feature to permanently exclude it from scan results.

== Installation ==

1. Upload the `wp-media-purge` folder to `/wp-content/plugins/`
   **or** install directly via WordPress → Plugins → Add New → search "WP Media Purge".
2. Activate the plugin through the **Plugins** menu.
3. Navigate to **Media → Media Purge** in the WordPress admin sidebar.
4. Click **Run Scan Now** to perform your first media audit.
5. Review the results, verify "Used In" links for each file, then trash what you no longer need.

== Frequently Asked Questions ==

= Will it permanently delete my files? =
No — not automatically, and not until you choose to.  Files are moved to the plugin's internal trash first.  They remain there for 30 days by default (you can change this in Settings) and can be restored to your live media library at any time from the **Recovery** tab.  Permanent deletion only happens when you click "Delete Permanently" yourself, or when the auto-purge retention period expires.

= Is it safe on live sites? =
Yes.  The scanner is completely read-only — it never moves, modifies, or deletes anything while scanning.  Nothing changes on your site until you explicitly click a Trash button.  The "Used In" column shows every post, page, or widget where a file is referenced, so you can verify it is safe to remove before doing anything.

= Does it work with page builders? =
Yes.  Elementor, Divi, WPBakery, and Beaver Builder are all scanned automatically — no settings to change.  The scanner detects which builders are active and only runs the relevant scan.  Image IDs and URLs stored inside builder JSON, meta, and shortcodes are all checked.

Bricks Builder, Oxygen, and Zion Builder are not yet supported — those files will not be falsely flagged as unused (the scanner does not know about them), but they also will not show up in the "Used In" column.  Use the **Whitelist** feature to exclude any files you know are used in unsupported builders.

= What if a file is used by a theme or plugin that the scanner doesn't know about? =
Use the **Whitelist** feature.  Click "Keep" on any file in the Scanner tab to permanently exclude it from all future scan results.  The file stays in your media library and will never be flagged as unused again.  This is the right solution for files used by unsupported page builders, custom themes, or plugin-generated content.

= Does it work with WooCommerce? =
Yes.  Product featured images and image galleries are scanned via post meta inspection.

= How does duplicate detection work? =
Files are grouped by their MD5 hash.  Byte-for-byte identical files are placed in the same duplicate group regardless of filename.

= Will activating the plugin affect my site's performance? =
No.  Scans run as a background async process — normal visitors are unaffected even while a scan is in progress.  The admin dashboard loads data via REST API calls that are completely separate from the front end.  Deactivating the plugin removes all hooks instantly with no performance trace left behind.

= Can I export the list of unused files? =
Yes.  Use the **Export CSV** button in the Scanner tab to download a CSV of all unused media with file path, size, MIME type, and usage status.

= What happens if I deactivate the plugin? =
Cron events are cleared immediately.  Plugin database tables are left intact so your scan history and whitelist are preserved if you reactivate.  Files in the plugin's trash remain in the media library — they are not deleted on deactivation.

= What happens if I uninstall the plugin? =
Database tables and all plugin options are fully removed.  This is irreversible.

= Does the free version have any limits? =
No artificial limits.  There are no scan caps, no file-count restrictions, and no time limits.  All core features — scanning, reviewing, trashing, restoring, bulk actions, whitelist, CSV export, and storage analytics — are fully available at no cost.

Features labelled "Coming Soon" (duplicate merge, scheduled auto-cleanup, advanced analytics, virtual folder organizer) are not yet built.  When they are ready they will be part of a paid upgrade tier.  The core scan-and-cleanup workflow will always remain free.

== Screenshots ==

1. **Dashboard** — stat cards (total media, unused files, storage used, potential savings), storage breakdown by type, last-scan date, and quick action buttons.
2. **Scanner — Pre-scan state** — clear "Start Full Scan" call-to-action with source badges showing what will be scanned.
3. **Scanner — Results** — media rows with thumbnail, filename, file size, "Used In" post links, type filter, Export CSV, and bulk-action toolbar.
4. **Recovery tab** — trashed files with one-click restore per file and bulk restore/delete options.
5. **Duplicates tab** — duplicate groups showing each copy, total wasted space, and "Coming Soon" card for one-click merge.
6. **Settings** — recent-upload protection days, trash retention days, WooCommerce toggle, and file-type exclusions.
7. **Folders tab** — virtual folder organizer preview with "Coming Soon" card (available in a future paid release).

== Changelog ==

= 1.4.2 =
* Replaced Folders (Coming Soon) tab with functional Recovery tab — list trashed files, restore or delete permanently, Empty Trash and Restore All bulk actions.
* Added first-run Setup Wizard — configures recent-upload protection, trash retention period, and WooCommerce scan preference on first visit.
* Wizard auto-dismissed after completion; never shown again; skippable at any step.
* Fixed Help button and footer documentation links to use getmediapurge.com.

= 1.4.1 =
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

= 1.4.1 =
Community-first release.  Removed all upgrade prompts and artificial usage meters from the UI.  Advanced features (duplicate merge, scheduled cleanup, virtual folders, advanced analytics) are now shown as "Coming Soon" cards so users can see the roadmap without being upsold.  Updated readme to accurately reflect the free feature set and planned paid tier.

= 1.4.1 =
Upgrade prompts and the artificial usage meter have been removed.  Advanced features are now shown as "Coming Soon" previews.  No behaviour change to core scan and cleanup functions.
Major UI/UX redesign.  Modern card-based dashboard, improved navigation under Media menu, full i18n support, and responsive layout.  Hard-refresh your browser after updating to see all changes.

= 1.0.0 =
First release.  After activation run a full scan to audit your media library.