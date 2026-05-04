/* global wpmpAdmin */
/**
 * WP Media Purge — Admin UI
 * Vanilla JS, no framework dependency.
 *
 * @package WP_Media_Purge
 */
( function () {
	'use strict';

	/* ============================================================
	   STATE
	   ============================================================ */
	var state = {
		currentTab: 'dashboard',
		scanPollTimer: null,
		unusedPage: 1,
		unusedTotal: 0,
		unusedItems: [],
		unusedType: '',
		selectedIds: {},
		trashedPage: 1,
		trashedTotal: 0,
		trashedItems: [],
		trashedSelected: {},
		settings: {},
	};

	/* ============================================================
	   API HELPERS
	   ============================================================ */
	function apiGet( endpoint ) {
		return fetch( wpmpAdmin.restUrl + endpoint, {
			headers: {
				'X-WP-Nonce': wpmpAdmin.nonce,
				Accept: 'application/json',
			},
			credentials: 'same-origin',
		} ).then( function ( r ) {
			if ( ! r.ok ) { return r.json().then( function ( e ) { throw e; } ); }
			return r.json();
		} );
	}

	function apiPost( endpoint, body ) {
		return fetch( wpmpAdmin.restUrl + endpoint, {
			method: 'POST',
			headers: {
				'X-WP-Nonce': wpmpAdmin.nonce,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			credentials: 'same-origin',
			body: JSON.stringify( body ),
		} ).then( function ( r ) {
			if ( ! r.ok ) { return r.json().then( function ( e ) { throw e; } ); }
			return r.json();
		} );
	}

	/* ============================================================
	   UTILITIES
	   ============================================================ */
	function fmt( bytes ) {
		bytes = parseInt( bytes ) || 0;
		if ( bytes <= 0 ) { return '0 B'; }
		var units = [ 'B', 'KB', 'MB', 'GB', 'TB' ];
		var i = 0;
		while ( bytes >= 1024 && i < units.length - 1 ) { bytes /= 1024; i++; }
		return ( i === 0 ? bytes : bytes.toFixed( 1 ) ) + '\u00a0' + units[ i ];
	}

	function pct( part, total ) {
		if ( ! total ) { return 0; }
		return Math.min( 100, Math.round( ( part / total ) * 100 ) );
	}

	function esc( str ) {
		var div = document.createElement( 'div' );
		div.textContent = str != null ? String( str ) : '';
		return div.innerHTML;
	}

	function setRoot( html ) {
		var root = document.getElementById( 'wpmp-root' );
		if ( root ) { root.innerHTML = html; }
	}

	function showLoading( msg ) {
		setRoot( '<div class="wpmp-loading"><span class="spinner is-active"></span><p>' + esc( msg || 'Loading\u2026' ) + '</p></div>' );
	}

	/* ============================================================
	   TOAST
	   ============================================================ */
	function toast( msg, type ) {
		type = type || 'success';
		var wrap = document.getElementById( 'wpmp-toast-wrap' );
		if ( ! wrap ) { return; }
		var icons = {
			success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px"><polyline points="20 6 9 17 4 12"/></svg>',
			error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
			info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
		};
		var t = document.createElement( 'div' );
		t.className = 'wpmp-toast ' + type;
		t.innerHTML = ( icons[ type ] || icons.info ) + '<span>' + esc( msg ) + '</span><button class="close" aria-label="Dismiss">&times;</button>';
		t.querySelector( '.close' ).addEventListener( 'click', function () { t.remove(); } );
		wrap.appendChild( t );
		setTimeout( function () { if ( t.parentNode ) { t.remove(); } }, 5000 );
	}

	/* ============================================================
	   MODAL
	   ============================================================ */
	function showModal( opts ) {
		var old = document.getElementById( 'wpmp-modal-overlay' );
		if ( old ) { old.remove(); }

		var isDelete = opts.type === 'delete';
		var iconSvg = isDelete
			? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>'
			: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>';

		var safetyHtml = opts.safety
			? '<div class="wpmp-modal-safety"><div class="wpmp-modal-safety-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px"><polyline points="20 6 9 17 4 12"/></svg></div><span>' + esc( opts.safety ) + '</span></div>'
			: '';
		var metaHtml = opts.meta ? '<div class="wpmp-modal-meta">' + esc( opts.meta ) + '</div>' : '';
		var confirmBtnStyle = isDelete ? 'background:var(--wpmp-red);color:#fff;border-color:var(--wpmp-red)' : '';

		var overlay = document.createElement( 'div' );
		overlay.id = 'wpmp-modal-overlay';
		overlay.className = 'wpmp-modal-overlay';
		overlay.innerHTML = '<div class="wpmp-modal">'
			+ '<div class="wpmp-modal-icon modal-' + ( opts.type || 'trash' ) + '">' + iconSvg + '</div>'
			+ '<h3>' + esc( opts.title ) + '</h3>'
			+ '<p>' + esc( opts.desc ) + '</p>'
			+ metaHtml + safetyHtml
			+ '<div class="wpmp-modal-actions">'
			+ '<button class="wpmp-btn-ghost" id="mpModal-cancel">' + esc( opts.cancelText || 'Cancel' ) + '</button>'
			+ '<button class="wpmp-btn-danger" id="mpModal-confirm" style="' + confirmBtnStyle + '">' + esc( opts.confirmText || 'Confirm' ) + '</button>'
			+ '</div></div>';

		document.body.appendChild( overlay );

		overlay.querySelector( '#mpModal-cancel' ).addEventListener( 'click', function () { overlay.remove(); } );
		overlay.addEventListener( 'click', function ( e ) { if ( e.target === overlay ) { overlay.remove(); } } );
		overlay.querySelector( '#mpModal-confirm' ).addEventListener( 'click', function () {
			overlay.remove();
			if ( opts.onConfirm ) { opts.onConfirm(); }
		} );
	}

	/* ============================================================
	   THUMBNAIL
	   ============================================================ */
	function thumbHtml( item ) {
		var isImg = item.mime_type && item.mime_type.indexOf( 'image/' ) === 0;
		if ( isImg && item.thumbnail_url ) {
			return '<div class="wpmp-media-thumb"><img src="' + esc( item.thumbnail_url ) + '" alt="" loading="lazy"></div>';
		}
		var ext = ( item.filename || item.file_path || '' ).split( '.' ).pop().toUpperCase().slice( 0, 4 );
		return '<div class="wpmp-media-thumb"><span class="ext">' + esc( ext ) + '</span></div>';
	}

	/* ============================================================
	   TAB SWITCHING
	   ============================================================ */
	function switchTab( tab ) {
		stopScanPoll();
		state.currentTab = tab;
		document.querySelectorAll( '.wpmp-tab' ).forEach( function ( btn ) {
			var active = btn.dataset.tab === tab;
			btn.classList.toggle( 'active', active );
			btn.setAttribute( 'aria-selected', active ? 'true' : 'false' );
		} );
		showLoading();
		switch ( tab ) {
			case 'dashboard': return loadDashboard();
			case 'scanner':   return loadScanner();
			case 'storage':   return loadStorage();
			case 'recovery':  return loadRecovery();
			case 'settings':  return loadSettings();
			case 'status':    return loadStatus();
			case 'about':     return renderAbout();
			default:          setRoot( '<div class="wpmp-error">Unknown tab.</div>' );
		}
	}

	/* ============================================================
	   DASHBOARD
	   ============================================================ */
	function loadDashboard() {
		Promise.all( [ apiGet( 'storage/stats' ), apiGet( 'scan/status' ) ] ).then( function ( results ) {
			renderDashboard( results[ 0 ], results[ 1 ] );
		} ).catch( function () {
			setRoot( '<div class="wpmp-error">Failed to load dashboard. Please check the REST API is enabled on your site.</div>' );
		} );
	}

	function renderDashboard( stats, scan ) {
		var totalFmt    = fmt( stats.total_size );
		var unusedFmt   = fmt( stats.unused_size );
		var savings_pct = pct( stats.unused_size, stats.total_size );
		var lastScan    = stats.last_scan ? new Date( stats.last_scan ).toLocaleString() : 'Never';

		var colors = { image: '#1B4FD8', video: '#7C3AED', audio: '#0891B2', document: '#D97706', other: '#64748B' };
		var byType = stats.by_type || {};
		var barSegs = '';
		var legendRows = '';
		Object.keys( colors ).forEach( function ( type ) {
			var t  = byType[ type ] || { count: 0, size: 0 };
			var tp = pct( t.size, stats.total_size || 1 );
			if ( tp > 0 ) {
				barSegs  += '<span class="wpmp-bar-seg" style="width:' + tp + '%;background:' + colors[ type ] + '" title="' + type + ': ' + fmt( t.size ) + '"></span>';
				legendRows += '<li class="wpmp-bar-leg-item">'
					+ '<span class="wpmp-bar-leg-dot" style="background:' + colors[ type ] + '"></span>'
					+ '<span>' + type.charAt( 0 ).toUpperCase() + type.slice( 1 ) + '</span>'
					+ '<span class="wpmp-bar-leg-size">' + fmt( t.size ) + '</span>'
					+ '</li>';
			}
		} );

		setRoot( '<div class="wpmp-tab-panel wpmp-fade-up">'
			+ '<div class="wpmp-page-title-row">'
			+ '<div><h1>Dashboard</h1><div class="wpmp-page-subtitle">Overview of your media library health and storage</div></div>'
			+ '</div>'

			// Stat cards
			+ '<div class="wpmp-stat-cards">'
			+ statCard( 'Total Files', ( stats.total_count || 0 ).toLocaleString(), 'attachments in library', 'blue',
				'<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>' )
			+ statCard( 'Unused Files', ( stats.unused_count || 0 ).toLocaleString(), 'not used anywhere', 'red',
				'<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>' )
			+ statCard( 'Total Storage', totalFmt, 'scanned media size', 'blue',
				'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>' )
			+ statCard( 'Potential Savings', unusedFmt, savings_pct + '% reclaimable', 'green',
				'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>' )
			+ '</div>'

			// Storage breakdown + quick actions
			+ '<div class="wpmp-storage-grid">'
			+ '<div class="wpmp-storage-card"><h3>Storage Breakdown</h3>'
			+ ( barSegs
				? '<div class="wpmp-storage-bar">' + barSegs + '</div><ul class="wpmp-bar-legend">' + legendRows + '</ul>'
				: '<p style="color:var(--wpmp-gray5);font-size:13px">Run a scan to see the breakdown.</p>' )
			+ '</div>'
			+ '<div class="wpmp-quick-actions"><h3>Quick Actions</h3>'
			+ '<div class="wpmp-quick-actions-list">'
			+ '<button class="wpmp-btn-primary" id="dash-scan-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Run Scan Now</button>'
			+ '<button class="wpmp-btn-ghost" id="dash-unused-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>View Unused Files</button>'
			+ '<button class="wpmp-btn-ghost" id="dash-recovery-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>Recovery Tab</button>'
			+ '</div>'
			+ '<div class="wpmp-last-scan-box"><div class="label">Last scan</div><div class="value">' + esc( lastScan ) + '</div></div>'
			+ '</div>'
			+ '</div>'
			+ '</div>'
		);

		document.getElementById( 'dash-scan-btn' ).addEventListener( 'click', function () { switchTab( 'scanner' ); } );
		document.getElementById( 'dash-unused-btn' ).addEventListener( 'click', function () { switchTab( 'scanner' ); } );
		document.getElementById( 'dash-recovery-btn' ).addEventListener( 'click', function () { switchTab( 'recovery' ); } );
	}

	function statCard( label, value, sub, color, svgPaths ) {
		var strokeColor = color === 'red' ? '#DC2626' : color === 'green' ? '#059669' : '#1B4FD8';
		return '<div class="wpmp-stat-card">'
			+ '<div class="wpmp-stat-header">'
			+ '<span class="wpmp-stat-label">' + esc( label ) + '</span>'
			+ '<div class="wpmp-stat-icon icon-' + color + '">'
			+ '<svg viewBox="0 0 24 24" fill="none" stroke="' + strokeColor + '" stroke-width="2">' + svgPaths + '</svg>'
			+ '</div></div>'
			+ '<div class="wpmp-stat-value">' + esc( value ) + '</div>'
			+ '<div class="wpmp-stat-sub">' + esc( sub ) + '</div>'
			+ '</div>';
	}

	/* ============================================================
	   SCANNER
	   ============================================================ */
	function loadScanner() {
		state.unusedPage   = 1;
		state.unusedItems  = [];
		state.selectedIds  = {};
		state.unusedType   = '';

		apiGet( 'scan/status' ).then( function ( status ) {
			if ( status.running ) {
				renderScanProgress( status );
				startScanPoll();
			} else if ( status.last_run ) {
				loadUnusedMedia( false );
			} else {
				renderPreScan();
			}
		} ).catch( function () {
			renderPreScan();
		} );
	}

	function renderPreScan() {
		var wooHtml = wpmpAdmin.hasWooCommerce ? '<span class="wpmp-source-badge free">WooCommerce</span>' : '';
		setRoot( '<div class="wpmp-tab-panel wpmp-fade-up">'
			+ '<div class="wpmp-prescan">'
			+ '<div class="wpmp-prescan-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>'
			+ '<h2>Ready to Scan Your Media Library</h2>'
			+ '<p>Media Purge will analyze your entire library and find every file not used anywhere on your site.</p>'
			+ '<p class="wpmp-prescan-meta">Post content &middot; Page builders &middot; Featured images &middot; Widgets &middot; Theme settings</p>'
			+ '<div class="wpmp-prescan-sources">'
			+ '<span class="wpmp-source-badge free">Post Content</span>'
			+ '<span class="wpmp-source-badge free">Featured Images</span>'
			+ '<span class="wpmp-source-badge free">Elementor</span>'
			+ '<span class="wpmp-source-badge free">Divi / WPBakery</span>'
			+ '<span class="wpmp-source-badge free">Widgets</span>'
			+ '<span class="wpmp-source-badge free">Theme Customizer</span>'
			+ wooHtml
			+ '</div>'
			+ '<button class="wpmp-btn-primary" id="btn-start-scan" style="font-size:15px;padding:13px 32px">'
			+ '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
			+ 'Start Scan</button>'
			+ '</div></div>'
		);
		document.getElementById( 'btn-start-scan' ).addEventListener( 'click', startScan );
	}

	function startScan() {
		// Show progress immediately for better UX.
		renderScanProgress( { phase: 'Initializing\u2026', progress: 0, running: true } );

		apiPost( 'scan/start', {} ).then( function ( res ) {
			if ( res.success === false ) {
				toast( res.message || 'Could not start scan.', 'error' );
				renderPreScan();
				return;
			}
			// Check whether scan is still running (async large-site) or already done (small site sync).
			apiGet( 'scan/status' ).then( function ( status ) {
				if ( status.running ) {
					startScanPoll();
				} else {
					// Small site: scan finished synchronously.
					stopScanPoll();
					toast( 'Scan complete!', 'success' );
					loadUnusedMedia( false );
				}
			} ).catch( function () {
				loadUnusedMedia( false );
			} );
		} ).catch( function ( err ) {
			toast( ( err && err.message ) ? err.message : 'Failed to start scan.', 'error' );
			renderPreScan();
		} );
	}

	function renderScanProgress( status ) {
		var progress = status.progress || 0;
		var phase    = esc( status.phase || 'Scanning\u2026' );
		setRoot( '<div class="wpmp-tab-panel wpmp-fade-up">'
			+ '<div class="wpmp-scan-progress">'
			+ '<div class="wpmp-scan-header">'
			+ '<div class="wpmp-scan-spinner-box"><svg viewBox="0 0 24 24" fill="none" stroke="#1B4FD8" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg></div>'
			+ '<div class="wpmp-scan-header-text"><p class="title">Scanning Media Library\u2026</p><p class="phase">' + phase + '</p></div>'
			+ '<span class="wpmp-scan-pct">' + progress + '%</span>'
			+ '</div>'
			+ '<div class="wpmp-progress-wrap"><div class="wpmp-progress-bar" style="width:' + progress + '%"></div></div>'
			+ '<div style="display:flex;justify-content:flex-end;margin-top:8px">'
			+ '<button class="wpmp-btn-ghost" id="btn-cancel-scan" style="font-size:12px;padding:6px 14px">Cancel</button>'
			+ '</div>'
			+ '</div></div>'
		);
		var cancelBtn = document.getElementById( 'btn-cancel-scan' );
		if ( cancelBtn ) {
			cancelBtn.addEventListener( 'click', cancelScan );
		}
	}

	function startScanPoll() {
		stopScanPoll();
		state.scanPollTimer = setInterval( function () {
			apiGet( 'scan/status' ).then( function ( status ) {
				if ( ! status.running ) {
					stopScanPoll();
					toast( 'Scan complete!', 'success' );
					loadUnusedMedia( false );
					return;
				}
				renderScanProgress( status );
			} ).catch( function () {
				stopScanPoll();
			} );
		}, 2500 );
	}

	function stopScanPoll() {
		if ( state.scanPollTimer ) {
			clearInterval( state.scanPollTimer );
			state.scanPollTimer = null;
		}
	}

	function cancelScan() {
		stopScanPoll();
		apiPost( 'scan/cancel', {} ).then( function () {
			toast( 'Scan cancelled.', 'info' );
			renderPreScan();
		} ).catch( function () {
			toast( 'Could not cancel scan.', 'error' );
		} );
	}

	/* ============================================================
	   UNUSED MEDIA
	   ============================================================ */
	function loadUnusedMedia( append ) {
		if ( ! append ) {
			state.unusedPage  = 1;
			state.unusedItems = [];
			state.selectedIds = {};
			showLoading( 'Loading results\u2026' );
		}

		apiGet( 'media/unused?page=' + state.unusedPage + '&per_page=30&type=' + encodeURIComponent( state.unusedType ) )
			.then( function ( data ) {
				if ( append ) {
					state.unusedItems = state.unusedItems.concat( data.items || [] );
				} else {
					state.unusedItems = data.items || [];
				}
				state.unusedTotal = data.total || 0;
				renderUnusedMedia();
			} )
			.catch( function () {
				setRoot( '<div class="wpmp-error">Failed to load media list. Please try re-scanning.</div>' );
			} );
	}

	function countSelected() {
		return Object.keys( state.selectedIds ).length;
	}

	function sizeSelected() {
		var total = 0;
		state.unusedItems.forEach( function ( item ) {
			if ( state.selectedIds[ item.attachment_id ] ) {
				total += parseInt( item.file_size ) || 0;
			}
		} );
		return total;
	}

	function renderUnusedMedia() {
		var items   = state.unusedItems;
		var total   = state.unusedTotal;
		var hasMore = items.length < total;
		var selCnt  = countSelected();
		var selSz   = sizeSelected();

		if ( ! items.length ) {
			setRoot( '<div class="wpmp-tab-panel wpmp-fade-up">'
				+ '<div class="wpmp-page-title-row"><div><h1>Scanner</h1><div class="wpmp-page-subtitle">No unused files found</div></div>'
				+ '<button class="wpmp-btn-primary" id="btn-rescan"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>Re-scan</button>'
				+ '</div>'
				+ '<div class="wpmp-prescan" style="padding:32px 40px">'
				+ '<div class="wpmp-prescan-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>'
				+ '<h2 style="color:var(--wpmp-green)">Your media library is clean!</h2>'
				+ '<p>No unused files were detected in the last scan.</p>'
				+ '</div></div>'
			);
			document.getElementById( 'btn-rescan' ).addEventListener( 'click', startScan );
			return;
		}

		var rowsHtml = items.map( function ( item ) { return mediaRowHtml( item ); } ).join( '' );

		setRoot( '<div class="wpmp-tab-panel wpmp-fade-up">'
			+ '<div class="wpmp-page-title-row">'
			+ '<div><h1>Unused Media</h1><div class="wpmp-page-subtitle">' + total.toLocaleString() + ' file' + ( total !== 1 ? 's' : '' ) + ' not used anywhere on your site</div></div>'
			+ '<div class="wpmp-scanner-actions">'
			+ '<select class="wpmp-type-filter" id="type-filter" aria-label="Filter by type">'
			+ '<option value="">All Types</option>'
			+ '<option value="image"'  + ( state.unusedType === 'image'    ? ' selected' : '' ) + '>Images</option>'
			+ '<option value="video"'  + ( state.unusedType === 'video'    ? ' selected' : '' ) + '>Videos</option>'
			+ '<option value="document"' + ( state.unusedType === 'document' ? ' selected' : '' ) + '>Documents</option>'
			+ '<option value="other"'  + ( state.unusedType === 'other'    ? ' selected' : '' ) + '>Other</option>'
			+ '</select>'
			+ '<button class="wpmp-btn-ghost" id="btn-select-all" style="font-size:12px">Select All</button>'
			+ '<a href="' + esc( wpmpAdmin.exportCsvUrl ) + '" class="wpmp-btn-ghost" style="font-size:12px;text-decoration:none" title="Export unused files as CSV">Export CSV</a>'
			+ '<button class="wpmp-btn-primary" id="btn-rescan-top" style="font-size:12px;padding:8px 14px">'
			+ '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>Re-scan</button>'
			+ '</div></div>'

			+ '<div class="wpmp-bulk-bar' + ( selCnt > 0 ? ' visible' : '' ) + '" id="bulk-bar" aria-live="polite">'
			+ '<span class="count">' + selCnt + ' selected</span>'
			+ '<span class="size">' + fmt( selSz ) + '</span>'
			+ '<button class="wpmp-btn-danger" id="btn-bulk-trash" style="font-size:12px">Move to Trash</button>'
			+ '<button class="wpmp-btn-ghost" id="btn-bulk-wl" style="font-size:12px;color:var(--wpmp-green);border-color:#6EE7B7">Keep (Whitelist)</button>'
			+ '<button class="wpmp-btn-ghost" id="btn-bulk-clear" style="font-size:12px">Clear</button>'
			+ '</div>'

			+ '<div class="wpmp-media-list" id="media-list">' + rowsHtml + '</div>'

			+ ( hasMore
				? '<div style="text-align:center;margin-top:16px"><button class="wpmp-btn-ghost" id="btn-load-more">Load More (' + ( total - items.length ).toLocaleString() + ' remaining)</button></div>'
				: '' )
			+ '</div>'
		);

		// Events
		document.getElementById( 'type-filter' ).addEventListener( 'change', function ( e ) {
			state.unusedType = e.target.value;
			loadUnusedMedia( false );
		} );
		document.getElementById( 'btn-select-all' ).addEventListener( 'click', function () {
			items.forEach( function ( i ) { state.selectedIds[ i.attachment_id ] = true; } );
			renderUnusedMedia();
		} );
		document.getElementById( 'btn-rescan-top' ).addEventListener( 'click', startScan );

		var clearBtn = document.getElementById( 'btn-bulk-clear' );
		if ( clearBtn ) {
			clearBtn.addEventListener( 'click', function () { state.selectedIds = {}; renderUnusedMedia(); } );
		}
		var bulkTrashBtn = document.getElementById( 'btn-bulk-trash' );
		if ( bulkTrashBtn ) {
			bulkTrashBtn.addEventListener( 'click', function () {
				var ids = Object.keys( state.selectedIds ).map( Number );
				showModal( {
					type: 'trash', title: 'Move to Trash?',
					desc: 'Move ' + ids.length + ' selected file(s) to trash.',
					meta: ids.length + ' file(s) \u00b7 ' + fmt( selSz ),
					safety: 'Files are recoverable from the Recovery tab within your retention period.',
					confirmText: 'Yes, Move to Trash',
					onConfirm: function () { bulkAction( 'media/trash', ids ); },
				} );
			} );
		}
		var bulkWlBtn = document.getElementById( 'btn-bulk-wl' );
		if ( bulkWlBtn ) {
			bulkWlBtn.addEventListener( 'click', function () {
				var ids = Object.keys( state.selectedIds ).map( Number );
				bulkAction( 'media/whitelist', ids );
			} );
		}
		var loadMoreBtn = document.getElementById( 'btn-load-more' );
		if ( loadMoreBtn ) {
			loadMoreBtn.addEventListener( 'click', function () {
				state.unusedPage++;
				loadUnusedMedia( true );
			} );
		}

		bindMediaRowEvents();
	}

	function mediaRowHtml( item ) {
		var isChecked  = !! state.selectedIds[ item.attachment_id ];
		var usedInHtml = buildUsedInHtml( item.used_in_data );
		return '<div class="wpmp-media-row' + ( isChecked ? ' is-selected' : '' ) + '" data-id="' + item.attachment_id + '">'
			+ '<div class="wpmp-checkbox-custom' + ( isChecked ? ' checked' : '' ) + '" data-chk="' + item.attachment_id + '" role="checkbox" aria-checked="' + isChecked + '" tabindex="0">'
			+ '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
			+ '</div>'
			+ thumbHtml( item )
			+ '<div class="wpmp-media-info">'
			+ '<span class="wpmp-media-name" title="' + esc( item.file_path ) + '">' + esc( item.filename || item.file_path ) + '</span>'
			+ '<div class="wpmp-media-meta">'
			+ '<span class="size">' + fmt( item.file_size ) + '</span>'
			+ '<span class="dot"></span><span class="mime">' + esc( item.mime_type || '' ) + '</span>'
			+ ( item.scan_date ? '<span class="dot"></span><span class="date">' + esc( item.scan_date.split( ' ' )[ 0 ] ) + '</span>' : '' )
			+ '</div>'
			+ usedInHtml
			+ '</div>'
			+ '<div class="wpmp-media-actions">'
			+ '<button class="wpmp-btn-ghost btn-row-trash" data-id="' + item.attachment_id + '" data-name="' + esc( item.filename || '' ) + '" data-size="' + ( item.file_size || 0 ) + '" style="font-size:12px;padding:6px 12px">Trash</button>'
			+ '<button class="wpmp-btn-ghost btn-row-wl" data-id="' + item.attachment_id + '" style="font-size:12px;padding:6px 12px;color:var(--wpmp-green);border-color:#6EE7B7">Keep</button>'
			+ '</div>'
			+ '</div>';
	}

	function buildUsedInHtml( usedInData ) {
		if ( ! usedInData || ! usedInData.length ) {
			return '<span class="wpmp-tag-unused" style="display:inline-flex;margin-top:4px">Not used anywhere</span>';
		}
		var preview = usedInData.slice( 0, 2 ).map( function ( u ) {
			var label = u.post_title || u.label || u.type || 'Post';
			if ( u.edit_url ) {
				return '<a href="' + esc( u.edit_url ) + '" target="_blank" rel="noopener" style="color:var(--wpmp-blue);font-size:11px;text-decoration:none">' + esc( label ) + '</a>';
			}
			return '<span style="font-size:11px;color:var(--wpmp-gray5)">' + esc( label ) + '</span>';
		} ).join( '<span style="color:var(--wpmp-gray4);margin:0 4px">&middot;</span>' );
		var more = usedInData.length > 2
			? '<span style="font-size:11px;color:var(--wpmp-gray5)"> +' + ( usedInData.length - 2 ) + ' more</span>'
			: '';
		return '<div style="margin-top:4px">' + preview + more + '</div>';
	}

	function bindMediaRowEvents() {
		document.querySelectorAll( '[data-chk]' ).forEach( function ( chk ) {
			function toggleChk() {
				var id = parseInt( chk.dataset.chk );
				if ( state.selectedIds[ id ] ) { delete state.selectedIds[ id ]; } else { state.selectedIds[ id ] = true; }
				renderUnusedMedia();
			}
			chk.addEventListener( 'click', toggleChk );
			chk.addEventListener( 'keydown', function ( e ) { if ( e.key === ' ' || e.key === 'Enter' ) { e.preventDefault(); toggleChk(); } } );
		} );

		document.querySelectorAll( '.btn-row-trash' ).forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				var id   = parseInt( btn.dataset.id );
				var name = btn.dataset.name;
				var size = parseInt( btn.dataset.size ) || 0;
				showModal( {
					type: 'trash', title: 'Move to Trash?',
					desc: 'Move this file to trash. You can restore it from the Recovery tab.',
					meta: name + ( size ? ' \u00b7 ' + fmt( size ) : '' ),
					safety: 'Recoverable within your retention period.',
					confirmText: 'Yes, Move to Trash',
					onConfirm: function () { bulkAction( 'media/trash', [ id ] ); },
				} );
			} );
		} );

		document.querySelectorAll( '.btn-row-wl' ).forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				bulkAction( 'media/whitelist', [ parseInt( btn.dataset.id ) ] );
			} );
		} );
	}

	function bulkAction( endpoint, ids ) {
		apiPost( endpoint, { ids: ids } ).then( function ( res ) {
			if ( res.message ) { toast( res.message, 'success' ); }
			// Remove acted-on items from local state.
			var idSet = {};
			ids.forEach( function ( id ) { idSet[ id ] = true; } );
			state.unusedItems = state.unusedItems.filter( function ( i ) { return ! idSet[ i.attachment_id ]; } );
			state.unusedTotal = Math.max( 0, state.unusedTotal - ids.length );
			state.selectedIds = {};
			renderUnusedMedia();
		} ).catch( function ( err ) {
			toast( ( err && err.message ) ? err.message : 'Action failed. Please try again.', 'error' );
		} );
	}

	/* ============================================================
	   STORAGE
	   ============================================================ */
	function loadStorage() {
		Promise.all( [ apiGet( 'storage/stats' ), apiGet( 'storage/largest?limit=10' ) ] ).then( function ( results ) {
			renderStorage( results[ 0 ], results[ 1 ] );
		} ).catch( function () {
			setRoot( '<div class="wpmp-error">Failed to load storage data.</div>' );
		} );
	}

	function renderStorage( stats, largest ) {
		var colors = { image: '#1B4FD8', video: '#7C3AED', audio: '#0891B2', document: '#D97706', other: '#64748B' };
		var byType = stats.by_type || {};

		var breakdownHtml = '';
		Object.keys( colors ).forEach( function ( type ) {
			var t  = byType[ type ] || { count: 0, size: 0 };
			if ( ! t.size ) { return; }
			var p = pct( t.size, stats.total_size || 1 );
			breakdownHtml += '<div style="margin-bottom:14px">'
				+ '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">'
				+ '<span style="display:flex;align-items:center;gap:8px"><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:' + colors[ type ] + '"></span>' + type.charAt( 0 ).toUpperCase() + type.slice( 1 ) + '</span>'
				+ '<span style="font-family:var(--wpmp-mono);font-size:12px;color:var(--wpmp-gray5)">' + fmt( t.size ) + ' &middot; ' + t.count + ' file' + ( t.count !== 1 ? 's' : '' ) + '</span>'
				+ '</div>'
				+ '<div class="wpmp-progress-wrap" style="height:6px"><div class="wpmp-progress-bar" style="width:' + p + '%;background:' + colors[ type ] + '"></div></div>'
				+ '</div>';
		} );

		var largestHtml = ( largest.items || [] ).slice( 0, 10 ).map( function ( item, i ) {
			return '<div class="wpmp-largest-item">'
				+ '<span style="width:22px;height:22px;border-radius:50%;background:var(--wpmp-gray1);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--wpmp-gray5);flex-shrink:0">' + ( i + 1 ) + '</span>'
				+ thumbHtml( item )
				+ '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc( item.filename || '' ) + '</div>'
				+ '<div style="font-size:11px;color:var(--wpmp-gray5)">' + esc( item.mime_type || '' ) + '</div></div>'
				+ '<span style="font-family:var(--wpmp-mono);font-size:12px;font-weight:600;flex-shrink:0">' + fmt( item.file_size ) + '</span>'
				+ '</div>';
		} ).join( '' );

		setRoot( '<div class="wpmp-tab-panel wpmp-fade-up">'
			+ '<div class="wpmp-page-title-row"><div><h1>Storage</h1><div class="wpmp-page-subtitle">Disk usage breakdown and largest files</div></div></div>'
			+ '<div class="wpmp-storage-grid">'
			+ '<div class="wpmp-storage-card"><h3>By File Type</h3>'
			+ ( breakdownHtml || '<p style="color:var(--wpmp-gray5);font-size:13px">Run a scan to see the type breakdown.</p>' )
			+ '</div>'
			+ '<div class="wpmp-storage-card"><h3>Summary</h3>'
			+ '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">'
			+ '<div style="background:var(--wpmp-gray1);border-radius:10px;padding:14px"><div style="font-size:11px;color:var(--wpmp-gray5);margin-bottom:4px">Total Media</div>'
			+ '<div style="font-size:20px;font-weight:700;color:var(--wpmp-navy);font-family:var(--wpmp-mono)">' + fmt( stats.total_size ) + '</div></div>'
			+ '<div style="background:var(--wpmp-red-light,#FEF2F2);border-radius:10px;padding:14px"><div style="font-size:11px;color:var(--wpmp-red);margin-bottom:4px">Unused</div>'
			+ '<div style="font-size:20px;font-weight:700;color:var(--wpmp-red);font-family:var(--wpmp-mono)">' + fmt( stats.unused_size ) + '</div></div>'
			+ '</div>'
			+ '<button class="wpmp-btn-ghost" id="stor-unused-btn" style="width:100%;justify-content:center">View Unused Files</button>'
			+ '</div></div>'
			+ '<div class="wpmp-storage-card" style="margin-top:16px">'
			+ '<h3 style="margin:0 0 14px;font-size:14px;font-weight:700;color:var(--wpmp-navy)">10 Largest Files</h3>'
			+ ( largestHtml || '<div style="color:var(--wpmp-gray5);font-size:13px;text-align:center;padding:24px 0">Run a scan to see the largest files.</div>' )
			+ '</div>'
			+ '</div>'
		);

		var btn = document.getElementById( 'stor-unused-btn' );
		if ( btn ) { btn.addEventListener( 'click', function () { switchTab( 'scanner' ); } ); }
	}

	/* ============================================================
	   RECOVERY
	   ============================================================ */
	function loadRecovery() {
		state.trashedPage     = 1;
		state.trashedItems    = [];
		state.trashedSelected = {};
		showLoading( 'Loading trashed files\u2026' );

		apiGet( 'media/trashed?page=1&per_page=30' ).then( function ( data ) {
			state.trashedItems = data.items || [];
			state.trashedTotal = data.total || 0;
			renderRecovery();
		} ).catch( function () {
			setRoot( '<div class="wpmp-error">Failed to load trashed files.</div>' );
		} );
	}

	function countTrashedSelected() {
		return Object.keys( state.trashedSelected ).length;
	}

	function renderRecovery() {
		var items  = state.trashedItems;
		var total  = state.trashedTotal;
		var selCnt = countTrashedSelected();

		if ( ! items.length ) {
			setRoot( '<div class="wpmp-tab-panel wpmp-fade-up">'
				+ '<div class="wpmp-page-title-row"><div><h1>Recovery</h1><div class="wpmp-page-subtitle">Files moved to trash appear here</div></div></div>'
				+ '<div class="wpmp-prescan" style="padding:32px 40px">'
				+ '<div class="wpmp-prescan-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg></div>'
				+ '<h3 style="margin-bottom:8px">Nothing in Trash</h3>'
				+ '<p>Files you move to trash from the Scanner tab will appear here. You can restore or permanently delete them.</p>'
				+ '</div></div>'
			);
			return;
		}

		var rowsHtml = items.map( function ( item ) { return recoveryRowHtml( item ); } ).join( '' );

		setRoot( '<div class="wpmp-tab-panel wpmp-fade-up">'
			+ '<div class="wpmp-page-title-row"><div><h1>Recovery</h1>'
			+ '<div class="wpmp-page-subtitle">' + total.toLocaleString() + ' trashed file' + ( total !== 1 ? 's' : '' ) + ' &mdash; restore or delete permanently</div></div></div>'

			+ '<div class="wpmp-bulk-bar' + ( selCnt > 0 ? ' visible' : '' ) + '" id="rec-bulk-bar">'
			+ '<span class="count">' + selCnt + ' selected</span>'
			+ '<button class="wpmp-btn-ghost" id="btn-bulk-restore" style="font-size:12px">Restore Selected</button>'
			+ '<button class="wpmp-btn-danger" id="btn-bulk-perm-del" style="background:var(--wpmp-red);color:#fff;border-color:var(--wpmp-red);font-size:12px">Delete Permanently</button>'
			+ '<button class="wpmp-btn-ghost" id="btn-rec-clear" style="font-size:12px">Clear</button>'
			+ '</div>'

			+ '<div class="wpmp-recovery-grid" id="recovery-list">' + rowsHtml + '</div>'

			+ ( items.length < total
				? '<div style="text-align:center;margin-top:16px"><button class="wpmp-btn-ghost" id="btn-recovery-more">Load More</button></div>'
				: '' )
			+ '</div>'
		);

		var clearBtn = document.getElementById( 'btn-rec-clear' );
		if ( clearBtn ) { clearBtn.addEventListener( 'click', function () { state.trashedSelected = {}; renderRecovery(); } ); }

		var restoreBtn = document.getElementById( 'btn-bulk-restore' );
		if ( restoreBtn ) {
			restoreBtn.addEventListener( 'click', function () {
				var ids = Object.keys( state.trashedSelected ).map( Number );
				apiPost( 'media/restore', { ids: ids } ).then( function ( res ) {
					toast( res.message || 'Restored', 'success' );
					loadRecovery();
				} ).catch( function () { toast( 'Restore failed.', 'error' ); } );
			} );
		}

		var permDelBtn = document.getElementById( 'btn-bulk-perm-del' );
		if ( permDelBtn ) {
			permDelBtn.addEventListener( 'click', function () {
				var ids = Object.keys( state.trashedSelected ).map( Number );
				showModal( {
					type: 'delete', title: 'Delete Permanently?',
					desc: 'Permanently delete ' + ids.length + ' file(s). This cannot be undone.',
					confirmText: 'Yes, Delete Permanently',
					onConfirm: function () {
						apiPost( 'media/delete', { ids: ids } ).then( function ( res ) {
							toast( res.message || 'Deleted', 'success' );
							loadRecovery();
						} ).catch( function () { toast( 'Delete failed.', 'error' ); } );
					},
				} );
			} );
		}

		var moreBtn = document.getElementById( 'btn-recovery-more' );
		if ( moreBtn ) {
			moreBtn.addEventListener( 'click', function () {
				state.trashedPage++;
				apiGet( 'media/trashed?page=' + state.trashedPage + '&per_page=30' ).then( function ( data ) {
					state.trashedItems = state.trashedItems.concat( data.items || [] );
					renderRecovery();
				} );
			} );
		}

		bindRecoveryRowEvents();
	}

	function recoveryRowHtml( item ) {
		var isChecked   = !! state.trashedSelected[ item.attachment_id ];
		var trashedDate = item.trashed_date ? item.trashed_date.split( ' ' )[ 0 ] : '';
		return '<div class="wpmp-recovery-item" data-id="' + item.attachment_id + '">'
			+ '<div class="wpmp-checkbox-custom' + ( isChecked ? ' checked' : '' ) + '" data-rec-chk="' + item.attachment_id + '" role="checkbox" aria-checked="' + isChecked + '" tabindex="0">'
			+ '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
			+ '</div>'
			+ thumbHtml( item )
			+ '<div class="wpmp-media-info">'
			+ '<span class="wpmp-media-name">' + esc( item.filename || item.file_path ) + '</span>'
			+ '<div class="wpmp-media-meta">'
			+ '<span class="size">' + fmt( item.file_size ) + '</span>'
			+ ( trashedDate ? '<span class="dot"></span><span class="date">Trashed ' + esc( trashedDate ) + '</span>' : '' )
			+ '</div></div>'
			+ '<div class="wpmp-media-actions">'
			+ '<button class="wpmp-btn-ghost btn-rec-restore" data-id="' + item.attachment_id + '" style="font-size:12px;padding:6px 12px;color:var(--wpmp-green);border-color:#6EE7B7">Restore</button>'
			+ '<button class="wpmp-btn-danger btn-rec-delete" data-id="' + item.attachment_id + '" data-name="' + esc( item.filename || '' ) + '" style="font-size:12px;padding:6px 12px">Delete</button>'
			+ '</div></div>';
	}

	function bindRecoveryRowEvents() {
		document.querySelectorAll( '[data-rec-chk]' ).forEach( function ( chk ) {
			chk.addEventListener( 'click', function () {
				var id = parseInt( chk.getAttribute( 'data-rec-chk' ) );
				if ( state.trashedSelected[ id ] ) { delete state.trashedSelected[ id ]; } else { state.trashedSelected[ id ] = true; }
				renderRecovery();
			} );
		} );

		document.querySelectorAll( '.btn-rec-restore' ).forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				apiPost( 'media/restore', { ids: [ parseInt( btn.dataset.id ) ] } ).then( function ( res ) {
					toast( res.message || 'Restored', 'success' );
					loadRecovery();
				} ).catch( function () { toast( 'Restore failed.', 'error' ); } );
			} );
		} );

		document.querySelectorAll( '.btn-rec-delete' ).forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				var id   = parseInt( btn.dataset.id );
				var name = btn.dataset.name || '';
				showModal( {
					type: 'delete', title: 'Delete Permanently?',
					desc: 'This action cannot be undone.',
					meta: name, confirmText: 'Yes, Delete Permanently',
					onConfirm: function () {
						apiPost( 'media/delete', { ids: [ id ] } ).then( function ( res ) {
							toast( res.message || 'Deleted', 'success' );
							loadRecovery();
						} ).catch( function () { toast( 'Delete failed.', 'error' ); } );
					},
				} );
			} );
		} );
	}

	/* ============================================================
	   SETTINGS
	   ============================================================ */
	function loadSettings() {
		apiGet( 'settings' ).then( function ( s ) {
			state.settings = s;
			renderSettings( s );
		} ).catch( function () {
			setRoot( '<div class="wpmp-error">Failed to load settings.</div>' );
		} );
	}

	function renderSettings( s ) {
		var exts     = [ 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'mp3', 'pdf', 'doc', 'docx', 'zip' ];
		var excluded = s.exclude_file_types || [];

		var extTagsHtml = exts.map( function ( ext ) {
			return '<button class="wpmp-exclude-tag' + ( excluded.indexOf( ext ) !== -1 ? ' active' : '' ) + '" data-ext="' + ext + '" type="button">.' + esc( ext ) + '</button>';
		} ).join( '' );

		setRoot( '<div class="wpmp-tab-panel wpmp-fade-up">'
			+ '<div class="wpmp-page-title-row">'
			+ '<div><h1>Settings</h1><div class="wpmp-page-subtitle">Configure how Media Purge works on your site</div></div>'
			+ '<button class="wpmp-btn-primary" id="btn-save-settings">Save Settings</button>'
			+ '</div>'
			+ '<div class="wpmp-settings-grid">'

			// Card 1: Scanner
			+ '<div class="wpmp-settings-card"><h3>Scanner Settings</h3><p class="card-desc">Control which files are scanned</p>'
			+ toggleRow( 'skip_recent', 'Skip Recently Uploaded Files', 'Protect files uploaded within N days from being flagged', !! s.skip_recent )
			+ '<div class="wpmp-settings-field"><label for="recent_upload_days">Recent Upload Protection (days)</label>'
			+ '<input type="number" id="recent_upload_days" min="0" max="90" value="' + ( parseInt( s.recent_upload_days ) || 30 ) + '"></div>'
			+ toggleRow( 'scan_woocommerce', 'Scan WooCommerce Galleries', 'Include WooCommerce product gallery images', !! s.scan_woocommerce, ! wpmpAdmin.hasWooCommerce )
			+ '</div>'

			// Card 2: Cleanup
			+ '<div class="wpmp-settings-card"><h3>Trash &amp; Cleanup</h3><p class="card-desc">Retention and batch-size controls</p>'
			+ '<div class="wpmp-settings-field"><label for="trash_retention_days">Trash Retention (days)</label>'
			+ '<input type="number" id="trash_retention_days" min="7" max="365" value="' + ( parseInt( s.trash_retention_days ) || 30 ) + '"></div>'
			+ '<div class="wpmp-settings-field"><label for="batch_size">Scan Batch Size</label>'
			+ '<input type="number" id="batch_size" min="50" max="500" value="' + ( parseInt( s.batch_size ) || 200 ) + '"></div>'
			+ '</div>'

			// Card 3: Exclude types
			+ '<div class="wpmp-settings-card" style="grid-column:1/-1"><h3>Exclude File Types</h3><p class="card-desc">Click a type to exclude it from future scans</p>'
			+ '<div class="wpmp-exclude-tags" id="exclude-tags">' + extTagsHtml + '</div>'
			+ '</div>'

			+ '</div></div>'
		);

		// Toggle buttons
		document.querySelectorAll( '[data-toggle]' ).forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				if ( btn.disabled ) { return; }
				var key = btn.dataset.toggle;
				state.settings[ key ] = ! state.settings[ key ];
				btn.classList.toggle( 'on', !! state.settings[ key ] );
			} );
		} );

		// Exclude tags
		document.querySelectorAll( '.wpmp-exclude-tag' ).forEach( function ( tag ) {
			tag.addEventListener( 'click', function () {
				var ext  = tag.dataset.ext;
				var list = state.settings.exclude_file_types || [];
				var idx  = list.indexOf( ext );
				if ( idx !== -1 ) {
					list.splice( idx, 1 );
					tag.classList.remove( 'active' );
				} else {
					list.push( ext );
					tag.classList.add( 'active' );
				}
				state.settings.exclude_file_types = list;
			} );
		} );

		// Save
		document.getElementById( 'btn-save-settings' ).addEventListener( 'click', function () {
			var payload = {
				skip_recent:           !! state.settings.skip_recent,
				scan_woocommerce:      !! state.settings.scan_woocommerce,
				recent_upload_days:    parseInt( document.getElementById( 'recent_upload_days' ).value ) || 30,
				trash_retention_days:  parseInt( document.getElementById( 'trash_retention_days' ).value ) || 30,
				batch_size:            parseInt( document.getElementById( 'batch_size' ).value ) || 200,
				exclude_file_types:    state.settings.exclude_file_types || [],
			};
			apiPost( 'settings', payload ).then( function () {
				toast( 'Settings saved.', 'success' );
			} ).catch( function () {
				toast( 'Failed to save settings.', 'error' );
			} );
		} );
	}

	function toggleRow( key, label, desc, isOn, disabled ) {
		return '<div class="wpmp-toggle-row">'
			+ '<div class="wpmp-toggle-info"><div class="wpmp-toggle-label"><span>' + esc( label ) + '</span></div>'
			+ '<div class="wpmp-toggle-desc">' + esc( desc ) + '</div></div>'
			+ '<button class="wpmp-toggle' + ( isOn ? ' on' : '' ) + ( disabled ? ' disabled' : '' ) + '" data-toggle="' + key + '" type="button"' + ( disabled ? ' disabled aria-disabled="true"' : '' ) + '>'
			+ '<span class="wpmp-toggle-knob"></span></button>'
			+ '</div>';
	}

	/* ============================================================
	   STATUS
	   ============================================================ */
	function loadStatus() {
		apiGet( 'health' ).then( function ( data ) {
			renderStatus( data.checks || {} );
		} ).catch( function () {
			setRoot( '<div class="wpmp-error">Failed to load system status.</div>' );
		} );
	}

	function renderStatus( checks ) {
		function iconFor( s ) {
			if ( s === 'ok' ) {
				return '<svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" style="width:18px;height:18px;flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>';
			}
			if ( s === 'error' ) {
				return '<svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5" style="width:18px;height:18px;flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
			}
			if ( s === 'warning' ) {
				return '<svg viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.5" style="width:18px;height:18px;flex-shrink:0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
			}
			return '<svg viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2.5" style="width:18px;height:18px;flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
		}
		function bgFor( s ) {
			return s === 'ok' ? 'var(--wpmp-green-light,#F0FDF4)' : s === 'error' ? 'var(--wpmp-red-light,#FEF2F2)' : s === 'warning' ? '#FFFBEB' : 'var(--wpmp-gray1)';
		}
		function borderFor( s ) {
			return s === 'ok' ? '#6EE7B7' : s === 'error' ? '#FCA5A5' : s === 'warning' ? '#FCD34D' : 'var(--wpmp-gray3)';
		}

		var rows = Object.keys( checks ).map( function ( k ) {
			var c = checks[ k ];
			return '<div style="display:flex;align-items:flex-start;gap:14px;padding:14px 18px;border-radius:12px;background:' + bgFor( c.status ) + ';border:1px solid ' + borderFor( c.status ) + ';margin-bottom:10px">'
				+ iconFor( c.status )
				+ '<div><div style="font-size:13px;font-weight:700;color:var(--wpmp-gray8,#1E293B);margin-bottom:3px">' + esc( c.label ) + '</div>'
				+ '<div style="font-size:12px;color:var(--wpmp-gray6,#475569);line-height:1.5">' + esc( c.note ) + '</div></div>'
				+ '</div>';
		} ).join( '' );

		setRoot( '<div class="wpmp-tab-panel wpmp-fade-up">'
			+ '<div class="wpmp-page-title-row"><div><h1>Status</h1><div class="wpmp-page-subtitle">System health &amp; plugin checks</div></div>'
			+ '<button class="wpmp-btn-ghost" id="btn-refresh-status" style="font-size:12px">Refresh</button></div>'
			+ '<div style="max-width:700px">'
			+ ( rows || '<div style="color:var(--wpmp-gray5);font-size:13px">No health data available.</div>' )
			+ '</div></div>'
		);

		document.getElementById( 'btn-refresh-status' ).addEventListener( 'click', function () {
			showLoading( 'Checking status\u2026' );
			loadStatus();
		} );
	}

	/* ============================================================
	   ABOUT
	   ============================================================ */
	function renderAbout() {
		setRoot( '<div class="wpmp-tab-panel wpmp-fade-up" style="max-width:680px">'
			+ '<div class="wpmp-page-title-row"><div><h1>About Media Purge</h1><div class="wpmp-page-subtitle">Version ' + esc( wpmpAdmin.pluginVersion ) + ' &mdash; GPL-2.0-or-later &mdash; Free</div></div></div>'

			+ '<div class="wpmp-storage-card" style="margin-bottom:16px"><h3>What We Scan</h3>'
			+ '<ul style="margin:10px 0 0;padding-left:20px;font-size:13px;color:var(--wpmp-gray7,#334155);line-height:2">'
			+ '<li>All post and page content (including shortcodes)</li>'
			+ '<li>Featured images and custom fields / post meta</li>'
			+ '<li>Widget areas and theme customizer settings</li>'
			+ '<li>Page builders: Elementor, Divi, WPBakery, Beaver Builder</li>'
			+ '<li>WooCommerce product galleries</li>'
			+ '<li>Serialized data and complex meta fields</li>'
			+ '</ul></div>'

			+ '<div class="wpmp-storage-card" style="margin-bottom:16px"><h3>Safety-First Philosophy</h3>'
			+ '<ul style="margin:10px 0 0;padding-left:20px;font-size:13px;color:var(--wpmp-gray7,#334155);line-height:2">'
			+ '<li>Nothing is ever deleted automatically &mdash; you always review first</li>'
			+ '<li>All trashed files are recoverable within your retention window</li>'
			+ '<li>Recently uploaded files are protected from being flagged</li>'
			+ '<li>Whitelist any file to permanently protect it from cleanup</li>'
			+ '</ul></div>'

			+ '<div class="wpmp-storage-card"><h3>Links &amp; Support</h3>'
			+ '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:12px">'
			+ '<a href="https://wordpress.org/support/plugin/wp-media-purge/" target="_blank" rel="noopener" class="wpmp-btn-ghost" style="text-decoration:none;font-size:12px">Support Forum</a>'
			+ '<a href="https://wordpress.org/plugins/wp-media-purge/#reviews" target="_blank" rel="noopener" class="wpmp-btn-ghost" style="text-decoration:none;font-size:12px">Leave a Review &#x2665;</a>'
			+ '</div></div>'
			+ '</div>'
		);
	}

	/* ============================================================
	   INIT
	   ============================================================ */
	function init() {
		if ( typeof wpmpAdmin === 'undefined' ) {
			return;
		}

		// Wire up tab click handlers.
		document.querySelectorAll( '.wpmp-tab' ).forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				var tab = btn.dataset.tab;
				if ( tab ) { switchTab( tab ); }
			} );
		} );

		// Load the default dashboard tab.
		loadDashboard();
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}

} )();
