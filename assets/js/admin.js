/**
 * WP Media Purge - Admin JavaScript (v1.4.1)
 * Navy + Blue design system — matches mediapurge-ui.jsx exactly
 *
 * @package WP_Media_Purge
 */

(function ($) {
  'use strict';

  var s = (typeof wpmpAdmin !== 'undefined' && wpmpAdmin.strings) ? wpmpAdmin.strings : {};
  var isPro = false; // Free-first release — Pro features Coming Soon
  var exportUrl = (typeof wpmpAdmin !== 'undefined' && wpmpAdmin.exportCsvUrl) ? wpmpAdmin.exportCsvUrl : '#';
  var currentTab = 'dashboard';
  var scanPollTimer = null;
  var scannerPage = 1;
  var scannerType = '';
  var scannerTotalPages = 1;
  var scannerTotal = 0;

  /* ================================================================
   * SVG ICON HELPER
   * ================================================================ */
  var icons = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    hdd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>',
    savings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    spinner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2a10 10 0 0 1 10 10" opacity=".3"/><path d="M12 2a10 10 0 0 0-7.07 2.93"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15a4 4 0 0 0 4 4h9a5 5 0 0 0 1.46-9.72 8 8 0 0 0-15.42 2.67A4 4 0 0 0 3 15z"/></svg>',
    xCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="12" y2="14"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  };

  function icon(name, w) {
    w = w || 14;
    return '<span class="wpmp-icon" style="display:inline-flex;width:' + w + 'px;height:' + w + 'px">' + (icons[name] || '') + '</span>';
  }

  /* ================================================================
   * UTILITIES
   * ================================================================ */
  var wpmp = {

    api: function (endpoint, options) {
      options = options || {};
      if (typeof wpmpAdmin === 'undefined') {
        return Promise.reject(new Error('Plugin not configured'));
      }
      var url = (wpmpAdmin.restUrl + endpoint).replace(/([^:]\/)\/+/g, '$1');
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
      var k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      var i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    formatDate: function (dateStr) {
      if (!dateStr) return s.never || 'Never';
      var d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleString();
    },

    esc: function (str) {
      return $('<span>').text(str || '').html();
    },

    /* ================================================================
     * TOAST SYSTEM (bottom-right)
     * ================================================================ */
    showToast: function (msg, type, duration) {
      type = type || 'info';
      duration = duration || 4000;
      var iconName = type === 'success' ? 'checkCircle' : (type === 'error' ? 'alert' : 'shield');
      var $toast = $('<div class="wpmp-toast ' + type + '">' +
        icon(iconName, 16) +
        '<span>' + wpmp.esc(msg) + '</span>' +
        '<button type="button" class="close">&times;</button>' +
        '</div>');
      $('#wpmp-toast-wrap').append($toast);
      $toast.find('.close').on('click', function () { $toast.remove(); });
      setTimeout(function () { $toast.fadeOut(300, function () { $(this).remove(); }); }, duration);
    },

    /* ================================================================
     * BOOT
     * ================================================================ */
    init: function () {
      wpmp.renderContent();
      /* Tab switching — tabs are rendered in PHP header */
      $('.wpmp-plugin-header').on('click', '.wpmp-tab', function () {
        var tab = $(this).data('tab');
        if (tab && tab !== currentTab) {
          currentTab = tab;
          $('.wpmp-tab').removeClass('active').attr('aria-selected', 'false');
          $(this).addClass('active').attr('aria-selected', 'true');
          if (tab === 'scanner') { scannerPage = 1; scannerType = ''; }
          wpmp.renderContent();
        }
      });
      $(document).on('click', '.wpmp-modal-overlay', wpmp.closeModal);
      $(document).on('click', '.wpmp-modal-cancel', function (e) { e.stopPropagation(); wpmp.closeModal(); });
      wpmp.api('scan/status').then(function (status) {
        if (status && status.running) { wpmp.startPoll(); }
      });
    },

    renderContent: function () {
      $('#wpmp-root').html(
        '<div class="wpmp-tab-panel" role="tabpanel">' +
        '<div class="wpmp-' + currentTab + '-placeholder wpmp-loading"><span class="spinner is-active"></span><p>' + wpmp.esc(s.loading || 'Loading\u2026') + '</p></div>' +
        '</div>'
      );
      wpmp.loadTabContent();
    },

    loadTabContent: function () {
      if (currentTab === 'dashboard') wpmp.loadDashboard();
      else if (currentTab === 'scanner') wpmp.loadScanner(false);
      else if (currentTab === 'storage') wpmp.loadStorage();
      else if (currentTab === 'folders') wpmp.loadFolders();
      else if (currentTab === 'settings') wpmp.loadSettings();
    },

    /* ================================================================
     * SVG BUILDERS (Ring Chart, SparkLine)
     * ================================================================ */

    /**
     * Build a donut / ring chart SVG from type-breakdown data.
     * @param {object} byType - { image:{size,count}, video:{size,count}, ... }
     * @param {number} totalSize - sum of all type sizes
     * @return {string} HTML
     */
    buildStorageRing: function (byType, totalSize) {
      var size = 140, cx = 70, cy = 70, r = 54, stroke = 13;
      var circ = 2 * Math.PI * r;
      var typeColors = { image: '#3B82F6', video: '#8B5CF6', audio: '#10B981', document: '#F59E0B', other: '#94A3B8' };
      var typeLabels = {
        image: s.storageImages || 'Images',
        video: s.storageVideos || 'Videos',
        audio: s.storageAudio || 'Audio',
        document: s.storageDocuments || 'Documents',
        other: s.storageOther || 'Other',
      };
      var segments = [];
      var types = ['image', 'video', 'audio', 'document', 'other'];
      types.forEach(function (t) {
        var seg = byType[t] || {};
        var segSize = parseInt(seg.size, 10) || 0;
        if (segSize > 0 && totalSize > 0) {
          segments.push({ type: t, size: segSize, pct: (segSize / totalSize * 100) });
        }
      });

      /* SVG circles */
      var circlesSvg = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#E2E8F0" stroke-width="' + stroke + '"/>';
      var offset = 0;
      segments.forEach(function (seg, i) {
        var dashArr = (seg.pct / 100) * circ;
        var dashOff = circ - (offset / 100) * circ;
        circlesSvg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + typeColors[seg.type] + '" stroke-width="' + stroke + '" stroke-dasharray="' + dashArr + ' ' + (circ - dashArr) + '" stroke-dashoffset="' + dashOff + '" style="transform:rotate(-90deg);transform-origin:' + cx + 'px ' + cy + 'px;transition:stroke-dasharray .8s ' + (i * 100) + 'ms ease"/>';
        offset += seg.pct;
      });

      var centerText = '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" style="font-size:17px;font-weight:700;fill:#0B1D35;font-family:\'DM Mono\',monospace">' + wpmp.formatBytes(totalSize) + '</text>' +
        '<text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" style="font-size:10px;fill:#94A3B8;font-family:\'DM Sans\',sans-serif">used</text>';

      var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" class="wpmp-ring-svg" role="img" aria-label="' + wpmp.esc(s.storageBreakdown || 'Storage breakdown') + '">' + circlesSvg + centerText + '</svg>';

      /* Legend */
      var legendHtml = '';
      segments.forEach(function (seg) {
        legendHtml += '<div class="wpmp-ring-legend-item">' +
          '<span style="width:10px;height:10px;border-radius:3px;background:' + typeColors[seg.type] + ';flex-shrink:0;display:inline-block"></span>' +
          '<span style="font-size:13px;color:#475569;flex:1">' + wpmp.esc(typeLabels[seg.type]) + '</span>' +
          '<span style="font-family:var(--wpmp-mono);font-size:12px;color:#64748B;font-weight:500">' + wpmp.formatBytes(seg.size) + '</span>' +
          '</div>';
      });

      return '<div class="wpmp-ring-wrap">' + svg + '<div class="wpmp-ring-legend">' + legendHtml + '</div></div>';
    },

    /**
     * Build a sparkline SVG from monthly data array.
     */
    buildSparkLine: function (data, color) {
      if (!data || data.length < 2) return '';
      var w = 200, h = 48;
      var max = Math.max.apply(null, data);
      var min = Math.min.apply(null, data);
      var range = max - min || 1;
      var pts = [];
      for (var i = 0; i < data.length; i++) {
        var x = (i / (data.length - 1)) * w;
        var y = h - ((data[i] - min) / range) * (h - 8) - 4;
        pts.push(x.toFixed(1) + ',' + y.toFixed(1));
      }
      var lastX = (w).toFixed(1);
      var lastY = (h - ((data[data.length - 1] - min) / range) * (h - 8) - 4).toFixed(1);
      return '<svg width="' + w + '" height="' + h + '" class="wpmp-sparkline" role="img" aria-label="Storage growth trend">' +
        '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<circle cx="' + lastX + '" cy="' + lastY + '" r="4" fill="' + color + '"/>' +
        '</svg>';
    },

    /* buildFreeMeter removed — WP Media Purge is 100% free with no usage limits */

    /**
     * Build largest files list with progress bars.
     */
    buildLargestFiles: function (files) {
      if (!files || !files.length) return '<p style="color:var(--wpmp-gray5);font-size:13px">' + wpmp.esc(s.noUnused || 'No data yet. Run a scan first.') + '</p>';
      var maxSize = parseInt(files[0].file_size, 10) || 1;
      var html = '';
      files.forEach(function (f, i) {
        var size = parseInt(f.file_size, 10) || 0;
        var used = f.status === 'used';
        var fname = wpmp.esc(f.filename || '');
        var barPct = (size / maxSize * 100).toFixed(1);
        var barColor = used ? 'var(--wpmp-green)' : 'var(--wpmp-red)';
        var tagHtml = used
          ? '<span class="wpmp-tag-used" style="font-size:10px">in use</span>'
          : '<span class="wpmp-tag-unused" style="font-size:10px">unused</span>';
        html += '<div class="wpmp-largest-item' + (i < files.length - 1 ? '' : ' last') + '">' +
          '<span class="wpmp-largest-rank">' + (i + 1) + '</span>' +
          '<div class="wpmp-largest-info">' +
          '<div class="wpmp-largest-top">' +
          '<span class="wpmp-largest-name">' + fname + '</span>' +
          '<div class="wpmp-largest-right">' +
          '<span class="wpmp-largest-size">' + wpmp.formatBytes(size) + '</span>' +
          tagHtml +
          '</div>' +
          '</div>' +
          '<div class="wpmp-largest-bar"><div class="wpmp-largest-bar-fill" style="width:' + barPct + '%;background:' + barColor + '"></div></div>' +
          '</div>' +
          (!used ? '<button type="button" class="wpmp-btn-ghost wpmp-trash-largest" data-id="' + (f.attachment_id || '') + '" style="padding:5px 10px;font-size:11px;color:var(--wpmp-red);border-color:#FCA5A5">' + wpmp.esc(s.trash || 'Trash') + '</button>' : '') +
          '</div>';
      });
      return html;
    },

    /* ================================================================
     * COMING SOON CARD (replaces Pro Gate for free-first release)
     * ================================================================ */
    buildProGate: function (feature, desc) {
      return '<div class="wpmp-coming-soon-card">' +
        '<span class="wpmp-tag-soon" style="margin-bottom:14px;display:inline-flex">' + wpmp.esc(s.comingSoon || 'Coming Soon') + '</span>' +
        '<h3>' + wpmp.esc(feature) + '</h3>' +
        '<p>' + wpmp.esc(desc) + '</p>' +
        '<p style="font-size:12px;color:var(--wpmp-gray5);margin-top:8px">' + wpmp.esc(s.comingSoonNote || 'This feature is in development. It will be available in a future release.') + '</p>' +
        '</div>';
    },

    /* ================================================================
     * DASHBOARD TAB (matches JSX DashboardTab exactly)
     * ================================================================ */
    loadDashboard: function () {
      var $ph = $('.wpmp-dashboard-placeholder');
      Promise.all([
        wpmp.api('scan/status'),
        wpmp.api('storage/stats'),
        wpmp.api('storage/largest?limit=5'),
      ]).then(function (results) {
        var scanStatus = results[0] || {};
        var stats = results[1] || {};
        var largestFiles = (results[2] && results[2].items) ? results[2].items : [];
        var totalCount = parseInt(stats.total_count, 10) || 0;
        var unusedCount = parseInt(stats.unused_count, 10) || 0;
        var totalSize = parseInt(stats.total_size, 10) || 0;
        var unusedSize = parseInt(stats.unused_size, 10) || 0;
        var byType = stats.by_type || {};
        var lastScan = stats.last_scan;

        $ph.replaceWith(
          '<div class="wpmp-dashboard wpmp-fade-up">' +
          /* Page title */
          '<div class="wpmp-page-title-row">' +
          '<div><h1>' + wpmp.esc(s.overview || 'Overview') + '</h1>' +
          '<div class="wpmp-page-subtitle">' + wpmp.esc(s.dashboardDesc || 'Your media library at a glance') + '</div></div>' +
          '</div>' +

          /* Stat cards row */
          '<div class="wpmp-stat-cards">' +
          wpmp.buildStatCard(s.totalMedia || 'Total Files', totalCount, s.mediaItems || 'in media library', 'blue', icons.image) +
          wpmp.buildStatCard(s.unusedFiles || 'Unused Files', unusedCount, unusedSize > 0 ? wpmp.formatBytes(unusedSize) + ' wasted' : '', 'red', icons.xCircle) +
          wpmp.buildStatCard(s.storageUsed || 'Storage Used', wpmp.formatBytes(totalSize), '', 'blue', icons.cloud) +
          wpmp.buildStatCard(s.potentialSavings || 'Potential Savings', '~' + wpmp.formatBytes(unusedSize), 'by cleaning unused', 'green', icons.receipt) +
          '</div>' +

          /* Storage Breakdown + Quick Actions row */
          '<div class="wpmp-storage-grid">' +

          /* Storage Breakdown card with ring chart */
          '<div class="wpmp-storage-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">' +
          '<h3 style="margin:0">' + wpmp.esc(s.storageBreakdown || 'Storage Breakdown') + '</h3>' +
          '</div>' +
          (totalSize > 0 ? wpmp.buildStorageRing(byType, totalSize) : '<p style="color:var(--wpmp-gray5);font-size:13px">' + wpmp.esc(s.noUnused || 'No data yet. Run a scan first.') + '</p>') +
          '</div>' +

          /* Quick Actions card */
          '<div class="wpmp-quick-actions">' +
          '<h3>' + wpmp.esc(s.quickActions || 'Quick Actions') + '</h3>' +
          '<div class="wpmp-quick-actions-list">' +
          '<button type="button" class="wpmp-btn-primary wpmp-dash-scan-btn" style="justify-content:flex-start;width:100%">' + icon('search', 15) + ' ' + wpmp.esc(scanStatus.running ? s.scanning || 'Scanning\u2026' : (lastScan ? s.runScan || 'Run New Scan' : s.startFullScan || 'Start Full Scan')) + '</button>' +
          '<button type="button" class="wpmp-btn-ghost wpmp-dash-storage-btn" style="justify-content:flex-start;width:100%">' + icon('hdd', 15) + ' ' + wpmp.esc(s.viewStorageDetails || 'View Storage Details') + '</button>' +
          '<button type="button" class="wpmp-btn-ghost" style="justify-content:flex-start;width:100%;opacity:.55;cursor:default" disabled title="Coming soon">' + icon('clock', 15) + ' ' + wpmp.esc(s.proScheduledClean || 'Schedule Auto-Scan') + ' <span class="wpmp-tag-soon" style="margin-left:auto;font-size:9px;padding:1px 5px">' + wpmp.esc(s.comingSoon || 'Soon') + '</span></button>' +
          '</div>' +
          '<div class="wpmp-last-scan-box"><div class="label">' + wpmp.esc(s.lastScanLabel || 'Last scan') + '</div><div class="value">' + wpmp.formatDate(lastScan) + '</div></div>' +
          '</div>' +

          '</div>' +

          /* Largest Files card */
          '<div class="wpmp-largest-card wpmp-card" style="padding:24px;margin-bottom:14px">' +
          '<h3 style="font-size:14px;font-weight:700;color:var(--wpmp-navy);margin:0 0 14px">' + wpmp.esc(s.largestFiles || 'Largest Files') + '</h3>' +
          wpmp.buildLargestFiles(largestFiles) +
          '</div>' +

          /* Free Meter removed — no usage limits */

          '</div>'
        );

        /* Event bindings */
        $('.wpmp-dash-scan-btn').on('click', wpmp.startScan);
        $('.wpmp-dash-storage-btn').on('click', function () {
          currentTab = 'storage';
          $('.wpmp-tab').removeClass('active').attr('aria-selected', 'false');
          $('.wpmp-tab[data-tab="storage"]').addClass('active').attr('aria-selected', 'true');
          wpmp.renderContent();
        });
        $('.wpmp-trash-largest').on('click', function () {
          var id = parseInt($(this).data('id'), 10);
          if (id) {
            wpmp.showConfirmModal([id], 0, 'trash', function () { wpmp.doTrash([id]); });
          }
        });

      }).catch(function (err) {
        $('.wpmp-dashboard-placeholder').replaceWith(
          '<p class="wpmp-error">' + wpmp.esc(err.message) + '</p>'
        );
      });
    },

    buildStatCard: function (label, value, sub, color, svgIcon) {
      return '<div class="wpmp-stat-card">' +
        '<div class="wpmp-stat-header">' +
        '<div class="wpmp-stat-label">' + wpmp.esc(label) + '</div>' +
        '<div class="wpmp-stat-icon icon-' + color + '">' + svgIcon + '</div>' +
        '</div>' +
        '<div class="wpmp-stat-value">' + wpmp.esc(String(value)) + '</div>' +
        (sub ? '<div class="wpmp-stat-sub">' + wpmp.esc(sub) + '</div>' : '') +
        '</div>';
    },

    /* ================================================================
     * SCANNER TAB
     * ================================================================ */
    loadScanner: function (append) {
      var $ph = append ? null : $('.wpmp-scanner-placeholder');
      var $list = append ? $('.wpmp-media-list') : null;
      var qs = 'media/unused?page=' + scannerPage + '&per_page=30' + (scannerType ? '&type=' + encodeURIComponent(scannerType) : '');

      Promise.all([
        append ? Promise.resolve(null) : wpmp.api('scan/status'),
        wpmp.api(qs),
        append ? Promise.resolve({ total: 0 }) : wpmp.api('media/trashed?per_page=1'),
      ]).then(function (results) {
        var scanStatus = results[0] || {};
        var unusedData = results[1] || {};
        var trashedData = results[2] || {};
        var items = unusedData.items || [];
        var total = parseInt(unusedData.total, 10) || 0;
        var totalPages = parseInt(unusedData.total_pages, 10) || 1;
        var trashedCount = parseInt(trashedData.total, 10) || 0;

        scannerTotalPages = totalPages;
        scannerTotal = total;

        if (append) {
          items.forEach(function (item) { $list.append(wpmp.buildMediaRow(item)); });
          if (scannerPage >= scannerTotalPages) { $('.wpmp-load-more-wrap').hide(); }
          return;
        }

        if (!append && scanStatus.running) {
          $ph.replaceWith(
            '<div class="wpmp-fade-up">' +
            '<div class="wpmp-page-title-row"><div><h1>' + wpmp.esc(s.scanner || 'Media Scanner') + '</h1>' +
            '<div class="wpmp-page-subtitle">' + wpmp.esc(s.scannerDesc || 'Find and safely remove unused files') + '</div></div></div>' +
            wpmp.buildScanProgressHtml(scanStatus) +
            '</div>'
          );
          return;
        }

        if (total === 0 && !scannerType) {
          $ph.replaceWith(wpmp.buildPreScanHtml());
          $(document).on('click.wpmpScan', '.wpmp-scan-btn', wpmp.startScan);
          return;
        }

        $ph.replaceWith(wpmp.buildScannerResultsHtml(items, total, trashedCount));
        wpmp.bindScannerEvents();
        if (scannerPage >= scannerTotalPages) { $('.wpmp-load-more-wrap').hide(); }

      }).catch(function (err) {
        if (!append) {
          $('.wpmp-scanner-placeholder').replaceWith('<p class="wpmp-error">' + wpmp.esc(err.message) + '</p>');
        }
      });
    },

    buildPreScanHtml: function () {
      return '<div class="wpmp-fade-up">' +
        '<div class="wpmp-page-title-row">' +
        '<div><h1>' + wpmp.esc(s.scanner || 'Media Scanner') + '</h1>' +
        '<div class="wpmp-page-subtitle">' + wpmp.esc(s.scannerDesc || 'Find and safely remove unused files') + '</div></div>' +
        '</div>' +
        '<div class="wpmp-prescan">' +
        '<div class="wpmp-prescan-icon">' + icons.search + '</div>' +
        '<h2>' + wpmp.esc(s.scanLibrary || 'Scan Your Media Library') + '</h2>' +
        '<p>' + wpmp.esc(s.scanLibraryDesc || 'MediaPurge will check every file in your media library against all posts, pages, widgets, theme settings, and page builder data.') + '</p>' +
        '<div class="wpmp-prescan-meta">' + icon('shield', 14) + ' ' + wpmp.esc(s.safeNote || 'Safe & non-destructive \u2014 nothing is deleted automatically') + '</div>' +
        '<div class="wpmp-prescan-sources">' +
        '<span class="wpmp-source-badge free">\u2713 ' + wpmp.esc(s.postContent || 'Post content') + '</span>' +
        '<span class="wpmp-source-badge free">\u2713 ' + wpmp.esc(s.metaFields || 'Featured images') + '</span>' +
        '<span class="wpmp-source-badge free">\u2713 ' + wpmp.esc(s.widgets || 'Widgets') + '</span>' +
        '<span class="wpmp-source-badge free">\u2713 ' + wpmp.esc(s.elementor || 'Customizer') + '</span>' +
        '<span class="wpmp-source-badge pro">\u2295 Pro ' + wpmp.esc(s.elementor || 'Elementor') + '</span>' +
        '<span class="wpmp-source-badge pro">\u2295 Pro ' + wpmp.esc(s.diviPro || 'Divi') + '</span>' +
        '</div>' +
        '<button type="button" class="wpmp-btn-primary wpmp-scan-btn">' + icon('search', 17) + ' ' + wpmp.esc(s.startFullScan || 'Start Scan') + '</button>' +
        '</div>' +
        '</div>';
    },

    buildScanProgressHtml: function (scanStatus) {
      var pct = parseInt(scanStatus.progress, 10) || 0;
      var phases = ['content', 'meta', 'options', 'builder', 'writing', 'done'];
      var phaseLabels = {
        content: s.scanPhaseContent || 'Post content',
        meta: s.scanPhaseMeta || 'Post meta',
        options: s.scanPhaseOptions || 'Widgets',
        builder: s.scanPhaseBuilder || 'Page builders',
        writing: s.scanPhaseWriting || 'Saving',
        done: s.scanPhaseDone || 'Done',
      };
      var phaseStatusDone = s.done || 'Done';
      var phaseStatusActive = s.checking || 'Checking\u2026';
      var phaseStatusWaiting = s.waiting || 'Waiting';
      var currentPhase = scanStatus.phase || 'content';
      var currentIdx = phases.indexOf(currentPhase);

      var phasesHtml = '';
      phases.forEach(function (p, i) {
        var cls = 'waiting';
        var statusText = phaseStatusWaiting;
        var prefix = '\u25CB';
        if (i < currentIdx) { cls = 'done'; statusText = phaseStatusDone; prefix = '\u2713'; }
        else if (i === currentIdx) { cls = 'active'; statusText = phaseStatusActive; prefix = '\u27F3'; }
        phasesHtml += '<div class="wpmp-scan-phase-item ' + cls + '">' + prefix + ' ' + wpmp.esc(phaseLabels[p]) + ' <span class="status">' + wpmp.esc(statusText) + '</span></div>';
      });

      return '<div class="wpmp-scan-progress" aria-live="polite" aria-atomic="true">' +
        '<div class="wpmp-scan-header">' +
        '<div class="wpmp-scan-spinner-box">' + icons.spinner + '</div>' +
        '<div class="wpmp-scan-header-text">' +
        '<div class="title">' + wpmp.esc(s.scanning || 'Scanning your media library\u2026') + '</div>' +
        '<div class="phase">' + wpmp.esc(phaseLabels[currentPhase] || s.scanning) + '</div>' +
        '</div>' +
        '<div class="wpmp-scan-pct">' + pct + '%</div>' +
        '</div>' +
        '<div class="wpmp-progress-wrap" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100">' +
        '<div class="wpmp-progress-bar" style="width:' + pct + '%"></div></div>' +
        '<div class="wpmp-scan-phases">' + phasesHtml + '</div>' +
        '</div>';
    },

    buildScannerResultsHtml: function (items, total, trashedCount) {
      var rows = '';
      items.forEach(function (item) { rows += wpmp.buildMediaRow(item); });
      trashedCount = trashedCount || 0;

      var trashedBar = '';
      if (trashedCount > 0) {
        trashedBar = '<div class="wpmp-trashed-bar">' +
          icon('trash', 18) +
          '<p>' + trashedCount + ' ' + wpmp.esc(s.filesInTrashLabel || 'file(s) in trash \u2014 restorable within 30 days') + '</p>' +
          '<button type="button" class="wpmp-btn-ghost wpmp-restore-all-trashed">' + wpmp.esc(s.restoreAll || 'Restore All') + '</button>' +
          '</div>';
      }

      return '<div class="wpmp-scanner-results wpmp-fade-up">' +
        '<div class="wpmp-page-title-row">' +
        '<div><h1>' + wpmp.esc(s.scanner || 'Media Scanner') + '</h1>' +
        '<div class="wpmp-page-subtitle">' + wpmp.esc(s.scannerDesc || 'Find and safely remove unused files') + '</div></div>' +
        '</div>' +
        '<div class="wpmp-scanner-header">' +
        '<div><h2>' + total + ' ' + wpmp.esc(s.unusedFilesFound2 || 'unused files found') + '</h2>' +
        '<p class="sub">' + wpmp.formatBytes(wpmp.sumUnusedSize(items)) + ' ' + wpmp.esc(s.ofWastedStorage || 'of wasted storage \u00B7 Safe to clean') + '</p></div>' +
        '<div class="wpmp-scanner-actions">' +
        '<select class="wpmp-type-filter" aria-label="Filter files">' +
        '<option value="">' + wpmp.esc(s.filterAll || 'All types') + '</option>' +
        '<option value="image"' + (scannerType === 'image' ? ' selected' : '') + '>' + wpmp.esc(s.filterImage || 'Images only') + '</option>' +
        '<option value="video"' + (scannerType === 'video' ? ' selected' : '') + '>' + wpmp.esc(s.filterVideo || 'Videos') + '</option>' +
        '<option value="document"' + (scannerType === 'document' ? ' selected' : '') + '>' + wpmp.esc(s.filterDocument || 'Documents') + '</option>' +
        '<option value="other"' + (scannerType === 'other' ? ' selected' : '') + '>' + wpmp.esc(s.filterOther || 'Other') + '</option>' +
        '</select>' +
        '<button type="button" class="wpmp-btn-ghost wpmp-select-all" style="font-size:12px;padding:7px 14px">' + icon('check', 14) + ' ' + wpmp.esc(s.selectAll || 'Select All') + '</button>' +
        '<button type="button" class="wpmp-btn-primary wpmp-scan-btn" style="font-size:12px;padding:7px 14px">' + icon('refresh', 13) + ' ' + wpmp.esc(s.rescan || 'Rescan') + '</button>' +
        '</div>' +
        '</div>' +
        '<div style="height:12px"></div>'  +
        '<div class="wpmp-media-list scrollbar">' + rows + '</div>' +
        '<div class="wpmp-load-more-wrap" style="text-align:center;margin:20px 0;' + (scannerTotalPages > 1 ? '' : 'display:none') + '">' +
        '<button type="button" class="wpmp-btn-ghost wpmp-load-more">' + wpmp.esc(s.loadMore || 'Load More') + '</button>' +
        '</div>' +
        trashedBar +
        '<div class="wpmp-bulk-bar">' +
        '<span class="count"></span>' +
        '<span class="size"></span>' +
        '<button type="button" class="wpmp-btn-ghost wpmp-bulk-whitelist">' + icon('shield', 14) + ' ' + wpmp.esc(s.whitelist || 'Keep') + '</button>' +
        '<button type="button" class="wpmp-btn-danger wpmp-bulk-trash" style="background:var(--wpmp-amber);color:#fff;border:none;padding:7px 14px;font-size:12px">' + icon('trash', 13) + ' ' + wpmp.esc(s.moveToTrash || 'Move to Trash') + '</button>' +
        '<button type="button" class="wpmp-btn-ghost wpmp-deselect" style="padding:7px 10px;color:#fff;border-color:#334155;font-size:12px">' + wpmp.esc(s.x || '\u2715') + '</button>' +
        '</div>' +
        '</div>';
    },

    sumUnusedSize: function (items) {
      var total = 0;
      (items || []).forEach(function (item) { total += parseInt(item.file_size, 10) || 0; });
      return total;
    },

    buildMediaRow: function (item) {
      var id = parseInt(item.attachment_id, 10);
      var fname = wpmp.esc(item.filename || 'file');
      var mime = item.mime_type || '';
      var thumb = item.thumbnail_url || (mime.indexOf('image') === 0 ? (item.attachment_url || '') : '');
      var size = parseInt(item.file_size, 10) || 0;
      var ext = (item.filename || '').split('.').pop().toUpperCase();
      var dateStr = item.scan_date ? item.scan_date.split(' ')[0] : '';

      return '<div class="wpmp-media-row" data-id="' + id + '" data-size="' + size + '">' +
        '<div class="wpmp-checkbox-custom" data-id="' + id + '" role="checkbox" aria-checked="false" aria-label="' + wpmp.esc((s.selectItem || 'Select') + ': ' + (item.filename || '')) + '" tabindex="0">' +
        icons.check +
        '</div>' +
        '<div class="wpmp-media-thumb">' +
        (thumb ? '<img src="' + wpmp.esc(thumb) + '" alt="' + fname + '" loading="lazy">' : '<span class="ext">' + wpmp.esc(ext) + '</span>') +
        '</div>' +
        '<div class="wpmp-media-info">' +
        '<span class="wpmp-media-name">' + fname + '</span>' +
        '<div class="wpmp-media-meta">' +
        '<span class="size">' + wpmp.formatBytes(size) + '</span>' +
        '<span class="dot"></span>' +
        '<span class="date">' + wpmp.esc(dateStr) + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="wpmp-media-actions">' +
        '<span class="wpmp-tag-unused">\u2715 ' + wpmp.esc(s.notUsedAnywhere || 'Not used anywhere') + '</span>' +
        '<button type="button" class="wpmp-btn-ghost wpmp-trash-one" data-id="' + id + '" title="' + wpmp.esc(s.helpTrash || 'Move to trash') + '" style="padding:6px 10px;color:var(--wpmp-red);border-color:#FCA5A5">' + icon('trash', 14) + '</button>' +
        '</div>' +
        '</div>';
    },

    bindScannerEvents: function () {
      $(document).off('.wpmpScanner');
      $(document).on('click.wpmpScanner', '.wpmp-scan-btn', wpmp.startScan);
      $(document).on('click.wpmpScanner', '.wpmp-checkbox-custom', wpmp.toggleCheckbox);
      $(document).on('keydown.wpmpScanner', '.wpmp-checkbox-custom', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); $(this).trigger('click'); }
      });
      $(document).on('click.wpmpScanner', '.wpmp-select-all', wpmp.toggleSelectAll);
      $(document).on('click.wpmpScanner', '.wpmp-deselect', wpmp.deselectAll);
      $(document).on('click.wpmpScanner', '.wpmp-trash-one', wpmp.trashOne);
      $(document).on('click.wpmpScanner', '.wpmp-bulk-trash', wpmp.bulkTrash);
      $(document).on('click.wpmpScanner', '.wpmp-bulk-whitelist', wpmp.bulkWhitelist);
      $(document).on('click.wpmpScanner', '.wpmp-load-more', wpmp.loadMoreScanner);
      $(document).on('change.wpmpScanner', '.wpmp-type-filter', wpmp.changeTypeFilter);
      $(document).on('click.wpmpScanner', '.wpmp-restore-all-trashed', wpmp.restoreAllTrashed);
    },

    toggleCheckbox: function () {
      var $cb = $(this);
      var checked = $cb.hasClass('checked');
      $cb.toggleClass('checked').attr('aria-checked', !checked);
      $cb.closest('.wpmp-media-row').toggleClass('is-selected');
      wpmp.updateBulkBar();
    },

    updateBulkBar: function () {
      var $checked = $('.wpmp-checkbox-custom.checked');
      var cnt = $checked.length;
      var $bar = $('.wpmp-bulk-bar');
      if (cnt > 0) {
        var totalSize = 0;
        $checked.each(function () {
          totalSize += parseInt($(this).closest('.wpmp-media-row').data('size'), 10) || 0;
        });
        $bar.find('.count').text(cnt + ' ' + (s.selected || 'selected'));
        $bar.find('.size').text(wpmp.formatBytes(totalSize));
        $bar.addClass('visible');
      } else {
        $bar.removeClass('visible');
      }
    },

    getSelectedIds: function () {
      return $('.wpmp-checkbox-custom.checked').map(function () { return parseInt($(this).data('id'), 10); }).get();
    },

    toggleSelectAll: function () {
      var $cbs = $('.wpmp-checkbox-custom');
      var allChecked = $cbs.length > 0 && $cbs.length === $cbs.filter('.checked').length;
      if (allChecked) {
        $cbs.removeClass('checked').attr('aria-checked', 'false');
        $('.wpmp-media-row').removeClass('is-selected');
        $(this).html(icon('check', 14) + ' ' + wpmp.esc(s.selectAll || 'Select All'));
      } else {
        $cbs.addClass('checked').attr('aria-checked', 'true');
        $('.wpmp-media-row').addClass('is-selected');
        $(this).html(icon('check', 14) + ' ' + wpmp.esc(s.deselectAll || 'Deselect All'));
      }
      wpmp.updateBulkBar();
    },

    deselectAll: function () {
      $('.wpmp-checkbox-custom').removeClass('checked').attr('aria-checked', 'false');
      $('.wpmp-media-row').removeClass('is-selected');
      $('.wpmp-select-all').html(icon('check', 14) + ' ' + wpmp.esc(s.selectAll || 'Select All'));
      wpmp.updateBulkBar();
    },

    trashOne: function () {
      var id = parseInt($(this).data('id'), 10);
      var size = parseInt($(this).closest('.wpmp-media-row').data('size'), 10) || 0;
      wpmp.showConfirmModal([id], size, 'trash', function () { wpmp.doTrash([id]); });
    },

    bulkTrash: function () {
      var ids = wpmp.getSelectedIds();
      if (!ids.length) { wpmp.showToast(s.noFilesSelected || 'No files selected.', 'error'); return; }
      var totalSize = 0;
      ids.forEach(function (id) {
        totalSize += parseInt($('.wpmp-media-row[data-id="' + id + '"]').data('size'), 10) || 0;
      });
      wpmp.showConfirmModal(ids, totalSize, 'trash', function () { wpmp.doTrash(ids); });
    },

    bulkWhitelist: function () {
      var ids = wpmp.getSelectedIds();
      if (!ids.length) { wpmp.showToast(s.noFilesSelected || 'No files selected.', 'error'); return; }
      wpmp.api('media/whitelist', { method: 'POST', body: JSON.stringify({ ids: ids }) })
        .then(function (data) {
          if (data.success) {
            wpmp.showToast(data.message || 'Items whitelisted.', 'success');
            ids.forEach(function (id) { $('.wpmp-media-row[data-id="' + id + '"]').remove(); });
            $('.wpmp-bulk-bar').removeClass('visible');
          } else {
            wpmp.showToast(data.message || 'Error.', 'error');
          }
        }).catch(function (err) { wpmp.showToast(err.message, 'error'); });
    },

    restoreAllTrashed: function () {
      wpmp.api('media/trashed?per_page=100').then(function (data) {
        var items = data.items || [];
        if (!items.length) return;
        var ids = items.map(function (item) { return parseInt(item.attachment_id, 10); });
        wpmp.api('media/restore', { method: 'POST', body: JSON.stringify({ ids: ids }) })
          .then(function (resp) {
            if (resp.success) {
              wpmp.showToast(resp.message || 'Files restored.', 'success');
              $('.wpmp-trashed-bar').fadeOut(300, function () { $(this).remove(); });
            }
          }).catch(function (err) { wpmp.showToast(err.message, 'error'); });
      }).catch(function (err) { wpmp.showToast(err.message, 'error'); });
    },

    loadMoreScanner: function () {
      if (scannerPage >= scannerTotalPages) return;
      scannerPage++;
      wpmp.loadScanner(true);
    },

    changeTypeFilter: function () {
      scannerType = $(this).val();
      scannerPage = 1;
      wpmp.renderContent();
    },

    /* ================================================================
     * CONFIRM MODAL (matches JSX ConfirmModal exactly)
     * ================================================================ */
    showConfirmModal: function (ids, totalSize, mode, onConfirm) {
      var sizeStr = wpmp.formatBytes(totalSize);
      var isDelete = mode === 'delete';
      var title = isDelete ? (s.confirmDelete || 'Permanently delete selected files?') : (s.confirmTrash || 'Move to Media Trash?');
      var desc = isDelete
        ? (s.confirmDeleteDesc || 'This action cannot be undone. The files will be permanently removed from your server.')
        : 'You\u2019re about to move <strong style="color:#1E293B">' + ids.length + ' file' + (ids.length > 1 ? 's' : '') + '</strong> (' + sizeStr + ') to trash. You can <strong style="color:#059669">restore them within 30 days</strong> \u2014 nothing is permanently deleted yet.';
      var confirmText = isDelete ? (s.yesDelete || 'Yes, Delete Permanently') : icon('trash', 13) + ' ' + (s.yesMoveToTrash || 'Move to Trash');
      var iconCls = isDelete ? 'modal-delete' : 'modal-trash';

      var safetyBox = !isDelete
        ? '<div class="wpmp-modal-safety"><div class="wpmp-modal-safety-icon">' + icons.lock + '</div><span>Safe-first: Files go to the Media Trash tab first. Permanent deletion only happens after 30 days, or when you choose.</span></div>'
        : '';

      $('body').append(
        '<div class="wpmp-modal-overlay">' +
        '<div class="wpmp-modal" role="dialog" aria-modal="true">' +
        '<div class="wpmp-modal-icon ' + iconCls + '">' + icons.alert + '</div>' +
        '<h3>' + wpmp.esc(title) + '</h3>' +
        '<p>' + desc + '</p>' +
        safetyBox +
        '<div class="wpmp-modal-actions">' +
        '<button type="button" class="wpmp-btn-ghost wpmp-modal-cancel">' + wpmp.esc(s.cancel || 'Cancel') + '</button>' +
        '<button type="button" class="wpmp-btn-danger wpmp-modal-confirm" style="background:var(--wpmp-amber);color:#fff;border:none">' + confirmText + '</button>' +
        '</div>' +
        '</div></div>'
      );
      $('.wpmp-modal-confirm').one('click', function () { wpmp.closeModal(); onConfirm(); });
    },

    closeModal: function () { $('.wpmp-modal-overlay').remove(); },

    doTrash: function (ids) {
      var snapshots = [];
      ids.forEach(function (id) {
        var $el = $('.wpmp-media-row[data-id="' + id + '"]');
        if ($el.length) {
          snapshots.push({ id: id, size: parseInt($el.data('size'), 10) || 0 });
        }
      });

      wpmp.api('media/trash', { method: 'POST', body: JSON.stringify({ ids: ids }) })
        .then(function (data) {
          if (data.success) {
            var totalSize = snapshots.reduce(function (acc, sn) { return acc + sn.size; }, 0);
            ids.forEach(function (id) { $('.wpmp-media-row[data-id="' + id + '"]').remove(); });
            $('.wpmp-bulk-bar').removeClass('visible');
            wpmp.showUndoToast(ids, snapshots.length, totalSize);
          } else {
            wpmp.showToast(data.message || 'Error.', 'error');
          }
        }).catch(function (err) { wpmp.showToast(err.message, 'error'); });
    },

    /* Undo toast */
    showUndoToast: function (ids, count, totalSize) {
      $('.wpmp-toast.undo-toast').remove();
      var msg = count + ' file' + (count > 1 ? 's' : '') + ' ' + (s.movedToTrash || 'moved to trash') +
        (totalSize > 0 ? ' \u2014 ' + wpmp.formatBytes(totalSize) + ' ' + (s.freed || 'freed') : '');

      var $toast = $('<div class="wpmp-toast success undo-toast">' +
        icon('checkCircle', 16) +
        '<span>' + wpmp.esc(msg) + '</span>' +
        '<button type="button" class="wpmp-undo-btn">' + wpmp.esc(s.undo || 'Undo') + '</button>' +
        '<button type="button" class="close">&times;</button>' +
        '</div>');
      $('#wpmp-toast-wrap').append($toast);

      var remaining = 8;
      var ticker = setInterval(function () {
        remaining--;
        if (remaining <= 0) { clearInterval(ticker); $toast.fadeOut(300, function () { $(this).remove(); }); }
      }, 1000);

      $toast.find('.close').on('click', function () { clearInterval(ticker); $toast.remove(); });
      $toast.find('.wpmp-undo-btn').one('click', function () {
        clearInterval(ticker);
        $(this).prop('disabled', true).text(s.undoing || 'Undoing\u2026');
        wpmp.api('media/restore', { method: 'POST', body: JSON.stringify({ ids: ids }) })
          .then(function () {
            $toast.remove();
            wpmp.showToast(s.undone || 'Restored! Files are back in your library.', 'success');
            if (currentTab === 'scanner') { scannerPage = 1; wpmp.renderContent(); }
          }).catch(function (err) { $toast.remove(); wpmp.showToast(err.message, 'error'); });
      });
    },

    /* ================================================================
     * STORAGE TAB (matches JSX StorageTab exactly)
     * ================================================================ */
    loadStorage: function () {
      var $ph = $('.wpmp-storage-placeholder');
      Promise.all([
        wpmp.api('storage/stats'),
        wpmp.api('storage/largest?limit=5'),
      ]).then(function (results) {
        var stats = results[0] || {};
        var largestFiles = (results[1] && results[1].items) ? results[1].items : [];
        var totalSize = parseInt(stats.total_size, 10) || 0;
        var unusedSize = parseInt(stats.unused_size, 10) || 0;
        var byType = stats.by_type || {};

        /* Storage growth mock (12 months) — real data would need a history table */
        var monthData = [];
        for (var m = 0; m < 12; m++) {
          monthData.push(totalSize > 0 ? Math.round(totalSize * (0.4 + m * 0.055)) : 0);
        }
        monthData[11] = totalSize;

        /* Build bar chart for storage growth */
        var maxMonth = Math.max.apply(null, monthData) || 1;
        var monthLabels = ['Jan', '', '', 'Apr', '', '', 'Jul', '', '', 'Oct', '', 'Dec'];
        var barChartHtml = '<svg width="100%" height="140" viewBox="0 0 300 140" preserveAspectRatio="none" role="img" aria-label="Monthly storage growth">';
        monthData.forEach(function (v, i) {
          var x = (i / 11) * 280 + 10;
          var h = totalSize > 0 ? (v / maxMonth) * 110 : 0;
          var y = 130 - h;
          barChartHtml += '<rect x="' + (x - 8) + '" y="' + y + '" width="16" height="' + h + '" rx="4" fill="' + (i === 11 ? '#1B4FD8' : '#DBEAFE') + '"/>';
        });
        monthLabels.forEach(function (label, i) {
          if (label) {
            barChartHtml += '<text x="' + ((i / 11) * 280 + 10) + '" y="138" text-anchor="middle" style="font-size:8px;fill:#94A3B8;font-family:\'DM Sans\',sans-serif">' + label + '</text>';
          }
        });
        barChartHtml += '</svg>';

        /* Unused space sub-card */
        var unusedPct = totalSize > 0 ? (unusedSize / totalSize * 100).toFixed(1) : 0;

        $ph.replaceWith(
          '<div class="wpmp-storage wpmp-fade-up">' +
          '<div class="wpmp-page-title-row">' +
          '<div><h1>' + wpmp.esc(s.storageAnalytics || 'Storage Analytics') + '</h1>' +
          '<div class="wpmp-page-subtitle">' + wpmp.esc(s.storageDesc || 'Understand what\u2019s taking up space') + '</div></div>' +
          '</div>' +

          /* 2-column: Storage Overview + Storage Growth */
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">' +

          /* Storage Overview */
          '<div class="wpmp-card wpmp-fade-up" style="padding:24px">' +
          '<h3 style="font-size:14px;font-weight:700;color:var(--wpmp-navy);margin:0 0 20px">' + wpmp.esc(s.storageOverview || 'Storage Overview') + '</h3>' +
          (totalSize > 0 ? wpmp.buildStorageRing(byType, totalSize) : '<p style="color:var(--wpmp-gray5);font-size:13px">No data yet. Run a scan first.</p>') +
          (totalSize > 0 ?
            '<div style="margin-top:20px;padding:12px 16px;background:var(--wpmp-sky);border-radius:10px;border:1px solid var(--wpmp-sky-mid)">' +
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
            '<span style="font-size:12px;color:var(--wpmp-blue);font-weight:600">' + wpmp.esc(s.unusedFilesSpace || 'Unused files space') + '</span>' +
            '<span style="font-family:var(--wpmp-mono);font-size:13px;color:var(--wpmp-red);font-weight:700">' + wpmp.formatBytes(unusedSize) + '</span>' +
            '</div>' +
            '<div style="height:5px;background:var(--wpmp-sky-mid);border-radius:99px;margin-top:8px;overflow:hidden">' +
            '<div style="height:100%;width:' + unusedPct + '%;background:var(--wpmp-red);border-radius:99px"></div>' +
            '</div>' +
            '</div>' : '') +
          '</div>' +

          /* Storage Growth */
          '<div class="wpmp-card wpmp-fade-up" style="padding:24px;animation-delay:60ms">' +
          '<h3 style="font-size:14px;font-weight:700;color:var(--wpmp-navy);margin:0 0 4px">' + wpmp.esc(s.storageGrowth || 'Storage Growth') + '</h3>' +
          '<p style="font-size:11px;color:var(--wpmp-gray5);margin:0 0 14px">' + wpmp.esc(s.storageGrowthNote || 'Estimated trend based on current storage size. Historical tracking coming in a future release.') + '</p>' +
          barChartHtml +
          wpmp.buildProGate(s.proHostingEstimator || 'Hosting Cost Estimator', s.proHostingEstimatorDesc || 'Enter your hosting plan\u2019s $/GB rate and see exactly how much unused files are costing you every month.') +
          '</div>' +

          '</div>' +

          /* Largest Files */
          '<div class="wpmp-card wpmp-fade-up" style="padding:24px;animation-delay:120ms">' +
          '<h3 style="font-size:14px;font-weight:700;color:var(--wpmp-navy);margin:0 0 14px">' + wpmp.esc(s.largestFiles || 'Top 5 Largest Files') + '</h3>' +
          wpmp.buildLargestFiles(largestFiles) +
          '</div>' +

          '</div>'
        );

        /* Bind trash buttons on largest files */
        $('.wpmp-trash-largest').on('click', function () {
          var id = parseInt($(this).data('id'), 10);
          if (id) {
            wpmp.showConfirmModal([id], 0, 'trash', function () { wpmp.doTrash([id]); });
          }
        });

      }).catch(function (err) {
        $('.wpmp-storage-placeholder').replaceWith('<p class="wpmp-error">' + wpmp.esc(err.message) + '</p>');
      });
    },

    /* ================================================================
     * FOLDERS TAB (Pro-gated, matches JSX FoldersTab)
     * ================================================================ */
    loadFolders: function () {
      var $ph = $('.wpmp-folders-placeholder');
      var previewFolders = ['All Media', 'Products', 'Blog Images', 'Team Photos', 'Brand Assets'];

      var folderTabs = '';
      previewFolders.forEach(function (f, i) {
        folderTabs += '<div style="padding:6px 14px;border-radius:8px;background:' + (i === 0 ? 'var(--wpmp-blue)' : 'var(--wpmp-gray1)') + ';color:' + (i === 0 ? '#fff' : 'var(--wpmp-gray6)') + ';font-size:12px;font-weight:500">' + wpmp.esc(f) + '</div>';
      });
      folderTabs += '<div style="padding:6px 14px;border-radius:8px;background:var(--wpmp-gray1);border:1.5px dashed var(--wpmp-gray3);color:var(--wpmp-gray5);font-size:12px">+ New Folder</div>';

      $ph.replaceWith(
        '<div class="wpmp-folders wpmp-fade-up">' +
        '<div class="wpmp-page-title-row">' +
        '<div><h1>' + wpmp.esc(s.folderOrganizer || 'Folder Organizer') + '</h1>' +
        '<div class="wpmp-page-subtitle">' + wpmp.esc(s.foldersDesc || 'Organize your media into virtual folders') + '</div></div>' +
        '</div>' +
        wpmp.buildProGate(s.proVirtFolders || 'Virtual Folder Organizer', s.proFoldersFullDesc || 'Create folders, drag & drop files, and organize your entire media library without changing any server paths. Filter by folder in the native WordPress Media Library too.') +
        '<div style="margin-top:20px;opacity:.35;pointer-events:none;user-select:none">' +
        '<div class="wpmp-card" style="padding:20px">' +
        '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">' + folderTabs + '</div>' +
        '<div style="height:160px;background:var(--wpmp-gray1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--wpmp-gray4);font-size:13px">Drag & drop media here</div>' +
        '</div>' +
        '</div>' +
        '</div>'
      );
    },

    /* ================================================================
     * SETTINGS TAB (matches JSX SettingsTab)
     * ================================================================ */
    loadSettings: function () {
      var $ph = $('.wpmp-settings-placeholder');
      wpmp.api('settings').then(function (settings) {
        settings = settings || {};
        var recentDays = parseInt(settings.recent_upload_days, 10) || 7;
        var trashDays = parseInt(settings.trash_retention_days, 10) || 30;
        var scanWoo = settings.scan_woocommerce !== false;

        $ph.replaceWith(
          '<div class="wpmp-settings wpmp-fade-up">' +
          '<div class="wpmp-page-title-row">' +
          '<div><h1>' + wpmp.esc(s.settings || 'Settings') + '</h1>' +
          '<div class="wpmp-page-subtitle">' + wpmp.esc(s.settingsDesc || 'Configure scan behaviour and preferences') + '</div></div>' +
          '<button type="button" class="wpmp-btn-primary wpmp-save-settings">' + icon('check', 14) + ' ' + wpmp.esc(s.saveSettings || 'Save Settings') + '</button>' +
          '</div>' +
          '<div class="wpmp-settings-grid">' +

          /* Scan Settings card */
          '<div class="wpmp-settings-card">' +
          '<h3>' + wpmp.esc(s.scanSettings || 'Scan Settings') + '</h3>' +
          '<p class="card-desc">' + wpmp.esc(s.scanSettingsDesc || 'Control what MediaPurge scans and how') + '</p>' +
          wpmp.buildToggleRow('skip-recent', s.skipRecentUploads || 'Skip files newer than 30 days', s.skipRecentDesc || 'Protect recently uploaded files from being flagged as unused.', recentDays > 0) +
          wpmp.buildToggleRow('scan-woo', s.scanWoo || 'Scan WooCommerce galleries', s.scanWooDesc || 'Include product gallery images in the unused file check.', scanWoo) +
          wpmp.buildToggleRow('page-builders', s.proPageBuilders || 'Page builder scanning', s.proBuildersDesc || 'Detect images inside Elementor, Divi, WPBakery, and Beaver Builder.', false, true) +
          wpmp.buildToggleRow('scheduled-scan', s.proScheduledClean || 'Scheduled weekly scan', s.proScheduledDesc || 'Automatically scan your media library every 7 days.', false, true) +
          '<div class="wpmp-settings-field" style="margin-top:16px">' +
          '<label for="wpmp-trash-days">' + wpmp.esc(s.autoTrashLabel || 'Auto-purge trash after') + '</label>' +
          '<select id="wpmp-trash-days" class="wpmp-setting" data-key="trash_retention_days">' +
          '<option value="30"' + (trashDays === 30 ? ' selected' : '') + '>30 days (recommended)</option>' +
          '<option value="14"' + (trashDays === 14 ? ' selected' : '') + '>14 days</option>' +
          '<option value="60"' + (trashDays === 60 ? ' selected' : '') + '>60 days</option>' +
          '<option value="365"' + (trashDays >= 365 ? ' selected' : '') + '>Never (manual only)</option>' +
          '</select>' +
          '</div>' +
          '</div>' +

          /* Whitelist & Exclusions card */
          '<div class="wpmp-settings-card">' +
          '<h3>' + wpmp.esc(s.exclusions || 'Whitelist & Exclusions') + '</h3>' +
          '<p class="card-desc">' + wpmp.esc(s.exclusionsDesc || 'Files and types to never flag as unused') + '</p>' +
          '<div style="margin-bottom:14px">' +
          '<label style="font-size:12px;font-weight:600;color:var(--wpmp-gray7);display:block;margin-bottom:6px">' + wpmp.esc(s.excludeFileTypes || 'Exclude file types') + '</label>' +
          '<div class="wpmp-exclude-tags">' +
          '<span class="wpmp-exclude-tag">SVG</span>' +
          '<span class="wpmp-exclude-tag">GIF</span>' +
          '<span class="wpmp-exclude-tag">PDF</span>' +
          '<span class="wpmp-exclude-tag">MP4</span>' +
          '<span class="wpmp-exclude-tag">MOV</span>' +
          '</div>' +
          '</div>' +
          '<div class="wpmp-settings-field">' +
          '<label for="wpmp-recent-days">' + wpmp.esc(s.recentDaysLabel || 'Min file age to flag (days)') + '</label>' +
          '<input id="wpmp-recent-days" type="number" class="wpmp-setting" data-key="recent_upload_days" value="' + recentDays + '" min="0" max="90">' +
          '</div>' +
          '<div class="wpmp-warning-box">' +
          '<div class="title">\u26A0 ' + wpmp.esc(s.warningTitle || 'Important') + '</div>' +
          '<p>' + wpmp.esc(s.warningDesc || 'MediaPurge never permanently deletes files automatically. All actions are reversible for 30 days.') + '</p>' +
          '</div>' +
          '</div>' +

          /* Pro Features card (full width) */
          ('<div class="wpmp-settings-card full-width">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
            '<div><h3 style="margin-bottom:4px">' + wpmp.esc(s.upcomingFeaturesTitle || 'Upcoming Features') + '</h3>' +
            '<p class="card-desc">' + wpmp.esc(s.upcomingFeaturesDesc || 'Duplicate merge, virtual folders, scheduled auto-cleanup, and advanced analytics are in development.') + '</p></div>' +
            '<span class="wpmp-tag-soon" style="font-size:11px;padding:4px 12px">' + wpmp.esc(s.comingSoon || 'Coming Soon') + '</span>' +
            '</div>' +
            '<div class="wpmp-pro-features">' +
            wpmp.buildProFeatureCard(icons.copy, s.proDupMerge || 'Duplicate Merge', s.proDupMergeDesc || 'One-click duplicate consolidation') +
            wpmp.buildProFeatureCard(icons.folder, s.proVirtFolders || 'Folder Organizer', s.proFoldersDesc2 || 'Virtual folders for your library') +
            wpmp.buildProFeatureCard(icons.calendar, s.proScheduledClean || 'Auto-Schedule', s.proScheduledDesc || 'Scheduled scans + email reports') +
            wpmp.buildProFeatureCard(icons.zap, s.proAnalytics || 'Advanced Analytics', s.proAnalyticsDesc || 'Cost estimator + 90-day trends') +
            '</div>' +
            '<p style="font-size:12px;color:var(--wpmp-gray5);margin:12px 0 0;text-align:center">' + wpmp.esc(s.comingSoonNote || 'These features are in development and will be available in a future release.') + '</p>' +
            '</div>') +

          '</div>' +
          '</div>'
        );

        /* Toggle switch events */
        $('.wpmp-toggle').on('click', function () {
          if ($(this).hasClass('disabled')) return;
          $(this).toggleClass('on');
        });
        $('.wpmp-save-settings').on('click', wpmp.saveSettings);
      }).catch(function (err) {
        $('.wpmp-settings-placeholder').replaceWith('<p class="wpmp-error">' + wpmp.esc(err.message) + '</p>');
      });
    },

    buildToggleRow: function (id, label, desc, isOn, isPrOnly) {
      return '<div class="wpmp-toggle-row">' +
        '<div class="wpmp-toggle-info">' +
        '<div class="wpmp-toggle-label"><span>' + wpmp.esc(label) + '</span>' +
        (isPrOnly ? ' <span class="wpmp-tag-soon" style="font-size:9px;padding:1px 5px">' + wpmp.esc(s.comingSoon || 'Soon') + '</span>' : '') +
        '</div>' +
        '<div class="wpmp-toggle-desc">' + wpmp.esc(desc) + '</div>' +
        '</div>' +
        '<button type="button" class="wpmp-toggle' + (isOn && !isPrOnly ? ' on' : '') + (isPrOnly ? ' disabled' : '') + '" data-toggle="' + id + '" aria-label="' + wpmp.esc(label) + '"' + (isPrOnly ? ' disabled style="opacity:.5;cursor:not-allowed"' : '') + '>' +
        '<div class="wpmp-toggle-knob"></div>' +
        '</button>' +
        '</div>';
    },

    buildProFeatureCard: function (svgIcon, title, desc) {
      return '<div class="wpmp-pro-feature-card">' +
        '<span class="wpmp-tag-soon" style="margin-bottom:8px;display:inline-flex;font-size:9px;padding:1px 5px">' + wpmp.esc(s.comingSoon || 'Soon') + '</span>' +
        '<div class="title">' + wpmp.esc(title) + '</div>' +
        '<p class="desc">' + wpmp.esc(desc) + '</p>' +
        '</div>';
    },

    saveSettings: function () {
      var $btn = $('.wpmp-save-settings').prop('disabled', true);
      $btn.html(icon('spinner', 14) + ' ' + wpmp.esc(s.saving || 'Saving\u2026'));
      var data = {};
      $('.wpmp-setting').each(function () {
        var val = $(this).val();
        data[$(this).data('key')] = parseInt(val, 10) || 0;
      });
      wpmp.api('settings', { method: 'POST', body: JSON.stringify(data) })
        .then(function () {
          wpmp.showToast(s.settingsSaved || 'Settings saved.', 'success');
          $btn.prop('disabled', false).html(icon('check', 14) + ' ' + wpmp.esc(s.saveSettings || 'Save Settings'));
        }).catch(function (err) {
          wpmp.showToast(s.settingsFailed || 'Failed to save settings.', 'error');
          $btn.prop('disabled', false).html(icon('check', 14) + ' ' + wpmp.esc(s.saveSettings || 'Save Settings'));
        });
    },

    /* ================================================================
     * SCAN (start + progress polling)
     * ================================================================ */
    startScan: function (e) {
      if (e && e.preventDefault) e.preventDefault();
      $(document).off('.wpmpScan');
      $('.wpmp-scan-btn').prop('disabled', true);

      wpmp.api('scan/start', { method: 'POST' })
        .then(function (data) {
          if (data && data.success !== false) {
            currentTab = 'scanner';
            scannerPage = 1;
            $('.wpmp-tab').removeClass('active').attr('aria-selected', 'false');
            $('.wpmp-tab[data-tab="scanner"]').addClass('active').attr('aria-selected', 'true');
            wpmp.showToast(data.message || (s.scanning || 'Scan started.'), 'success');
            wpmp.renderContent();
            wpmp.startPoll();
          } else {
            $('.wpmp-scan-btn').prop('disabled', false);
            wpmp.showToast(data.message || (s.scanFailed || 'Scan failed.'), 'error');
          }
        }).catch(function (err) {
          $('.wpmp-scan-btn').prop('disabled', false);
          wpmp.showToast(err.message, 'error');
        });
    },

    startPoll: function () {
      if (scanPollTimer) return;
      scanPollTimer = setInterval(function () {
        wpmp.api('scan/status').then(function (status) {
          if (currentTab === 'scanner' && $('.wpmp-scan-progress').length) {
            var newHtml = wpmp.buildScanProgressHtml(status);
            $('.wpmp-scan-progress').replaceWith(newHtml);
          }
          if (!status.running) {
            clearInterval(scanPollTimer);
            scanPollTimer = null;
            wpmp.showToast(s.scanComplete || 'Scan complete.', 'success');
            wpmp.renderContent();
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
