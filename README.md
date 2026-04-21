# Media Purge — WordPress Plugin

![Version](https://img.shields.io/badge/version-1.4.3-blue)
![WordPress](https://img.shields.io/badge/WordPress-5.8%2B-21759b)
![PHP](https://img.shields.io/badge/PHP-7.4%2B-8892bf)
![License](https://img.shields.io/badge/license-GPLv2%2B-green)

> Find and safely remove unused media, detect duplicates, and reclaim disk space — free to use today, with advanced features planned for a future release.

---

## Overview

**Media Purge** gives you complete visibility into your WordPress media library, surfaces every file that is not used anywhere on your site, and lets you clean it up safely — without any risk of breaking live content.

Whether you have a small blog or a large WooCommerce store, media libraries accumulate hundreds of forgotten files over time. Media Purge makes it effortless to spot them, verify whether they are truly unused, and move them to a recoverable trash — not a permanent delete.

All core cleanup features are **free** — scan, review, trash, restore, export. No scan limits, no file caps. A paid upgrade tier with advanced automation features is planned for a future release; those features are clearly marked "Coming Soon" inside the plugin.

---

## Features

### ✅ Free — Included Now

| Feature | Description |
|---|---|
| **Smart Unused Media Scanner** | Scans post content, post meta (featured images, WooCommerce galleries), theme customizer, widgets, and all major page builders |
| **"Used In" Display** | Each item shows exactly where it's used — post title, post type, context — with a direct edit link |
| **Safe Trash Flow** | Files go to an internal trash (default 30-day retention), never immediately deleted |
| **Recovery Tab** | Browse, restore, or permanently delete trashed media anytime |
| **Storage Analytics** | Visual breakdown by file type with total counts, sizes, and potential savings |
| **Duplicate Detection** | Groups byte-for-byte identical files via MD5 hash; shows total wasted storage per group |
| **Type Filter & CSV Export** | Filter by Images / Videos / Documents / Other; export the full list to CSV |
| **Bulk Actions** | Bulk select, trash, and whitelist any number of files at once |
| **Whitelist** | Permanently exclude any file from future scan results |
| **Page Builder Support** | Deep scanning of Elementor, Divi, WPBakery, and Beaver Builder |
| **Pagination** | 30-items-per-page load-more pagination for large libraries |

### 🔜 Coming in a Future Release (Paid Tier)

- **One-click Duplicate Merge** — keep one copy, rewrite all references, delete the rest automatically
- **Scheduled Auto-Cleanup** — recurring trash schedule with optional email summary
- **Advanced Storage Analytics** — 90-day trend history and hosting cost estimator
- **Virtual Folder Organizer** — logical virtual folders without touching server directory structure

> Core cleanup (scan → review → trash → restore) will always be free.

---

## Page Builder Compatibility

| Plugin / Theme | What is scanned |
|---|---|
| **Elementor** | Image widgets, background images, gallery elements in Elementor JSON |
| **Divi Builder** | Images in Divi module meta and layout data |
| **WPBakery Page Builder** | Images in `[vc_*]` shortcode attributes |
| **Beaver Builder** | Images in Beaver Builder layout posts |
| **WooCommerce** | Product featured image and all product gallery images |
| **Gutenberg / Block Editor** | Image, gallery, cover, media-text, and all core blocks |
| **Classic Editor** | All `<img>` tags and `[gallery]` shortcodes in post content |
| **Widgets & Theme Customizer** | Upload URLs in widget options and theme mod values |

**Not yet scanned (planned):** Bricks Builder, Oxygen Builder, Zion Builder, Breakdance, ACF URL fields, files referenced only in CSS/JS.

---

## Installation

1. Upload the `media-purge` folder to `/wp-content/plugins/`
   **or** install directly via **WordPress → Plugins → Add New** and search for "Media Purge".
2. Activate the plugin through the **Plugins** menu.
3. Navigate to **Media → Media Purge** in the WordPress admin sidebar.
4. Click **Run Scan Now** to perform your first media audit.
5. Review results, verify "Used In" links, then trash what you no longer need.

**Requirements**

- WordPress 5.8 or higher (tested up to 6.9)
- PHP 7.4 or higher
- Single-site installs (multisite support is planned)

---

## Frequently Asked Questions

**Will it permanently delete my files?**
No — not automatically, and not until you choose to. Files go to an internal trash first (default 30-day retention, adjustable in Settings). Restore any file from the Recovery tab at any time. Permanent deletion only happens when you explicitly click "Delete Permanently" or the retention period expires.

**Is it safe on live sites?**
Yes. The scanner is completely read-only — it never moves, modifies, or deletes anything during a scan. Nothing changes until you click Trash. The "Used In" column shows every post and widget referencing a file so you can verify it's safe to remove.

**Does it work with page builders?**
Yes. Elementor, Divi, WPBakery, and Beaver Builder are all scanned automatically. The scanner detects which builders are active and only runs relevant checks. For unsupported builders, use the Whitelist feature to exclude files you know are in use.

**Does it work with WooCommerce?**
Yes. Product featured images and image galleries are scanned via post meta inspection.

**How does duplicate detection work?**
Files are grouped by MD5 hash. Byte-for-byte identical files appear in the same group regardless of filename.

**Will scans affect site performance?**
No. Scans run as a background async process — front-end visitors are unaffected. The dashboard loads via REST API calls that are entirely separate from the front end.

**Does the free version have any limits?**
No artificial limits — no scan caps, no file-count restrictions, no time limits. All core features are fully available at no cost. Features labelled "Coming Soon" are not yet built.

---

## Screenshots

1. **Dashboard** — stat cards, storage breakdown by type, last-scan date, and quick actions
2. **Scanner (pre-scan)** — "Start Full Scan" CTA with source badges showing what will be scanned
3. **Scanner (results)** — media rows with thumbnail, filename, size, "Used In" links, type filter, CSV export
4. **Recovery tab** — trashed files with per-file restore and bulk restore/delete options
5. **Duplicates tab** — duplicate groups with total wasted space; one-click merge "Coming Soon"
6. **Settings** — recent-upload protection, trash retention, WooCommerce toggle, file-type exclusions
7. **Folders tab** — virtual folder organizer preview ("Coming Soon" in a future paid release)

---

## Changelog

### 1.4.3
- Added System Status tab — health check covering REST API, DB tables, PHP/WP versions, cron jobs, memory limit, upload directory, and WooCommerce
- Added REST API health endpoint `GET /wpmp/v1/health`
- Fixed: Scanner no longer shows "Start Scan" screen after a scan returns 0 results — new sites now see a clear "No Unused Files Found" message
- Improved: About tab clearly lists all free features and planned future releases
- Improved: Page builders (Elementor, Divi, WPBakery) correctly show as free — removed incorrect "Pro" badge
- Added: "Adjust Protection Period" shortcut on the scan-clean screen links directly to Settings

### 1.4.2
- Replaced Folders (Coming Soon) tab with functional Recovery tab — list, restore, or permanently delete trashed files
- Added first-run Setup Wizard — configures upload protection, trash retention, and WooCommerce scan preference on first visit
- Wizard is auto-dismissed after completion and skippable at any step

### 1.4.1
- Security: Rewrote `get_unused_media` query to use `$wpdb->prepare()` — eliminated SQL LIKE injection risk
- Security: Fixed negative OFFSET vulnerability when `?page=0` was passed to the media endpoint
- Performance: Scanner now fetches attachment IDs in configurable batches (default 200) instead of loading all at once
- Reliability: Replaced TRUNCATE (full data wipe) with targeted DELETE that preserves whitelisted entries
- Reliability: Added `POST /scan/cancel` endpoint to force-clear a stuck scan lock
- Removed Google Fonts CDN enqueue — admin UI now uses a system font stack
- Business logic: Removed "(Pro)" label from Divi, WPBakery, and Beaver Builder scanner labels
- Code: Removed dead `reset_monthly_count()` cron method

### 1.3.0
- Complete UI overhaul — Navy/Blue premium design system
- SVG icon system replaces WordPress dashicons
- New navy plugin header bar with integrated tab navigation
- Dashboard stat cards, storage grid, quick actions card
- Scanner pre-scan hero with source badges and large CTA
- Scan progress component with animated spinner, gradient bar, and phase indicators
- Horizontal media rows with improved information density
- Custom checkbox component with animated SVG check
- Bottom-right toast notification system
- Confirm modal with safety box and amber confirm button
- Undo toast with 8-second countdown
- 9 CSS keyframe animations; 40+ new localised strings; responsive breakpoints

### 1.2.0
- Undo toast after trash action with 5-second countdown and one-click undo
- Scan phase labels showing which step is running during scan progress
- Elementor scanning moved to Free tier
- Full ARIA accessibility (tabs, modals, checkboxes, progress bar — WCAG 2.1 AA)
- Selected media rows highlight with blue outline and tinted background

### 1.1.0
- Complete UI/UX redesign with modern card-based interface and CSS custom properties
- Menu moved under Media → Media Purge
- Dashboard stat cards, storage breakdown, "How it works" onboarding section
- Tab navigation with dashicons and contextual description banners
- Enhanced confirmation modal with animated backdrop
- Full internationalisation — all UI strings localised

### 1.0.0
- Initial public release
- Smart scanner with content, meta, options, and page builder support
- "Used In" display with clickable post links
- Safe trash-and-recovery flow with configurable retention
- Storage analytics dashboard with type breakdown
- Type filter and CSV export
- Load-more pagination
- Duplicate detection (view)
- Whitelist support
- Full uninstall cleanup

---

## License

[GPLv2 or later](https://www.gnu.org/licenses/gpl-2.0.html)

---

## Author

**Naqeeb** — [getmediapurge.com](https://getmediapurge.com/)