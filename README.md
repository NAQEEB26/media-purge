# Media Purge

<p>
  <a href="https://wordpress.org/plugins/media-purge/"><img src="assets/badges/version.svg" alt="version 1.4.6"></a>
  <a href="https://www.gnu.org/licenses/gpl-2.0.html"><img src="assets/badges/license.svg" alt="license GPL v2"></a>
  <a href="https://www.php.net/"><img src="assets/badges/php.svg" alt="PHP 7.4+"></a>
  <a href="https://wordpress.org/"><img src="assets/badges/wordpress.svg" alt="WordPress 5.8+"></a>
</p>

**Find unused media, see where each file is used, and clean up safely** — with recoverable trash, not permanent deletes.

| | |
|---|---|
| **WordPress.org** | [Install Media Purge](https://wordpress.org/plugins/media-purge/) |
| **Website** | [getmediapurge.com](https://getmediapurge.com/) |
| **Support** | [WordPress.org support forum](https://wordpress.org/support/plugin/media-purge/) |
| **Author** | [Naqeeb Ul Rehman](https://profiles.wordpress.org/naqeeb026/) |

---

## Features

- **Smart unused media scanner** — post content, post meta, widgets, Customizer, WooCommerce, Elementor, Divi, WPBakery, Beaver Builder, and Gutenberg
- **“Used in” display** — see the post and context before you trash anything
- **Safe trash & recovery** — configurable retention (default 30 days), restore anytime
- **Storage analytics** — breakdown by file type and potential savings
- **Duplicate detection** — MD5 grouping (view today; merge planned)
- **CSV export, type filters, whitelist, bulk actions**
- **System status** — REST health, database tables, cron, environment checks

Core scan → review → trash → restore is **free**, with no artificial scan limits.

---

## Requirements

- WordPress **5.8+**
- PHP **7.4+**
- Single-site installs (multisite support planned)

---

## Installation

### From WordPress.org (recommended)

1. In wp-admin go to **Plugins → Add New**
2. Search for **Media Purge**
3. Install and activate
4. Open **Media → Media Purge** and run your first scan

### From this repository

```bash
git clone https://github.com/NAQEEB26/media-purge.git
```

Copy the folder into `wp-content/plugins/media-purge` and activate the plugin in wp-admin.

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

Contributions are welcome.

1. Open an [issue](https://github.com/NAQEEB26/media-purge/issues) for bugs or feature ideas
2. Fork the repository and create a branch: `feature/your-change`
3. Follow [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md)
4. Open a [pull request](https://github.com/NAQEEB26/media-purge/compare) against `main`

Please do not include `.env` files, IDE folders, or credentials in pull requests.

---

## Reporting bugs

Use the [issue tracker](https://github.com/NAQEEB26/media-purge/issues/new). Include:

- WordPress and PHP versions
- Media Purge version
- Steps to reproduce
- Expected vs actual behaviour
- Screenshots or error messages when available

For live-site support, use the [WordPress.org support forum](https://wordpress.org/support/plugin/media-purge/).

---

## Changelog

See [readme.txt](readme.txt) for the full WordPress.org changelog.

**Current stable: 1.4.6**

---

## License

Media Purge is free software licensed under the [GNU General Public License v2.0 or later](LICENSE).

---

## Links

- [Plugin on WordPress.org](https://wordpress.org/plugins/media-purge/)
- [Support forum](https://wordpress.org/support/plugin/media-purge/)
- [Translate Media Purge](https://translate.wordpress.org/projects/wp-plugins/media-purge)
