/**
 * WP Media Purge — Admin JavaScript
 *
 * @package WP_Media_Purge
 */

(function ($) {
	'use strict';

	const s = (wpmpAdmin && wpmpAdmin.strings) ? wpmpAdmin.strings : {};
	const isPro = !!(wpmpAdmin && wpmpAdmin.isPro);
	const upgradeUrl = (wpmpAdmin && wpmpAdmin.upgradeUrl) ? wpmpAdmin.upgradeUrl : '#';
	const exportUrl = (wpmpAdmin && wpmpAdmin.exportCsvUrl) ? wpmpAdmin.exportCsvUrl : '#';
	let currentTab = 'dashboard';
	let scanPollTimer = null;
	let scannerPage = 1;
	let scannerType = '';
	let scannerTotalPages = 1;
	let scannerTotal = 0;
	let recoveryPage = 1;
	let recoveryTotalPages = 1;

	/* ---------------------------------------------------------------
	 * UTILITIES
	 * ---------------------------------------------------------------*/
	const wpmp = {

		api: function (endpoint, options) {
			options = options || {};
			if (typeof wpmpAdmin === 'undefined') {
				return Promise.reject(new Error('Plugin not configured'));
			}
			const url = (wpmpAdmin.restUrl + endpoint).replace(/([^:]\/)\/+/g, '$1');
			return fetch(url, $.extend({}, options, {
				headers: $.extend({
					'X-WP-Nonce': wpmpAdmin.nonce,
					'Content-Type': 'application/json',
				}, options.headers || {}),
			})).then(function (r) {
				return r.json().catch(function () { return {}; }).then(function (data) {
					if (!r.ok) {
						var msg = (data && data.message) ? data.message : (r.statusText || 'API error ' + r.status);
						throw new Error(msg);
					}
					return data;
				});
			});
		},

		formatBytes: function (bytes) {
			bytes = parseInt(bytes, 10) || 0;
			if (bytes === 0) return '0 B';
			const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
			const i = Math.floor(Math.log(bytes) / Math.log(k));
			return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
		},

		formatDate: function (dateStr) {
			if (!dateStr) return s.never || 'Never';
			const d = new Date(dateStr);
			return isNaN(d.getTime()) ? dateStr : d.toLocaleString();
		},

		parseBytes: function (str) {
			const m = (str || '').match(/^([\d.]+)\s*(\w+)$/);
			if (!m) return 0;
			const k = { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 };
			return parseFloat(m[1]) * (k[m[2].toUpperCase()] || 1);
		},

		esc: function (str) {
			return $('<span>').text(str || '').html();
		},

		showNotice: function (msg, type) {
			$('.wpmp-wrap .notice').remove();
			const cls = type === 'success' ? 'notice-success' : 'notice-error';
			const icon = type === 'success' ? 'yes-alt' : 'warning';
			const $n = $('<div class="notice ' + cls + ' is-dismissible"><p><span class="dashicons dashicons-' + icon + '" style="margin-right:4px;color:inherit"></span>' + wpmp.esc(msg) + '</p></div>');
			$('.wpmp-page-header').after($n);
			setTimeout(function () { $n.fadeOut(400, function () { $(this).remove(); }); }, 5000);
		},

		/* ---------------------------------------------------------------
		 * BOOT
		 * ---------------------------------------------------------------*/
		init: function () {
			wpmp.render();
			$(document).on('click', '.wpmp-tab', wpmp.switchTab);
			$(document).on('click', '.wpmp-modal-overlay', wpmp.closeModal);
			$(document).on('click', '.wpmp-modal-cancel', wpmp.closeModal);

			wpmp.api('scan/status').then(function (status) {
				if (status && status.running) {
					wpmp.startPoll();
				}
			});
		},

		switchTab: function (e) {
			const tab = $(e.currentTarget).data('tab');
			if (tab && tab !== currentTab) {
				currentTab = tab;
				if (tab === 'scanner') { scannerPage = 1; scannerType = ''; }
				if (tab === 'recovery') { recoveryPage = 1; }
				wpmp.render();
			}
		},

		render: function () {
			$('#wpmp-root').html(wpmp.getTabsHtml() + wpmp.getContentHtml());
			wpmp.bindContentEvents();
		},

		getTabsHtml: function () {
			const tabs = [
				{ id: 'dashboard', label: s.dashboard || 'Dashboard', icon: 'dashicons-dashboard' },
				{ id: 'scanner', label: s.scanner || 'Scanner', icon: 'dashicons-search' },
				{ id: 'duplicates', label: s.duplicates || 'Duplicates', icon: 'dashicons-admin-page' },
				{ id: 'recovery', label: s.recovery || 'Recovery', icon: 'dashicons-backup' },
				{ id: 'settings', label: s.settings || 'Settings', icon: 'dashicons-admin-generic' },
			];
			var html = '<nav class="wpmp-tabs">';
			tabs.forEach(function (t) {
				html += '<button type="button" class="wpmp-tab' + (currentTab === t.id ? ' active' : '') + '" data-tab="' + t.id + '">' +
					'<span class="dashicons ' + t.icon + '"></span>' +
					wpmp.esc(t.label) + '</button>';
			});
			return html + '</nav>';
		},

		getContentHtml: function () {
			return '<div class="wpmp-tab-body"><div class="wpmp-tab-content wpmp-' + currentTab + '-placeholder"><span class="spinner is-active"></span></div></div>';
		},

		/* Tab description bar — gives user context about every tab */
		getTabDescHtml: function () {
			const descMap = {
				'dashboard': { text: s.dashboardDesc || 'Overview of your media library health and storage usage.', icon: 'dashicons-info-outline' },
				'scanner': { text: s.scannerDesc || 'Review files not used anywhere on your site. You can safely trash or keep them.', icon: 'dashicons-info-outline' },
				'duplicates': { text: s.duplicatesDesc || 'Groups of identical files wasting disk space.', icon: 'dashicons-info-outline' },
				'recovery': { text: s.recoveryDesc || 'Files you previously trashed. Restore them if needed, or delete permanently.', icon: 'dashicons-info-outline' },
				'settings': { text: s.settingsDesc || 'Configure how Media Purge works for your site.', icon: 'dashicons-admin-generic' },
			};
			const d = descMap[currentTab] || descMap['dashboard'];
			return '<div class="wpmp-tab-desc"><span class="dashicons ' + d.icon + '"></span> ' + wpmp.esc(d.text) + '</div>';
		},

		bindContentEvents: function () {
			if (currentTab === 'dashboard') wpmp.loadDashboard();
			else if (currentTab === 'scanner') wpmp.loadScanner(false);
			else if (currentTab === 'duplicates') wpmp.loadDuplicates();
			else if (currentTab === 'recovery') wpmp.loadRecovery(false);
			else if (currentTab === 'settings') wpmp.loadSettings();
		},

		/* ---------------------------------------------------------------
		 * DASHBOARD TAB
		 * ---------------------------------------------------------------*/
		loadDashboard: function () {
			const $ph = $('.wpmp-dashboard-placeholder');
			Promise.all([
				wpmp.api('scan/status'),
				wpmp.api('storage/stats'),
			]).then(function (results) {
				const scanStatus = results[0] || {};
				const stats = results[1] || {};
				const totalCount = parseInt(stats.total_count, 10) || 0;
				const unusedCount = parseInt(stats.unused_count, 10) || 0;
				const totalSize = parseInt(stats.total_size, 10) || 0;
				const unusedSize = parseInt(stats.unused_size, 10) || 0;
				const byType = stats.by_type || {};
				const lastScan = stats.last_scan;

				/* storage type bar */
				let barHtml = '', legendHtml = '';
				const typeColors = { image: '#2271b1', video: '#d63638', audio: '#00a32a', document: '#dba617', other: '#8c8f94' };
				const typeLabels = {
					image: s.storageImages || 'Images',
					video: s.storageVideos || 'Videos',
					audio: s.storageAudio || 'Audio',
					document: s.storageDocuments || 'Documents',
					other: s.storageOther || 'Other',
				};
				if (totalSize > 0) {
					['image', 'video', 'audio', 'document', 'other'].forEach(function (t) {
						const seg = byType[t] || {};
						const pct = totalSize > 0 ? ((parseInt(seg.size, 10) || 0) / totalSize * 100).toFixed(1) : 0;
						if (pct > 0) {
							barHtml += '<div class="wpmp-bar-seg" style="width:' + pct + '%;background:' + typeColors[t] + ';" title="' + wpmp.esc(typeLabels[t]) + ': ' + wpmp.formatBytes(seg.size) + '"></div>';
							legendHtml += '<span class="wpmp-bar-leg-item"><span class="wpmp-bar-leg-dot" style="background:' + typeColors[t] + ';"></span>' + wpmp.esc(typeLabels[t]) + ' <strong>' + wpmp.formatBytes(seg.size) + '</strong></span>';
						}
					});
				}

				const runningBanner = scanStatus.running
					? '<div class="wpmp-scan-running-banner"><span class="spinner is-active"></span> ' + wpmp.esc(s.scanning || 'Scanning\u2026') + ' ' + (scanStatus.progress || 0) + '%</div>'
					: '';

				$ph.replaceWith(
					'<div class="wpmp-dashboard">' +
					wpmp.getTabDescHtml() +
					runningBanner +
					'<div class="wpmp-stat-cards">' +
					'<div class="wpmp-card">' +
					'<div class="wpmp-card-icon icon-total"><span class="dashicons dashicons-format-gallery"></span></div>' +
					'<span class="wpmp-card-value">' + totalCount + '</span>' +
					'<span class="wpmp-card-label">' + wpmp.esc(s.totalMedia || 'Total Media') + '</span>' +
					'</div>' +
					'<div class="wpmp-card wpmp-card-warn">' +
					'<div class="wpmp-card-icon icon-unused"><span class="dashicons dashicons-warning"></span></div>' +
					'<span class="wpmp-card-value">' + unusedCount + '</span>' +
					'<span class="wpmp-card-label">' + wpmp.esc(s.storageUnused || 'Unused') + '</span>' +
					'</div>' +
					'<div class="wpmp-card">' +
					'<div class="wpmp-card-icon icon-storage"><span class="dashicons dashicons-cloud"></span></div>' +
					'<span class="wpmp-card-value">' + wpmp.formatBytes(totalSize) + '</span>' +
					'<span class="wpmp-card-label">' + wpmp.esc(s.storageUsed || 'Storage Used') + '</span>' +
					'</div>' +
					'<div class="wpmp-card wpmp-card-savings">' +
					'<div class="wpmp-card-icon icon-savings"><span class="dashicons dashicons-money-alt"></span></div>' +
					'<span class="wpmp-card-value">' + wpmp.formatBytes(unusedSize) + '</span>' +
					'<span class="wpmp-card-label">' + wpmp.esc(s.potentialSavings || 'Potential Savings') + '</span>' +
					'</div>' +
					'</div>' +
					(barHtml ? '<div class="wpmp-storage-section"><p class="wpmp-storage-section-title">' + wpmp.esc(s.storageBreakdown || 'Storage Breakdown') + '</p><div class="wpmp-storage-bar">' + barHtml + '</div><p class="wpmp-bar-legend">' + legendHtml + '</p></div>' : '') +
					'<div class="wpmp-last-scan"><span class="dashicons dashicons-clock"></span> ' + wpmp.esc(s.lastScan || 'Last scan:') + ' <strong>' + wpmp.formatDate(lastScan) + '</strong></div>' +
					'<div class="wpmp-dashboard-actions">' +
					'<button type="button" class="button button-primary wpmp-dash-scan-btn"><span class="dashicons dashicons-search" style="margin-right:4px;line-height:inherit"></span>' + wpmp.esc(s.runScan || 'Run Scan Now') + '</button> ' +
					'<button type="button" class="button wpmp-view-unused-btn"><span class="dashicons dashicons-visibility" style="margin-right:4px;line-height:inherit"></span>' + wpmp.esc(s.viewUnused || 'View Unused Files') + '</button> ' +
					'<button type="button" class="button wpmp-view-dupes-btn"><span class="dashicons dashicons-admin-page" style="margin-right:4px;line-height:inherit"></span>' + wpmp.esc(s.duplicates || 'Duplicates') + '</button>' +
					'</div>' +
					/* How it works section */
					'<div class="wpmp-how-it-works">' +
					'<p class="wpmp-how-title"><span class="dashicons dashicons-lightbulb"></span> ' + wpmp.esc(s.howItWorks || 'How It Works') + '</p>' +
					'<div class="wpmp-steps">' +
					'<div class="wpmp-step">' +
					'<span class="wpmp-step-num">1</span>' +
					'<div class="wpmp-step-text">' +
					'<h4>' + wpmp.esc(s.step1Title || 'Scan') + '</h4>' +
					'<p>' + wpmp.esc(s.step1Desc || 'Analyze your entire media library to find files not used in any post, page, widget, or page builder.') + '</p>' +
					'</div>' +
					'</div>' +
					'<div class="wpmp-step">' +
					'<span class="wpmp-step-num">2</span>' +
					'<div class="wpmp-step-text">' +
					'<h4>' + wpmp.esc(s.step2Title || 'Review') + '</h4>' +
					'<p>' + wpmp.esc(s.step2Desc || 'Browse the results, check where each file is used, and decide which ones to clean up.') + '</p>' +
					'</div>' +
					'</div>' +
					'<div class="wpmp-step">' +
					'<span class="wpmp-step-num">3</span>' +
					'<div class="wpmp-step-text">' +
					'<h4>' + wpmp.esc(s.step3Title || 'Clean') + '</h4>' +
					'<p>' + wpmp.esc(s.step3Desc || 'Move unused files to trash or keep them. Nothing is permanently deleted until you say so.') + '</p>' +
					'</div>' +
					'</div>' +
					'</div>' +
					'</div>' +
					(isPro ? '' : '<div class="wpmp-upgrade-banner">' +
						'<span class="dashicons dashicons-star-filled"></span>' +
						'<span><strong>' + wpmp.esc(s.proFeature || 'Pro Features') + ':</strong> ' +
						wpmp.esc(s.proScheduleMsg || 'Scheduled auto-cleanup, duplicate merge, virtual folders.') + '</span>' +
						'<a href="' + upgradeUrl + '" target="_blank" rel="noopener">' + wpmp.esc(s.upgradeToPro || 'Upgrade to Pro') + '</a>' +
						'</div>') +
					'</div>'
				);

				$('.wpmp-dash-scan-btn').on('click', wpmp.startScan);
				$('.wpmp-view-unused-btn').on('click', function () {
					currentTab = 'scanner'; scannerPage = 1; scannerType = '';
					wpmp.render();
				});
				$('.wpmp-view-dupes-btn').on('click', function () {
					currentTab = 'duplicates';
					wpmp.render();
				});
			}).catch(function (err) {
				$('.wpmp-dashboard-placeholder').replaceWith(
					'<p class="wpmp-error">Failed to load dashboard: ' + wpmp.esc(err.message) + '</p>'
				);
			});
		},

		/* ---------------------------------------------------------------
		 * SCANNER TAB
		 * ---------------------------------------------------------------*/
		loadScanner: function (append) {
			const $ph = append ? null : $('.wpmp-scanner-placeholder');
			const $grid = append ? $('.wpmp-media-grid') : null;
			const qs = 'media/unused?page=' + scannerPage + '&per_page=30' + (scannerType ? '&type=' + encodeURIComponent(scannerType) : '');

			Promise.all([
				append ? Promise.resolve(null) : wpmp.api('scan/status'),
				wpmp.api(qs),
			]).then(function (results) {
				const scanStatus = results[0] || {};
				const unusedData = results[1] || {};
				const items = unusedData.items || [];
				const total = parseInt(unusedData.total, 10) || 0;
				const totalPages = parseInt(unusedData.total_pages, 10) || 1;

				scannerTotalPages = totalPages;
				scannerTotal = total;

				if (append) {
					items.forEach(function (item) { $grid.append(wpmp.buildMediaRow(item)); });
					if (scannerPage >= scannerTotalPages) {
						$('.wpmp-load-more-wrap').hide();
					}
					return;
				}

				if (!append && scanStatus.running) {
					$ph.replaceWith(wpmp.getTabDescHtml() + wpmp.buildScanningHtml(scanStatus));
					return;
				}

				if (total === 0 && !scannerType) {
					$ph.replaceWith(wpmp.getTabDescHtml() + wpmp.buildPreScanHtml());
					$(document).on('click.wpmpScan', '.wpmp-scan-btn', wpmp.startScan);
					return;
				}

				$ph.replaceWith(wpmp.getTabDescHtml() + wpmp.buildScannerShell(items, total));
				wpmp.bindScannerEvents();
				if (scannerPage >= scannerTotalPages) {
					$('.wpmp-load-more-wrap').hide();
				}

			}).catch(function (err) {
				if (!append) {
					$('.wpmp-scanner-placeholder').replaceWith('<p class="wpmp-error">Failed to load: ' + wpmp.esc(err.message) + '</p>');
				}
			});
		},

		buildPreScanHtml: function () {
			return '<div class="wpmp-prescan">' +
				'<div class="wpmp-prescan-icon">&#x1F50D;</div>' +
				'<h2>' + wpmp.esc(s.scanLibrary || 'Scan Your Media Library') + '</h2>' +
				'<p>' + wpmp.esc(s.scanLibraryDesc || 'Click the button below to analyze your entire media library. The scanner will check every post, page, widget, and page builder to find files that are no longer in use.') + '</p>' +
				'<button type="button" class="button button-primary button-hero wpmp-scan-btn"><span class="dashicons dashicons-search" style="margin-right:6px;line-height:inherit"></span>' + wpmp.esc(s.runScan || 'Run Scan Now') + '</button>' +
				'<p class="wpmp-prescan-note"><span class="dashicons dashicons-shield"></span> ' + wpmp.esc(s.safeNote || 'Safe & non-destructive — nothing is deleted automatically') + '</p>' +
				'</div>';
		},

		buildScanningHtml: function (scanStatus) {
			const pct = parseInt(scanStatus.progress, 10) || 0;
			return '<div class="wpmp-scanning">' +
				'<div class="wpmp-scan-anim">&#x1F504;</div>' +
				'<h3>' + wpmp.esc(s.scanning || 'Scanning\u2026') + '</h3>' +
				'<div class="wpmp-progress-wrap"><div class="wpmp-progress-bar" style="width:' + pct + '%"></div></div>' +
				'<p class="wpmp-progress-pct">' + pct + wpmp.esc(s.pctComplete || '% complete') + '</p>' +
				'<p class="wpmp-scanning-note">' + wpmp.esc(s.scanMayTakeMoment || 'This may take a moment depending on the size of your media library. Please do not close this page.') + '</p>' +
				'</div>';
		},

		buildScannerShell: function (items, total) {
			let rows = '';
			items.forEach(function (item) { rows += wpmp.buildMediaRow(item); });

			const showMore = scannerTotalPages > 1;

			return '<div class="wpmp-scanner-results">' +
				'<div class="wpmp-scanner-toolbar">' +
				'<div class="wpmp-toolbar-left">' +
				'<button type="button" class="button wpmp-select-all"><span class="dashicons dashicons-yes" style="margin-right:2px;line-height:inherit"></span>' + wpmp.esc(s.selectAll || 'Select All') + '</button>' +
				'<button type="button" class="button button-primary wpmp-scan-btn"><span class="dashicons dashicons-update" style="margin-right:2px;line-height:inherit"></span>' + wpmp.esc(s.rescan || 'Re-scan') + '</button>' +
				'</div>' +
				'<div class="wpmp-toolbar-right">' +
				'<select class="wpmp-type-filter">' +
				'<option value="">' + wpmp.esc(s.filterAll || 'All Types') + '</option>' +
				'<option value="image"' + (scannerType === 'image' ? ' selected' : '') + '>' + wpmp.esc(s.filterImage || 'Images') + '</option>' +
				'<option value="video"' + (scannerType === 'video' ? ' selected' : '') + '>' + wpmp.esc(s.filterVideo || 'Videos') + '</option>' +
				'<option value="document"' + (scannerType === 'document' ? ' selected' : '') + '>' + wpmp.esc(s.filterDocument || 'Documents') + '</option>' +
				'<option value="other"' + (scannerType === 'other' ? ' selected' : '') + '>' + wpmp.esc(s.filterOther || 'Other') + '</option>' +
				'</select>' +
				'<a href="' + exportUrl + '" class="button wpmp-export-btn"><span class="dashicons dashicons-download" style="margin-right:2px;line-height:inherit"></span>' + wpmp.esc(s.exportCsv || 'Export CSV') + '</a>' +
				'</div>' +
				'</div>' +
				'<p class="wpmp-result-count"><strong>' + total + '</strong> ' + wpmp.esc(s.unusedFilesFound ? s.unusedFilesFound.replace('%d', '').trim() : 'unused file(s) found') + '</p>' +
				'<div class="wpmp-media-grid">' + rows + '</div>' +
				'<div class="wpmp-load-more-wrap" style="' + (showMore ? '' : 'display:none') + '">' +
				'<button type="button" class="button wpmp-load-more">' + wpmp.esc(s.loadMore || 'Load More') + '</button>' +
				'</div>' +
				'<div class="wpmp-bulk-bar" style="display:none">' +
				'<span class="wpmp-bulk-count"><span class="dashicons dashicons-yes-alt"></span></span>' +
				'<button type="button" class="button wpmp-bulk-whitelist" title="' + wpmp.esc(s.helpWhitelist || '') + '"><span class="dashicons dashicons-saved" style="margin-right:2px;line-height:inherit"></span>' + wpmp.esc(s.whitelist || 'Keep') + '</button>' +
				'<button type="button" class="button button-primary wpmp-bulk-trash" title="' + wpmp.esc(s.helpTrash || '') + '"><span class="dashicons dashicons-trash" style="margin-right:2px;line-height:inherit"></span>' + wpmp.esc(s.trash || 'Trash') + '</button>' +
				'</div>' +
				'</div>';
		},

		buildMediaRow: function (item) {
			const id = parseInt(item.attachment_id, 10);
			const fname = wpmp.esc(item.filename || 'file');
			const mime = item.mime_type || '';
			const thumb = item.thumbnail_url || (mime.indexOf('image') === 0 ? (item.attachment_url || '') : '');
			const size = parseInt(item.file_size, 10) || 0;

			/* Used-in section */
			let usedInHtml = '<span class="wpmp-badge-unused"><span class="dashicons dashicons-no" style="font-size:12px;width:12px;height:12px;line-height:12px;margin-right:2px"></span>' + wpmp.esc(s.notUsedAnywhere || 'Not used anywhere') + '</span>';
			const usedIn = item.used_in_data || [];
			if (usedIn.length > 0) {
				let links = '';
				usedIn.forEach(function (loc) {
					const title = wpmp.esc(loc.post_title || loc.label || 'Unknown');
					const editUrl = loc.edit_url ? loc.edit_url : '';
					const typeLabel = wpmp.esc(wpmp.locTypeLabel(loc.type));
					if (editUrl) {
						links += '<a href="' + editUrl + '" target="_blank" class="wpmp-used-link" title="Edit post">' + title + '</a><span class="wpmp-used-type"> (' + typeLabel + ')</span> ';
					} else {
						links += '<span class="wpmp-used-link">' + title + '</span><span class="wpmp-used-type"> (' + typeLabel + ')</span> ';
					}
				});
				usedInHtml = '<span class="wpmp-badge-used"><span class="dashicons dashicons-yes" style="font-size:12px;width:12px;height:12px;line-height:12px;margin-right:2px"></span>' + wpmp.esc(s.usedIn || 'Used in:') + '</span> ' + links;
			}

			return '<div class="wpmp-media-item" data-id="' + id + '" data-size="' + size + '">' +
				'<label class="wpmp-media-check"><input type="checkbox" class="wpmp-item-cb" value="' + id + '"></label>' +
				'<div class="wpmp-media-thumb">' +
				(thumb ? '<img src="' + wpmp.esc(thumb) + '" alt="" loading="lazy">' : '<span class="wpmp-file-icon dashicons dashicons-media-default"></span>') +
				'</div>' +
				'<div class="wpmp-media-info">' +
				'<strong class="wpmp-media-name">' + fname + '</strong>' +
				'<span class="wpmp-media-size">' + wpmp.formatBytes(size) + ' &bull; ' + wpmp.esc(mime) + '</span>' +
				'<div class="wpmp-used-in">' + usedInHtml + '</div>' +
				'</div>' +
				'<div class="wpmp-item-actions">' +
				'<button type="button" class="button button-small button-trash wpmp-trash-one" data-id="' + id + '" title="' + wpmp.esc(s.helpTrash || 'Move to trash') + '"><span class="dashicons dashicons-trash" style="font-size:14px;width:14px;height:14px;line-height:inherit;margin-right:2px"></span>' + wpmp.esc(s.trash || 'Trash') + '</button>' +
				'<button type="button" class="button button-small button-keep wpmp-whitelist-one" data-id="' + id + '" title="' + wpmp.esc(s.helpWhitelist || 'Keep this file') + '"><span class="dashicons dashicons-saved" style="font-size:14px;width:14px;height:14px;line-height:inherit;margin-right:2px"></span>' + wpmp.esc(s.whitelist || 'Keep') + '</button>' +
				'</div>' +
				'</div>';
		},

		locTypeLabel: function (type) {
			const map = {
				'post': s.locTypePost || 'Post',
				'page': s.locTypePage || 'Page',
				'featured_image': s.locTypeFeatured || 'Featured Image',
				'widget': s.locTypeWidget || 'Widget',
				'theme_customizer': s.locTypeCustomizer || 'Theme Customizer',
				'elementor': s.locTypeElementor || 'Elementor',
				'divi': s.locTypeDivi || 'Divi',
				'wpbakery': s.locTypeWpBakery || 'WPBakery',
				'beaver_builder': s.locTypeBeaver || 'Beaver Builder',
			};
			return map[type] || type || 'Content';
		},

		bindScannerEvents: function () {
			$(document).off('.wpmpScanner');
			$(document).on('click.wpmpScanner', '.wpmp-scan-btn', wpmp.startScan);
			$(document).on('click.wpmpScanner', '.wpmp-item-cb', wpmp.updateBulkBar);
			$(document).on('click.wpmpScanner', '.wpmp-select-all', wpmp.toggleSelectAll);
			$(document).on('click.wpmpScanner', '.wpmp-trash-one', wpmp.trashOne);
			$(document).on('click.wpmpScanner', '.wpmp-whitelist-one', wpmp.whitelistOne);
			$(document).on('click.wpmpScanner', '.wpmp-bulk-trash', wpmp.bulkTrash);
			$(document).on('click.wpmpScanner', '.wpmp-bulk-whitelist', wpmp.bulkWhitelist);
			$(document).on('click.wpmpScanner', '.wpmp-load-more', wpmp.loadMoreScanner);
			$(document).on('change.wpmpScanner', '.wpmp-type-filter', wpmp.changeTypeFilter);
		},

		updateBulkBar: function () {
			const ids = $('.wpmp-item-cb:checked').map(function () { return parseInt($(this).val(), 10); }).get();
			const $bar = $('.wpmp-bulk-bar');
			if (ids.length > 0) {
				$bar.find('.wpmp-bulk-count').html('<span class="dashicons dashicons-yes-alt"></span> ' + ids.length + ' ' + wpmp.esc(s.filesSelected || 'file(s) selected'));
				$bar.show();
			} else {
				$bar.hide();
			}
		},

		getSelectedIds: function () {
			return $('.wpmp-item-cb:checked').map(function () { return parseInt($(this).val(), 10); }).get();
		},

		toggleSelectAll: function () {
			const $cbs = $('.wpmp-item-cb');
			const allChecked = $cbs.length > 0 && $cbs.length === $cbs.filter(':checked').length;
			$cbs.prop('checked', !allChecked);
			wpmp.updateBulkBar();
		},

		trashOne: function () {
			const id = parseInt($(this).data('id'), 10);
			const size = parseInt($(this).closest('.wpmp-media-item').data('size'), 10) || 0;
			wpmp.showConfirmModal([id], size, 'trash', function () { wpmp.doTrash([id]); });
		},

		whitelistOne: function () {
			const id = parseInt($(this).data('id'), 10);
			wpmp.api('media/whitelist', { method: 'POST', body: JSON.stringify({ ids: [id] }) })
				.then(function (data) {
					if (data.success) {
						wpmp.showNotice(data.message || 'Whitelisted.', 'success');
						$('.wpmp-media-item[data-id="' + id + '"]').remove();
					} else {
						wpmp.showNotice(data.message || 'Error.', 'error');
					}
				}).catch(function (err) { wpmp.showNotice(err.message, 'error'); });
		},

		bulkTrash: function () {
			const ids = wpmp.getSelectedIds();
			if (!ids.length) { wpmp.showNotice(s.noFilesSelected || 'No files selected.', 'error'); return; }
			let totalSize = 0;
			ids.forEach(function (id) {
				totalSize += parseInt($('.wpmp-media-item[data-id="' + id + '"]').data('size'), 10) || 0;
			});
			wpmp.showConfirmModal(ids, totalSize, 'trash', function () { wpmp.doTrash(ids); });
		},

		bulkWhitelist: function () {
			const ids = wpmp.getSelectedIds();
			if (!ids.length) { wpmp.showNotice(s.noFilesSelected || 'No files selected.', 'error'); return; }
			wpmp.api('media/whitelist', { method: 'POST', body: JSON.stringify({ ids: ids }) })
				.then(function (data) {
					if (data.success) {
						wpmp.showNotice(data.message || 'Items whitelisted.', 'success');
						ids.forEach(function (id) { $('.wpmp-media-item[data-id="' + id + '"]').remove(); });
						$('.wpmp-bulk-bar').hide();
					} else {
						wpmp.showNotice(data.message || 'Error.', 'error');
					}
				}).catch(function (err) { wpmp.showNotice(err.message, 'error'); });
		},

		loadMoreScanner: function () {
			if (scannerPage >= scannerTotalPages) return;
			scannerPage++;
			wpmp.loadScanner(true);
		},

		changeTypeFilter: function () {
			scannerType = $(this).val();
			scannerPage = 1;
			wpmp.render();
		},

		/* ---------------------------------------------------------------
		 * CONFIRM MODAL (trash | delete)
		 * ---------------------------------------------------------------*/
		showConfirmModal: function (ids, totalSize, mode, onConfirm) {
			const sizeStr = wpmp.formatBytes(totalSize);
			const isDelete = mode === 'delete';
			const title = isDelete ? (s.confirmDelete || 'Permanently delete selected files?') : (s.confirmTrash || 'Move selected files to trash?');
			const desc = isDelete ? (s.confirmDeleteDesc || 'This action cannot be undone. The files will be permanently removed from your server.') : (s.confirmTrashDesc || 'These files will be moved to trash and can be recovered within your retention period.');
			const confirmText = isDelete ? (s.yesDelete || 'Yes, Delete Permanently') : (s.yesMoveToTrash || 'Yes, Move to Trash');
			const btnCls = isDelete ? 'button-link-delete' : 'button-primary';
			const iconCls = isDelete ? 'modal-delete' : 'modal-trash';
			const iconName = isDelete ? 'dashicons-trash' : 'dashicons-archive';

			$('body').append(
				'<div class="wpmp-modal-overlay">' +
				'<div class="wpmp-modal" role="dialog" aria-modal="true">' +
				'<div class="wpmp-modal-icon ' + iconCls + '"><span class="dashicons ' + iconName + '"></span></div>' +
				'<h3>' + wpmp.esc(title) + '</h3>' +
				'<p>' + wpmp.esc(desc) + '</p>' +
				'<div class="wpmp-modal-meta"><span class="dashicons dashicons-media-default" style="font-size:16px;width:16px;height:16px"></span> ' + ids.length + ' ' + wpmp.esc(s.filesAndSize || 'file(s)') + ' &mdash; ' + sizeStr + '</div>' +
				'<div class="wpmp-modal-actions">' +
				'<button type="button" class="button wpmp-modal-cancel">' + wpmp.esc(s.cancel || 'Cancel') + '</button>' +
				'<button type="button" class="button ' + btnCls + ' wpmp-modal-confirm">' + wpmp.esc(confirmText) + '</button>' +
				'</div>' +
				'</div></div>'
			);
			$('.wpmp-modal-confirm').one('click', function () { wpmp.closeModal(); onConfirm(); });
		},

		closeModal: function () { $('.wpmp-modal-overlay').remove(); },

		doTrash: function (ids) {
			wpmp.api('media/trash', { method: 'POST', body: JSON.stringify({ ids: ids }) })
				.then(function (data) {
					if (data.success) {
						wpmp.showNotice(data.message || 'Moved to trash.', 'success');
						ids.forEach(function (id) { $('.wpmp-media-item[data-id="' + id + '"]').remove(); });
						$('.wpmp-bulk-bar').hide();
					} else {
						wpmp.showNotice(data.message || 'Error.', 'error');
					}
				}).catch(function (err) { wpmp.showNotice(err.message, 'error'); });
		},

		/* ---------------------------------------------------------------
		 * RECOVERY TAB
		 * ---------------------------------------------------------------*/
		loadRecovery: function (append) {
			const $ph = append ? null : $('.wpmp-recovery-placeholder');
			const $grid = append ? $('.wpmp-recovery-grid') : null;
			const qs = 'media/trashed?page=' + recoveryPage + '&per_page=30';

			wpmp.api(qs).then(function (data) {
				const items = data.items || [];
				const total = parseInt(data.total, 10) || 0;
				const totalPages = parseInt(data.total_pages, 10) || 1;
				recoveryTotalPages = totalPages;

				if (append) {
					items.forEach(function (item) { $grid.append(wpmp.buildRecoveryRow(item)); });
					if (recoveryPage >= recoveryTotalPages) { $('.wpmp-recovery-more-wrap').hide(); }
					return;
				}

				if (items.length === 0) {
					$ph.replaceWith(
						wpmp.getTabDescHtml() +
						'<div class="wpmp-recovery-empty">' +
						'<div class="wpmp-recovery-empty-icon">&#x2705;</div>' +
						'<h3>' + wpmp.esc(s.trashEmpty || 'Trash is Empty') + '</h3>' +
						'<p>' + wpmp.esc(s.trashEmptyDesc || 'No files in trash. When you move unused media to trash from the Scanner tab, they will appear here for recovery.') + '</p>' +
						'</div>'
					);
					return;
				}

				let rows = '';
				items.forEach(function (item) { rows += wpmp.buildRecoveryRow(item); });

				$ph.replaceWith(
					wpmp.getTabDescHtml() +
					'<div class="wpmp-recovery-results">' +
					'<p class="wpmp-result-count"><strong>' + total + '</strong> ' + wpmp.esc(s.filesInTrash ? s.filesInTrash.replace('%d', '').trim() : 'file(s) in trash') + '</p>' +
					'<div class="wpmp-recovery-toolbar">' +
					'<button type="button" class="button wpmp-recov-select-all"><span class="dashicons dashicons-yes" style="margin-right:2px;line-height:inherit"></span>' + wpmp.esc(s.selectAll || 'Select All') + '</button>' +
					'<button type="button" class="button button-primary wpmp-bulk-restore" disabled><span class="dashicons dashicons-backup" style="margin-right:2px;line-height:inherit"></span>' + wpmp.esc(s.restoreSelected || 'Restore Selected') + '</button>' +
					'<button type="button" class="button button-link-delete wpmp-bulk-perm-delete" disabled><span class="dashicons dashicons-trash" style="margin-right:2px;line-height:inherit"></span>' + wpmp.esc(s.deletePermanently || 'Delete Permanently') + '</button>' +
					'</div>' +
					'<div class="wpmp-recovery-grid">' + rows + '</div>' +
					'<div class="wpmp-recovery-more-wrap" style="' + (totalPages > 1 ? '' : 'display:none') + '">' +
					'<button type="button" class="button wpmp-recovery-load-more">Load More</button>' +
					'</div>' +
					'</div>'
				);
				wpmp.bindRecoveryEvents();
			}).catch(function (err) {
				if (!append) {
					$('.wpmp-recovery-placeholder').replaceWith('<p class="wpmp-error">Failed to load: ' + wpmp.esc(err.message) + '</p>');
				}
			});
		},

		buildRecoveryRow: function (item) {
			const id = parseInt(item.attachment_id, 10);
			const fname = wpmp.esc(item.filename || 'file');
			const thumb = item.thumbnail_url || item.attachment_url || '';
			const size = parseInt(item.file_size, 10) || 0;

			return '<div class="wpmp-recovery-item" data-id="' + id + '" data-size="' + size + '">' +
				'<label><input type="checkbox" class="wpmp-recov-cb" value="' + id + '"></label>' +
				'<div class="wpmp-media-thumb">' +
				(thumb ? '<img src="' + wpmp.esc(thumb) + '" alt="" loading="lazy">' : '<span class="dashicons dashicons-media-default"></span>') +
				'</div>' +
				'<div class="wpmp-media-info">' +
				'<strong class="wpmp-media-name">' + fname + '</strong>' +
				'<span class="wpmp-media-size">' + wpmp.formatBytes(size) + '</span>' +
				'</div>' +
				'<div class="wpmp-item-actions">' +
				'<button type="button" class="button button-small button-primary wpmp-restore-one" data-id="' + id + '" title="' + wpmp.esc(s.helpRestore || 'Restore this file') + '"><span class="dashicons dashicons-backup" style="font-size:14px;width:14px;height:14px;line-height:inherit;margin-right:2px"></span>' + wpmp.esc(s.restore || 'Restore') + '</button>' +
				'<button type="button" class="button button-small button-link-delete wpmp-perm-delete-one" data-id="' + id + '" title="' + wpmp.esc(s.helpPermDelete || 'Permanently delete') + '"><span class="dashicons dashicons-trash" style="font-size:14px;width:14px;height:14px;line-height:inherit;margin-right:2px"></span>' + wpmp.esc(s.delete || 'Delete') + '</button>' +
				'</div>' +
				'</div>';
		},

		bindRecoveryEvents: function () {
			$(document).off('.wpmpRecovery');
			$(document).on('click.wpmpRecovery', '.wpmp-restore-one', wpmp.restoreOne);
			$(document).on('click.wpmpRecovery', '.wpmp-perm-delete-one', wpmp.permDeleteOne);
			$(document).on('click.wpmpRecovery', '.wpmp-recov-select-all', wpmp.recovToggleAll);
			$(document).on('click.wpmpRecovery', '.wpmp-bulk-restore', wpmp.bulkRestore);
			$(document).on('click.wpmpRecovery', '.wpmp-bulk-perm-delete', wpmp.bulkPermDelete);
			$(document).on('click.wpmpRecovery', '.wpmp-recovery-load-more', wpmp.loadMoreRecovery);
			$(document).on('change.wpmpRecovery', '.wpmp-recov-cb', wpmp.updateRecoveryBar);
		},

		updateRecoveryBar: function () {
			const any = $('.wpmp-recov-cb:checked').length > 0;
			$('.wpmp-bulk-restore, .wpmp-bulk-perm-delete').prop('disabled', !any);
		},

		recovToggleAll: function () {
			const $cbs = $('.wpmp-recov-cb');
			const all = $cbs.length > 0 && $cbs.length === $cbs.filter(':checked').length;
			$cbs.prop('checked', !all);
			wpmp.updateRecoveryBar();
		},

		restoreOne: function () {
			const id = parseInt($(this).data('id'), 10);
			wpmp.api('media/restore', { method: 'POST', body: JSON.stringify({ ids: [id] }) })
				.then(function (data) {
					if (data.success) {
						wpmp.showNotice(data.message || 'Restored.', 'success');
						$('.wpmp-recovery-item[data-id="' + id + '"]').remove();
					} else {
						wpmp.showNotice(data.message || 'Error.', 'error');
					}
				}).catch(function (err) { wpmp.showNotice(err.message, 'error'); });
		},

		permDeleteOne: function () {
			const id = parseInt($(this).data('id'), 10);
			const size = parseInt($(this).closest('.wpmp-recovery-item').data('size'), 10) || 0;
			wpmp.showConfirmModal([id], size, 'delete', function () { wpmp.doPermDelete([id]); });
		},

		bulkRestore: function () {
			const ids = $('.wpmp-recov-cb:checked').map(function () { return parseInt($(this).val(), 10); }).get();
			if (!ids.length) return;
			wpmp.api('media/restore', { method: 'POST', body: JSON.stringify({ ids: ids }) })
				.then(function (data) {
					if (data.success) {
						wpmp.showNotice(data.message || 'Restored.', 'success');
						ids.forEach(function (id) { $('.wpmp-recovery-item[data-id="' + id + '"]').remove(); });
					}
				}).catch(function (err) { wpmp.showNotice(err.message, 'error'); });
		},

		bulkPermDelete: function () {
			const ids = $('.wpmp-recov-cb:checked').map(function () { return parseInt($(this).val(), 10); }).get();
			if (!ids.length) return;
			let totalSize = 0;
			ids.forEach(function (id) {
				totalSize += parseInt($('.wpmp-recovery-item[data-id="' + id + '"]').data('size'), 10) || 0;
			});
			wpmp.showConfirmModal(ids, totalSize, 'delete', function () { wpmp.doPermDelete(ids); });
		},

		doPermDelete: function (ids) {
			wpmp.api('media/delete', { method: 'POST', body: JSON.stringify({ ids: ids }) })
				.then(function (data) {
					if (data.success) {
						wpmp.showNotice(data.message || 'Deleted permanently.', 'success');
						ids.forEach(function (id) { $('.wpmp-recovery-item[data-id="' + id + '"]').remove(); });
					} else {
						wpmp.showNotice(data.message || 'Error.', 'error');
					}
				}).catch(function (err) { wpmp.showNotice(err.message, 'error'); });
		},

		loadMoreRecovery: function () {
			if (recoveryPage >= recoveryTotalPages) return;
			recoveryPage++;
			wpmp.loadRecovery(true);
		},

		/* ---------------------------------------------------------------
		 * DUPLICATES TAB
		 * ---------------------------------------------------------------*/
		loadDuplicates: function () {
			const $ph = $('.wpmp-duplicates-placeholder');
			wpmp.api('media/duplicates').then(function (data) {
				const groups = (data && data.groups) ? data.groups : [];

				if (groups.length === 0) {
					$ph.replaceWith(
						wpmp.getTabDescHtml() +
						'<div class="wpmp-duplicates-empty">' +
						'<div class="wpmp-duplicates-empty-icon">&#x2705;</div>' +
						'<h3>' + wpmp.esc(s.noDupesTitle || 'No Duplicates Found') + '</h3>' +
						'<p>' + wpmp.esc(s.noDupesDesc || 'Great news! No duplicate files were detected. Run a new scan to check again.') + '</p>' +
						'<button type="button" class="button button-primary wpmp-scan-btn"><span class="dashicons dashicons-search" style="margin-right:4px;line-height:inherit"></span>' + wpmp.esc(s.runScan || 'Run Scan Now') + '</button>' +
						'</div>'
					);
					$(document).on('click.wpmpScan', '.wpmp-scan-btn', wpmp.startScan);
					return;
				}

				let groupsHtml = '';
				groups.forEach(function (g) {
					let itemsHtml = '';
					(g.items || []).forEach(function (it) {
						const thumb = it.thumbnail_url || it.attachment_url || '';
						itemsHtml += '<div class="wpmp-dup-item">' +
							(thumb ? '<img src="' + wpmp.esc(thumb) + '" alt="" loading="lazy">' : '<span class="dashicons dashicons-media-default" style="font-size:40px;width:40px;height:40px;color:#8c8f94"></span>') +
							'<span class="wpmp-dup-fname">' + wpmp.esc(it.filename || '') + '</span>' +
							'<span class="wpmp-dup-size">' + wpmp.formatBytes(it.file_size) + '</span>' +
							'</div>';
					});
					groupsHtml += '<div class="wpmp-dup-group">' +
						'<div class="wpmp-dup-header">' +
						'<span><span class="dashicons dashicons-admin-page" style="margin-right:4px;color:#8c8f94"></span>' + (g.count || 0) + ' ' + wpmp.esc(s.identicalFiles || 'identical files') + '</span>' +
						'<span class="wpmp-dup-savings"><span class="dashicons dashicons-money-alt" style="font-size:16px;width:16px;height:16px"></span> ' + wpmp.esc(s.save || 'Save') + ' ' + wpmp.formatBytes(g.savings) + '</span>' +
						'</div>' +
						'<div class="wpmp-dup-items">' + itemsHtml + '</div>' +
						wpmp.buildProGate(s.proDuplicatesMsg || 'Merge duplicates with one click \u2014 available in Pro.') +
						'</div>';
				});

				$ph.replaceWith(
					wpmp.getTabDescHtml() +
					'<div class="wpmp-duplicates-results">' +
					'<p class="wpmp-result-count"><strong>' + (data.total_groups || groups.length) + '</strong> ' + wpmp.esc(s.dupGroupsFound ? s.dupGroupsFound.replace('%d', '').trim() : 'duplicate group(s) found') + '</p>' +
					groupsHtml +
					'</div>'
				);
			}).catch(function (err) {
				$('.wpmp-duplicates-placeholder').replaceWith('<p class="wpmp-error">' + wpmp.esc(err.message) + '</p>');
			});
		},

		buildProGate: function (msg) {
			if (isPro) return '';
			return '<div class="wpmp-pro-gate">' +
				'<span class="wpmp-pro-badge">' + wpmp.esc(s.proFeature || 'Pro') + '</span> ' +
				wpmp.esc(msg) + ' ' +
				'<a href="' + upgradeUrl + '" target="_blank" rel="noopener">' + wpmp.esc(s.upgradeToPro || 'Upgrade') + '</a>' +
				'</div>';
		},

		/* ---------------------------------------------------------------
		 * SETTINGS TAB
		 * ---------------------------------------------------------------*/
		loadSettings: function () {
			const $ph = $('.wpmp-settings-placeholder');
			wpmp.api('settings').then(function (settings) {
				settings = settings || {};
				$ph.replaceWith(
					wpmp.getTabDescHtml() +
					'<div class="wpmp-settings-form">' +
					'<div class="wpmp-settings-section">' +
					'<h3><span class="dashicons dashicons-shield" style="margin-right:6px;color:#2271b1"></span>' + wpmp.esc(s.scanProtection || 'Scan Protection') + '</h3>' +
					'<p class="section-desc">' + wpmp.esc(s.scanProtectionDesc || 'Control how the scanner identifies unused files to prevent false positives.') + '</p>' +
					'<div class="wpmp-setting-row">' +
					'<div class="wpmp-setting-label"><label for="wpmp-recent-days">' + wpmp.esc(s.recentDaysLabel || 'Recent upload protection (days)') + '</label></div>' +
					'<div class="wpmp-setting-field">' +
					'<input id="wpmp-recent-days" type="number" class="wpmp-setting" data-key="recent_upload_days" value="' + (parseInt(settings.recent_upload_days, 10) || 7) + '" min="0" max="30">' +
					'<div class="wpmp-setting-help"><span class="dashicons dashicons-info-outline"></span> ' + wpmp.esc(s.recentDaysHelp || 'Files uploaded within this period are protected from being flagged as unused. This prevents newly uploaded files from being incorrectly marked.') + '</div>' +
					'</div>' +
					'</div>' +
					'</div>' +
					'<div class="wpmp-settings-section">' +
					'<h3><span class="dashicons dashicons-trash" style="margin-right:6px;color:#d63638"></span>' + wpmp.esc(s.trashManagement || 'Trash Management') + '</h3>' +
					'<p class="section-desc">' + wpmp.esc(s.trashMgmtDesc || 'Configure how long trashed files are kept before automatic permanent deletion.') + '</p>' +
					'<div class="wpmp-setting-row">' +
					'<div class="wpmp-setting-label"><label for="wpmp-trash-days">' + wpmp.esc(s.trashDaysLabel || 'Trash retention (days)') + '</label></div>' +
					'<div class="wpmp-setting-field">' +
					'<input id="wpmp-trash-days" type="number" class="wpmp-setting" data-key="trash_retention_days" value="' + (parseInt(settings.trash_retention_days, 10) || 30) + '" min="7" max="365">' +
					'<div class="wpmp-setting-help"><span class="dashicons dashicons-info-outline"></span> ' + wpmp.esc(s.trashDaysHelp || 'Files in trash will be automatically and permanently deleted after this many days. Set a longer period if you want more time to recover files.') + '</div>' +
					'</div>' +
					'</div>' +
					'</div>' +
					'<p class="submit">' +
					'<button type="button" class="button button-primary wpmp-save-settings"><span class="dashicons dashicons-saved" style="margin-right:4px;line-height:inherit"></span>' + wpmp.esc(s.saveSettings || 'Save Settings') + '</button>' +
					'</p>' +
					(wpmp.buildProGate(s.proScheduleMsg || 'Scheduled automatic cleanup is available in Pro.') || '') +
					'</div>'
				);
				$('.wpmp-save-settings').on('click', wpmp.saveSettings);
			}).catch(function (err) {
				$('.wpmp-settings-placeholder').replaceWith('<p class="wpmp-error">' + wpmp.esc(err.message) + '</p>');
			});
		},

		saveSettings: function () {
			const $btn = $('.wpmp-save-settings').prop('disabled', true).html('<span class="spinner is-active" style="float:none;margin:0 4px 0 0"></span> ' + wpmp.esc(s.saving || 'Saving\u2026'));
			const data = {};
			$('.wpmp-setting').each(function () {
				const $el = $(this);
				data[$el.data('key')] = parseInt($el.val(), 10) || 0;
			});
			wpmp.api('settings', { method: 'POST', body: JSON.stringify(data) })
				.then(function () {
					wpmp.showNotice(s.settingsSaved || 'Settings saved.', 'success');
					$btn.prop('disabled', false).html('<span class="dashicons dashicons-saved" style="margin-right:4px;line-height:inherit"></span>' + wpmp.esc(s.saveSettings || 'Save Settings'));
				}).catch(function (err) {
					wpmp.showNotice(s.settingsFailed || 'Failed to save settings.', 'error');
					$btn.prop('disabled', false).html('<span class="dashicons dashicons-saved" style="margin-right:4px;line-height:inherit"></span>' + wpmp.esc(s.saveSettings || 'Save Settings'));
				});
		},

		/* ---------------------------------------------------------------
		 * SCAN (start + progress polling)
		 * ---------------------------------------------------------------*/
		startScan: function (e) {
			if (e && e.preventDefault) e.preventDefault();
			$(document).off('.wpmpScan');
			$('.wpmp-scan-btn').prop('disabled', true).text(s.scanQueued || 'Starting\u2026');

			wpmp.api('scan/start', { method: 'POST' })
				.then(function (data) {
					if (data && data.success !== false) {
						currentTab = 'scanner';
						scannerPage = 1;
						wpmp.showNotice(data.message || (s.scanning || 'Scan started.'), 'success');
						wpmp.render();
						wpmp.startPoll();
					} else {
						$('.wpmp-scan-btn').prop('disabled', false).text(s.runScan || 'Run Scan Now');
						wpmp.showNotice(data.message || (s.scanFailed || 'Scan failed.'), 'error');
					}
				}).catch(function (err) {
					$('.wpmp-scan-btn').prop('disabled', false).text(s.runScan || 'Run Scan Now');
					wpmp.showNotice(err.message, 'error');
				});
		},

		startPoll: function () {
			if (scanPollTimer) return;
			scanPollTimer = setInterval(function () {
				wpmp.api('scan/status').then(function (status) {
					if (currentTab === 'scanner' && $('.wpmp-scanning').length) {
						$('.wpmp-scanning').replaceWith(wpmp.buildScanningHtml(status));
					}
					if (currentTab === 'dashboard' && $('.wpmp-scan-running-banner').length) {
						$('.wpmp-scan-running-banner').html('<span class="spinner is-active"></span> ' + wpmp.esc(s.scanning || 'Scanning\u2026') + ' ' + (status.progress || 0) + '%');
					}
					if (!status.running) {
						clearInterval(scanPollTimer);
						scanPollTimer = null;
						wpmp.showNotice(s.scanComplete || 'Scan complete.', 'success');
						wpmp.render();
					}
				});
			}, 2000);
		},
	};

	$(document).ready(function () {
		if (typeof wpmpAdmin !== 'undefined') {
			wpmp.init();
		}
	});

})(jQuery);
