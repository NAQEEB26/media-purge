# Contributing to Media Purge

Thank you for helping improve Media Purge. This repository is the public source for the plugin listed on [WordPress.org](https://wordpress.org/plugins/media-purge/).

## How to contribute

1. Fork the repository on GitHub.
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/media-purge.git
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/describe-change
   ```
4. Make your changes and follow the existing code style.
5. Test on WordPress 5.8+ with PHP 7.4+.
6. Commit with a clear message:
   ```bash
   git commit -m "fix: short description of the change"
   ```
7. Push your branch and open a pull request against `main`.

## What we review

- Correctness and consistency with existing patterns
- Security: sanitize input, escape output, prepared SQL, capability checks on REST/AJAX
- No unrelated or packaging-only files in the plugin runtime tree
- Compatibility with WordPress 5.8+ and PHP 7.4+
- New user-facing strings use the `media-purge` text domain

## Issue reporting

When opening an issue, please include:

- Clear title and description
- Steps to reproduce (for bugs)
- WordPress, PHP, and Media Purge versions
- Screenshots or error messages when available

## Coding standards

- Follow [WordPress PHP Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/)
- Prefer WordPress helpers (`sanitize_*`, `esc_*`, `$wpdb->prepare()`, etc.)
- Keep admin JavaScript dependency-free where possible
- Do not add silent background data collection or external CDN assets without discussion

## Community

By participating, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).
