# Contributing to Media Purge

Thank you for your interest in contributing to Media Purge! This project is open source and maintained with professional standards to ensure stable releases and a strong developer experience.

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
5. Test your changes locally on WordPress 6.9+ and PHP 7.4+.
6. Commit with a clear message:
   ```bash
   git commit -m "fix: description of change"
   ```
7. Push your branch and open a pull request.

## What we review

- Code quality and consistency with existing patterns
- Security and sanitization for all data input/output
- No hidden or unrelated files included in plugin packaging
- Confirmed compatibility with WordPress 6.9+ and PHP 7.4+
- Proper gettext translation strings for any new user-facing text

## Issue reporting

If you find a bug or want to request a feature:
- Open a GitHub issue with a clear title
- Include steps to reproduce the bug
- Share your WordPress and PHP version
- Attach screenshots or error messages when available

## Coding standards

- Use WordPress PHP coding standards
- Prefer `sanitize_text_field()`, `esc_html()`, `esc_attr()`, `wp_json_encode()`, and similar helper functions
- Keep JavaScript plain and dependency-free where possible
- Avoid introducing any background data collection unless explicitly required and documented

## GitHub release workflow

1. Merge approved code into `main`
2. Tag the release version, e.g. `v1.4.5`
3. Create a GitHub release with changelog notes
4. Deploy the same release version to WP.org SVN
