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
      wpmp.checkWizard();
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
      else if (currentTab === 'recovery') wpmp.loadRecovery();
      else if (currentTab === 'settings') wpmp.loadSettings();
      else if (currentTab === 'status') wpmp.loadStatus();
      else if (currentTab === 'about') wpmp.loadAbout();
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
          if (scanStatus.last_run) {
            // Scan completed but no unused files — new site / all files protected
            $ph.replaceWith(wpmp.buildScanCleanHtml(scanStatus));
          } else {
            // Never scanned — show pre-scan prompt
            $ph.replaceWith(wpmp.buildPreScanHtml());
          }
          $(document).on('click.wpmpScan', '.wpmp-scan-btn', wpmp.startScan);
          $(document).on('click.wpmpScan', '.wpmp-go-settings-btn', function () {
            currentTab = 'settings';
            $('.wpmp-tab').removeClass('active').attr('aria-selected', 'false');
            $('.wpmp-tab[data-tab="settings"]').addClass('active').attr('aria-selected', 'true');
            wpmp.renderContent();
          });
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
        '<span class="wpmp-source-badge free">\u2713 ' + wpmp.esc(s.elementor || 'Elementor') + '</span>' +
        '<span class="wpmp-source-badge free">\u2713 ' + wpmp.esc(s.diviPro || 'Divi') + '</span>' +
        '<span class="wpmp-source-badge free">\u2713 ' + wpmp.esc(s.wpBakeryPro || 'WPBakery') + '</span>' +
        '</div>' +
        '<button type="button" class="wpmp-btn-primary wpmp-scan-btn">' + icon('search', 17) + ' ' + wpmp.esc(s.startFullScan || 'Start Scan') + '</button>' +
        '</div>' +
        '</div>';
    },

    /* ================================================================
     * SCANNER — "Scan ran but no unused files found" state
     * Shown when: scan has been run but total unused = 0
     * Common on new sites where all files fall within recent-upload protection
     * ================================================================ */
    buildScanCleanHtml: function (scanStatus) {
      var recentDays = (typeof wpmpAdmin !== 'undefined' && wpmpAdmin.recentUploadDays) ? wpmpAdmin.recentUploadDays : 30;
      var lastRun = (scanStatus && scanStatus.last_run) ? scanStatus.last_run : '';
      var lastRunDate = lastRun ? wpmp.formatDate(lastRun) : '';
      var protectedMsg = (s.scanCleanProtected || 'Files uploaded within the last %d days are protected from being flagged. On a new site or after a recent content import, this is why results may appear empty.').replace('%d', recentDays);

      return '<div class="wpmp-fade-up">' +
        '<div class="wpmp-page-title-row">' +
        '<div><h1>' + wpmp.esc(s.scanner || 'Media Scanner') + '</h1>' +
        '<div class="wpmp-page-subtitle">' + wpmp.esc(s.scannerDesc || 'Find and safely remove unused files') + '</div></div>' +
        '</div>' +
        '<div class="wpmp-prescan wpmp-prescan-clean">' +
        '<div class="wpmp-prescan-icon wpmp-prescan-icon-clean">' + icons.checkCircle + '</div>' +
        '<h2>' + wpmp.esc(s.scanCleanTitle || 'No Unused Files Found') + '</h2>' +
        (lastRunDate ? '<p class="wpmp-scan-date-note">' + wpmp.esc((s.lastScan || 'Last scan:') + ' ') + '<strong>' + wpmp.esc(lastRunDate) + '</strong></p>' : '') +
        '<p>' + wpmp.esc(s.scanCleanDesc || 'The scanner completed and found no unused files in your media library. Your site looks clean!') + '</p>' +
        '<div class="wpmp-prescan-notice">' +
        icon('clock', 14) + ' <span>' + wpmp.esc(protectedMsg) + '</span>' +
        '</div>' +
        '<div class="wpmp-prescan-meta">' + icon('shield', 14) + ' ' + wpmp.esc(s.safeNote || 'Safe & non-destructive \u2014 nothing is deleted automatically') + '</div>' +
        '<div class="wpmp-prescan-actions">' +
        '<button type="button" class="wpmp-btn-primary wpmp-scan-btn">' + icon('refresh', 15) + ' ' + wpmp.esc(s.rescan || 'Run New Scan') + '</button>' +
        '<button type="button" class="wpmp-btn-ghost wpmp-go-settings-btn">' + icon('zap', 14) + ' ' + wpmp.esc(s.adjustSettings || 'Adjust Protection Period') + '</button>' +
        '</div>' +
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
        '<div style="height:12px"></div>' +
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
    loadRecovery: function () {
      var recoveryPage = 1;

      function buildRecoveryRow(item) {
        var attId = parseInt(item.attachment_id || 0, 10);
        var size = parseInt(item.file_size || 0, 10);
        var thumb = item.thumbnail_url
          ? '<img src="' + wpmp.esc(item.thumbnail_url) + '" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid var(--wpmp-gray2)">'
          : '<div style="width:44px;height:44px;border-radius:6px;background:var(--wpmp-gray1);border:1px solid var(--wpmp-gray2);display:flex;align-items:center;justify-content:center;color:var(--wpmp-gray4)">' + icon('file', 18) + '</div>';
        var trashDate = item.trashed_date ? ' &middot; Trashed ' + wpmp.esc(wpmp.formatDate(item.trashed_date)) : '';
        return '<div class="wpmp-recovery-row" data-id="' + attId + '">' +
          '<div class="wpmp-recovery-thumb">' + thumb + '</div>' +
          '<div class="wpmp-recovery-info">' +
          '<div class="wpmp-recovery-name">' + wpmp.esc(item.filename || item.file_path || '') + '</div>' +
          '<div class="wpmp-recovery-meta">' + wpmp.esc(wpmp.formatBytes(size)) + trashDate + '</div>' +
          '</div>' +
          '<div class="wpmp-recovery-actions">' +
          '<button type="button" class="wpmp-btn-ghost wpmp-restore-one" data-id="' + attId + '" title="' + wpmp.esc(s.helpRestore || 'Restore') + '" style="font-size:12px;padding:5px 12px;color:var(--wpmp-green)">' + icon('undo', 13) + ' ' + wpmp.esc(s.restore || 'Restore') + '</button>' +
          '<button type="button" class="wpmp-btn-ghost wpmp-delete-one" data-id="' + attId + '" data-size="' + size + '" title="' + wpmp.esc(s.helpPermDelete || 'Delete permanently') + '" style="font-size:12px;padding:5px 12px;color:var(--wpmp-red);border-color:#FCA5A5">' + icon('trash', 13) + ' ' + wpmp.esc(s.delete || 'Delete') + '</button>' +
          '</div>' +
          '</div>';
      }

      function fetchAndRender(page, append) {
        var $ph = append ? null : $('.wpmp-recovery-placeholder');
        wpmp.api('media/trashed?page=' + page + '&per_page=20').then(function (data) {
          var items = data.items || [];
          var total = data.total || 0;
          var totalPages = data.total_pages || 1;

          if (!append) {
            if (!total) {
              $ph.replaceWith(
                '<div class="wpmp-recovery wpmp-fade-up">' +
                '<div class="wpmp-page-title-row"><div><h1>' + wpmp.esc(s.recovery || 'Recovery') + '</h1>' +
                '<div class="wpmp-page-subtitle">' + wpmp.esc(s.recoveryDesc || 'Files you previously trashed. Restore them if needed, or delete permanently.') + '</div></div></div>' +
                '<div class="wpmp-card" style="padding:60px 24px;text-align:center">' +
                '<div style="width:64px;height:64px;border-radius:50%;background:var(--wpmp-gray1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--wpmp-gray4)">' + icon('trash', 28) + '</div>' +
                '<h3 style="font-size:16px;font-weight:700;color:var(--wpmp-navy);margin:0 0 8px">' + wpmp.esc(s.trashEmpty || 'Trash is Empty') + '</h3>' +
                '<p style="color:var(--wpmp-gray5);font-size:13px;margin:0">' + wpmp.esc(s.trashEmptyDesc || 'No files in trash. When you move unused media to trash from the Scanner tab, they will appear here.') + '</p>' +
                '</div></div>'
              );
              return;
            }

            var rows = '';
            items.forEach(function (item) { rows += buildRecoveryRow(item); });
            var html =
              '<div class="wpmp-recovery wpmp-fade-up">' +
              '<div class="wpmp-page-title-row">' +
              '<div><h1>' + wpmp.esc(s.recovery || 'Recovery') + '</h1>' +
              '<div class="wpmp-page-subtitle">' + wpmp.esc(s.recoveryDesc || 'Files you previously trashed. Restore them if needed, or delete permanently.') + '</div></div>' +
              '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
              '<button type="button" class="wpmp-btn-ghost wpmp-restore-all-btn" style="font-size:12px;color:var(--wpmp-green)">' + icon('undo', 13) + ' ' + wpmp.esc(s.restoreAll || 'Restore All') + '</button>' +
              '<button type="button" class="wpmp-btn-ghost wpmp-empty-trash-btn" style="font-size:12px;color:var(--wpmp-red);border-color:#FCA5A5">' + icon('trash', 13) + ' ' + wpmp.esc(s.emptyTrash || 'Empty Trash') + '</button>' +
              '</div></div>' +
              '<div class="wpmp-card" style="padding:0;overflow:hidden">' +
              '<div class="wpmp-recovery-count-bar">' +
              icon('clock', 13) + '<span>' + total + ' ' + wpmp.esc(s.filesInTrashLabel || 'file(s) in trash \u2014 restorable within 30 days') + '</span>' +
              '</div>' +
              '<div class="wpmp-recovery-list">' + rows + '</div>' +
              (page < totalPages
                ? '<div class="wpmp-recovery-loadmore"><button type="button" class="wpmp-btn-ghost wpmp-recovery-load-more-btn" style="font-size:12px">' + wpmp.esc(s.loadMore || 'Load More') + '</button></div>'
                : '') +
              '</div></div>';
            $ph.replaceWith(html);

            $(document).off('.wpmpRecovery');

            /* Restore individual */
            $(document).on('click.wpmpRecovery', '.wpmp-restore-one', function () {
              var id = parseInt($(this).data('id'), 10);
              var $row = $(this).closest('.wpmp-recovery-row');
              $(this).prop('disabled', true).text('\u2026');
              wpmp.api('media/restore', { method: 'POST', body: JSON.stringify({ ids: [id] }) })
                .then(function (resp) {
                  if (resp.success) {
                    $row.css({ opacity: 0, transition: 'opacity .25s' });
                    setTimeout(function () { $row.remove(); }, 260);
                    wpmp.showToast(resp.message || 'Restored.', 'success');
                  }
                }).catch(function (err) { wpmp.showToast(err.message, 'error'); });
            });

            /* Delete individual permanently */
            $(document).on('click.wpmpRecovery', '.wpmp-delete-one', function () {
              var id = parseInt($(this).data('id'), 10);
              var size = parseInt($(this).data('size'), 10) || 0;
              var $row = $(this).closest('.wpmp-recovery-row');
              wpmp.showConfirmModal([id], size, 'delete', function () {
                wpmp.api('media/delete', { method: 'POST', body: JSON.stringify({ ids: [id] }) })
                  .then(function (resp) {
                    if (resp.success) {
                      $row.css({ opacity: 0, transition: 'opacity .25s' });
                      setTimeout(function () { $row.remove(); }, 260);
                      wpmp.showToast(resp.message || 'Deleted permanently.', 'success');
                    }
                  }).catch(function (err) { wpmp.showToast(err.message, 'error'); });
              });
            });

            /* Restore all */
            $(document).on('click.wpmpRecovery', '.wpmp-restore-all-btn', function () {
              var $btn = $(this).prop('disabled', true);
              wpmp.api('media/trashed?per_page=500').then(function (data) {
                var ids = (data.items || []).map(function (i) { return parseInt(i.attachment_id, 10); });
                if (!ids.length) { $btn.prop('disabled', false); return; }
                wpmp.api('media/restore', { method: 'POST', body: JSON.stringify({ ids: ids }) })
                  .then(function (resp) {
                    if (resp.success) {
                      wpmp.showToast(resp.message || 'All files restored.', 'success');
                      wpmp.renderContent();
                    }
                  }).catch(function (err) { wpmp.showToast(err.message, 'error'); $btn.prop('disabled', false); });
              });
            });

            /* Empty trash */
            $(document).on('click.wpmpRecovery', '.wpmp-empty-trash-btn', function () {
              wpmp.api('media/trashed?per_page=500').then(function (data) {
                var items2 = data.items || [];
                if (!items2.length) { wpmp.showToast(s.trashEmpty || 'Trash is already empty.', 'info'); return; }
                var ids = items2.map(function (i) { return parseInt(i.attachment_id, 10); });
                var totalSz = items2.reduce(function (a, i) { return a + parseInt(i.file_size || 0, 10); }, 0);
                wpmp.showConfirmModal(ids, totalSz, 'delete', function () {
                  wpmp.api('media/delete', { method: 'POST', body: JSON.stringify({ ids: ids }) })
                    .then(function (resp) {
                      if (resp.success) {
                        wpmp.showToast(resp.message || 'Trash emptied.', 'success');
                        wpmp.renderContent();
                      }
                    }).catch(function (err) { wpmp.showToast(err.message, 'error'); });
                });
              });
            });

            /* Load more */
            $(document).on('click.wpmpRecovery', '.wpmp-recovery-load-more-btn', function () {
              recoveryPage++;
              fetchAndRender(recoveryPage, true);
            });

          } else {
            if (items.length) {
              var newRows = '';
              items.forEach(function (item) { newRows += buildRecoveryRow(item); });
              $('.wpmp-recovery-list').append(newRows);
              if (page >= totalPages) { $('.wpmp-recovery-loadmore').remove(); }
            }
          }
        }).catch(function (err) {
          if (!append) {
            $('.wpmp-recovery-placeholder').replaceWith('<p class="wpmp-error">' + wpmp.esc(err.message) + '</p>');
          }
        });
      }

      fetchAndRender(1, false);
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
     * STATUS TAB — System health checks
     * ================================================================ */
    loadStatus: function () {
      var $ph = $('.wpmp-status-placeholder');

      wpmp.api('health').then(function (data) {
        var checks = data.checks || {};
        var order = ['rest_api', 'db_tables', 'php_version', 'wp_version', 'set_time_limit', 'upload_dir', 'cron', 'memory', 'woocommerce', 'last_scan'];

        var errorCount = 0, warningCount = 0;
        order.forEach(function (k) {
          if (checks[k]) {
            if (checks[k].status === 'error') errorCount++;
            else if (checks[k].status === 'warning') warningCount++;
          }
        });

        var summaryStatus = errorCount > 0 ? 'error' : (warningCount > 0 ? 'warning' : 'ok');
        var summaryIcon = summaryStatus === 'ok' ? 'checkCircle' : (summaryStatus === 'error' ? 'xCircle' : 'alert');
        var summaryMsg = summaryStatus === 'ok'
          ? wpmp.esc(s.statusAllGood || 'Everything looks good! The plugin is healthy and ready to use.')
          : summaryStatus === 'error'
            ? '<strong>' + errorCount + '</strong> ' + wpmp.esc(s.statusHasErrors || 'critical issue(s) need your attention.')
            : '<strong>' + warningCount + '</strong> ' + wpmp.esc(s.statusHasWarnings || 'warning(s) found \u2014 plugin may not work at full capacity.');

        var rows = '';
        order.forEach(function (key) {
          var check = checks[key];
          if (!check) return;
          var st = check.status;
          var statusColors = { ok: 'var(--wpmp-green)', error: 'var(--wpmp-red)', warning: 'var(--wpmp-amber)', info: 'var(--wpmp-blue)' };
          var statusIcons = { ok: 'checkCircle', error: 'xCircle', warning: 'alert', info: 'shield' };
          var badgeLabels = { ok: s.statusOk || 'OK', error: s.statusError || 'Error', warning: s.statusWarning || 'Warning', info: s.statusInfo || 'Info' };
          rows += '<div class="wpmp-status-row wpmp-status-' + st + '">' +
            '<div class="wpmp-status-icon" style="color:' + (statusColors[st] || 'var(--wpmp-blue)') + '">' + icon(statusIcons[st] || 'shield', 20) + '</div>' +
            '<div class="wpmp-status-info">' +
            '<div class="wpmp-status-label">' + wpmp.esc(check.label || key) + '</div>' +
            '<div class="wpmp-status-note">' + wpmp.esc(check.note || '') + '</div>' +
            '</div>' +
            '<div class="wpmp-status-badge wpmp-status-badge-' + st + '">' + wpmp.esc(badgeLabels[st] || st) + '</div>' +
            '</div>';
        });

        $ph.replaceWith(
          '<div class="wpmp-status wpmp-fade-up">' +
          '<div class="wpmp-page-title-row">' +
          '<div><h1>' + wpmp.esc(s.statusTitle || 'System Status') + '</h1>' +
          '<div class="wpmp-page-subtitle">' + wpmp.esc(s.statusSubtitle || 'Check that the plugin is working correctly on your site') + '</div></div>' +
          '</div>' +
          '<div class="wpmp-status-summary wpmp-status-summary-' + summaryStatus + '">' +
          icon(summaryIcon, 18) + ' <span>' + summaryMsg + '</span>' +
          '</div>' +
          '<div class="wpmp-card" style="padding:0;overflow:hidden;margin-bottom:20px">' +
          rows +
          '</div>' +
          '<div class="wpmp-status-help">' +
          icon('cloud', 14) + ' ' +
          '<span>If you see errors, try deactivating security plugins temporarily to test. For help, visit <a href="https://getmediapurge.com/docs" target="_blank" rel="noopener">getmediapurge.com/docs</a> or the <a href="https://wordpress.org/support/plugin/wp-media-purge/" target="_blank" rel="noopener">support forum</a>.</span>' +
          '</div>' +
          '</div>'
        );
      }).catch(function () {
        $ph.replaceWith(
          '<div class="wpmp-status wpmp-fade-up">' +
          '<div class="wpmp-page-title-row"><div><h1>' + wpmp.esc(s.statusTitle || 'System Status') + '</h1></div></div>' +
          '<div class="wpmp-status-summary wpmp-status-summary-error">' +
          icon('xCircle', 18) + ' <span>' + wpmp.esc(s.statusRestFailed || 'REST API is not accessible. A security plugin or server configuration may be blocking REST API requests. Check your security plugin settings or contact your hosting provider.') + '</span>' +
          '</div>' +
          '</div>'
        );
      });
    },

    /* ================================================================
     * ABOUT TAB — Plugin info, mission, and value
     * ================================================================ */
    loadAbout: function () {
      var $ph = $('.wpmp-about-placeholder');

      function aboutSection(iconName, title, content, extraClass) {
        extraClass = extraClass || '';
        return '<div class="wpmp-about-section ' + extraClass + '">' +
          '<div class="wpmp-about-section-icon">' + icon(iconName, 20) + '</div>' +
          '<h3>' + wpmp.esc(title) + '</h3>' +
          content +
          '</div>';
      }

      function aboutList(items) {
        var html = '<ul class="wpmp-about-list" role="list">';
        items.forEach(function (item) {
          html += '<li role="listitem">' + icon('checkCircle', 14) + ' <span>' + wpmp.esc(item) + '</span></li>';
        });
        return html + '</ul>';
      }

      function aboutStep(num, text) {
        return '<div class="wpmp-about-step">' +
          '<div class="wpmp-about-step-num" aria-hidden="true">' + num + '</div>' +
          '<span>' + wpmp.esc(text) + '</span>' +
          '</div>';
      }

      var pluginVersion = (typeof wpmpAdmin !== 'undefined' && wpmpAdmin.pluginVersion) ? wpmpAdmin.pluginVersion : '';

      $ph.replaceWith(
        '<div class="wpmp-about wpmp-fade-up">' +

        /* Header */
        '<div class="wpmp-about-hero">' +
        '<div class="wpmp-about-hero-icon">' + icon('shield', 36) + '</div>' +
        '<h1>' + wpmp.esc(s.aboutTitle || 'About WP Media Purge') + '</h1>' +
        '<p class="wpmp-about-subtitle">' + wpmp.esc(s.aboutSubtitle || 'Clean your WordPress media library safely and confidently') + '</p>' +
        '</div>' +

        '<div class="wpmp-about-grid">' +

        /* What is in the free version */
        aboutSection('checkCircle', 'What You Get — Free, Forever',
          '<p style="font-size:12px;color:var(--wpmp-gray5);margin:0 0 10px">Everything below is included in the free version. No account, no upsells, no limits on core features.</p>' +
          aboutList([
            'Scan all posts, pages, widgets & theme customizer',
            'Scan Elementor, Divi, WPBakery & Beaver Builder page builders',
            'Scan WooCommerce product galleries (if WooCommerce is active)',
            'See exactly where each file is used before you decide',
            'Safely move unused files to trash — always one click to review first',
            'Restore any trashed file from the Recovery tab (30-day window)',
            'Whitelist files you always want to keep',
            'Export unused file list as CSV',
            'Recent upload protection — new files are never flagged by mistake',
            'Storage analytics & largest files breakdown',
          ]),
          'safety'
        ) +

        /* Safety-First Philosophy */
        aboutSection('shield', s.aboutSafetyTitle || 'Safety-First Philosophy',
          aboutList([
            s.aboutSafety1 || 'Nothing is ever deleted automatically \u2014 you always review first',
            s.aboutSafety2 || 'All trashed files are recoverable for 30 days',
            s.aboutSafety3 || 'Recently uploaded files are protected from being flagged',
            s.aboutSafety4 || 'Whitelist any file to permanently protect it from cleanup',
          ])
        ) +

        /* How It Works */
        aboutSection('zap', s.aboutWorkflowTitle || 'How It Works',
          '<div class="wpmp-about-steps">' +
          aboutStep('1', s.aboutStep1 || 'Scan \u2014 Analyze your entire media library against all site content') +
          aboutStep('2', s.aboutStep2 || 'Review \u2014 See exactly where each file is used (or not used)') +
          aboutStep('3', s.aboutStep3 || 'Clean \u2014 Move unused files to a safe trash with one click') +
          aboutStep('4', s.aboutStep4 || 'Recover \u2014 Restore any file within 30 days if you change your mind') +
          '</div>'
        ) +

        /* What We Scan */
        aboutSection('search', s.aboutScanTitle || 'What We Scan',
          aboutList([
            s.aboutScan1 || 'All post and page content (including shortcodes)',
            s.aboutScan2 || 'Featured images and custom fields',
            s.aboutScan3 || 'Widget areas and theme customizer settings',
            s.aboutScan4 || 'Page builders: Elementor, Divi, WPBakery, Beaver Builder',
            s.aboutScan5 || 'WooCommerce product galleries',
            s.aboutScan6 || 'Serialized data and complex meta fields',
          ])
        ) +

        /* Coming Soon */
        aboutSection('clock', 'Coming in Future Releases',
          '<p style="font-size:12px;color:var(--wpmp-gray5);margin:0 0 10px">These features are in active development and will be released for free or as an optional paid add-on. We will always be transparent about what is paid.</p>' +
          aboutList([
            'Scheduled automatic scan & cleanup',
            'Virtual folder organizer for your media library',
            'Duplicate file detection & merge',
            'Advanced storage analytics with cost estimator',
            'Bulk image compression',
          ])
        ) +

        /* Support */
        aboutSection('cloud', s.aboutSupport || 'Need Help?',
          '<p>' + wpmp.esc(s.aboutSupportDesc || 'If you have questions, need support, or want to suggest a feature \u2014 we are here for you.') + '</p>' +
          '<div class="wpmp-about-links">' +
          '<a href="https://wordpress.org/support/plugin/wp-media-purge/" target="_blank" rel="noopener" class="wpmp-btn-primary" style="font-size:13px;padding:8px 18px">' + icon('cloud', 14) + ' ' + wpmp.esc(s.support || 'Support Forum') + '</a>' +
          '<a href="https://getmediapurge.com/docs" target="_blank" rel="noopener" class="wpmp-btn-ghost" style="font-size:13px;padding:8px 18px">' + icon('file', 14) + ' ' + wpmp.esc(s.documentation || 'Documentation') + '</a>' +
          '</div>'
        ) +

        '</div>' +

        /* Plugin Meta */
        '<div class="wpmp-about-meta">' +
        '<div class="wpmp-about-meta-item"><strong>' + wpmp.esc(s.aboutVersion || 'Version') + '</strong><span>' + wpmp.esc(pluginVersion) + '</span></div>' +
        '<div class="wpmp-about-meta-item"><strong>' + wpmp.esc(s.aboutAuthor || 'Author') + '</strong><span>Naqeeb Ul Rehman</span></div>' +
        '<div class="wpmp-about-meta-item"><strong>' + wpmp.esc(s.aboutLicense || 'License') + '</strong><span>GPL-2.0+</span></div>' +
        '<div class="wpmp-about-meta-item"><strong>' + wpmp.esc(s.aboutRequires || 'Requires') + '</strong><span>WordPress 5.8+ &middot; PHP 7.4+</span></div>' +
        '</div>' +

        '</div>'
      );
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

    /* ================================================================
     * SETUP WIZARD (first-run)
     * ================================================================ */
    checkWizard: function () {
      if (typeof wpmpAdmin !== 'undefined' && !wpmpAdmin.wizardSeen) {
        setTimeout(function () { wpmp.showWizard(); }, 600);
      }
    },

    showWizard: function () {
      if ($('.wpmp-wizard-overlay').length) return;
      var wizardStep = 1;
      var wizardData = { recent_upload_days: 30, trash_retention_days: 30, scan_woocommerce: true };

      function captureStep() {
        if (wizardStep === 2) {
          var v = parseInt($('#wpmp-wizard-recent-days').val(), 10);
          if (!isNaN(v)) wizardData.recent_upload_days = v;
        } else if (wizardStep === 3) {
          var v2 = parseInt($('#wpmp-wizard-trash-days').val(), 10);
          if (!isNaN(v2)) wizardData.trash_retention_days = v2;
        }
      }

      function dismissWizard() {
        wpmp.api('settings', { method: 'POST', body: JSON.stringify({ wizard_seen: true }) }).catch(function () { });
        if (typeof wpmpAdmin !== 'undefined') wpmpAdmin.wizardSeen = true;
        $('.wpmp-wizard-overlay').fadeOut(200, function () { $(this).remove(); });
      }

      function renderStep() {
        var content = '';
        if (wizardStep === 1) {
          content =
            '<div class="wpmp-wizard-icon-wrap">' + icon('shield', 32) + '</div>' +
            '<h2 class="wpmp-wizard-title">' + wpmp.esc(s.wizardWelcomeTitle || 'Welcome to MediaPurge!') + '</h2>' +
            '<p class="wpmp-wizard-desc">' + wpmp.esc(s.wizardWelcomeDesc || 'Let\'s take 30 seconds to set up 2 key preferences for your site.') + '</p>' +
            '<div class="wpmp-wizard-features">' +
            '<div class="wpmp-wizard-feature">' + icon('checkCircle', 16) + '<span>' + wpmp.esc(s.wizardFeature1 || 'Scans posts, pages, widgets & page builders') + '</span></div>' +
            '<div class="wpmp-wizard-feature">' + icon('checkCircle', 16) + '<span>' + wpmp.esc(s.wizardFeature2 || 'Nothing is deleted until you confirm') + '</span></div>' +
            '<div class="wpmp-wizard-feature">' + icon('checkCircle', 16) + '<span>' + wpmp.esc(s.wizardFeature3 || 'All trashed files are recoverable for 30 days') + '</span></div>' +
            '</div>';
        } else if (wizardStep === 2) {
          content =
            '<div class="wpmp-wizard-icon-wrap" style="background:linear-gradient(135deg,#059669,#34D399)">' + icon('clock', 32) + '</div>' +
            '<h2 class="wpmp-wizard-title">' + wpmp.esc(s.wizardStep2Title || 'Protect Recent Uploads') + '</h2>' +
            '<p class="wpmp-wizard-desc">' + wpmp.esc(s.wizardStep2Desc || 'How many days after upload should a file be protected from being flagged as unused?') + '</p>' +
            '<div class="wpmp-wizard-field">' +
            '<label class="wpmp-wizard-label">' + wpmp.esc(s.wizardRecentLabel || 'Protect files uploaded within the last:') + '</label>' +
            '<select id="wpmp-wizard-recent-days" class="wpmp-wizard-select">' +
            '<option value="7"' + (wizardData.recent_upload_days === 7 ? ' selected' : '') + '>7 days</option>' +
            '<option value="14"' + (wizardData.recent_upload_days === 14 ? ' selected' : '') + '>14 days</option>' +
            '<option value="30"' + (wizardData.recent_upload_days === 30 ? ' selected' : '') + '>30 days (recommended)</option>' +
            '<option value="60"' + (wizardData.recent_upload_days === 60 ? ' selected' : '') + '>60 days</option>' +
            '</select></div>' +
            '<p class="wpmp-wizard-hint">' + wpmp.esc(s.wizardRecentHint || 'We recommend 30 days to protect files still being rolled out on your site.') + '</p>';
        } else {
          var wooRow = '';
          if (typeof wpmpAdmin !== 'undefined' && wpmpAdmin.hasWooCommerce) {
            wooRow =
              '<div class="wpmp-wizard-toggle-row">' +
              '<div><div class="wpmp-wizard-toggle-label">' + wpmp.esc(s.scanWoo || 'Scan WooCommerce galleries') + '</div>' +
              '<div class="wpmp-wizard-toggle-desc">' + wpmp.esc(s.scanWooDesc || 'Include product gallery images in scans.') + '</div></div>' +
              '<button type="button" class="wpmp-toggle' + (wizardData.scan_woocommerce ? ' on' : '') + '" id="wpmp-wizard-woo"><div class="wpmp-toggle-knob"></div></button>' +
              '</div>';
          }
          content =
            '<div class="wpmp-wizard-icon-wrap" style="background:linear-gradient(135deg,#D97706,#FCD34D)">' + icon('trash', 32) + '</div>' +
            '<h2 class="wpmp-wizard-title">' + wpmp.esc(s.wizardStep3Title || 'Trash Policy') + '</h2>' +
            '<p class="wpmp-wizard-desc">' + wpmp.esc(s.wizardStep3Desc || 'How long should trashed files stay in Recovery before being permanently deleted?') + '</p>' +
            '<div class="wpmp-wizard-field">' +
            '<label class="wpmp-wizard-label">' + wpmp.esc(s.wizardTrashLabel || 'Keep trashed files for:') + '</label>' +
            '<select id="wpmp-wizard-trash-days" class="wpmp-wizard-select">' +
            '<option value="14"' + (wizardData.trash_retention_days === 14 ? ' selected' : '') + '>14 days</option>' +
            '<option value="30"' + (wizardData.trash_retention_days === 30 ? ' selected' : '') + '>30 days (recommended)</option>' +
            '<option value="60"' + (wizardData.trash_retention_days === 60 ? ' selected' : '') + '>60 days</option>' +
            '<option value="365"' + (wizardData.trash_retention_days >= 365 ? ' selected' : '') + '>Never auto-delete</option>' +
            '</select></div>' +
            wooRow +
            '<p class="wpmp-wizard-hint">' + wpmp.esc(s.wizardTrashHint || '30 days gives you a comfortable window to recover anything accidentally trashed.') + '</p>';
        }

        var dots = '';
        for (var d = 1; d <= 3; d++) {
          dots += '<div class="wpmp-wizard-dot' + (d === wizardStep ? ' active' : '') + '"></div>';
        }
        var prevBtn = wizardStep > 1
          ? '<button type="button" class="wpmp-btn-ghost wpmp-wizard-prev" style="min-width:72px">' + wpmp.esc(s.wizardBack || '\u2190 Back') + '</button>'
          : '';
        var actionBtn = wizardStep === 3
          ? '<button type="button" class="wpmp-btn-primary wpmp-wizard-finish">' + icon('checkCircle', 14) + ' ' + wpmp.esc(s.wizardFinish || 'Finish Setup') + '</button>'
          : '<button type="button" class="wpmp-btn-primary wpmp-wizard-next">' + wpmp.esc(s.wizardNext || 'Next') + ' \u2192</button>';

        $('.wpmp-wizard-body').html(
          content +
          '<div class="wpmp-wizard-footer">' +
          '<div class="wpmp-wizard-dots">' + dots + '</div>' +
          '<div class="wpmp-wizard-actions">' + prevBtn + actionBtn +
          '<button type="button" class="wpmp-wizard-skip">' + wpmp.esc(s.wizardSkip || 'Skip setup') + '</button>' +
          '</div></div>'
        );

        /* Step-specific bindings */
        $('#wpmp-wizard-recent-days').on('change', function () { wizardData.recent_upload_days = parseInt($(this).val(), 10); });
        $('#wpmp-wizard-trash-days').on('change', function () { wizardData.trash_retention_days = parseInt($(this).val(), 10); });
        $('#wpmp-wizard-woo').on('click', function () {
          wizardData.scan_woocommerce = !wizardData.scan_woocommerce;
          $(this).toggleClass('on', wizardData.scan_woocommerce);
        });
        $('.wpmp-wizard-next').on('click', function () { captureStep(); wizardStep++; renderStep(); });
        $('.wpmp-wizard-prev').on('click', function () { captureStep(); wizardStep--; renderStep(); });
        $('.wpmp-wizard-skip').on('click', dismissWizard);
        $('.wpmp-wizard-finish').on('click', function () {
          captureStep();
          var $btn = $(this).prop('disabled', true).html(icon('spinner', 14) + ' Saving\u2026');
          wpmp.api('settings', { method: 'POST', body: JSON.stringify($.extend({}, wizardData, { wizard_seen: true })) })
            .then(function () {
              if (typeof wpmpAdmin !== 'undefined') wpmpAdmin.wizardSeen = true;
              $('.wpmp-wizard-overlay').fadeOut(200, function () { $(this).remove(); });
              wpmp.showToast(s.wizardDone || 'Setup complete! You\'re ready to run your first scan.', 'success');
            }).catch(function (err) {
              $btn.prop('disabled', false).html(icon('checkCircle', 14) + ' ' + wpmp.esc(s.wizardFinish || 'Finish Setup'));
              wpmp.showToast(err.message, 'error');
            });
        });
      }

      $('body').append(
        '<div class="wpmp-wizard-overlay">' +
        '<div class="wpmp-wizard-modal">' +
        '<div class="wpmp-wizard-body"></div>' +
        '</div></div>'
      );
      renderStep();
    },

  };

  $(document).ready(function () {
    if (typeof wpmpAdmin !== 'undefined') {
      wpmp.init();
    }
  });

})(jQuery);
