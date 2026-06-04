# Media Purge

[![WordPress Plugin Version](https://img.shields.io/wordpress/plugin/v/media-purge?style=flat-square)](https://wordpress.org/plugins/media-purge/)
[![WordPress Plugin Downloads](https://img.shields.io/wordpress/plugin/dt/media-purge?style=flat-square)](https://wordpress.org/plugins/media-purge/)
[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg?style=flat-square)](https://www.gnu.org/licenses/gpl-2.0.html)
[![PHP Version Require](https://img.shields.io/badge/PHP-7.4%2B-777BB4?style=flat-square)](https://php.net/)
[![Tested up to](https://img.shields.io/badge/WordPress-7.0%2B-21759B?style=flat-square&logo=wordpress)](https://wordpress.org/)

**Find unused media, review where files are used, and clean up safely** — with recoverable trash, not permanent deletes.

| | |
|---|---|
| **WordPress.org** | [Download & install](https://wordpress.org/plugins/media-purge/) |
| **Website** | [getmediapurge.com](https://getmediapurge.com/) |
| **Support** | [WordPress.org support forum](https://wordpress.org/support/plugin/media-purge/) |
| **Author** | [Naqeeb Ul Rehman](https://profiles.wordpress.org/naqeeb026/) |

---

## Features

- **Smart scanner** — posts, meta, widgets, customizer, WooCommerce, Elementor, Divi, WPBakery, Beaver Builder, Gutenberg
- **“Used in” links** — see exactly where each file is referenced before you trash anything
- **Safe trash & recovery** — configurable retention (default 30 days), bulk restore
- **Storage analytics** — breakdown by file type, largest files, potential savings
- **Duplicate detection** — MD5 grouping (view-only; merge coming later)
- **Export & filters** — CSV export, type filter, pagination, whitelist
- **System status** — REST health, DB tables, cron, PHP/WP checks

Core scan → review → trash → restore is **free** with no artificial limits. Advanced automation features are marked *Coming Soon* in the plugin UI.

---

## Requirements

- WordPress **5.8+** (tested up to **7.0**)
- PHP **7.4+**
- Single-site installs (multisite planned)

---

## Installation

### From WordPress.org (recommended)

1. In wp-admin go to **Plugins → Add New**
2. Search for **Media Purge**
3. Install and activate
4. Open **Media → Media Purge** and run your first scan

### From source (development)

```bash
git clone https://github.com/NAQEEB26/media-purge.git
cd media-purge
# Copy the folder into wp-content/plugins/ and activate in wp-admin
```

---

## Project structure

```text
media-purge/
├── admin/           # Admin UI + REST API (wpmp/v1)
├── assets/          # admin.js, admin.css
├── includes/        # Activator, settings, cron, loader
├── scanner/         # Content, meta, page builders, filesystem
├── languages/
├── media-purge.php  # Bootstrap
├── readme.txt       # WordPress.org plugin readme
└── uninstall.php
```

---

## Contributing

We welcome issues and pull requests.

1. [Open an issue](https://github.com/NAQEEB26/media-purge/issues) — bug or feature
2. Fork the repo and create a branch: `feature/your-change`
3. Follow [CONTRIBUTING.md](CONTRIBUTING.md)
4. Open a [pull request](https://github.com/NAQEEB26/media-purge/compare) against `main`

Please do **not** include `.env`, IDE folders, or credentials in pull requests.

---

## Reporting bugs

Use the [issue tracker](https://github.com/NAQEEB26/media-purge/issues/new). Include:

- WordPress and PHP versions
- Steps to reproduce
- Expected vs actual behaviour
- Screenshots or console errors if relevant

For live-site help, use the [WordPress.org support forum](https://wordpress.org/support/plugin/media-purge/).

---

## Changelog

See [readme.txt](readme.txt) for the full changelog.

**Latest release: 1.4.6**

- Fixed support URL for WP.org forum links
- Fixed storage analytics subtitle display

---

## License

This project is licensed under the [GNU General Public License v2.0 or later](LICENSE).

---

## Links

- [Plugin on WordPress.org](https://wordpress.org/plugins/media-purge/)
- [Support forum](https://wordpress.org/support/plugin/media-purge/)
- [Translate the plugin](https://translate.wordpress.org/projects/wp-plugins/media-purge)
