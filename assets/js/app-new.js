/* Podbean — application core */
(function () {
  'use strict';

  /* ============================== utilities ============================== */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const nf = new Intl.NumberFormat('en-US');
  const cf = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
  const dfLong = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dfShort = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  const dfTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
  const dfLong2 = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function num(n) { return n == null ? '—' : nf.format(n); }
  function compact(n) { return cf.format(n); }
  function money(n) { return Number(n || 0).toFixed(2); }
  function fmtDate(iso) { return dfLong.format(new Date(iso)); }
  function fmtShort(iso) { return dfShort.format(new Date(iso)); }
  function fmtTime(iso) { return dfTime.format(new Date(iso)); }
  function fmtDateTime(iso) { return fmtDate(iso) + ' · ' + fmtTime(iso); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function fmtStamp(iso) {
    const d = new Date(iso);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' +
      pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }
  function fmtDay(iso) {
    const d = new Date(iso);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function todayISO() { return new Date().toISOString(); }
  function slugify(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
  }
  function plural(n, single, many) { return n + ' ' + (n === 1 ? single : (many || single + 's')); }

  const AVATAR_PALETTES = [
    ['#f4c9a6', '#d07c56'],
    ['#c8d4fb', '#7489dc'],
    ['#f6cede', '#c9739d'],
    ['#c5e9d4', '#55a878'],
    ['#e4d2f7', '#9470c4'],
    ['#f6e1a8', '#c89a3d'],
    ['#f4c7c2', '#c46a64'],
    ['#c5e7ea', '#4b98a2'],
    ['#d9dce2', '#737b89'],
    ['#e8d7c8', '#a98468']
  ];

  function initials(name) {
    const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const ASSET_BASE = window.PB_ASSET_BASE != null ? window.PB_ASSET_BASE : 'assets-new/';
  const PROFILE_PHOTO = ASSET_BASE + 'img/danita-profile.jpg';
  const PROFILE_PHOTO_FALLBACK = ASSET_BASE + 'img/people/w12.jpg';

  function photoAvatar(size, extraClass) {
    const s = size || 36;
    const sizeCls = [32, 36, 40, 44, 52].indexOf(s) >= 0 ? ' avatar-' + s : '';
    const cls = extraClass ? ' ' + extraClass : '';
    const style = sizeCls ? '' : 'width:' + s + 'px;height:' + s + 'px;';
    return '<span class="avatar avatar-photo member-photo' + sizeCls + cls + '" style="' + style + '" aria-hidden="true">' +
      '<span class="member-photo-fallback">DA</span>' +
      '<img src="' + PROFILE_PHOTO + '" alt="" loading="lazy" style="object-position:center 0%" data-fb="' + PROFILE_PHOTO_FALLBACK + '" onerror="if(this.dataset.fb){this.src=this.dataset.fb;delete this.dataset.fb}else{this.remove()}">' +
      '</span>';
  }

  function avatar(name, size, extraClass) {
    if (data && data.currentUser && name === data.currentUser.name) return photoAvatar(size, extraClass);
    const s = size || 36;
    let hash = 0;
    for (let i = 0; i < String(name).length; i++) hash = (hash * 31 + String(name).charCodeAt(i)) >>> 0;
    const p = AVATAR_PALETTES[hash % AVATAR_PALETTES.length];
    const cls = extraClass ? ' ' + extraClass : '';
    const sizeCls = [32, 36, 40, 44, 52].indexOf(s) >= 0 ? ' avatar-' + s : '';
    const style = '--av1:' + p[0] + ';--av2:' + p[1] + (sizeCls ? '' : ';width:' + s + 'px;height:' + s + 'px;font-size:' + Math.round(s * 0.3) + 'px');
    return '<span class="avatar' + sizeCls + cls + '" style="' + style + '" aria-hidden="true">' + esc(initials(name)) + '</span>';
  }

  function statusPill(status) {
    const map = {
      live: ['Live', 'status-live', true],
      scheduled: ['Scheduled', 'status-scheduled', false],
      finished: ['Finished', 'status-finished', false],
      expired: ['Expired', 'status-expired', false]
    };
    const s = map[status] || [status, 'status-finished', false];
    return '<span class="pill ' + s[1] + '">' + (s[2] ? '<span class="dot"></span>' : '') + s[0] + '</span>';
  }

  function visPill(visibility) {
    const map = {
      public: ['Public', 'vis-public', 'globe'],
      private: ['Private', 'vis-private', 'lock'],
      unlisted: ['Unlisted', 'vis-unlisted', 'link']
    };
    const v = map[visibility] || map.public;
    return '<span class="vis-pill ' + v[1] + '">' + icon(v[2]) + v[0] + '</span>';
  }

  function coin(value, cls) {
    if (value == null) return '<span class="cell-subtle">—</span>';
    return '<span class="coin-amount ' + (cls || '') + '">' + icon('coins') + num(value) + '</span>';
  }

  function heart(value) {
    if (value == null) return '<span class="cell-subtle">—</span>';
    return '<span class="heart-amount">' + icon('heart-filled') + num(value) + '</span>';
  }

  function delta(text, cls) {
    const down = String(text).trim().charAt(0) === '-';
    const flat = String(text).trim() === '0%';
    return '<span class="delta ' + (down ? 'down' : flat ? 'flat' : '') + (cls ? ' ' + cls : '') + '">' + esc(text) + '</span>';
  }

  function emptyDocument() {
    return '<div class="empty-illustration" aria-hidden="true"><svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">' +
      '<rect x="34" y="15" width="38" height="52" rx="5"/>' +
      '<path d="M43 28h20M43 37h20M43 46h13"/>' +
      '<rect x="21" y="29" width="36" height="47" rx="5" fill="#fff"/>' +
      '<path d="M30 42h18M30 51h18M30 60h11"/>' +
      '</svg></div>';
  }

  function emptyCoins() {
    return '<div class="empty-illustration" aria-hidden="true"><svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round">' +
      '<ellipse cx="48" cy="30" rx="25" ry="9"/>' +
      '<path d="M23 30v10c0 5 11 9 25 9s25-4 25-9V30"/>' +
      '<path d="M23 43v10c0 5 11 9 25 9s25-4 25-9V43"/>' +
      '<path d="M23 56v10c0 5 11 9 25 9s25-4 25-9V56"/>' +
      '</svg></div>';
  }

  function emptySearch() {
    return '<div class="empty-illustration" aria-hidden="true"><svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' +
      '<circle cx="43" cy="43" r="20"/>' +
      '<path d="m58 58 15 15"/>' +
      '<path d="M36 43h14M43 36v14"/>' +
      '</svg></div>';
  }

  /* ============================== state ============================== */
  const STORAGE_KEY = 'podbean-live-demo-new-v1';
  const COLLAPSE_KEY = 'podbean-live-sidebar-collapsed-new';

  function loadData() {
    const defaults = window.createDefaultData();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const stored = JSON.parse(raw);
      return Object.assign(defaults, stored);
    } catch (err) {
      console.warn('Could not read saved demo data.', err);
      return defaults;
    }
  }

  let data = loadData();
  if (!data.liveRoomUrl) data.liveRoomUrl = 'https://live.podbean.com/room/podbean-live';

  const ui = {
    lastPath: null,
    lastSearch: '',
    showsQuery: '',
    showsStatus: 'all',
    showsPage: 1,
    earningsQuery: '',
    earningsRange: '90',
    earningsPage: 1,
    giftPage: 1,
    payoutPage: 1,
    memberQuery: '',
    membersPage: 1,
    statsRange: '30d',
    newShowStep: 1,
    newShowDraft: null,
    liveRoomTimer: null,
    openGroups: new Set(),
    closedGroups: new Set(),
    activeGroup: null,
    charts: {},
    postImage: null,
    floatingMenus: [],
    pendingConfirm: null,
    pendingAction: null
  };

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.warn('Could not save demo data (storage full?).', err);
      return false;
    }
  }

  function show(id) { return data.shows.find(function (s) { return s.id === id; }) || data.shows[0]; }
  function roomUrlFor(showObj) {
    const base = data.liveRoomUrl || 'https://live.podbean.com/room/podbean-live';
    const key = showObj ? slugify(showObj.title) || showObj.id : 'podbean-live';
    return base.replace(/\/$/, '') + '/' + key;
  }

  /* Stable, shareable-looking Podbean live URL (same shape as the share sheet mockup). */
  function shareToken(seed, len) {
    let h = 2166136261;
    const str = 'podbean-live:' + seed;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let n = h;
    let out = '';
    for (let i = 0; i < len; i++) {
      n = (Math.imul(n, 1103515245) + 12345) >>> 0;
      out += alphabet[n % alphabet.length];
    }
    return out;
  }
  function shareUrlFor(showObj) {
    const id = (showObj && (showObj.id || showObj.title)) || 'live';
    const slug = (showObj && showObj.shareSlug) || shareToken(id, 11);
    return 'https://www.podbean.com/lsw/' + slug + '?isid=' + shareToken(id + ':broadcast', 8);
  }

  /* ============================== toast / modal ============================== */
  function toast(message, type) {
    const root = $('#toast-root');
    const el = document.createElement('div');
    el.className = 'toast ' + (type || 'success');
    const ico = type === 'error' ? 'alert' : 'check';
    el.innerHTML = '<span class="toast-ico">' + icon(ico) + '</span><span>' + esc(message) + '</span>';
    root.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 220);
    }, 3200);
  }

  function modalShell(opts) {
    return '<div class="modal-backdrop" data-action="modal-backdrop">' +
      '<div class="modal' + (opts.wide ? ' modal-wide' : '') + (opts.className ? ' ' + opts.className : '') + '" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<div class="modal-head"><div class="modal-head-main">' +
      '<h2 class="modal-title" id="modal-title">' + esc(opts.title) + '</h2>' +
      (opts.desc ? '<p class="modal-desc">' + opts.desc + '</p>' : '') +
      (opts.note ? '<p class="modal-desc modal-desc-note">' + opts.note + '</p>' : '') +
      '</div><button class="modal-close" data-action="close-modal" aria-label="Close dialog">' + icon('x') + '</button></div>' +
      (opts.body ? '<div class="modal-body">' + opts.body + '</div>' : '') +
      (opts.foot ? '<div class="modal-foot">' + opts.foot + '</div>' : '') +
      '</div></div>';
  }

  function openModal(html) {
    closeAllMenus();
    const root = $('#modal-root');
    root.innerHTML = html;
    document.body.classList.add('modal-open');
    setTimeout(function () {
      const target = root.querySelector('[data-autofocus]') || root.querySelector('input:not([type="hidden"]), select, textarea') || root.querySelector('.btn-primary') || root.querySelector('button');
      if (target) {
        target.focus();
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          try {
            const len = target.value ? target.value.length : 0;
            target.setSelectionRange(len, len);
          } catch (err) { /* types without selection support */ }
        }
      }
    }, 40);
  }

  function closeModal() {
    const root = $('#modal-root');
    if (!root.firstChild) return;
    root.innerHTML = '';
    document.body.classList.remove('modal-open');
    ui.pendingConfirm = null;
  }

  function confirmModal(opts) {
    ui.pendingConfirm = opts.onConfirm;
    openModal(modalShell({
      title: opts.title,
      desc: opts.desc,
      className: opts.className || '',
      body: opts.icon ? '<div class="modal-illustration ' + (opts.tone === 'danger' ? 'danger' : '') + '">' + icon(opts.icon) + '</div>' : '',
      foot: '<button class="btn btn-secondary" data-action="close-modal">' + esc(opts.cancelLabel || 'Cancel') + '</button>' +
        '<button class="btn ' + (opts.tone === 'danger' ? 'btn-danger' : 'btn-primary') + '" data-action="run-confirm">' + esc(opts.confirmLabel || 'Delete') + '</button>'
    }));
  }

  /* ============================== clipboard / download ============================== */
  function copyText(text) {
    const done = function () { toast('Copied to clipboard'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        toast('Copy failed — select the text and copy manually.', 'error');
      });
      return;
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      done();
    } catch (err) {
      toast('Copy failed — select the text and copy manually.', 'error');
    }
  }

  function downloadCSV(filename, rows) {
    const csv = rows.map(function (row) {
      return row.map(function (cell) {
        const s = String(cell == null ? '' : cell);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',');
    }).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast('Export downloaded');
  }

  /* ============================== chart engine ============================== */
  const METRIC_CONFIG = {
    listeners: { label: 'Listeners', value: '190', delta: '+12%', seed: 7, min: 120, max: 235, accent: '#20b26b', totalFmt: function (v) { return num(v); }, yFmt: function (v) { return num(v); } },
    'live-hours': { label: 'Live Hours', value: '15H', delta: '+8%', seed: 13, min: 6, max: 28, accent: '#3b82f6', totalFmt: function (v) { return num(v) + 'h'; }, yFmt: function (v) { return num(v); } },
    engagement: { label: 'Engagement', value: '3.6K', delta: '+12%', seed: 21, min: 2400, max: 5200, accent: '#8b5cf6', totalFmt: function (v) { return compact(v); }, yFmt: function (v) { return compact(v); } },
    podpoints: { label: 'PodPoints', value: '680', delta: '+9%', seed: 33, min: 380, max: 980, accent: '#eba51a', totalFmt: function (v) { return num(v); }, yFmt: function (v) { return num(v); } }
  };
  const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90 };
  const RANGE_LABELS = { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days' };

  function seededSeries(seed, n, min, max) {
    let s = seed * 9301 + 49297;
    const rnd = function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    let v = min + (max - min) * 0.42;
    const arr = [];
    for (let i = 0; i < n; i++) {
      v += (rnd() - 0.43) * (max - min) * 0.22;
      v = Math.max(min, Math.min(max, v));
      arr.push(Math.round(v));
    }
    return arr;
  }

  function buildStats(metricId, rangeKey) {
    const cfg = METRIC_CONFIG[metricId] || METRIC_CONFIG.listeners;
    const days = RANGE_DAYS[rangeKey] || 30;
    const n = rangeKey === '7d' ? 7 : rangeKey === '90d' ? 18 : 15;
    const points = seededSeries(cfg.seed + days, n, cfg.min, cfg.max);
    const prev = points.map(function (v, i) {
      return Math.max(Math.round(cfg.min * 0.55), Math.round(v * (0.72 + 0.1 * Math.sin(i * 1.4 + cfg.seed))));
    });
    const labels = [];
    const dates = [];
    const end = new Date();
    const start = new Date(end.getTime() - (days - 1) * 86400000);
    for (let i = 0; i < n; i++) {
      const d = new Date(start.getTime() + ((days - 1) * i) / (n - 1) * 86400000);
      labels.push((d.getMonth() + 1) + '/' + d.getDate());
      dates.push(d.toISOString());
    }
    const total = points.reduce(function (a, b) { return a + b; }, 0);
    const prevEnd = new Date(start.getTime() - 86400000);
    const prevStart = new Date(prevEnd.getTime() - (days - 1) * 86400000);
    const rangeLine = dfLong.format(start) + ' - ' + dfLong.format(end) + ' vs. ' + dfLong.format(prevStart) + ' - ' + dfLong.format(prevEnd);
    const showsInRange = (data.shows || []).filter(function (sh) {
      if (!sh.date) return false;
      const t = new Date(sh.date).getTime();
      return t >= start.getTime() && t <= end.getTime();
    }).length;
    return {
      cfg: cfg,
      rangeLine: rangeLine,
      showsInRange: showsInRange,
      points: points,
      prev: prev,
      labels: labels,
      dates: dates,
      total: total,
      totalText: cfg.totalFmt(total),
      rangeText: dfShort.format(start) + ' – ' + dfShort.format(end) + ', ' + end.getFullYear(),
      rangeKey: rangeKey,
      days: days,
      deltaText: '+' + (10 + (cfg.seed % 5)) + '.' + (cfg.seed % 9) + '%'
    };
  }

  function chartSVG(stats) {
    const id = 'chart-' + Math.random().toString(36).slice(2, 9);
    const W = 1000, H = 320, L = 34, R = 0, T = 18, B = 38;
    const PW = W - L - R, PH = H - T - B;
    const n = stats.points.length;
    const accent = stats.cfg.accent;
    const rawMax = Math.max.apply(null, stats.points.concat(stats.prev));
    const intervals = 6;
    const rawStep = (rawMax * 1.08) / intervals;
    const unit = rawStep < 10 ? 5 : rawStep < 100 ? 10 : 100;
    const step = Math.max(unit, Math.ceil(rawStep / unit) * unit);
    const yMax = step * intervals || 1;
    const x = function (i) { return L + (n === 1 ? PW / 2 : (i / (n - 1)) * PW); };
    const y = function (v) { return T + PH - (v / yMax) * PH; };
    const linePath = function (arr) {
      return arr.map(function (v, i) { return (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
    };
    const areaPath = linePath(stats.points) + ' L' + x(n - 1).toFixed(1) + ' ' + (T + PH) + ' L' + x(0).toFixed(1) + ' ' + (T + PH) + ' Z';
    const ticks = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1];
    let grid = '';
    ticks.forEach(function (f) {
      const gv = yMax * f;
      const gy = y(gv);
      grid += '<line class="grid-line" x1="' + L + '" y1="' + gy.toFixed(1) + '" x2="' + (W - R) + '" y2="' + gy.toFixed(1) + '"/>';
      grid += '<text class="axis-label-y" x="0" y="' + (gy + 2.6).toFixed(1) + '" text-anchor="start">' + stats.cfg.yFmt(Math.round(gv)) + '</text>';
    });
    let xLabels = '';
    const labelIdx = n <= 7 ? Array.from({ length: n }, function (_, i) { return i; }) : [0, Math.round((n - 1) / 4), Math.round((n - 1) / 2), Math.round(3 * (n - 1) / 4), n - 1];
    labelIdx.forEach(function (i) {
      xLabels += '<text class="axis-label-x" x="' + x(i).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="' + (i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle') + '">' + esc(stats.labels[i]) + '</text>';
    });
    const lastX = x(n - 1), lastY = y(stats.points[n - 1]);

    ui.charts[id] = {
      points: stats.points,
      prev: stats.prev,
      labels: stats.labels,
      dates: stats.dates || [],
      accent: accent,
      cfg: stats.cfg,
      L: L, R: R, T: T, B: B, W: W, H: H, PW: PW, PH: PH, yMax: yMax, n: n,
      valueFmt: stats.cfg.yFmt
    };

    return '<svg class="line-chart" data-chart="' + id + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(stats.cfg.label) + ' trend chart">' +
      '<defs><linearGradient id="' + id + '-fill" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + accent + '" stop-opacity="0.08"/>' +
      '<stop offset="72%" stop-color="' + accent + '" stop-opacity="0.02"/>' +
      '<stop offset="100%" stop-color="' + accent + '" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      grid +
      '<line class="axis-line" x1="' + L + '" y1="' + (T + PH) + '" x2="' + (W - R) + '" y2="' + (T + PH) + '"/>' +
      '<path d="' + areaPath + '" fill="url(#' + id + '-fill)"/>' +
      '<path class="prev-line" d="' + linePath(stats.prev) + '"/>' +
      '<path class="series-line" d="' + linePath(stats.points) + '" stroke="' + accent + '"/>' +
      '<circle cx="' + lastX.toFixed(1) + '" cy="' + lastY.toFixed(1) + '" r="2.2" fill="' + accent + '" fill-opacity="0.6" stroke="#fff" stroke-width="1.2"/>' +
      xLabels +
      '<g class="hover-layer" style="opacity:0">' +
      '<line class="hover-line" x1="0" y1="' + T + '" x2="0" y2="' + (T + PH) + '"/>' +
      '<circle class="hover-dot" cx="0" cy="0" r="4.5" fill="' + accent + '"/>' +
      '</g>' +
      '</svg>';
  }

  function sparkline(values, color) {
    const W = 140, H = 34;
    const max = Math.max.apply(null, values), min = Math.min.apply(null, values);
    const span = max - min || 1;
    const pts = values.map(function (v, i) {
      return (i / (values.length - 1)) * W + ',' + (H - 4 - ((v - min) / span) * (H - 8));
    });
    const path = pts.map(function (p) { return p; }).join(' ');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<polygon points="0,' + H + ' ' + path + ' ' + W + ',' + H + '" fill="' + color + '" opacity="0.08"/>' +
      '<polyline points="' + path + '" fill="none" stroke="' + color + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
      '</svg>';
  }

  function mountCharts() {
    $$('[data-chart]').forEach(function (svg) {
      const meta = ui.charts[svg.dataset.chart];
      if (!meta) return;
      const wrap = svg.closest('.chart-wrap');
      const tooltip = wrap ? wrap.querySelector('.chart-tooltip') : null;
      const layer = svg.querySelector('.hover-layer');
      const line = svg.querySelector('.hover-line');
      const dot = svg.querySelector('.hover-dot');
      if (!tooltip || !layer) return;

      function move(ev) {
        const rect = svg.getBoundingClientRect();
        const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
        const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
        const xv = ((clientX - rect.left) / rect.width) * meta.W;
        let idx = Math.round(((xv - meta.L) / meta.PW) * (meta.n - 1));
        idx = Math.max(0, Math.min(meta.n - 1, idx));
        const px = meta.L + (idx / (meta.n - 1)) * meta.PW;
        const py = meta.T + meta.PH - (meta.points[idx] / meta.yMax) * meta.PH;
        line.setAttribute('x1', px);
        line.setAttribute('x2', px);
        dot.setAttribute('cx', px);
        dot.setAttribute('cy', py);
        layer.style.opacity = '1';

        const wrapRect = wrap.getBoundingClientRect();
        const left = (px / meta.W) * rect.width + (rect.left - wrapRect.left);
        const top = (py / meta.H) * rect.height + (rect.top - wrapRect.top) - 10;
        const clampLeft = Math.max(70, Math.min(wrapRect.width - 70, left));
        tooltip.style.left = clampLeft + 'px';
        tooltip.style.top = top + 'px';
        const iso = meta.dates && meta.dates[idx];
        const d = iso ? new Date(iso) : null;
        const dayName = d ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()] : '';
        const fullDate = d ? dfLong.format(d) : esc(meta.labels[idx]);
        const val = meta.points[idx];
        const ttRow = function (label, value, cls) {
          return '<div class="tt-row' + (cls ? ' ' + cls : '') + '"><span>' + esc(label) + '</span><span>' + esc(value) + '</span></div>';
        };
        const isHours = meta.cfg.label === 'Live Hours';
        const valueText = isHours ? num(val) + 'h' : meta.valueFmt(val);
        let rows = '';
        rows = ttRow(meta.cfg.label, valueText) + ttRow('Previous', meta.valueFmt(meta.prev[idx]), 'tt-sub');
        tooltip.innerHTML =
          '<div class="tt-day">' + esc(dayName) + '</div>' +
          '<div class="tt-date">' + esc(fullDate) + '</div>' +
          rows;
        tooltip.classList.add('show');
      }
      function leave() {
        layer.style.opacity = '0';
        tooltip.classList.remove('show');
      }
      svg.addEventListener('pointermove', move);
      svg.addEventListener('pointerleave', leave);
      svg.addEventListener('touchmove', move, { passive: true });
    });
  }

  /* ============================== shell ============================== */
  const NAV = [
    {
      id: 'shows', label: 'Live Shows', icon: 'broadcast', route: '/shows'
    },
    {
      id: 'statistics', label: 'Statistics', icon: 'trend', route: '/statistics/listeners'
    },
    {
      id: 'payments', label: 'Payments', icon: 'money-bag', route: '/payments/earnings',
      children: [
        { label: 'Earnings', route: '/payments/earnings' },
        { label: 'Payouts', route: '/payments/payouts' }
      ]
    },
    {
      id: 'fanclub', label: 'Fan Club', icon: 'users', route: '/fanclub/community',
      children: [
        { label: 'Community', route: '/fanclub/community' },
        { label: 'Members', route: '/fanclub/members' }
      ]
    }
  ];

  function activeNav(path) {
    if (path.indexOf('/shows') === 0) return { group: 'shows', sub: null };
    if (path.indexOf('/statistics') === 0) return { group: 'statistics', sub: null };
    if (path.indexOf('/payments/earnings') === 0) return { group: 'payments', sub: 'Earnings' };
    if (path.indexOf('/payments/payouts') === 0) return { group: 'payments', sub: 'Payouts' };
    if (path.indexOf('/fanclub/community') === 0) return { group: 'fanclub', sub: 'Community' };
    if (path.indexOf('/fanclub/members') === 0) return { group: 'fanclub', sub: 'Members' };
    return { group: 'shows', sub: null };
  }

  function renderSidebar(r) {
    const active = activeNav(r.path);
    if (ui.activeGroup !== active.group) {
      ui.closedGroups.clear();
      ui.activeGroup = active.group;
    }
    const html = NAV.map(function (group) {
      const isActiveGroup = group.id === active.group;
      if (!group.children) {
        return '<a class="nav-item' + (isActiveGroup ? ' active' : '') + '" href="#' + group.route + '"' +
          (isActiveGroup ? ' aria-current="page"' : '') + ' title="' + esc(group.label) + '">' +
          icon(group.icon) + '<span class="nav-label">' + esc(group.label) + '</span></a>';
      }
      const isOpen = isActiveGroup && !ui.closedGroups.has(group.id);
      const subs = group.children.map(function (sub) {
        const isActive = isActiveGroup && active.sub === sub.label;
        return '<a class="nav-sub-link' + (isActive ? ' active' : '') + '" href="#' + sub.route + '"' + (isActive ? ' aria-current="page"' : '') + '>' + esc(sub.label) + '</a>';
      }).join('');
      return '<div class="nav-group' + (isOpen ? ' open' : '') + '" data-nav-group="' + group.id + '">' +
        '<button class="nav-item' + (isActiveGroup ? ' active' : '') + '" data-action="nav-group" data-group="' + group.id + '" data-route="' + group.route + '" aria-expanded="' + (isOpen ? 'true' : 'false') + '" title="' + esc(group.label) + '">' +
        icon(group.icon) + '<span class="nav-label">' + esc(group.label) + '</span>' + icon('chevron-down', 'nav-chevron') +
        '</button>' +
        '<div class="nav-sub"><div><div class="nav-sub-inner">' + subs + '</div></div></div>' +
        '</div>';
    }).join('');
    $('#side-nav').innerHTML = html;
  }

  function renderChrome(r) {
    renderSidebar(r);
    const user = data.currentUser;
    $('#header-name').textContent = user.name;
    const headerAvatar = $('#header-avatar');
    if (headerAvatar) {
      headerAvatar.outerHTML = avatar(user.name, 32).replace('class="avatar', 'id="header-avatar" class="avatar');
    }

    $('#profile-menu').innerHTML =
      '<div class="menu-profile">' + avatar(user.name, 36) +
      '<div class="menu-profile-text"><strong>' + esc(user.name) + '</strong><span>' + esc(user.email) + '</span></div></div>' +
      '<div class="menu-sep"></div>' +
      '<button class="menu-item" role="menuitem" data-action="account-settings">' + icon('user') + 'Account Settings</button>' +
      '<button class="menu-item" role="menuitem" data-action="open-help">' + icon('help') + 'Help &amp; Support</button>' +
      '<button class="menu-item" role="menuitem" data-action="reset-demo">' + icon('refresh') + 'Reset Demo Data</button>' +
      '<div class="menu-sep"></div>' +
      '<button class="menu-item danger" role="menuitem" data-action="log-out">' + icon('log-out') + 'Log Out</button>';

    const unread = data.notifications.some(function (n) { return n.unread; });
    $('#notif-dot').classList.toggle('show', unread && !data.notificationsRead);
    $('#notifications-menu').innerHTML =
      '<div class="notif-head"><strong>Notifications</strong><button data-action="mark-all-read">Mark all read</button></div>' +
      data.notifications.map(function (n) {
        return '<button class="notif-item' + (n.unread ? ' unread' : '') + '" data-action="notif-click" data-id="' + n.id + '">' +
          '<span class="notif-ico">' + icon(n.icon) + '</span>' +
          '<span class="notif-body"><strong>' + esc(n.title) + '</strong><p>' + esc(n.text) + '</p><span>' + esc(n.time) + '</span></span>' +
          '</button>';
      }).join('');
  }

  /* ============================== menus ============================== */
  function toggleMenu(btn) {
    const wrap = btn.closest('.menu-wrap');
    if (!wrap) return;
    const menu = wrap.querySelector('.menu');
    if (!menu) return;
    const isOpen = menu.classList.contains('open');
    closeAllMenus();
    if (isOpen) return;

    if (wrap.hasAttribute('data-menu-fixed')) {
      const btnRect = btn.getBoundingClientRect();
      document.body.appendChild(menu);
      menu.classList.add('floating', 'open');
      menu.style.position = 'fixed';
      menu.style.left = '0px';
      menu.style.top = '0px';
      const mw = menu.offsetWidth;
      const mh = menu.offsetHeight;
      menu.style.left = Math.max(8, Math.min(btnRect.right - mw, window.innerWidth - mw - 8)) + 'px';
      menu.style.top = (btnRect.bottom + 6 + mh > window.innerHeight - 8 ? btnRect.top - mh - 6 : btnRect.bottom + 6) + 'px';
      ui.floatingMenus.push({ menu: menu, wrap: wrap });
    } else {
      menu.classList.add('open');
    }
    btn.setAttribute('aria-expanded', 'true');
    wrap.classList.add('open');
  }

  function closeAllMenus() {
    $$('.menu.open').forEach(function (menu) { menu.classList.remove('open'); });
    ui.floatingMenus.forEach(function (item) {
      item.menu.classList.remove('floating');
      item.menu.removeAttribute('style');
      if (item.wrap) item.wrap.appendChild(item.menu);
    });
    ui.floatingMenus = [];
    $$('.menu-wrap.open').forEach(function (wrap) { wrap.classList.remove('open'); });
    $$('[data-menu-toggle]').forEach(function (btn) { btn.setAttribute('aria-expanded', 'false'); });
  }

  /* ============================== modal content builders ============================== */
  function renderHelpMenu() {
    const el = $('#help-menu');
    if (!el) return;
    el.innerHTML =
      '<div class="notif-head"><strong>Help &amp; Support</strong></div>' +
      helpItem('book-open', 'Quick Start Guide', 'Set up your room and go live in five minutes.', 'guide') +
      helpItem('help', 'Frequently Asked Questions', 'Co-hosts, recordings, payouts and more.', 'faq') +
      helpItem('mail', 'Contact Support', 'Real humans, usually within one business day.', 'contact') +
      helpItem('headphones', 'Live Show Checklist', 'A pre-flight list before every broadcast.', 'checklist');
  }

  function openHelp() {
    closeAllMenus();
    const btn = $('#help-btn');
    const wrap = btn && btn.closest('.menu-wrap');
    if (!wrap) return;
    wrap.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
  function helpItem(ico, title, desc, topic) {
    return '<button class="help-item" data-action="help-link" data-topic="' + topic + '">' +
      '<span class="help-item-ico">' + icon(ico) + '</span>' +
      '<span class="help-item-text"><strong>' + esc(title) + '</strong><span>' + esc(desc) + '</span></span>' +
      '</button>';
  }

  var MUSIC_LIBRARY = {
    Gospel: [
      ['Sacred Rituals', '00:01:04'], ['Sacred Narratives', '00:01:05'], ['Joyous Fanfare', '00:00:42'],
      ['Reflective Lamentations', '00:00:59'], ['Harmony Melodies', '00:01:15'], ['Divine Enigma', '00:01:04'],
      ['Grace Notes', '00:00:48'], ['Hymn for Dawn', '00:01:09']
    ],
    Calm: [
      ['Still Water', '00:01:20'], ['Slow Morning', '00:00:55'], ['Drifting Clouds', '00:01:08'], ['Soft Focus', '00:00:47'],
      ['Evening Air', '00:01:02'], ['Paper Moon', '00:00:58'], ['Gentle Rain', '00:01:15'], ['Open Window', '00:00:51']
    ],
    Energetic: [
      ['Bright Start', '00:00:38'], ['Fast Lane', '00:01:02'], ['Pulse Check', '00:00:51'], ['Rising Tide', '00:01:12'],
      ['Neon Run', '00:00:57'], ['Full Throttle', '00:01:05'], ['City Sprint', '00:00:49'], ['Power Up', '00:00:43']
    ],
    Happy: [
      ['Sunny Steps', '00:00:44'], ['Little Wins', '00:00:57'], ['Good News', '00:01:03'], ['Weekend Plans', '00:00:49'],
      ['Lemonade', '00:00:52'], ['Sidewalk Skip', '00:00:46'], ['Bright Side', '00:01:01'], ['Happy Place', '00:00:55']
    ],
    Romantic: [
      ['Late Evening', '00:01:11'], ['Close Two', '00:00:58'], ['Paper Letters', '00:01:06'], ['Slow Dance', '00:01:14'],
      ['Candlelight', '00:01:03'], ['Two Cups', '00:00:49'], ['Soft Landing', '00:01:09'], ['Harbour Lights', '00:00:57']
    ],
    Sad: [
      ['Empty Room', '00:01:14'], ['Grey Weather', '00:00:52'], ['Last Message', '00:01:01'], ['Long Goodbye', '00:01:08'],
      ['Rain on Glass', '00:00:59'], ['Old Photograph', '00:01:16'], ['Fading Out', '00:00:47'], ['Quiet Street', '00:01:04']
    ],
    'Your Uploads': [
      ['Studio Intro', '00:00:22'], ['Episode Theme', '00:00:36'], ['Guest Sting', '00:00:19'],
      ['Outro Bed', '00:00:41'], ['Ad Break', '00:00:15']
    ]
  };
  var musicCat = 'Gospel';
  var musicAdded = { 'Gospel|Sacred Rituals': true, 'Gospel|Sacred Narratives': true };
  var musicPlaying = {};

  function musicRowHTML(cat, track, i) {
    const key = cat + '|' + track[0];
    const added = !!musicAdded[key];
    const playing = !!musicPlaying[key];
    return '<div class="music-row">' +
      '<span class="music-thumb g' + (i % 6) + '"></span>' +
      '<span class="music-main"><span class="music-name">' + esc(track[0]) + '</span>' +
      '<span class="music-time">' + esc(track[1]) + '</span></span>' +
      '<button type="button" class="music-icon-btn music-play' + (playing ? ' is-active' : '') + '" data-action="music-play" data-key="' + esc(key) + '" aria-label="' + (playing ? 'Pause' : 'Play') + '">' + icon(playing ? 'pause' : 'play') + '</button>' +
      '<button type="button" class="music-icon-btn music-add' + (added ? ' is-active' : '') + '" data-action="music-add" data-key="' + esc(key) + '" aria-label="' + (added ? 'Remove' : 'Add') + '">' + icon(added ? 'check' : 'plus') + '</button>' +
      '</div>';
  }

  function musicListHTML() {
    const tracks = MUSIC_LIBRARY[musicCat] || [];
    return tracks.map(function (t, i) { return musicRowHTML(musicCat, t, i); }).join('');
  }

  function openMusicModal() {
    openModal(modalShell({
      title: 'Add Music',
      desc: 'Choose music to play during your live show.',
      wide: true,
      className: 'modal-music live-dialog',
      body:
        '<div class="music-tabs" role="tablist" aria-label="Music categories">' +
        Object.keys(MUSIC_LIBRARY).map(function (cat) {
          return '<button class="music-tab' + (cat === musicCat ? ' active' : '') + '" role="tab" aria-selected="' + (cat === musicCat) + '" data-action="music-tab" data-cat="' + esc(cat) + '">' + esc(cat) + '</button>';
        }).join('') +
        '</div>' +
        '<div class="music-list" id="music-list">' + musicListHTML() + '</div>'
    }));
  }

  function refreshMusicModal() {
    const tabs = document.querySelectorAll('.modal-music .music-tab');
    tabs.forEach(function (t) {
      const on = t.dataset.cat === musicCat;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    const list = $('#music-list');
    if (list) list.innerHTML = musicListHTML();
  }

  function openLiveRoom(id) {
    const s = show(id);
    if (!s) return;
    const url = roomUrlFor(s);
    openModal(modalShell({
      title: 'Live room',
      desc: esc(s.title),
      body:
        '<div class="form-row"><div class="form-label">Room link</div>' +
        '<div class="invite-link-row" style="margin-top:0">' +
        '<input class="input" readonly value="' + esc(url) + '" aria-label="Live room link">' +
        '<button class="btn btn-secondary" data-action="copy" data-copy="' + esc(url) + '">' + icon('copy') + 'Copy</button></div></div>' +
        '<div class="modal-note">' + icon('info') + '<span>The room opens in a new tab for you and anyone with the link. ' + (s.status === 'live' ? 'This show is currently live.' : 'You can open the room any time before the start time.') + '</span></div>',
      foot: '<button class="btn btn-secondary" data-action="close-modal">Close</button>' +
        '<button class="btn btn-primary" data-action="enter-room">' + icon('arrow-up-right') + 'Open room</button>'
    }));
  }

  function openLiveInviteModal(showArg) {
    const match = location.hash.match(/#\/live-room\/([^/?]+)/);
    const current = showArg || (match && data.shows.find(function (s) { return s.id === match[1]; }));
    const link = shareUrlFor(current || data.shows.find(function (s) { return s.status === 'live'; })) + '&invite=cohost';
    const rows = data.invites.map(function (inv, i) {
      const sent = inv.status === 'Joined';
      const av = window.PB.invitePhoto ? window.PB.invitePhoto(i, 36, inv.name) : avatar(inv.name, 36);
      return '<div class="live-invite-person">' + av +
        '<span class="live-invite-name">' + esc(inv.name) + '</span>' +
        (sent ? '<span class="live-sent">Sent</span>' : '<button type="button" class="btn btn-primary btn-sm" data-action="live-invite-send">Invite</button>') +
        '</div>';
    }).join('');
    openModal(modalShell({
      title: 'Invite Co-Hosts',
      desc: 'Invite co-hosts to join your live show.',
      wide: true,
      className: 'live-dialog',
      body: '<div class="live-invite-modal">' +
        '<h3 class="live-invite-title">Invite via Link</h3>' +
        '<p class="live-invite-text">Share this link to invite people as your co-host.</p>' +
        '<div class="live-invite-row"><input class="input" readonly value="' + esc(link) + '" aria-label="Co-host invite link">' +
        '<button class="btn btn-secondary btn-sm invite-copy" data-action="copy" data-copy="' + esc(link) + '">Copy</button></div>' +
        '<h3 class="live-invite-title">Invite via Email</h3>' +
        '<p class="live-invite-text">Co-hosts will get an email with instructions to join the show.</p>' +
        '<form class="live-invite-row" data-form="live-invite-email" novalidate onsubmit="return false">' +
        '<input class="input" name="email" type="email" placeholder="Please enter your co-host’s email" required>' +
        '<button class="btn btn-primary btn-sm" type="submit">Invite</button></form>' +
        '<h3 class="live-invite-title">Recently Invited Co-Hosts/Speakers</h3>' +
        '<div class="live-invite-list" id="live-invite-list">' + rows + '</div>' +
        '</div>'
    }));
    setTimeout(function () {
      const active = document.activeElement;
      if (active && active !== document.body) active.blur();
    }, 80);
  }

  function openLiveShareModal(showArg, title) {
    const match = location.hash.match(/#\/live-room\/([^/?]+)/);
    const current = showArg || (match && data.shows.find(function (s) { return s.id === match[1]; }));
    const baseUrl = shareUrlFor(current || data.shows.find(function (s) { return s.status === 'live'; }));
    const modalTitle = title || 'Share Live Room';
    const url = modalTitle === 'Share Live Room' ? baseUrl.split('?')[0] : baseUrl;
    const facebook = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M13.5 20v-6.2h2.1l.3-2.4h-2.4V9.9c0-.7.2-1.2 1.2-1.2h1.3V6.6c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.1-3.2 3.2v1.8H9v2.4h2.3V20h2.2Z"/></svg>';
    const x = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4" fill="#0F1419"/><path fill="#fff" d="M17.7 5h2.1l-4.6 5.2L20.5 19h-4.2l-3.3-4.3L9.2 19H7.1l4.9-5.6L6.8 5H11l3 3.9L17.7 5Zm-.7 12.5h1.2L9.8 6.4H8.5l8.5 11.1Z"/></svg>';
    const linkedin = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4" fill="#0A66C2"/><path fill="#fff" d="M7.2 9.5H4.8V19h2.4V9.5ZM6 8.4a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8ZM19.2 19h-2.4v-4.6c0-1.1-.4-1.9-1.4-1.9-.8 0-1.2.5-1.4 1-.1.2-.1.5-.1.9V19h-2.4V9.5h2.4v1.3c.3-.5 1-1.4 2.5-1.4 1.8 0 3.2 1.2 3.2 3.8V19Z"/></svg>';
    const messenger = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#0084FF"/><path fill="#fff" d="M12 4.2c-4.4 0-8 3.2-8 7.2 0 2.3 1.1 4.3 2.9 5.6v2.6l2.5-1.4c.8.2 1.7.3 2.6.3 4.4 0 8-3.2 8-7.2s-3.6-7.1-8-7.1Zm.8 9.5-2-2.1-3.9 2.1 4.3-4.6 2.1 2.1 3.9-2.1-4.4 4.6Z"/></svg>';
    const whatsapp = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#25D366"/><path fill="#fff" d="M17.2 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 1.9 3 4.7 4.1 2.3.9 2.8.7 3.3.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3Z"/></svg>';
    openModal(modalShell({
      title: modalTitle,
      desc: (modalTitle === 'Share Live Room' ? 'Share this link to promote and invite users to join your live room.' : 'Share this link to promote and invite users to join your live show.'),
      className: 'modal-md' + (location.hash.indexOf('#/live-room/') === 0 ? ' live-dialog' : ''),
      body:
        '<div class="live-share-row"><input class="input" readonly value="' + esc(url) + '" aria-label="Live show link">' +
        '<button class="btn btn-primary" data-action="copy" data-copy="' + esc(url) + '">Copy</button></div>' +
        '<div class="live-share-socials">' +
        '<button class="live-social" data-action="share-social" data-net="facebook" data-url="' + esc(url) + '" aria-label="Share on Facebook" title="Share on Facebook">' + facebook + '</button>' +
        '<button class="live-social" data-action="share-social" data-net="x" data-url="' + esc(url) + '" aria-label="Share on X" title="Share on X">' + x + '</button>' +
        '<button class="live-social" data-action="share-social" data-net="messenger" data-url="' + esc(url) + '" aria-label="Share on Messenger" title="Share on Messenger">' + messenger + '</button>' +
        '<button class="live-social" data-action="share-social" data-net="linkedin" data-url="' + esc(url) + '" aria-label="Share on LinkedIn" title="Share on LinkedIn">' + linkedin + '</button>' +
        '<button class="live-social" data-action="share-social" data-net="whatsapp" data-url="' + esc(url) + '" aria-label="Share on WhatsApp" title="Share on WhatsApp">' + whatsapp + '</button>' +
        '</div>'
    }));
  }

  /* ---------- live room settings modals ---------- */
  var LIVE_THEMES = [
    { id: 'customize', name: 'Customize', badge: 'Change' },
    { id: 'default', name: 'Default' },
    { id: 'beige', name: 'Beige' },
    { id: 'blossom', name: 'Blossom' },
    { id: 'blue', name: 'Blue' },
    { id: 'brown', name: 'Brown' },
    { id: 'green', name: 'Green' },
    { id: 'grey', name: 'Grey' },
    { id: 'orange', name: 'Orange' },
    { id: 'pink', name: 'Pink' },
    { id: 'purple', name: 'Purple' },
    { id: 'red', name: 'Red' },
    { id: 'yellow', name: 'Yellow' }
  ];
  var liveThemeDraft = 'default';

  function liveRoomShow() {
    const match = location.hash.match(/#\/live-room\/([^/?]+)/);
    return (match && data.shows.find(function (s) { return s.id === match[1]; })) ||
      data.shows.find(function (s) { return s.status === 'live'; }) ||
      data.shows[0] ||
      { id: '', title: 'Live Show Test', about: '', visibility: 'public' };
  }

  function livePersonAvatar(name, size) {
    if (window.PB.memberPhoto && name !== data.currentUser.name) {
      const index = data.members.findIndex(function (m) { return m.name === name; });
      if (index >= 0) return window.PB.memberPhoto(index, size, name);
    }
    return avatar(name, size);
  }

  function liveAdminRows() {
    if (!data.admins.length) {
      return '<div class="live-people-empty">' + icon('users') + '<span>No admins yet.</span></div>';
    }
    return data.admins.map(function (a) {
      return '<div class="live-person">' +
        livePersonAvatar(a.name, 36) +
        '<div class="live-person-main"><span class="live-person-name">' + esc(a.name) + '</span>' +
        '<span class="live-person-role">' + esc(a.role) + '</span></div>' +
        '<button type="button" class="btn btn-secondary btn-sm live-person-btn" data-action="remove-live-admin" data-id="' + esc(a.id) + '">Remove</button>' +
        '</div>';
    }).join('');
  }

  var LIVE_BLOCKED_USERS = [
    { id: 'blk-1', name: 'Ava Bennett', photo: 3 },
    { id: 'blk-2', name: 'Noah Carter', photo: 4 },
    { id: 'blk-3', name: 'Mia Rodriguez', photo: 2 },
    { id: 'blk-4', name: 'Ethan Brooks', photo: 6 },
    { id: 'blk-5', name: 'Sofia Kim', photo: 7 }
  ];

  function liveBlockedRows() {
    if (!data.blockedUsers.length) {
      return '<div class="live-people-empty">' + icon('shield') + '<span>No blocked users.</span></div>';
    }
    return data.blockedUsers.map(function (u) {
      const label = u.name || u.username || 'Blocked user';
      const av = window.PB.memberPhoto && u.photo != null
        ? window.PB.memberPhoto(u.photo, 30, label)
        : avatar(label, 30);
      return '<div class="live-person">' + av +
        '<div class="live-person-main"><span class="live-person-name">' + esc(label) + '</span></div>' +
        '<button type="button" class="btn btn-secondary btn-sm live-person-btn" data-action="unblock-live-user" data-id="' + esc(u.id) + '">Unblock</button>' +
        '</div>';
    }).join('');
  }

  function syncLiveSettingsMenu() {
    const menu = $('.live-settings-menu');
    if (!menu) return;
    ensureLiveSettingsData();
    $$('.menu-item', menu).forEach(function (item) {
      const id = item.dataset.settings || '';
      const name = item.dataset.name || '';
      if (id === 'admins' || name.indexOf('Admins') === 0) {
        item.textContent = 'Admins (' + data.admins.length + ')';
      } else if (id === 'blocked' || name.indexOf('Blocked Users') === 0) {
        item.textContent = 'Blocked Users (' + data.blockedUsers.length + ')';
      }
    });
  }

  function ensureLiveSettingsData() {
    if (!Array.isArray(data.admins)) {
      data.admins = [
        { id: 'adm-1', name: 'Danita', role: 'Owner' },
        { id: 'adm-2', name: 'Patricia Wang', role: 'Admin' }
      ];
    }
    if (!Array.isArray(data.blockedUsers)) {
      data.blockedUsers = LIVE_BLOCKED_USERS.map(function (u) {
        return { id: u.id, name: u.name, photo: u.photo };
      });
    } else {
      data.blockedUsers.forEach(function (u) {
        const def = LIVE_BLOCKED_USERS.find(function (d) { return d.id === u.id; });
        if (!def) return;
        if (!u.name) {
          u.name = def.name;
          delete u.username;
        }
        u.photo = def.photo;
      });
    }
    if (data.liveGreeting == null) {
      data.liveGreeting = 'Hi, welcome to my live show! I hope you will enjoy my live show.';
    }
    if (!data.liveTheme) data.liveTheme = 'default';
  }

  function openLiveAdminsModal() {
    openModal(modalShell({
      title: 'Admins',
      className: 'live-people-modal live-dialog',
      body: '<div class="live-people-list" id="live-admins-list">' + liveAdminRows() + '</div>'
    }));
  }

  function openLiveBlockedUsersModal() {
    openModal(modalShell({
      title: 'Blocked Users',
      className: 'live-people-modal live-dialog',
      body: '<div class="live-people-list" id="live-blocked-list">' + liveBlockedRows() + '</div>'
    }));
  }

  function liveThemeCards() {
    return LIVE_THEMES.map(function (t) {
      const selected = t.id === liveThemeDraft;
      return '<button type="button" class="theme-card' + (selected ? ' is-selected' : '') + '" data-action="select-live-theme" data-theme="' + t.id + '" aria-pressed="' + (selected ? 'true' : 'false') + '">' +
        '<span class="theme-swatch theme-' + t.id + '">' +
        (t.badge ? '<span class="theme-badge">' + icon('upload') + t.badge + '</span>' : '') +
        '</span>' +
        '<span class="theme-name">' + t.name + '</span></button>';
    }).join('');
  }

  function openLiveThemesModal() {
    liveThemeDraft = data.liveTheme || 'default';
    openModal(modalShell({
      title: 'Themes',
      desc: 'The live show theme only displays on the Podbean app.',
      className: 'live-themes-modal live-dialog',
      body: '<div class="theme-grid" id="live-theme-grid">' + liveThemeCards() + '</div>',
      foot: '<button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>' +
        '<button type="button" class="btn btn-primary" data-action="save-live-theme">Save</button>'
    }));
  }

  function openLiveGreetingModal() {
    const value = data.liveGreeting == null ? '' : String(data.liveGreeting);
    openModal(modalShell({
      title: 'Greeting',
      className: 'live-greeting-modal live-dialog',
      body: '<div class="live-greeting-wrap">' +
        '<textarea class="textarea live-greeting-input" id="live-greeting-input" maxlength="128" rows="4" placeholder="Hi, welcome to my live show! I hope you will enjoy my live show.">' + esc(value) + '</textarea>' +
        '<span class="live-greeting-count" id="live-greeting-count">' + value.length + '/128</span>' +
        '</div>' +
        '<button type="button" class="btn btn-primary live-greeting-save" data-action="save-live-greeting">Save</button>'
    }));
    const input = $('#live-greeting-input');
    const count = $('#live-greeting-count');
    if (input && count) {
      input.addEventListener('input', function () {
        count.textContent = input.value.length + '/128';
      });
    }
  }

  function openLiveInfoModal() {
    const s = liveRoomShow();
    const title = s.title || '';
    const about = s.about || '';
    const visibility = s.visibility || 'public';
    const titleWords = title.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
    const logoInitials = !titleWords.length
      ? 'LS'
      : titleWords.length === 1
        ? titleWords[0].slice(0, 2).toUpperCase()
        : (titleWords[0][0] + titleWords[1][0]).toUpperCase();
    const visOption = function (value, label, desc) {
      const on = visibility === value;
      return '<label class="radio-card' + (on ? ' selected' : '') + '">' +
        '<input type="radio" name="live-visibility" value="' + value + '"' + (on ? ' checked' : '') + '>' +
        '<span class="radio-dot"></span>' +
        '<span class="radio-card-body"><span class="radio-card-title">' + label + '</span>' +
        '<span class="radio-card-desc">' + desc + '</span></span></label>';
    };
    openModal(modalShell({
      title: 'Live Show Info',
      wide: true,
      className: 'live-info-modal live-dialog',
      body: '<form class="live-info-form" id="live-info-form" novalidate onsubmit="return false">' +
        '<div class="live-info-row live-info-row-logo">' +
        '<div class="live-info-label">Logo</div>' +
        '<div class="live-info-field"><span class="live-info-logo live-info-logo-photo" aria-hidden="true">' +
        '<span class="live-info-logo-letters">' + esc(logoInitials) + '</span>' +
        '<img src="' + ASSET_BASE + 'img/live-show-logo.png" alt="" loading="lazy" onerror="this.remove()">' +
        '</span></div>' +
        '</div>' +
        '<div class="live-info-row">' +
        '<label class="live-info-label" for="live-info-title">Live Room Title <span class="req">*</span></label>' +
        '<div class="live-info-field">' +
        '<input class="input" id="live-info-title" name="title" maxlength="80" autocomplete="off" value="' + esc(title) + '">' +
        '<span class="live-info-count' + (title.length > 80 ? ' over' : '') + '" id="live-info-title-count">' + title.length + '/80</span>' +
        '</div></div>' +
        '<div class="live-info-row">' +
        '<label class="live-info-label" for="live-info-about">About This Show</label>' +
        '<div class="live-info-field">' +
        '<textarea class="textarea" id="live-info-about" name="about" maxlength="512" rows="3">' + esc(about) + '</textarea>' +
        '<span class="live-info-count is-bottom' + (about.length > 512 ? ' over' : '') + '" id="live-info-about-count">' + about.length + '/512</span>' +
        '</div></div>' +
        '<div class="live-info-row">' +
        '<div class="live-info-label">Visibility <span class="req">*</span></div>' +
        '<div class="live-info-field"><div class="radio-group">' +
        visOption('public', 'Public', 'Everyone can join the show.') +
        visOption('unlisted', 'Unlisted', 'Anyone with the link can join; will not be listed in the Podbean app. Can be used for invitation-only streams, remote recording with cohosts and guests, or testing.') +
        '</div></div></div>' +
        '</form>',
      foot: '<button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>' +
        '<button type="button" class="btn btn-primary" data-action="save-live-info">Save</button>'
    }));
    const titleInput = $('#live-info-title');
    const aboutInput = $('#live-info-about');
    const bindCount = function (input, counter, max) {
      if (!input || !counter) return;
      input.addEventListener('input', function () {
        counter.textContent = input.value.length + '/' + max;
        counter.classList.toggle('over', input.value.length > max);
        const row = input.closest('.live-info-row');
        if (row) row.classList.remove('has-error');
      });
    };
    bindCount(titleInput, $('#live-info-title-count'), 80);
    bindCount(aboutInput, $('#live-info-about-count'), 512);
  }

  function openLiveSettingsModal(key) {
    ensureLiveSettingsData();
    const k = String(key || '').toLowerCase();
    if (k.indexOf('admin') === 0) return openLiveAdminsModal();
    if (k.indexOf('blocked') === 0) return openLiveBlockedUsersModal();
    if (k.indexOf('themes') === 0) return openLiveThemesModal();
    if (k.indexOf('greeting') === 0) return openLiveGreetingModal();
    return openLiveInfoModal();
  }

  var liveExitMode = 'exit';
  var liveExitShowId = null;

  function openLiveExitModal(mode, showId) {
    liveExitMode = mode || 'exit';
    liveExitShowId = showId || null;
    const timer = document.getElementById('live-timer');
    const totalTime = timer ? timer.textContent.trim() : '00:00:00';
    openModal(
      '<div class="modal-backdrop" data-action="modal-backdrop">' +
      '<div class="modal live-exit-modal live-dialog" role="dialog" aria-modal="true" aria-labelledby="live-exit-title">' +
      '<button class="modal-close live-exit-close" data-action="close-modal" aria-label="Close dialog">' + icon('x') + '</button>' +
      '<p class="live-exit-text" id="live-exit-title">Your livestream is completed. Total time: <span class="live-exit-time">' + esc(totalTime) + '</span></p>' +
      '<p class="live-exit-text live-exit-thanks">Thanks for using Podbean Livestreaming!</p>' +
      '<div class="live-exit-stats">' +
      '<div class="live-exit-stat"><b>550</b><span>PodPoints</span></div>' +
      '<div class="live-exit-stat"><b>2</b><span>Participants</span></div>' +
      '<div class="live-exit-stat"><b>0</b><span>New Followers</span></div>' +
      '</div>' +
      '<div class="live-exit-actions">' +
      '<button class="btn btn-secondary live-exit-cancel" data-action="close-modal">Close</button>' +
      '<button class="btn live-exit-confirm" data-action="confirm-exit-room">Exit</button>' +
      '</div></div></div>'
    );
  }

  function openShareAchievement(metricId) {
    closeAllMenus();
    const stats = buildStats(metricId, ui.statsRange);
    const cfg = stats.cfg;
    const label = cfg.label;
    openModal(modalShell({
      title: 'Share Achievement',
      desc: 'A little milestone worth celebrating with your listeners.',
      wide: true,
      body:
        '<div class="share-card">' +
        '<div class="share-card-brand"><span class="share-card-logo">' + window.logoMark() + '</span>Podbean</div>' +
        '<div class="share-card-label">' + esc(label) + ' · last ' + stats.days + ' days</div>' +
        '<div class="share-card-value">' + esc(stats.totalText) + '</div>' +
        '<div class="share-card-delta">' + esc(stats.deltaText) + ' vs previous period</div>' +
        '<div class="share-card-foot"><span>' + esc(stats.rangeText) + '</span><span>Made with Podbean</span></div>' +
        '</div>',
      foot: '<button class="btn btn-secondary" data-action="close-modal">Close</button>' +
        '<button class="btn btn-primary" data-action="copy-share-link">' + icon('copy') + 'Copy link</button>'
    }));
  }

  function openPaypalModal() {
    const current = data.payouts.account || '';
    openModal(modalShell({
      title: current ? 'Change Payout Account' : 'Add PayPal Payout Account',
      note: 'The balance will be paid out on the 10th of next month. The minimum amount is $20.',
      body:
        '<form data-form="paypal-account">' +
        '<div class="form-row" data-field="email">' +
        '<label class="form-label" for="paypal-email">PayPal email address <span class="req">*</span></label>' +
        '<input class="input" id="paypal-email" name="email" type="email" value="' + esc(current) + '" placeholder="you@example.com" required data-autofocus>' +
        '<div class="form-error">Enter a valid email address.</div>' +
        '</div>' +
        '<div class="modal-foot"><button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">' + (current ? 'Update' : 'Connect') + '</button></div>' +
        '</form>'
    }));
  }

  function openMembershipModal() {
    openModal(modalShell({
      title: data.membershipFee ? 'Edit Membership Fee' : 'Set Membership Fee',
      desc: 'Please set the membership fee for your Fan Club. Users can join the Fan Club by paying the fee.',
      body:
        '<form data-form="membership-fee">' +
        '<div class="form-row" data-field="fee">' +
        '<label class="form-label" for="fee-input">Membership Fee</label>' +
        '<input class="input" id="fee-input" name="fee" type="number" min="0.99" step="0.01" value="' + (data.membershipFee || '4.99') + '" required data-autofocus>' +
        '<div class="form-error">Enter a price of at least $0.99.</div>' +
        '</div>' +
        '<div class="modal-foot"><button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">Save</button></div>' +
        '</form>'
    }));
  }

  function openAccountModal() {
    const u = data.currentUser;
    openModal(modalShell({
      title: 'Account Settings',
      desc: 'Your name and email appear on invites, gifts and fan club posts.',
      body:
        '<form data-form="account-settings">' +
        '<div class="form-row" data-field="name">' +
        '<label class="form-label" for="acct-name">Nickname <span class="req">*</span></label>' +
        '<input class="input" id="acct-name" name="name" value="' + esc(u.name) + '" required data-autofocus>' +
        '<div class="form-error">Enter your name.</div></div>' +
        '<div class="form-row" data-field="email">' +
        '<label class="form-label" for="acct-email">Email</label>' +
        '<input class="input" id="acct-email" name="email" type="email" value="' + esc(u.email) + '" required>' +
        '<div class="form-error">Enter a valid email address.</div></div>' +
        '<div class="modal-foot"><button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">Save</button></div>' +
        '</form>'
    }));
  }

  function openEditRoomUrl() {
    const showObj = data.shows.find(function (x) { return x.status === 'live'; }) || data.shows[0];
    const url = shareUrlFor(showObj).split('?')[0];
    openModal(modalShell({
      title: 'Edit Live Room URL',
      desc: 'This is the base address for every room you open. Changing it will not break rooms that are already live.',
      className: 'modal-url-edit',
      body:
        '<form id="room-url-form" data-form="room-url" novalidate>' +
        '<div class="form-row" data-field="url" style="margin-bottom:0">' +
        '<label class="form-label" for="room-url">Live Room URL</label>' +
        '<input class="input" id="room-url" name="url" type="url" value="' + esc(url) + '" placeholder="https://www.podbean.com/lsw/URL" required data-autofocus>' +
        '<div class="form-error">Enter a valid URL starting with https://.</div></div></form>',
      foot: '<button type="button" class="btn btn-ghost" data-action="close-modal" style="min-width:78px">Cancel</button>' +
        '<button type="submit" form="room-url-form" class="btn btn-primary" style="min-width:78px">Save</button>'
    }));
  }

  function autoShareRow(net, title, desc) {
    const icons = {
      facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v2.8h2.5V21h3Z"/></svg>',
      linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M7.2 9.5H4.8V19h2.4V9.5ZM6 8.4a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8ZM19.2 19h-2.4v-4.6c0-1.1-.4-1.9-1.4-1.9-.8 0-1.2.5-1.4 1-.1.2-.1.5-.1.9V19h-2.4V9.5h2.4v1.3c.3-.5 1-1.4 2.5-1.4 1.8 0 3.2 1.2 3.2 3.8V19Z"/></svg>'
    };
    return '<div class="auto-share-row on" data-net="' + net + '">' +
      '<span class="auto-share-ico ' + net + '">' + icons[net] + '</span>' +
      '<div class="auto-share-main"><strong>' + esc(title) + '</strong><p>' + esc(desc) + '</p></div>' +
      '<div class="auto-share-actions">' +
      '<button class="auto-share-btn edit" data-action="auto-share-set" data-on="1" aria-label="Edit ' + esc(title) + ' auto-share">' + icon('pencil-outline') + '</button>' +
      '<button class="auto-share-btn x" data-action="auto-share-set" data-on="0" aria-label="Disable ' + esc(title) + ' auto-share">' + icon('x') + '</button>' +
      '</div></div>';
  }

  function openAutoShare() {
    openModal(modalShell({
      title: 'Auto Share',
      desc: 'Choose where your live stream link should be shared automatically.',
      className: 'modal-md',
      body: '<div class="auto-share-list">' +
        autoShareRow('facebook', 'Facebook', 'Auto-share your live stream link to Facebook. Turn your friends, family, and people you know into your listeners.') +
        autoShareRow('linkedin', 'LinkedIn', 'Auto-share your live stream link to LinkedIn to promote your show.') +
        '</div>'
    }));
  }

  function openEmbedModal(showObj) {
    const url = roomUrlFor(showObj);
    const code = '<iframe height="150" width="100%" style="border: none;" scrolling="no" data-name="pb-iframe-player" src="' + url + '/embed"></iframe>';
    const title = (showObj && showObj.title) || 'Live Show Test';
    openModal(modalShell({
      title: 'Embeddable Player',
      desc: 'Embed your live show on other websites.',
      className: 'modal-md modal-embed',
      body:
        '<div class="embed-label">Here’s a peek</div>' +
        '<div class="embed-preview">' +
        '<div class="embed-cover"><img src="' + ASSET_BASE + 'img/danita-profile.jpg" alt=""></div>' +
        '<div class="embed-player-main">' +
        '<div class="embed-player-head"><div class="embed-player-meta">' +
        '<div class="embed-player-top"><span class="embed-tag">Replay</span><strong>' + esc(title) + '</strong></div>' +
        '<div class="embed-author">' + avatar(data.currentUser.name, 20) + '<span>' + esc(data.currentUser.name) + '</span></div>' +
        '</div><div class="embed-player-icons">' + icon('list') + icon('share') + '</div></div>' +
        '<div class="embed-progress"><span class="embed-play-tri" aria-hidden="true"></span><span class="embed-time">0:00</span><span class="embed-bar"><span></span></span><span class="embed-time">-0:00</span></div>' +
        '<div class="embed-brand">' + window.logoMark() + '<span>PodBean</span></div>' +
        '</div></div>' +
        '<div class="embed-label">Widget Code</div>' +
        '<div class="embed-code-row"><input class="input" readonly value="' + esc(code) + '" aria-label="Embed code">' +
        '<button class="btn btn-primary" data-action="copy" data-copy="' + esc(code) + '">Copy</button></div>'
    }));
  }

  /* ============================== action handlers ============================== */
  function submitCreateShowForm() {
    const form = document.querySelector('form[data-form="create-show"]');
    if (!form) return;
    if (form.requestSubmit) form.requestSubmit();
    else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }

  const actions = {
    'toggle-sidebar': function () {
      if (window.innerWidth <= 1024) {
        document.body.classList.toggle('sidebar-open');
      } else {
        const collapsed = document.body.classList.toggle('sidebar-collapsed');
        try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch (err) { /* private mode */ }
      }
    },
    'close-sidebar': function () { document.body.classList.remove('sidebar-open'); },
    'skip-to-main': function () {
      const main = $('#main');
      if (main) {
        main.focus();
        main.scrollIntoView({ block: 'start' });
      }
    },

    'nav-group': function (el) {
      const group = el.dataset.group;
      const active = activeNav(parseHash().path).group;
      if (document.body.classList.contains('sidebar-collapsed') && window.innerWidth > 1024) {
        document.body.classList.remove('sidebar-collapsed');
        try { localStorage.setItem(COLLAPSE_KEY, '0'); } catch (err) { /* private mode */ }
      }
      if (group === active) {
        if (ui.closedGroups.has(group)) ui.closedGroups.delete(group);
        else ui.closedGroups.add(group);
        renderSidebar(parseHash());
      } else {
        ui.closedGroups.delete(group);
        go(el.dataset.route);
        if (window.innerWidth <= 1024) document.body.classList.remove('sidebar-open');
      }
    },

    'open-help': openHelp,
    'help-link': function (el) {
      const topics = { guide: 'Opening the quick start guide…', faq: 'Loading frequently asked questions…', contact: 'Opening a support conversation…', checklist: 'Opening the live show checklist…' };
      closeAllMenus();
      toast(topics[el.dataset.topic] || 'Opening help…');
    },
    'account-settings': function () { closeAllMenus(); openAccountModal(); },
    'reset-demo': function () {
      closeAllMenus();
      confirmModal({
        title: 'Reset Demo Data?',
        desc: 'Shows, posts, invites and payout settings will return to their original demo values. This cannot be undone.',
        confirmLabel: 'Reset data',
        tone: 'danger',
        icon: 'refresh',
        onConfirm: function () {
          localStorage.removeItem(STORAGE_KEY);
          data = window.createDefaultData();
          data.liveRoomUrl = 'https://live.podbean.com/room/podbean-live';
          ui.earningsPage = 1; ui.giftPage = 1; ui.payoutPage = 1;
          ui.earningsQuery = ''; ui.earningsRange = '90';
          ui.showsQuery = ''; ui.showsStatus = 'all';
          ui.memberQuery = ''; ui.membersPage = 1; ui.postImage = null;
          ui.statsRange = '30d';
          ui.newShowStep = 1;
          ui.newShowDraft = null;
          ui.openGroups = new Set();
          ui.closedGroups = new Set();
          ui.activeGroup = null;
          save();
          go('/shows');
          render({ forceTop: true });
          toast('Demo data restored');
        }
      });
    },
    'log-out': function () {
      closeAllMenus();
      openModal(modalShell({
        title: 'You’re in the demo workspace',
        desc: 'Signing out would end this preview, so we’ve kept your session open. Reset the demo data from the account menu any time.',
        body: '<div class="modal-illustration">' + icon('lock') + '</div>',
        foot: '<button class="btn btn-primary" data-action="close-modal">Got it</button>'
      }));
    },

    'close-modal': closeModal,
    'modal-backdrop': function (el, ev) {
      if (ev.target.classList.contains('modal-backdrop')) closeModal();
    },
    'run-confirm': function () {
      const fn = ui.pendingConfirm;
      closeModal();
      if (fn) fn();
    },

    copy: function (el) { copyText(el.dataset.copy || ''); },

    'copy-show-link': function (el) {
      const s = show(el.dataset.id);
      copyText(roomUrlFor(s));
      toast('Show link copied');
    },
    'share-show': function (el) { openLiveShareModal(show(el.dataset.id), 'Share This Show'); },
    'open-live-room': function (el) { openLiveShareModal(show(el.dataset.id)); },
    'enter-live-room': function (el) { go('/live-room/' + el.dataset.id); },
    'live-exit': function () {
      confirmModal({
        title: 'Warning',
        desc: 'Are you sure you want to exit the live room? The live stream will end immediately.',
        confirmLabel: 'Yes',
        cancelLabel: 'No',
        className: 'live-dialog',
        onConfirm: function () { openLiveExitModal('exit'); }
      });
    },
    'confirm-exit-room': function () {
      if (liveExitMode === 'end' && liveExitShowId) {
        const s = data.shows.find(function (item) { return item.id === liveExitShowId; });
        if (s) { s.status = 'finished'; save(); }
        closeModal();
        go('/shows');
        toast('Live show ended');
        return;
      }
      closeModal();
      go('/shows');
    },
    'live-share': function () { openLiveShareModal(null, 'Share This Show'); },
    'share-social': function (el) {
      const url = encodeURIComponent(el.dataset.url || location.href);
      const text = encodeURIComponent('Join me live on Podbean!');
      const targets = {
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
        x: 'https://twitter.com/intent/tweet?url=' + url + '&text=' + text,
        messenger: 'https://www.facebook.com/dialog/send?link=' + url + '&app_id=123456789',
        linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + url,
        whatsapp: 'https://wa.me/?text=' + encodeURIComponent('Join me live on Podbean! ' + (el.dataset.url || location.href))
      };
      const target = targets[el.dataset.net];
      if (target) window.open(target, '_blank', 'noopener,width=640,height=560');
    },
    'end-live-show': function (el) {
      const showId = el.dataset.id;
      confirmModal({
        title: 'Warning',
        desc: 'Are you sure you want to exit the live room? The live stream will end immediately.',
        confirmLabel: 'Yes',
        cancelLabel: 'No',
        className: 'live-dialog',
        onConfirm: function () { openLiveExitModal('end', showId); }
      });
    },
    'live-tool': function (el) { toast('Opening ' + el.dataset.name + '…'); },
    'live-add-music': function () { openMusicModal(); },
    'music-tab': function (el) {
      musicCat = el.dataset.cat;
      refreshMusicModal();
    },
    'music-play': function (el) {
      const key = el.dataset.key;
      musicPlaying[key] = !musicPlaying[key];
      refreshMusicModal();
    },
    'music-add': function (el) {
      const key = el.dataset.key;
      const was = !!musicAdded[key];
      musicAdded[key] = !was;
      refreshMusicModal();
      toast(was ? 'Removed from playlist' : 'Added to playlist');
    },
    'live-settings-item': function (el) { openLiveSettingsModal(el.dataset.settings || el.dataset.name); },
    'remove-live-admin': function (el) {
      ensureLiveSettingsData();
      const admin = data.admins.find(function (a) { return a.id === el.dataset.id; });
      if (!admin) return;
      data.admins = data.admins.filter(function (a) { return a.id !== el.dataset.id; });
      save();
      const list = $('#live-admins-list');
      if (list) list.innerHTML = liveAdminRows();
      syncLiveSettingsMenu();
      toast(admin.name + ' removed from admins');
    },
    'unblock-live-user': function (el) {
      ensureLiveSettingsData();
      const user = data.blockedUsers.find(function (u) { return u.id === el.dataset.id; });
      if (!user) return;
      data.blockedUsers = data.blockedUsers.filter(function (u) { return u.id !== el.dataset.id; });
      save();
      const list = $('#live-blocked-list');
      if (list) list.innerHTML = liveBlockedRows();
      syncLiveSettingsMenu();
      toast((user.name || user.username || 'User') + ' unblocked');
    },
    'select-live-theme': function (el) {
      liveThemeDraft = el.dataset.theme;
      $$('#live-theme-grid .theme-card').forEach(function (card) {
        const on = card === el;
        card.classList.toggle('is-selected', on);
        card.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    },
    'save-live-theme': function () {
      data.liveTheme = liveThemeDraft || 'default';
      save();
      closeModal();
      toast('Theme saved');
    },
    'save-live-greeting': function () {
      const input = $('#live-greeting-input');
      data.liveGreeting = input ? input.value.trim() : '';
      save();
      closeModal();
      toast('Greeting saved');
    },
    'save-live-info': function () {
      const titleInput = $('#live-info-title');
      const aboutInput = $('#live-info-about');
      const visInput = $('#live-info-form input[name="live-visibility"]:checked');
      const title = (titleInput ? titleInput.value.trim() : '').slice(0, 80);
      if (!title) {
        const row = titleInput ? titleInput.closest('.live-info-row') : null;
        if (row) row.classList.add('has-error');
        if (titleInput) titleInput.focus();
        toast('Give your live room a title', 'error');
        return;
      }
      const s = liveRoomShow();
      const about = (aboutInput ? aboutInput.value.trim() : '').slice(0, 512);
      if (s) {
        s.title = title;
        s.about = about;
        s.visibility = visInput ? visInput.value : 'public';
        save();
      }
      const heading = $('.live-chat-title-text');
      if (heading) heading.textContent = title;
      const aboutEl = $('.live-chat-about span');
      if (aboutEl) aboutEl.textContent = about;
      closeModal();
      toast('Live show information saved');
    },
    'toggle-recording': function (el) {
      const on = el.classList.toggle('on');
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
      toast('Recording ' + (on ? 'on' : 'off'));
    },
    'live-emoji': function () {
      const input = $('#live-message-input');
      if (input) {
        input.value += '😊';
        input.focus();
      }
    },
    'live-image': function () { toast('Image sharing is coming soon'); },
    'invite-live-cohost': function () { openLiveInviteModal(); },
    'live-invite-send': function (el) {
      const person = el.closest('.live-invite-person');
      const name = person ? person.querySelector('.live-invite-name').textContent : '';
      const inv = data.invites.find(function (item) { return item.name === name; });
      if (inv) {
        inv.status = 'Joined';
        save();
      }
      el.outerHTML = '<span class="live-sent">Sent</span>';
      toast('Invite sent to ' + (name || 'your co-host'));
    },
    'toggle-sound-monitoring': function (el) {
      const on = el.classList.toggle('on');
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
      toast(on ? 'Sound monitoring on' : 'Sound monitoring off');
    },
    'toggle-volume-popover': function (el) {
      const pop = document.getElementById('live-volume-popover');
      if (!pop) return;
      const open = pop.hidden;
      pop.hidden = !open;
      el.setAttribute('aria-expanded', open ? 'true' : 'false');
    },
    'toggle-self-mute': function (el) {
      const muted = el.classList.toggle('is-muted');
      el.setAttribute('aria-pressed', muted ? 'true' : 'false');
      const label = el.querySelector('.live-status-label');
      if (label) label.textContent = muted ? 'Unmute' : 'Mute';
      const ico = el.querySelector('.icon');
      if (ico) ico.outerHTML = icon(muted ? 'mic-off' : 'mic');
      toast(muted ? 'Microphone muted' : 'Microphone unmuted');
    },
    'toggle-mute-popover': function (el) {
      const pop = $('#live-mute-popover');
      if (!pop) return;
      const open = pop.hidden;
      pop.hidden = !open;
      el.setAttribute('aria-expanded', open ? 'true' : 'false');
      const chip = el.closest('.live-mute-chip');
      if (chip) chip.classList.toggle('is-open', open);
    },
    'select-device': function (el) {
      const group = el.closest('.live-device-group');
      if (!group) return;
      $$('.live-device', group).forEach(function (btn) {
        btn.classList.remove('active');
        const check = btn.querySelector('.live-device-check');
        if (check) check.innerHTML = '';
      });
      el.classList.add('active');
      const check = el.querySelector('.live-device-check');
      if (check) check.innerHTML = icon('check');
    },
    'live-fan-sort': function (el) {
      const root = el.closest('.live-pop-panel');
      if (!root) return;
      const sort = el.dataset.sort;
      $$('.live-fan-tab', root).forEach(function (b) {
        b.classList.toggle('active', b === el);
      });
      $$('[data-sort-panel]', root).forEach(function (p) {
        p.hidden = p.dataset.sortPanel !== sort;
      });
    },
    'live-pop': function (el) {
      const pop = document.getElementById('live-pop');
      if (!pop) return;
      const name = el.dataset.pop;
      const title = pop.querySelector('#live-pop-title');
      if (title) title.textContent = el.dataset.title || '';
      $$('.live-pop-panel', pop).forEach(function (p) {
        p.hidden = p.dataset.pop !== name;
      });
      $$('[data-action="live-pop"]').forEach(function (b) {
        const on = b === el;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    },
    'close-live-pop': function () {
      const pop = document.getElementById('live-pop');
      if (pop) pop.hidden = true;
      $$('.live-rail-btn').forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
    },
    'live-rail': function (el) {
      const drawer = document.getElementById('live-drawer');
      if (!drawer) return;
      const panel = el.dataset.panel;
      const rail = el.closest('.live-v2-rail');
      const isActive = el.classList.contains('is-active');
      if (isActive && !drawer.classList.contains('is-closed')) {
        drawer.classList.add('is-closed');
        el.classList.remove('is-active');
        el.setAttribute('aria-pressed', 'false');
        return;
      }
      drawer.classList.remove('is-closed');
      $$('.live-drawer-panel', drawer).forEach(function (p) {
        p.hidden = p.dataset.panel !== panel;
      });
      if (rail) {
        $$('.live-rail-btn', rail).forEach(function (b) {
          const on = b === el;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      }
    },
    'open-live-tool': function (el) {
      const railBtn = document.querySelector('.live-rail-btn[data-panel="audio"]');
      if (railBtn && !railBtn.classList.contains('is-active')) railBtn.click();
      const head = document.querySelector('.live-tool-head[data-tool="' + el.dataset.tool + '"]');
      if (!head) return;
      if (head.getAttribute('aria-expanded') !== 'true') head.click();
      const panel = head.closest('.live-tool-panel');
      if (panel) panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },
    'live-accordion': function (el) {
      const panel = el.closest('.live-tool-panel');
      if (!panel) return;
      const body = panel.querySelector('.live-tool-body');
      if (!body) return;
      const isOpen = !body.hidden;
      $$('.live-tool-body').forEach(function (b) { b.hidden = true; });
      $$('.live-tool-head').forEach(function (h) {
        h.classList.remove('open');
        h.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        body.hidden = false;
        el.classList.add('open');
        el.setAttribute('aria-expanded', 'true');
      }
    },
    'toggle-callin': function (el) {
      const on = el.classList.toggle('on');
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
      toast(on ? 'Call-ins enabled' : 'Call-ins paused');
    },
    'live-effect': function (el) { toast('Playing ' + el.dataset.name); },
    'toggle-music-play': function (el) {
      const playing = el.classList.toggle('playing');
      el.innerHTML = icon(playing ? 'pause' : 'play');
      el.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    },
    'music-loop': function (el) {
      const on = el.classList.toggle('active');
      toast(on ? 'Loop playlist on' : 'Loop playlist off');
    },
    'music-quality': function (el) {
      const group = el.parentNode;
      $$('button', group).forEach(function (b) { b.classList.remove('active'); });
      el.classList.add('active');
    },
    'select-track': function (el) {
      const list = el.parentNode;
      $$('.live-track', list).forEach(function (b) { b.classList.remove('active'); });
      el.classList.add('active');
      toast('Now playing ' + el.textContent.trim());
    },
    'toggle-mute': function (el) {
      const row = el.closest('.live-vol-row');
      const muted = row ? row.classList.toggle('muted') : el.classList.toggle('is-muted');
      if (row) el.classList.toggle('is-muted', muted);
      el.setAttribute('aria-pressed', muted ? 'true' : 'false');
    },
    'toggle-listeners': function (el) {
      const panel = el.closest('.live-panel');
      if (panel) panel.classList.toggle('collapsed');
    },
    'enter-room': function () { closeModal(); toast('Opening the live room in a new tab…'); },
    'share-email': function (el) {
      const s = show(el.dataset.id);
      copyText(roomUrlFor(s));
      toast('Room link copied — paste it into your email');
    },
    'embed-code': function (el) { openEmbedModal(show(el.dataset.id)); },
    'get-recording': function () {
      toast('Recording is being prepared — we’ll email you the link');
    },
    'edit-room-url': function () { openEditRoomUrl(); },
    'auto-share': function () { openAutoShare(); },
    'auto-share-set': function (el) {
      const row = el.closest('.auto-share-row');
      if (row) row.classList.toggle('on', el.dataset.on === '1');
    },
    'invite-cohost': function (el) {
      openLiveInviteModal(show(el.dataset.id));
    },
    'delete-show': function (el) {
      const s = data.shows.find(function (item) { return item.id === el.dataset.id; });
      if (!s) return;
      closeAllMenus();
      confirmModal({
        title: 'Delete this show?',
        desc: '“' + esc(s.title) + '” and its room settings will be removed. Recordings and earnings are kept.',
        confirmLabel: 'Delete',
        tone: 'danger',
        onConfirm: function () {
          data.shows = data.shows.filter(function (item) { return item.id !== s.id; });
          save();
          render({ preserveScroll: true });
          toast('Show deleted');
        }
      });
    },
    'new-show': function () {
      ui.newShowStep = 1;
      ui.newShowDraft = null;
      go('/shows/new');
    },
    'toggle-start-menu': function (el) {
      const menu = el.parentNode.querySelector('.start-menu');
      if (!menu) return;
      const open = menu.classList.toggle('is-open');
      el.setAttribute('aria-expanded', open ? 'true' : 'false');
    },
    'start-mode': function (el) {
      const main = document.querySelector('.start-main');
      if (main) main.textContent = el.dataset.mode === 'schedule' ? 'Schedule' : 'Start now';
      document.querySelectorAll('.start-menu .menu-item').forEach(function (item) {
        item.classList.toggle('selected', item === el);
      });
      const menu = el.closest('.start-menu');
      if (menu) menu.classList.remove('is-open');
    },
    'cancel-new-show': function () {
      ui.newShowStep = 1;
      ui.newShowDraft = null;
      go('/shows');
    },
    'wizard-back': function () {
      ui.newShowStep = 1;
      render({ forceTop: true });
    },
    'go-live': function () {
      const draft = ui.newShowDraft;
      if (!draft) {
        ui.newShowStep = 1;
        render({ forceTop: true });
        return;
      }
      const newShow = {
        id: 'show-' + Date.now(),
        title: draft.title,
        visibility: draft.visibility,
        status: 'live',
        date: todayISO(),
        podPoints: 0,
        listeners: 0,
        hearts: 0,
        category: draft.category,
        about: draft.about
      };
      data.shows.unshift(newShow);
      save();
      ui.newShowStep = 1;
      ui.newShowDraft = null;
      go('/live-room/' + newShow.id);
      toast('You’re live! Your room is ready for listeners');
    },
    'finish-invites': function () {
      go('/shows');
      toast('Co-host invites saved');
    },

    'select-metric': function (el) {
      const metric = el.dataset.metric;
      try { history.replaceState(null, '', '#/statistics/' + metric); } catch (err) { /* file:// fallback */ }
      render({ preserveScroll: true, noAnimation: true });
    },
    'stats-range': function () { render({ preserveScroll: true }); },
    'share-achievement': function (el) {
      const path = parseHash().path;
      const metric = path.split('/')[2] || 'listeners';
      openShareAchievement(METRIC_CONFIG[metric] ? metric : 'listeners');
    },
    'copy-share-link': function () {
      copyText(location.href);
      closeModal();
    },

    'shows-page': function (el) {
      ui.showsPage = Number(el.dataset.page);
      render({ preserveScroll: true });
    },
    'earnings-page': function (el) {
      ui.earningsPage = Number(el.dataset.page);
      render({ preserveScroll: true });
    },
    'gift-page': function (el) {
      ui.giftPage = Number(el.dataset.page);
      render({ preserveScroll: true });
    },
    'payout-page': function (el) {
      ui.payoutPage = Number(el.dataset.page);
      render({ preserveScroll: true });
    },
    'earnings-export': function () {
      const rows = filteredEarnings();
      const csv = [['Show', 'Time', 'PodPoints', 'Gift users', 'Gifts', 'Top gifter']].concat(rows.map(function (r) {
        return [r.showTitle, fmtDateTime(r.date), r.podPoints, r.giftUsers, r.giftCount, r.topGifter];
      }));
      downloadCSV('podbean-live-earnings.csv', csv);
    },
    'clear-earnings': function () {
      ui.earningsQuery = '';
      ui.earningsRange = '90';
      ui.earningsPage = 1;
      render({ preserveScroll: true });
    },
    'connect-payout': function () { openPaypalModal(); },
    'disconnect-payout': function () {
      closeAllMenus();
      confirmModal({
        title: 'Disconnect PayPal?',
        desc: 'Payouts will pause until you connect an account again. You can reconnect at any time.',
        confirmLabel: 'Disconnect',
        tone: 'danger',
        icon: 'wallet',
        onConfirm: function () {
          data.payouts.account = null;
          save();
          render({ preserveScroll: true });
          toast('PayPal account disconnected');
        }
      });
    },
    'payout-learn-more': function () {
      openModal(modalShell({
        title: 'How payouts work',
        desc: 'PodPoints become cash once they clear the payout threshold.',
        body: '<div class="help-list">' +
          '<div class="help-item"><span class="help-item-ico">' + icon('coins') + '</span><span class="help-item-text"><strong>Earn PodPoints</strong><span>Listeners send gifts during your live shows and community posts.</span></span></div>' +
          '<div class="help-item"><span class="help-item-ico">' + icon('wallet') + '</span><span class="help-item-text"><strong>Reach the threshold</strong><span>Once your balance is at least $25, it becomes eligible for payout.</span></span></div>' +
          '<div class="help-item"><span class="help-item-ico">' + icon('send') + '</span><span class="help-item-text"><strong>Get paid via PayPal</strong><span>Payouts are sent on the 1st and 15th of each month.</span></span></div>' +
          '</div>',
        foot: '<button class="btn btn-primary" data-action="close-modal">Got it</button>'
      }));
    },

    'like-post': function (el) {
      const post = data.posts.find(function (p) { return p.id === el.dataset.id; });
      if (!post) return;
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      save();
      el.classList.toggle('liked', post.liked);
      el.setAttribute('aria-pressed', post.liked ? 'true' : 'false');
      el.innerHTML = icon(post.liked ? 'heart-filled' : 'heart') + '<span>' + num(post.likes) + '</span>';
    },
    'toggle-comments': function (el) {
      const postEl = el.closest('.post-card');
      const comments = postEl.querySelector('.comments');
      if (!comments) return;
      const willShow = comments.hidden;
      comments.hidden = !willShow;
      el.setAttribute('aria-expanded', willShow ? 'true' : 'false');
      if (willShow) {
        const input = comments.querySelector('input');
        if (input) setTimeout(function () { input.focus(); }, 30);
      }
    },
    'delete-post': function (el) {
      const post = data.posts.find(function (p) { return p.id === el.dataset.id; });
      if (!post) return;
      closeAllMenus();
      confirmModal({
        title: 'Delete this post?',
        desc: '“' + esc(post.title) + '” will be removed from the community feed for all members.',
        confirmLabel: 'Delete post',
        tone: 'danger',
        icon: 'trash',
        onConfirm: function () {
          data.posts = data.posts.filter(function (p) { return p.id !== post.id; });
          save();
          render({ preserveScroll: true });
          toast('Post deleted');
        }
      });
    },
    'clear-post-image': function (el, ev) {
      if (ev) ev.preventDefault();
      ui.postImage = null;
      const preview = $('#post-image-preview');
      const empty = $('#upload-plus');
      const input = $('#post-image');
      if (preview) { preview.classList.remove('show'); preview.querySelector('img').removeAttribute('src'); }
      if (empty) empty.style.display = '';
      if (input) input.value = '';
    },
    'set-membership': openMembershipModal,
    'resend-invite': function (el) {
      toast('Invite resent to ' + el.dataset.email);
    },
    'copy-fanclub-link': function () {
      copyText('https://live.podbean.com/fanclub/join/podbean-live');
      toast('Fan club invite link copied');
    },
    'members-page': function (el) {
      ui.membersPage = Number(el.dataset.page);
      applyMemberFilter();
    },
    'clear-member-search': function () {
      ui.memberQuery = '';
      const input = $('#member-search');
      if (input) input.value = '';
      applyMemberFilter();
    },

    'mark-all-read': function () {
      data.notifications.forEach(function (n) { n.unread = false; });
      data.notificationsRead = true;
      save();
      renderChrome(parseHash());
      toast('All notifications marked as read');
    },
    'notif-click': function (el) {
      const n = data.notifications.find(function (item) { return item.id === el.dataset.id; });
      if (n) {
        n.unread = false;
        save();
        renderChrome(parseHash());
        toast(n.title);
      }
    },

    'clear-show-filters': function () {
      ui.showsQuery = '';
      ui.showsStatus = 'all';
      ui.showsPage = 1;
      render({ preserveScroll: true });
    }
  };

  function filteredEarnings() {
    const days = ui.earningsRange === 'all' ? Infinity : Number(ui.earningsRange);
    const cutoff = days === Infinity ? 0 : Date.now() - days * 86400000;
    const q = ui.earningsQuery.trim().toLowerCase();
    return data.earnings.filter(function (row) {
      if (new Date(row.date).getTime() < cutoff) return false;
      if (q && (row.showTitle + ' ' + row.topGifter).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function memberPager(current, total) {
    if (total <= 1) return '';
    const pages = [];
    for (let i = 1; i <= total; i++) {
      pages.push('<button type="button" class="' + (i === current ? 'active' : '') + '" data-action="members-page" data-page="' + i + '"' + (i === current ? ' aria-current="page"' : '') + '>' + i + '</button>');
    }
    return '<div class="pager">' +
      '<button type="button" data-action="members-page" data-page="' + (current - 1) + '" aria-label="Previous page"' + (current === 1 ? ' disabled' : '') + '>' + icon('chevron-left') + '</button>' +
      pages.join('') +
      '<button type="button" data-action="members-page" data-page="' + (current + 1) + '" aria-label="Next page"' + (current === total ? ' disabled' : '') + '>' + icon('chevron-right') + '</button>' +
      '</div>';
  }

  function applyMemberFilter() {
    const q = ui.memberQuery.trim().toLowerCase();
    const rows = $$('#member-rows [data-member]');
    const matched = rows.filter(function (row) { return !q || row.dataset.search.indexOf(q) !== -1; });
    const total = matched.length;
    const perPage = 12;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(Math.max(1, ui.membersPage || 1), totalPages);
    ui.membersPage = page;
    const start = (page - 1) * perPage;
    rows.forEach(function (row) { row.hidden = true; });
    matched.slice(start, start + perPage).forEach(function (row) { row.hidden = false; });
    const range = $('#member-range');
    if (range) range.textContent = total ? ('Showing ' + (start + 1) + '–' + Math.min(start + perPage, total) + ' of ' + total + ' members') : '';
    const pagerEl = $('#member-pager');
    if (pagerEl) pagerEl.innerHTML = memberPager(page, totalPages);
    const foot = $('.member-foot');
    if (foot) foot.hidden = total === 0;
    const empty = $('#member-empty');
    if (empty) empty.hidden = total !== 0;
  }

  /* ============================== router ============================== */
  function parseHash() {
    let raw = location.hash.replace(/^#/, '');
    if (!raw) raw = '/shows';
    const qIndex = raw.indexOf('?');
    const path = qIndex >= 0 ? raw.slice(0, qIndex) : raw;
    const search = qIndex >= 0 ? raw.slice(qIndex + 1) : '';
    const params = new URLSearchParams(search);
    return { path: path.replace(/\/+$/, '') || '/shows', search: search, params: params, raw: raw };
  }

  function go(path) {
    if (location.hash === '#' + path) render({ preserveScroll: true });
    else location.hash = path;
  }

  function resolveView(r) {
    const v = window.PB.views;
    if (r.path.indexOf('/live-room') === 0) return v.liveRoom(r);
    if (r.path === '/shows') return v.shows(r);
    if (r.path === '/shows/new') return v.newShow(r);
    if (r.path === '/shows/invite') return v.invite(r);
    if (r.path.indexOf('/statistics') === 0) return v.statistics(r);
    if (/^\/payments\/earnings\/[^/]+\/gifts$/.test(r.path)) return v.giftDetails(r);
    if (r.path === '/payments/earnings') return v.earnings(r);
    if (r.path === '/payments/payouts/history') return v.payouts(r);
    if (r.path === '/payments/payouts/empty') return v.payouts(r);
    if (r.path === '/payments/payouts') return v.payouts(r);
    if (r.path === '/fanclub/community') return v.community(r);
    if (r.path === '/fanclub/community/new') return v.createPost(r);
    if (r.path === '/fanclub/members') return v.members(r);
    return v.notFound(r);
  }

  function render(opts) {
    opts = opts || {};
    const r = parseHash();
    const changed = r.path !== ui.lastPath || r.search !== ui.lastSearch;
    const previousScroll = window.scrollY;
    const isLiveRoom = r.path.indexOf('/live-room') === 0;

    if (ui.liveRoomTimer) {
      clearInterval(ui.liveRoomTimer);
      ui.liveRoomTimer = null;
    }
    document.body.classList.toggle('live-room-mode', isLiveRoom);

    closeAllMenus();
    renderChrome(r);
    const view = resolveView(r);
    const main = $('#main');
    main.classList.toggle('route-change', changed && !opts.noAnimation);
    main.innerHTML = view.html;
    document.title = (view.title || 'Dashboard') + ' · Podbean';
    if (typeof view.mount === 'function') view.mount(r);
    mountCharts();

    ui.lastPath = r.path;
    ui.lastSearch = r.search;

    if (opts.forceTop) window.scrollTo(0, 0);
    else if (opts.preserveScroll) window.scrollTo(0, previousScroll);
    else if (changed) window.scrollTo(0, 0);
  }

  function rerender() { render({ preserveScroll: true }); }

  /* ============================== global listeners ============================== */
  function initShell() {
    const logoEl = $('.logo');
    if (logoEl) logoEl.innerHTML = window.logoMark();
    let collapsed = false;
    try { collapsed = localStorage.getItem(COLLAPSE_KEY) === '1'; } catch (err) { collapsed = false; }
    if (collapsed && window.innerWidth > 1024) {
      document.body.classList.add('sidebar-collapsed');
    }
    renderChrome(parseHash());
  }

  document.addEventListener('click', function (ev) {
    if (!ev.target.closest('.start-menu-wrap')) {
      document.querySelectorAll('.start-menu.is-open').forEach(function (menu) {
        menu.classList.remove('is-open');
        const caret = menu.parentNode.querySelector('.start-caret');
        if (caret) caret.setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.addEventListener('click', function (ev) {
    const mutePop = document.getElementById('live-mute-popover');
    if (mutePop && !mutePop.hidden && !ev.target.closest('#live-mute-popover') && !ev.target.closest('[data-action="toggle-mute-popover"]')) {
      mutePop.hidden = true;
      const muteBtn = $('[data-action="toggle-mute-popover"]');
      if (muteBtn) muteBtn.setAttribute('aria-expanded', 'false');
    }

    const menuBtn = ev.target.closest('[data-menu-toggle]');
    if (menuBtn) {
      ev.preventDefault();
      ev.stopPropagation();
      toggleMenu(menuBtn);
      return;
    }

    const tabBtn = ev.target.closest('[data-tab]');
    if (tabBtn) {
      const group = tabBtn.closest('[data-tabs]');
      if (group) {
        $$('.tab', group).forEach(function (t) { t.classList.toggle('active', t === tabBtn); });
        $$('.tab-panel', group).forEach(function (p) { p.hidden = p.dataset.panel !== tabBtn.dataset.tab; });
      }
      return;
    }

    const actionEl = ev.target.closest('[data-action]');
    if (actionEl) {
      const action = actionEl.dataset.action;
      if (actionEl.tagName === 'A') ev.preventDefault();
      if (action === 'modal-backdrop') {
        if (ev.target.classList.contains('modal-backdrop')) closeModal();
        return;
      }
      if (actionEl.closest('.menu') && !actionEl.hasAttribute('data-menu-keep')) closeAllMenus();
      if (action === 'clear-post-image') ev.preventDefault();
      if (actions[action]) {
        if (action !== 'nav-group' && !actionEl.hasAttribute('data-menu-keep')) closeAllMenus();
        actions[action](actionEl, ev);
      }
      return;
    }

    if (!ev.target.closest('.menu-wrap')) closeAllMenus();

    const navLink = ev.target.closest('.nav-sub-link, .sidebar a.nav-item');
    if (navLink && window.innerWidth <= 1024) document.body.classList.remove('sidebar-open');
  });

  document.addEventListener('submit', function (ev) {
    const form = ev.target.closest('form[data-form]');
    if (!form) return;
    ev.preventDefault();
    const kind = form.dataset.form;
    const fd = new FormData(form);
    const val = function (name) { return String(fd.get(name) || '').trim(); };

    function error(field, message) {
      const row = form.querySelector('[data-field="' + field + '"]');
      if (!row) return false;
      row.classList.add('has-error');
      const msg = row.querySelector('.form-error');
      if (msg && message) msg.textContent = message;
      const input = row.querySelector('input, select, textarea');
      if (input) input.focus();
      return false;
    }
    $$('.form-row', form).forEach(function (row) { row.classList.remove('has-error'); });

    if (kind === 'invite-email') {
      const email = val('email');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { error('email', 'Enter a valid email address.'); return; }
      if (data.invites.some(function (i) { return i.email.toLowerCase() === email.toLowerCase(); })) {
        toast('That person has already been invited', 'error');
        return;
      }
      const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      data.invites.unshift({ id: 'inv-' + Date.now(), name: name, email: email, status: 'Invited' });
      save();
      rerender();
      toast('Invite sent to ' + email);
      return;
    }

    if (kind === 'create-show') {
      const title = val('title');
      if (!title) { error('title', 'Give your live room a title.'); return; }
      const visibility = form.querySelector('input[name="visibility"]:checked');
      ui.newShowDraft = {
        title: title,
        visibility: visibility ? visibility.value : 'public',
        category: val('category') || 'Education',
        about: val('about')
      };
      ui.newShowStep = 2;
      render({ forceTop: true });
      toast('Details saved — now invite your co-hosts');
      return;
    }

    if (kind === 'create-post') {
      const title = val('post-title');
      const body = val('post-body');
      if (!title) { error('title', 'Add a title for your post.'); return; }
      const post = {
        id: 'post-' + Date.now(),
        author: data.currentUser.name,
        time: 'Just now',
        title: title,
        body: body,
        cover: ui.postImage || null,
        likes: 0,
        liked: false,
        comments: []
      };
      data.posts.unshift(post);
      const saved = save();
      if (!saved && ui.postImage) {
        post.cover = null;
        save();
        toast('Post published — image was too large to store in this demo', 'error');
      } else {
        toast('Post published to your community');
      }
      ui.postImage = null;
      go('/fanclub/community');
      return;
    }

    if (kind === 'add-comment') {
      const postId = form.dataset.post;
      const text = val('comment');
      if (!text) return;
      const post = data.posts.find(function (p) { return p.id === postId; });
      if (!post) return;
      const comment = { name: data.currentUser.name, time: 'Just now', text: text };
      post.comments.push(comment);
      save();
      const card = form.closest('.post-card');
      const list = card.querySelector('.comments-list');
      const item = document.createElement('div');
      item.className = 'comment';
      item.innerHTML = avatar(comment.name, 28) +
        '<div class="comment-body"><div class="comment-head"><span class="comment-name">' + esc(comment.name) + '</span><span class="comment-time">Just now</span></div>' +
        '<div class="comment-text">' + esc(comment.text) + '</div></div>';
      list.appendChild(item);
      form.reset();
      const countBtn = card.querySelector('[data-action="toggle-comments"] span');
      if (countBtn) countBtn.textContent = post.comments.length;
      return;
    }

    if (kind === 'live-chat') {
      const text = val('message');
      if (!text) return;
      const body = document.getElementById('live-chat-body');
      if (!body) return;
      const host = data.currentUser.name;
      const msg = document.createElement('div');
      msg.className = 'live-msg mine';
      msg.innerHTML = '<div class="live-msg-main"><div class="live-msg-meta"><span class="live-msg-name">' + esc(host) + '</span><span class="live-badge host">Host</span></div>' +
        '<div class="live-bubble">' + esc(text) + '</div></div>' + avatar(host, 26);
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
      form.reset();
      return;
    }

    if (kind === 'live-invite-email') {
      const email = val('email');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        toast('Enter a valid email address', 'error');
        return;
      }
      const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      data.invites.unshift({ id: 'inv-' + Date.now(), name: name, email: email, status: 'Invited' });
      save();
      const list = document.getElementById('live-invite-list');
      if (list) {
        const row = document.createElement('div');
        row.className = 'live-invite-person';
        row.innerHTML = avatar(name, 36) + '<span class="live-invite-name">' + esc(name) + '</span><span class="live-sent">Sent</span>';
        list.prepend(row);
      }
      form.reset();
      toast('Invite sent to ' + email);
      return;
    }

    if (kind === 'paypal-account') {
      const email = val('email');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { error('email', 'Enter a valid email address.'); return; }
      const onEmptyState = parseHash().path === '/payments/payouts/empty';
      data.payouts.account = email;
      save();
      closeModal();
      if (onEmptyState) go('/payments/payouts');
      else render({ preserveScroll: true });
      toast('PayPal payout account connected');
      return;
    }

    if (kind === 'membership-fee') {
      const fee = Number(val('fee'));
      if (!fee || fee < 0.99) { error('fee', 'Enter a price of at least $0.99.'); return; }
      data.membershipFee = Math.round(fee * 100) / 100;
      save();
      closeModal();
      render({ preserveScroll: true });
      toast('Membership fee saved — $' + Number(data.membershipFee).toFixed(2) + ' / month');
      return;
    }

    if (kind === 'account-settings') {
      const name = val('name');
      const email = val('email');
      if (!name) { error('name', 'Enter your name.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { error('email', 'Enter a valid email address.'); return; }
      data.currentUser.name = name;
      data.currentUser.email = email;
      save();
      closeModal();
      render({ preserveScroll: true });
      toast('Account details saved');
      return;
    }

    if (kind === 'room-url') {
      let url = val('url');
      if (!url) { error('url', 'Enter a live room URL.'); return; }
      if (!/^https?:\/\//.test(url)) url = 'https://www.podbean.com/lsw/' + url.replace(/^\/+/, '');
      if (!/^https?:\/\/.+/.test(url)) { error('url', 'Enter a valid URL starting with https://.'); return; }
      const showObj = data.shows.find(function (x) { return x.status === 'live'; }) || data.shows[0];
      const parts = url.split('/lsw/');
      if (parts.length > 1 && showObj) {
        showObj.shareSlug = parts[1].split('?')[0].replace(/\/+$/, '');
      } else {
        data.liveRoomUrl = url.replace(/\/$/, '');
      }
      save();
      closeModal();
      toast('Live room URL updated');
      return;
    }

    if (kind === 'auto-share') {
      closeModal();
      toast('Auto-share preferences saved');
      return;
    }
  });

  document.addEventListener('change', function (ev) {
    const range = ev.target.closest('[data-range="stats"]');
    if (range) {
      ui.statsRange = range.value;
      render({ preserveScroll: true });
      return;
    }
    const earningsRange = ev.target.closest('[data-range="earnings"]');
    if (earningsRange) {
      ui.earningsRange = earningsRange.value;
      ui.earningsPage = 1;
      render({ preserveScroll: true });
      return;
    }
    const visibility = ev.target.closest('input[name="visibility"], input[name="live-visibility"]');
    if (visibility) {
      $$('.radio-card', visibility.closest('form')).forEach(function (card) {
        card.classList.toggle('selected', card.querySelector('input').checked);
      });
    }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      if ($('#modal-root').firstChild) { closeModal(); return; }
      const mutePop = $('#live-mute-popover');
      if (mutePop && !mutePop.hidden) {
        mutePop.hidden = true;
        const muteBtn = $('[data-action="toggle-mute-popover"]');
        if (muteBtn) muteBtn.setAttribute('aria-expanded', 'false');
        return;
      }
      closeAllMenus();
      document.body.classList.remove('sidebar-open');
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024) document.body.classList.remove('sidebar-open');
    closeAllMenus();
  });
  window.addEventListener('scroll', function () {
    if (ui.floatingMenus.length) closeAllMenus();
  }, { passive: true });

  window.addEventListener('hashchange', function () {
    render({ forceTop: true });
  });

  /* ============================== public API ============================== */
  window.PB = {
    getData: function () { return data; },
    getUI: function () { return ui; },
    save: save,
    esc: esc,
    num: num,
    compact: compact,
    money: money,
    fmtDate: fmtDate,
    fmtShort: fmtShort,
    fmtTime: fmtTime,
    fmtDateTime: fmtDateTime,
    fmtStamp: fmtStamp,
    fmtDay: fmtDay,
    plural: plural,
    slugify: slugify,
    avatar: avatar,
    statusPill: statusPill,
    visPill: visPill,
    coin: coin,
    heart: heart,
    delta: delta,
    emptyDocument: emptyDocument,
    emptyCoins: emptyCoins,
    emptySearch: emptySearch,
    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
    modalShell: modalShell,
    confirmModal: confirmModal,
    copyText: copyText,
    downloadCSV: downloadCSV,
    go: go,
    render: render,
    rerender: rerender,
    parseHash: parseHash,
    buildStats: buildStats,
    chartSVG: chartSVG,
    sparkline: sparkline,
    METRIC_CONFIG: METRIC_CONFIG,
    RANGE_LABELS: RANGE_LABELS,
    show: show,
    roomUrlFor: roomUrlFor,
    shareUrlFor: shareUrlFor,
    filteredEarnings: filteredEarnings,
    applyMemberFilter: applyMemberFilter,
    actions: actions
  };

  document.addEventListener('DOMContentLoaded', function () {
    renderHelpMenu();
    initShell();
    if (!location.hash) {
      try { history.replaceState(null, '', '#/shows'); } catch (err) { /* file:// fallback */ }
    }
    render({ forceTop: true });
  });
})();
