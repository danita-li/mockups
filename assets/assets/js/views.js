/* Podbean — page views */
(function () {
  'use strict';

  const PB = window.PB;
  const esc = PB.esc;
  const num = PB.num;
  const avatar = PB.avatar;
  const icon = window.icon;

  function giftEmoji(name) {
    return {
      Clap: '👏',
      'Mic Drop': '🎤',
      Applause: '🙌',
      Heart: '❤️',
      Fire: '🔥',
      Star: '⭐',
      Confetti: '🎉',
      Trophy: '🏆'
    }[name] || '🎁';
  }

  function pageHead(opts) {
    const crumb = opts.breadcrumb ? '<div class="breadcrumb">' + opts.breadcrumb + '</div>' : '';
    return '<div class="page-head"' + (opts.headStyle ? ' style="' + opts.headStyle + '"' : '') + '><div class="page-head-main">' +
      (opts.crumbBelow ? '' : crumb) +
      '<h1 class="page-title">' + opts.title + '</h1>' +
      (opts.sub ? '<p class="page-sub">' + opts.sub + '</p>' : '') +
      (opts.crumbBelow ? crumb : '') +
      '</div>' + (opts.actions ? '<div class="page-actions">' + opts.actions + '</div>' : '') +
      '</div>';
  }

  function rangeControl(attr, options, current) {
    return '<label class="control date-control">' + icon('calendar') +
      '<select data-range="' + attr + '" aria-label="Date range">' +
      options.map(function (o) {
        return '<option value="' + o[0] + '"' + (o[0] === current ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
      }).join('') + '</select>' + icon('chevron-down', 'control-caret') + '</label>';
  }

  function pager(current, total, action) {
    if (total <= 1) return '';
    const pages = [];
    for (let i = 1; i <= total; i++) {
      pages.push('<button type="button" class="' + (i === current ? 'active' : '') + '" data-action="' + action + '" data-page="' + i + '"' + (i === current ? ' aria-current="page"' : '') + '>' + i + '</button>');
    }
    return '<div class="pager">' +
      '<button type="button" data-action="' + action + '" data-page="' + (current - 1) + '" aria-label="Previous page"' + (current === 1 ? ' disabled' : '') + '>' + icon('chevron-left') + '</button>' +
      pages.join('') +
      '<button type="button" data-action="' + action + '" data-page="' + (current + 1) + '" aria-label="Next page"' + (current === total ? ' disabled' : '') + '>' + icon('chevron-right') + '</button>' +
      '</div>';
  }

  function showsView() {
    const db = PB.getData();
    const ui = PB.getUI();
    const counts = db.shows.reduce(function (acc, s) { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {});
    const orderedShows = db.shows.slice().sort(function (a, b) {
      const la = a.status === 'live';
      const lb = b.status === 'live';
      if (la !== lb) return la ? -1 : 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    const rows = orderedShows.map(function (s, i) {
      const isUpcoming = s.status === 'live' || s.status === 'scheduled';
      const search = (s.title + ' ' + s.visibility + ' ' + s.status + ' ' + (s.category || '')).toLowerCase();
      const menu = '<div class="menu-wrap" data-menu-fixed>' +
        '<button class="btn btn-ghost btn-sm btn-icon" data-menu-toggle aria-label="More actions for ' + esc(s.title) + '" aria-expanded="false">' + icon('more') + '</button>' +
        '<div class="menu">' +
        ((s.status === 'live' || s.status === 'scheduled')
          ? '<button class="menu-item" data-action="share-show" data-id="' + s.id + '">' + icon('link') + 'Share This Show</button>' +
            '<button class="menu-item" data-action="invite-cohost" data-id="' + s.id + '">' + icon('user') + 'Invite Co-Hosts</button>'
          : s.status === 'finished'
            ? '<button class="menu-item" data-action="get-recording">' + icon('download') + 'Get Recording</button>'
            : '') +
        '<button class="menu-item danger" data-action="delete-show" data-id="' + s.id + '">' + icon('trash') + 'Delete</button>' +
        '</div></div>';
      return '<tr data-show-row data-status="' + s.status + '" data-search="' + esc(search) + '">' +
        '<td><input type="checkbox" class="checkbox row-check" aria-label="Select ' + esc(s.title) + '"></td>' +
        '<td><span class="cell-title">' + esc(s.title) + '</span></td>' +
        '<td>' + PB.visPill(s.visibility) + '</td>' +
        '<td>' + PB.statusPill(s.status) + '</td>' +
        '<td class="nowrap"><div class="cell-strong">' + PB.fmtDate(s.date) + '</div><div class="cell-sub">' + PB.fmtTime(s.date) + '</div></td>' +
        '<td>' + PB.coin(s.podPoints) + '</td>' +
        '<td><div class="audience-cell">' +
        '<span class="audience-line">' + icon('user') + (s.listeners == null ? '—' : num(s.listeners)) + '</span>' +
        '<span class="audience-line hearts">' + icon('heart-filled') + (s.hearts == null ? '—' : num(s.hearts)) + '</span>' +
        '</div></td>' +
        '<td class="row-actions"><div class="row-actions-inner">' +
        (isUpcoming ? '<button class="btn btn-secondary btn-sm" data-action="enter-live-room" data-id="' + s.id + '">Live Room</button>' : '') +
        menu +
        '</div></td></tr>';
    }).join('');

    const lead = db.shows[0] || { id: '', title: 'live show' };
    const html = '<div class="page shows-page">' +
      pageHead({
        title: 'Live Shows',
        sub: 'Create rooms, invite co-hosts and keep every broadcast in one place.',
        actions:
          '<button class="btn btn-primary" data-action="new-show">' + icon('plus') + 'New Live Show</button>' +
          '<div class="menu-wrap"><button class="btn btn-secondary" data-menu-toggle aria-haspopup="true" aria-expanded="false">Share' + icon('chevron-down') + '</button>' +
          '<div class="menu">' +
          '<button class="menu-item" data-action="open-live-room" data-id="' + lead.id + '">' + icon('share') + 'Share Live Room</button>' +
          '<button class="menu-item" data-action="auto-share">' + icon('send') + 'Set Up Auto-Share</button>' +
          '<button class="menu-item" data-action="embed-code" data-id="' + lead.id + '">' + icon('external-link') + 'Embed</button>' +
          '</div></div>' +
          '<div class="menu-wrap"><button class="btn btn-secondary btn-icon" data-menu-toggle aria-label="Live room settings" aria-expanded="false">' + icon('more') + '</button>' +
          '<div class="menu">' +
          '<button class="menu-item" data-action="edit-room-url">' + icon('link') + 'Edit Live Room URL</button>' +
          '</div></div>'
      }) +
      '<div class="card card-plain table-card">' +
      '<div class="table-toolbar">' +
      '<div class="search-box">' + icon('search') + '<input id="show-search" type="search" placeholder="Search live shows" value="' + esc(ui.showsQuery) + '" aria-label="Search live shows"></div>' +
      '<div class="select-control"><select id="show-status" aria-label="Filter by status">' +
      '<option value="all">All status</option>' +
      ['live', 'scheduled', 'finished', 'expired'].map(function (s) {
        return '<option value="' + s + '"' + (ui.showsStatus === s ? ' selected' : '') + '>' + s.charAt(0).toUpperCase() + s.slice(1) + ' (' + (counts[s] || 0) + ')</option>';
      }).join('') +
      '</select>' + icon('chevron-down') + '</div>' +
      '</div>' +
      '<div class="table-wrap" id="shows-table-wrap"><table class="data-table shows-table"><thead><tr>' +
      '<th style="width:36px"><input type="checkbox" class="checkbox" id="select-all-shows" aria-label="Select all shows"></th>' +
      '<th>Title</th><th>Visibility</th><th>Status</th><th>Start Time</th><th>PodPoints</th><th>Audience</th><th style="text-align:right">Action</th>' +
      '</tr></thead><tbody id="shows-tbody">' + rows + '</tbody></table></div>' +
      '<div class="table-foot" id="shows-foot" hidden><span id="shows-range"></span><div id="shows-pager"></div></div>' +
      '<div class="empty" id="shows-empty" hidden>' + PB.emptySearch() +
      '<h3 class="empty-title">' + (db.shows.length ? 'No shows match your filters' : 'No live shows yet') + '</h3>' +
      '<p class="empty-text">' + (db.shows.length ? 'Try a different search term or status, or clear the filters to see all of your live shows.' : 'Create your first live room, invite a co-host and go live to your listeners.') + '</p>' +
      '<div class="empty-actions">' + (db.shows.length
        ? '<button class="btn btn-secondary" data-action="clear-show-filters">Clear filters</button>'
        : '<button class="btn btn-primary" data-action="new-show">' + icon('plus') + 'New Live Show</button>') + '</div></div>' +
      '</div></div>';

    return {
      title: 'Live Shows',
      html: html,
      mount: function () {
        const search = document.getElementById('show-search');
        const status = document.getElementById('show-status');
        const empty = document.getElementById('shows-empty');
        const wrap = document.getElementById('shows-table-wrap');
        const selectAll = document.getElementById('select-all-shows');
        const foot = document.getElementById('shows-foot');
        const range = document.getElementById('shows-range');
        const pagerEl = document.getElementById('shows-pager');
        const perPage = 8;

        function apply() {
          if (!wrap.isConnected) return;
          const q = PB.getUI().showsQuery.trim().toLowerCase();
          const statusVal = PB.getUI().showsStatus;
          const rows = Array.prototype.slice.call(document.querySelectorAll('#shows-tbody [data-show-row]'));
          const matched = rows.filter(function (row) {
            return (!q || row.dataset.search.indexOf(q) !== -1) && (statusVal === 'all' || row.dataset.status === statusVal);
          });
          const total = matched.length;
          const totalPages = Math.max(1, Math.ceil(total / perPage));
          const page = Math.min(Math.max(1, PB.getUI().showsPage), totalPages);
          PB.getUI().showsPage = page;
          const start = (page - 1) * perPage;
          const pageRows = matched.slice(start, start + perPage);
          rows.forEach(function (row) { row.hidden = true; });
          pageRows.forEach(function (row) { row.hidden = false; });

          wrap.hidden = total === 0;
          empty.hidden = total !== 0;
          foot.hidden = total === 0;
          if (total) {
            range.textContent = 'Showing ' + (start + 1) + '–' + (start + pageRows.length) + ' of ' + total + ' shows';
            pagerEl.innerHTML = pager(page, totalPages, 'shows-page');
          }
          if (selectAll) {
            const checks = Array.prototype.slice.call(document.querySelectorAll('#shows-tbody .row-check')).filter(function (c) { return !c.closest('tr').hidden; });
            selectAll.checked = checks.length > 0 && checks.every(function (c) { return c.checked; });
            selectAll.indeterminate = checks.some(function (c) { return c.checked; }) && !selectAll.checked;
          }
        }

        search.addEventListener('input', function () { PB.getUI().showsQuery = search.value; PB.getUI().showsPage = 1; apply(); });
        status.addEventListener('change', function () { PB.getUI().showsStatus = status.value; PB.getUI().showsPage = 1; apply(); });
        apply();

        document.querySelectorAll('.row-check').forEach(function (check) {
          check.addEventListener('change', function () {
            check.closest('tr').classList.toggle('selected', check.checked);
            apply();
          });
        });
        if (selectAll) {
          selectAll.addEventListener('change', function () {
            document.querySelectorAll('#shows-tbody .row-check').forEach(function (check) {
              if (!check.closest('tr').hidden) {
                check.checked = selectAll.checked;
                check.closest('tr').classList.toggle('selected', check.checked);
              }
            });
          });
        }
      }
    };
  }

  function wizardSteps(step) {
    return '<div class="stepper" aria-label="Create live show steps">' +
      '<div class="step' + (step === 1 ? ' active' : ' done') + '">' +
      '<span class="step-num">' + (step > 1 ? icon('check') : '1') + '</span>' +
      '<span class="step-label">Show details</span></div>' +
      '<span class="step-line" aria-hidden="true"></span>' +
      '<div class="step' + (step === 2 ? ' active' : '') + '">' +
      '<span class="step-num">2</span><span class="step-label">Invite co-hosts</span></div>' +
      '</div>';
  }

  function invitePanel(ref) {
    const db = PB.getData();
    const link = (PB.shareUrlFor ? PB.shareUrlFor(ref) : PB.roomUrlFor(ref)) + '&invite=cohost';
    const invites = db.invites;
    const recent = invites.map(function (inv, i) {
      const sent = inv.status === 'Joined';
      return '<div class="live-invite-person">' + invitePhoto(i, 36, inv.name) +
        '<span class="live-invite-name">' + esc(inv.name) + '</span>' +
        (sent ? '<span class="live-sent">Sent</span>' : '<button type="button" class="btn btn-primary btn-sm" data-action="live-invite-send">Invite</button>') +
        '</div>';
    }).join('');
    return '<div class="live-invite-modal">' +
      '<h3 class="live-invite-title">Invite via Link</h3>' +
      '<p class="live-invite-text">Share this link to invite people as your co-host.</p>' +
      '<div class="live-invite-row"><input class="input" id="invite-link" readonly value="' + esc(link) + '" aria-label="Co-host invite link">' +
      '<button class="btn btn-secondary btn-sm invite-copy" data-action="copy" data-copy="' + esc(link) + '">Copy</button></div>' +
      '<h3 class="live-invite-title">Invite via Email</h3>' +
      '<p class="live-invite-text">Co-hosts will get an email with instructions to join the show.</p>' +
      '<form class="live-invite-row" data-form="live-invite-email" novalidate onsubmit="return false">' +
      '<input class="input" name="email" type="email" placeholder="Please enter your co-host’s email" required>' +
      '<button class="btn btn-primary btn-sm" type="submit">Invite</button></form>' +
      '<h3 class="live-invite-title">Recently Invited Co-Hosts/Speakers</h3>' +
      '<div class="live-invite-list" id="live-invite-list">' + recent + '</div>' +
      '</div>';
  }

  function newShowView() {
    const ui = PB.getUI();
    const step = (ui.newShowStep === 2 && ui.newShowDraft) ? 2 : 1;
    const draft = ui.newShowDraft || { title: '', about: '', category: 'Education', visibility: 'public' };
    const now = new Date();
    const startNote = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    if (step === 2) {
      const html = '<div class="page wizard-page">' +
        pageHead({
          breadcrumb: '<button class="wizard-back-link" type="button" data-action="wizard-back">' + icon('arrow-left') + 'Back</button>',
          title: 'New Live Show',
          sub: 'Invite co-hosts to join your live show.'
        }) +
        wizardSteps(2) +
        '<div class="card card-plain invite-card wizard-card">' + invitePanel({ title: draft.title }) +
        '<div class="live-invite-done wizard-bottom"><button class="start-main invite-done-btn" style="border-radius:999px" data-action="go-live">Done</button></div>' +
        '</div></div>';
      return { title: 'New Live Show', html: html };
    }

    const categories = ['Education', 'Music', 'Comedy', 'News', 'Technology', 'Business', 'Health & Wellness', 'Arts'];
    const visOptions = [
      { value: 'public', label: 'Public', icon: 'globe', desc: 'Everyone can discover the show and join the room.' },
      { value: 'unlisted', label: 'Unlisted', icon: 'link', desc: 'Only people with the sharing link can join. Good for invite-only rooms and tests.' }
    ];
    const visibility = visOptions.some(function (o) { return o.value === draft.visibility; }) ? draft.visibility : 'public';
    const radios = visOptions.map(function (v) {
      return '<label class="radio-card' + (visibility === v.value ? ' selected' : '') + '">' +
        '<input type="radio" name="visibility" value="' + v.value + '"' + (visibility === v.value ? ' checked' : '') + '><span class="radio-dot"></span>' +
        '<span class="radio-card-body"><span class="radio-card-title">' + icon(v.icon) + v.label + '</span>' +
        '<span class="radio-card-desc">' + v.desc + '</span></span></label>';
    }).join('');

    const html = '<div class="page wizard-page">' +
      pageHead({
        breadcrumb: '<a class="wizard-back-link" href="#/shows" data-action="cancel-new-show">' + icon('arrow-left') + 'Back</a>',
        title: 'New Live Show',
        sub: 'Set up the room — you can change these details any time before you go live.'
      }) +
      wizardSteps(1) +
      '<div class="card card-plain form-card wizard-card">' +
      '<form data-form="create-show" novalidate>' +
      '<div class="form-row" data-field="title">' +
      '<label class="form-label" for="show-title">Live Room Title <span class="req">*</span></label>' +
      '<input class="input input-underline" id="show-title" name="title" maxlength="120" placeholder="Give your room a clear, inviting name" value="' + esc(draft.title) + '" data-autofocus>' +
      '<div class="form-hint">Make it clear, concise and easy to recognise in your show list.</div>' +
      '<div class="form-error">Give your live room a title.</div></div>' +
      '<div class="form-row" data-field="about">' +
      '<label class="form-label" for="show-about">About This Show</label>' +
      '<div class="textarea-wrap"><textarea class="textarea" id="show-about" name="about" maxlength="512" rows="4" placeholder="Describe what the live show is about, or any useful information for your listeners.">' + esc(draft.about) + '</textarea>' +
      '<span class="counter" id="about-counter">' + String(draft.about || '').length + '/512</span></div></div>' +
      '<div class="form-row" data-field="category">' +
      '<label class="form-label" for="show-category">Category</label>' +
      '<div class="field-select"><select id="show-category" name="category">' +
      categories.map(function (c) { return '<option value="' + esc(c) + '"' + (c === draft.category ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') +
      '</select>' + icon('chevron-down') + '</div></div>' +
      '<div class="form-row" data-field="visibility">' +
      '<div class="form-label">Visibility</div>' +
      '<div class="radio-group">' + radios + '</div></div>' +
      '<div class="live-invite-done wizard-bottom"><div class="start-split" style="display:inline-flex;align-items:stretch">' +
      '<button class="start-main" type="submit" style="height:44px;padding:0 24px;background:#0f1115;color:#fff;border:0;font:inherit;font-size:14.5px;font-weight:600;border-radius:999px 0 0 999px;cursor:pointer">Start now</button>' +
      '<div class="menu-wrap start-menu-wrap" style="position:relative">' +
      '<button class="start-caret" type="button" data-action="toggle-start-menu" aria-label="Start options" aria-haspopup="true" aria-expanded="false" style="height:44px;width:38px;display:grid;place-items:center;background:#0f1115;color:#fff;border:0;border-left:1px solid rgba(255,255,255,.25);border-radius:0 999px 999px 0;cursor:pointer"><span class="start-tri" style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #fff"></span></button>' +
      '<div class="menu start-menu"><button type="button" class="menu-item selected" data-action="start-mode" data-mode="now">Start now</button>' +
      '<button type="button" class="menu-item" data-action="start-mode" data-mode="schedule">Schedule</button>' +
      '<div class="start-menu-note">Current time: ' + esc(startNote) + '</div></div>' +
      '</div></div></div>' +
      '</form></div></div>';

    return {
      title: 'New Live Show',
      html: html,
      mount: function () {
        const about = document.getElementById('show-about');
        const counter = document.getElementById('about-counter');
        if (about) {
          about.addEventListener('input', function () {
            counter.textContent = about.value.length + '/512';
            counter.classList.toggle('over', about.value.length >= 512);
          });
        }
        const title = document.getElementById('show-title');
        if (title) {
          title.addEventListener('input', function () {
            const row = title.closest('.form-row');
            if (row) row.classList.remove('has-error');
          });
        }
      }
    };
  }

  function inviteView(r) {
    const db = PB.getData();
    const requested = r.params.get('show');
    const showObj = requested ? db.shows.find(function (s) { return s.id === requested; }) : db.shows[0];
    const target = showObj || db.shows[0] || { id: 'podbean-live', title: 'your live show' };

    const html = '<div class="page">' +
      pageHead({
        breadcrumb: '<a href="#/shows">' + icon('arrow-left') + 'Live Shows</a>',
        title: 'Invite Co-Hosts',
        sub: 'Bring the right people on stage for <strong>' + esc(target.title) + '</strong>.'
      }) +
      '<div class="card card-plain invite-card">' + invitePanel(target) +
      '<div class="live-invite-done wizard-bottom"><button class="start-main invite-done-btn" style="border-radius:999px" data-action="finish-invites">Done</button></div>' +
      '</div></div>';

    return { title: 'Invite Co-Hosts', html: html };
  }

  function statisticsView(r) {
    const ui = PB.getUI();
    const parts = r.path.split('/');
    let metric = parts[2] || 'listeners';
    if (!PB.METRIC_CONFIG[metric]) metric = 'listeners';
    const active = PB.buildStats(metric, ui.statsRange);

    const hoverRow = function (label, value, delta) {
      return '<span class="stat-hover-row"><span>' + esc(label) + '</span>' +
        '<span class="stat-hover-value"><strong>' + esc(value) + '</strong>' + PB.delta(delta) + '</span></span>';
    };
    const hoverPanel = function (key, cfg) {
      return '<span class="stat-hover" aria-hidden="true">' +
        '<span class="stat-hover-range">' + esc(active.rangeLine) + '</span>' +
        (key === 'live-hours'
          ? hoverRow('Live Hours', cfg.value, cfg.delta) + hoverRow('Live Shows', String(active.showsInRange), cfg.delta)
          : hoverRow(cfg.label, cfg.value, cfg.delta)) +
        '</span>';
    };
    const tabs = Object.keys(PB.METRIC_CONFIG).map(function (key) {
      const cfg = PB.METRIC_CONFIG[key];
      const isActive = key === metric;
      return '<button class="stat-tab' + (isActive ? ' active' : '') + '" role="tab" aria-selected="' + isActive + '" data-action="select-metric" data-metric="' + key + '">' +
        '<span class="stat-tab-label">' + cfg.label + '<span class="tip stat-info" data-tip="' + esc(tooltipFor(key)) + '">' + icon('info') + '</span></span>' +
        '<span class="stat-tab-value">' + cfg.value + PB.delta(cfg.delta) + '</span>' +
        hoverPanel(key, cfg) +
        '</button>';
    }).join('');

    const showRows = PB.getData().topShows.slice().sort(function (a, b) {
      return b.engagement - a.engagement;
    }).map(function (s) {
      return '<tr><td><span class="cell-title">' + esc(s.title) + '</span></td>' +
        '<td class="nowrap"><span class="cell-strong">' + PB.fmtDate(s.date) + '</span></td>' +
        '<td class="cell-strong">' + num(s.listeners) + '</td>' +
        '<td class="cell-strong">' + esc(s.hours) + '</td>' +
        '<td>' + PB.heart(s.engagement) + '</td>' +
        '<td>' + PB.coin(s.podPoints) + '</td></tr>';
    }).join('');

    const fanRows = function (valueKey) {
      const head = '<div class="data-row data-head"><span class="data-head-name">Listener</span>' +
        '<span class="data-head-value">' + (valueKey === 'points' ? 'PodPoints' : 'Engagement') + '</span>' +
        '<span class="data-head-delta">Change</span></div>';
      return head + PB.getData().topFans.map(function (f, i) {
        return '<div class="data-row">' + fanPhoto(i, 32, f.name) +
          '<div class="data-row-main"><div class="data-row-name">' + esc(f.name) + '</div></div>' +
          '<div class="data-row-value">' + (valueKey === 'points' ? PB.coin(f.points) : PB.heart(f.engagement)) + '</div>' +
          '<div class="data-row-delta">' + PB.delta(f.change) + '</div></div>';
      }).join('');
    };

    const giftRows = function (list, label) {
      const head = '<div class="data-row data-head"><span class="data-head-name">' + esc(label || 'Gift') + '</span>' +
        '<span class="data-head-value">PodPoints</span><span class="data-head-delta">Change</span></div>';
      return head + list.map(function (g) {
        return '<div class="data-row"><span class="gift-thumb"><span class="gift-emoji">' + giftEmoji(g.name) + '</span></span>' +
          '<div class="data-row-main"><div class="data-row-name">' + esc(g.name) + '</div></div>' +
          '<div class="data-row-value">' + PB.coin(g.beans) + '</div>' +
          '<div class="data-row-delta">' + PB.delta(g.change) + '</div></div>';
      }).join('');
    };

    const gifts = PB.getData().gifts;

    const html = '<div class="page stats-page">' +
      pageHead({
        title: 'Overview',
        sub: 'Here’s how your live shows are performing.',
        actions: rangeControl('stats', [['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['90d', 'Last 90 days']], ui.statsRange) +
          '<span class="tip range-info" data-tip="Choose a date range for all stats and charts below.">' + icon('info') + '</span>'
      }) +
      '<div class="card chart-card stats-card">' +
      '<div class="stat-tabs" role="tablist" aria-label="Statistics metric">' + tabs + '</div>' +
      '<div class="stats-chart-body">' +
      '<div class="chart-wrap">' + PB.chartSVG(active) + '<div class="chart-tooltip" role="status"></div></div>' +
      '</div></div>' +
      '<div class="card table-card section-gap">' +
      '<div class="card-head"><div><h2 class="card-title">Top Live Shows<span class="tip card-info" data-tip="The Top Live Shows Stats highlight the live shows with the most engagement in your live room.">' + icon('info') + '</span></h2></div>' +
      '<a class="link-arrow" href="#/shows">View all' + icon('arrow-right') + '</a></div>' +
      '<div class="table-wrap stats-table-wrap"><table class="data-table stats-table"><thead><tr>' +
      '<th>Live Show</th><th>Time</th><th>Listeners</th><th>Live Hours</th><th>Engagement</th><th>PodPoints</th>' +
      '</tr></thead><tbody>' + showRows + '</tbody></table></div></div>' +
      '<div class="two-col">' +
      '<div class="card list-card" data-tabs>' +
      '<div class="card-head" style="padding-bottom:14px"><div><h2 class="card-title">Top Fans<span class="tip card-info" data-tip="The Top Fans Stats highlight the top 20 fans who contribute the most in your live room, ranked by engagement or PodPoints.">' + icon('info') + '</span></h2></div>' +
      '<div class="tabs"><button class="tab active" data-tab="engagement">Engagement</button><button class="tab" data-tab="points">PodPoints</button></div></div>' +
      '<div class="tab-panel" data-panel="engagement">' + fanRows('engagement') + '</div>' +
      '<div class="tab-panel" data-panel="points" hidden>' + fanRows('points') + '</div></div>' +
      '<div class="card list-card" data-tabs>' +
      '<div class="card-head" style="padding-bottom:14px"><div><h2 class="card-title">Top Received Gifts<span class="tip card-info" data-tip="Top Received Gifts Stats show the most frequently received gifts in your live room, categorized into regular gifts and Fan Club gifts.">' + icon('info') + '</span></h2></div>' +
      '<div class="tabs"><button class="tab active" data-tab="regular">Regular gifts</button><button class="tab" data-tab="fanclub">Fan club gifts</button></div></div>' +
      '<div class="tab-panel" data-panel="regular">' + giftRows(gifts, 'Regular gift') + '</div>' +
      '<div class="tab-panel" data-panel="fanclub" hidden>' + giftRows(gifts.slice(2).concat(gifts.slice(0, 2)), 'Fan club gift') + '</div></div>' +
      '</div></div>';

    return { title: 'Overview', html: html };
  }

  function tooltipFor(key) {
    return {
      listeners: 'The number of listeners who joined your live show.',
      'live-hours': 'The total duration of your live streams.',
      engagement: 'Engagement is based on listeners interactions like sending virtual gifts, sharing the show, commenting, and liking the show.',
      podpoints: 'PodPoints are earned from Golden Beans given through gifts and super chats. 7 Golden Beans = 50 PodPoints.'
    }[key] || '';
  }

  function earningsRegion() {
    const ui = PB.getUI();
    const rows = PB.filteredEarnings();
    const perPage = 10;
    const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
    const page = Math.min(Math.max(1, ui.earningsPage), totalPages);
    ui.earningsPage = page;

    if (!rows.length) {
      const searchEmpty = ui.earningsQuery.trim() !== '';
      return '<div class="empty">' + (searchEmpty ? PB.emptySearch() : PB.emptyCoins()) +
        '<h3 class="empty-title">' + (searchEmpty ? 'No earnings found' : 'You haven’t received any PodPoints yet.') + '</h3>' +
        '<p class="empty-text">' + (searchEmpty
          ? 'No earnings match your current search. Try another show or gifter, or clear the search.'
          : 'There are no PodPoints from gifts in this date range. Try a wider period, or go live to start earning.') + '</p>' +
        '<div class="empty-actions">' + (searchEmpty
          ? '<button class="btn btn-primary" data-action="clear-earnings">Clear search</button>'
          : '<button class="btn btn-secondary" data-action="clear-earnings">Show last 90 days</button>') + '</div></div>';
    }

    const start = (page - 1) * perPage;
    const pageRows = rows.slice(start, start + perPage);
    const body = pageRows.map(function (row) {
      return '<tr><td><span class="cell-title" title="' + esc(row.showTitle) + '">' + esc(row.showTitle) + '</span></td>' +
        '<td class="nowrap"><span class="cell-strong">' + PB.fmtDate(row.date) + '</span></td>' +
        '<td><span class="cell-person">' + fanPhotoByName(row.topGifter, 24) + '<span>' + esc(row.topGifter) + '</span></span></td>' +
        '<td>' + PB.coin(row.podPoints) + '</td>' +
        '<td class="cell-strong">' + num(row.giftUsers) + '</td>' +
        '<td class="cell-strong">' + num(row.giftCount) + '</td>' +
        '<td class="row-actions"><div class="row-actions-inner"><a class="btn btn-secondary btn-sm" href="#/payments/earnings/' + row.id + '/gifts">View Details</a></div></td></tr>';
    }).join('');

    return '<div class="table-wrap"><table class="data-table earnings-table"><thead><tr>' +
      '<th>Live Show</th><th>Time</th><th>Top Gifter</th><th>PodPoints</th><th>Gift Users</th><th>Gift Count</th><th style="text-align:right">Action</th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div>' +
      '<div class="table-foot earnings-foot"><span>Showing ' + (start + 1) + '–' + Math.min(start + perPage, rows.length) + ' of ' + rows.length + ' entries</span>' +
      pager(page, totalPages, 'earnings-page') + '</div>';
  }

  function earningsView() {
    const ui = PB.getUI();
    const html = '<div class="page list-page">' +
      pageHead({
        title: 'Earnings',
        sub: 'Every gift, every gifter, and the PodPoints you’ve earned from live shows.',
        actions: rangeControl('earnings', [['1', 'Today'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['all', 'All time']], ui.earningsRange)
      }) +
      '<div class="card card-plain table-card">' +
      '<div class="table-toolbar">' +
      '<div class="search-box">' + icon('search') + '<input id="earnings-search" type="search" placeholder="Search by show or top gifter" value="' + esc(ui.earningsQuery) + '" aria-label="Search earnings"></div>' +
      '</div>' +
      '<div id="earnings-region">' + earningsRegion() + '</div>' +
      '</div></div>';

    return {
      title: 'Earnings',
      html: html,
      mount: function () {
        const input = document.getElementById('earnings-search');
        if (!input) return;
        function fitTable() {
          const table = document.querySelector('.earnings-table');
          if (!table || !table.isConnected) return;
          const wrap = table.parentElement;
          table.style.setProperty('--eg-lg', '25px');
          table.style.setProperty('--eg-sm', '20px');
          const base = table.offsetWidth;
          table.style.removeProperty('--eg-lg');
          table.style.removeProperty('--eg-sm');
          const extra = Math.max(0, wrap.clientWidth - base);
          const d = extra / 12;
          table.style.setProperty('--eg-lg', (25 + d).toFixed(2) + 'px');
          table.style.setProperty('--eg-sm', (20 + d).toFixed(2) + 'px');
        }
        let timer = null;
        input.addEventListener('input', function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            const ui = PB.getUI();
            ui.earningsQuery = input.value;
            ui.earningsPage = 1;
            const region = document.getElementById('earnings-region');
            if (region) region.innerHTML = earningsRegion();
            fitTable();
          }, 180);
        });
        window.addEventListener('resize', fitTable);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTable);
        fitTable();
      }
    };
  }

  function giftDetailsView(r) {
    const match = r.path.match(/^\/payments\/earnings\/([^/]+)\/gifts$/);
    const id = match ? match[1] : '';
    const db = PB.getData();
    const earning = db.earnings.find(function (row) { return row.id === id; }) || db.earnings[0];
    if (!earning) return notFoundView();

    const ui = PB.getUI();
    const namePool = ['Danielle Rossi', 'Marcus Lee', 'Priya Shah', 'Leo Martins', 'Sofia Alvarez', 'Noah Bennett', 'Ava Thompson', 'Ethan Cole', 'Maya Chen', 'Kai Walker', 'Nina Patel'];
    // Derive the breakdown from the parent earning so the detail totals always add up.
    const gifters = Math.max(1, earning.giftUsers || 1);
    const giftTotal = Math.max(gifters, earning.giftCount || gifters);
    const pointsTotal = Math.max(0, earning.podPoints || 0);
    const weightSum = gifters * (gifters + 1) / 2;
    const extras = giftTotal - gifters;
    const startIdx = Math.max(0, namePool.indexOf(earning.topGifter));
    const details = [];
    let assigned = 0;
    for (let i = 0; i < gifters; i++) {
      const points = i === gifters - 1
        ? pointsTotal - assigned
        : Math.round(pointsTotal * (gifters - i) / weightSum);
      assigned += points;
      details.push({
        name: namePool[(startIdx + i) % namePool.length],
        points: points,
        count: 1 + Math.floor(extras / gifters) + (i < extras % gifters ? 1 : 0),
        time: earning.date
      });
    }
    details.sort(function (a, b) { return b.points - a.points; });
    const perPage = 10;
    const totalPages = Math.ceil(details.length / perPage);
    const page = Math.min(Math.max(1, ui.giftPage), totalPages);
    ui.giftPage = page;
    const slice = details.slice((page - 1) * perPage, page * perPage);
    const totalPoints = details.reduce(function (a, b) { return a + b.points; }, 0);

    const rows = slice.map(function (d) {
      return '<tr><td><span class="cell-person">' + fanPhotoByName(d.name, 32) + '<span>' + esc(d.name) + '</span></span></td>' +
        '<td>' + PB.coin(d.points) + '</td><td class="cell-strong">' + d.count + '</td></tr>';
    }).join('');

    const html = '<div class="page list-page">' +
      pageHead({
        breadcrumb: '<a href="#/payments/earnings">' + icon('arrow-left') + 'Earnings</a>',
        title: 'Gift Details',
        sub: esc(earning.showTitle) + ' · ' + PB.fmtDateTime(earning.date)
      }) +
      '<div class="summary-strip">' +
      '<div class="summary-item"><span class="summary-label">PodPoints</span><span class="summary-value">' + num(totalPoints) + '</span></div>' +
      '<div class="summary-divider"></div>' +
      '<div class="summary-item"><span class="summary-label">Gifters</span><span class="summary-value">' + details.length + '</span></div>' +
      '<div class="summary-divider"></div>' +
      '<div class="summary-item"><span class="summary-label">Gifts</span><span class="summary-value">' + num(details.reduce(function (a, b) { return a + b.count; }, 0)) + '</span></div>' +
      '</div>' +
      '<div class="card card-plain table-card">' +
      '<div class="table-wrap"><table class="data-table gift-details-table"><thead><tr><th>Gifter</th><th>PodPoints</th><th>Gift count</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="table-foot"><span>Showing ' + ((page - 1) * perPage + 1) + '–' + Math.min(page * perPage, details.length) + ' of ' + details.length + ' entries</span>' +
      pager(page, totalPages, 'gift-page') + '</div></div></div>';

    return { title: 'Gift Details', html: html };
  }

  function payoutsView(r) {
    const db = PB.getData();
    const ui = PB.getUI();
    const isEmpty = !!(r && r.path === '/payments/payouts/empty');
    const realAccount = db.payouts.account;
    const perPage = 10;

    if (isEmpty) {
      const html = '<div class="page">' +
        pageHead({
          title: 'Payouts (Empty)',
          sub: 'The Payouts page before any eligible payout balance.',
          actions: '<button class="btn btn-primary" data-action="connect-payout">' + icon('wallet') + 'Add PayPal Payout Account</button>' +
            '<a class="btn btn-secondary" href="#/payments/payouts">' + icon('arrow-left') + 'Back to Payouts</a>'
        }) +
        '<div class="summary-strip">' +
        '<div class="summary-item"><span class="summary-label">Total</span><span class="summary-value"><span class="currency">$</span>0.00</span></div>' +
        '<div class="summary-divider"></div>' +
        '<div class="summary-item"><span class="summary-label">Balance</span><span class="summary-value"><span class="currency">$</span>0.00</span></div>' +
        '</div>' +
        '<div class="card card-plain"><div class="empty">' + PB.emptyCoins() +
        '<h3 class="empty-title">You haven’t received any PodPoints eligible for payout yet.</h3>' +
        '<p class="empty-text">Connect a PayPal account and your eligible balance will be paid out automatically on the 1st and 15th of each month.</p>' +
        '<div class="empty-actions"><button class="btn btn-primary" data-action="connect-payout">Add PayPal Payout Account</button>' +
        '<a class="btn btn-secondary" href="#/payments/payouts">View Payouts</a>' +
        '<button class="btn btn-secondary" data-action="payout-learn-more">Learn more</button></div></div></div></div>';
      return { title: 'Payouts (Empty)', html: html };
    }

    const rowsData = db.payouts.rows;
    const totalPages = Math.max(1, Math.ceil(rowsData.length / perPage));
    const page = Math.min(Math.max(1, ui.payoutPage), totalPages);
    ui.payoutPage = page;
    const slice = rowsData.slice((page - 1) * perPage, page * perPage);
    const statusPill = function (status) {
      const map = { Pending: 'status-pending', Paid: 'status-paid', Failed: 'status-failed' };
      return '<span class="pill ' + (map[status] || 'status-finished') + '">' + esc(status) + '</span>';
    };

    const rows = slice.map(function (p, j) {
      const idx = (page - 1) * perPage + j;
      const now = new Date();
      const payDate = new Date(now.getFullYear(), now.getMonth() - idx, 10, 16, 30);
      const status = idx === 0 ? 'Pending' : 'Paid';
      return '<tr><td class="nowrap">' + PB.fmtDate(payDate.toISOString()) + '</td>' +
        '<td>' + PB.coin(p.podPoints) + '</td>' +
        '<td class="cell-strong">$' + PB.money(p.amount) + '</td>' +
        '<td>' + statusPill(status) + '</td></tr>';
    }).join('');

    const accountBlock = (realAccount
      ? '<span class="account-line">' + icon('wallet') + 'PayPal · ' + esc(realAccount) +
        '<button data-action="connect-payout" aria-label="Edit payout account">' + icon('edit') + '</button></span>'
      : '<button class="btn btn-secondary btn-sm" data-action="connect-payout">' + icon('wallet') + 'Add PayPal Payout Account</button>');

    const html = '<div class="page list-page payouts-page">' +
      pageHead({
        title: 'Payouts',
        sub: 'Track what’s been paid out and what’s on the way.',
        headStyle: 'margin-bottom:35px'
      }) +
      '<div class="summary-strip">' +
      '<div class="summary-item"><span class="summary-label">Total</span><span class="summary-value"><span class="currency">$</span>' + PB.money(db.payouts.total) + '</span></div>' +
      '<div class="summary-divider"></div>' +
      '<div class="summary-item"><span class="summary-label">Balance</span><span class="summary-value"><span class="currency">$</span>' + PB.money(db.payouts.balance) + '</span></div>' +
      '<div class="summary-account">' + accountBlock + '</div>' +
      '</div>' +
      '<div class="card card-plain table-card">' +
      '<div class="table-wrap"><table class="data-table payouts-table"><thead><tr><th>Time</th><th>PodPoints</th><th>Amount</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="table-foot"><span>Showing ' + ((page - 1) * perPage + 1) + '–' + Math.min(page * perPage, rowsData.length) + ' of ' + rowsData.length + ' entries</span>' +
      pager(page, totalPages, 'payout-page') + '</div></div></div>';

    return { title: 'Payouts', html: html };
  }

  function postStamp(post) {
    if (!post.postedAt) return post.time || '';
    const d = new Date(post.postedAt);
    const pad = function (n) { return String(n).padStart(2, '0'); };
    return PB.fmtDate(d.toISOString()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function postCard(post) {
    const comments = post.comments || [];
    const cover = post.cover
      ? (post.cover === 'sunset'
        ? '<div class="post-cover" role="img" aria-label="A sunset over the water"></div>'
        : '<div class="post-cover"><img src="' + esc(post.cover) + '" alt=""></div>')
      : '';

    const commentItems = comments.map(function (c) {
      return '<div class="comment">' + avatar(c.name, 28) +
        '<div class="comment-body"><div class="comment-head"><span class="comment-name">' + esc(c.name) + '</span><span class="comment-time">' + esc(c.time) + '</span></div>' +
        '<div class="comment-text">' + esc(c.text) + '</div></div></div>';
    }).join('');

    return '<article class="card card-plain post-card" data-post="' + post.id + '">' +
      '<div class="post-head">' + avatar(post.author, 40) +
      '<div class="post-head-main"><div class="post-author">' + esc(post.author) + '</div><div class="post-time">' + esc(postStamp(post)) + '</div></div>' +
      '<div class="menu-wrap" data-menu-fixed><button class="btn btn-ghost btn-sm btn-icon" data-menu-toggle aria-label="Post options" aria-expanded="false">' + icon('more') + '</button>' +
      '<div class="menu"><button class="menu-item" data-action="copy" data-copy="' + esc(location.href.split('#')[0]) + '#/fanclub/community">' + icon('share') + 'Share</button>' +
      '<button class="menu-item danger" data-action="delete-post" data-id="' + post.id + '">' + icon('trash') + 'Delete</button></div></div>' +
      '</div>' +
      '<div class="post-body-wrap"><h2 class="post-title">' + esc(post.title) + '</h2>' +
      '<div class="post-text">' + esc(post.body) + '</div>' + cover + '</div>' +
      '<div class="post-actions">' +
      '<button class="post-action' + (post.liked ? ' liked' : '') + '" data-action="like-post" data-id="' + post.id + '" aria-pressed="' + (!!post.liked) + '" aria-label="Like this post">' +
      icon(post.liked ? 'heart-filled' : 'heart') + '<span>' + num(post.likes) + '</span></button>' +
      '<button class="post-action" data-action="toggle-comments" data-id="' + post.id + '" aria-expanded="false">' +
      icon('message') + '<span>' + comments.length + '</span></button>' +
      '</div>' +
      '<div class="comments" hidden>' +
      '<div class="comments-list">' + commentItems + '</div>' +
      '<form class="comment-form" data-form="add-comment" data-post="' + post.id + '">' +
      '<input class="input" name="comment" placeholder="Write a comment…" aria-label="Write a comment" required>' +
      '<button class="btn btn-primary btn-sm" type="submit">Post</button></form>' +
      '</div></article>';
  }

  function communityView() {
    const db = PB.getData();
    const fee = db.membershipFee;
    const postCount = db.posts.length;

    const empty = '<div class="card card-plain"><div class="empty">' + PB.emptyDocument() +
      '<h3 class="empty-title">Start the conversation with your fans</h3>' +
      '<p class="empty-text">Compose mesmerizing announcements, curate unforgettable moments, and engage like never before. Get ready to connect and leave your fans craving more!</p>' +
      '<div class="empty-actions"><a class="btn btn-primary" href="#/fanclub/community/new">' + icon('plus') + 'Create Post</a></div></div></div>';

    const html = '<div class="page">' +
      pageHead({
        title: 'Community',
        sub: 'A home for announcements, moments and conversation with your fan club.',
        actions:
          '<a class="btn btn-primary" href="#/fanclub/community/new">' + icon('plus') + 'Create Post</a>' +
          (fee
            ? '<button class="membership-chip" data-action="set-membership" aria-label="Edit membership fee">' + icon('dollar') + 'Membership · $' + Number(fee).toFixed(2) + ' / mo</button>'
            : '<button class="btn btn-secondary" data-action="set-membership">Set Membership Fee</button>')
      }) +
      '<div class="feed">' + (postCount ? db.posts.map(postCard).join('') : empty) + '</div></div>';

    return { title: 'Community', html: html };
  }

  function createPostView() {
    const ui = PB.getUI();
    const html = '<div class="page">' +
      pageHead({
        breadcrumb: '<a href="#/fanclub/community">' + icon('arrow-left') + 'Community</a>',
        title: 'Create Post',
        sub: 'Share an announcement, a behind-the-scenes moment, or a question for your fans.'
      }) +
      '<div class="card card-plain form-card">' +
      '<form data-form="create-post" novalidate>' +
      '<div class="form-row" data-field="title">' +
      '<label class="form-label" for="post-title">Title <span class="req">*</span></label>' +
      '<input class="input input-underline" id="post-title" name="post-title" maxlength="60" placeholder="Give your post a title" data-autofocus>' +
      '<div class="counter" id="post-title-counter">0/60</div>' +
      '<div class="form-error">Add a title for your post.</div></div>' +
      '<div class="form-row" data-field="description">' +
      '<label class="form-label" for="post-body">Description</label>' +
      '<div class="textarea-wrap"><textarea class="textarea" id="post-body" name="post-body" maxlength="512" rows="6" placeholder="What would you like to share with your fans?"></textarea>' +
      '<span class="counter" id="post-body-counter">0/512</span></div></div>' +
      '<div class="form-row" data-field="image">' +
      '<div class="form-label">Upload image</div>' +
      '<label class="upload-zone" for="post-image">' +
      '<span class="upload-plus" id="upload-plus">' + icon('plus') + '</span>' +
      '<span class="upload-preview" id="post-image-preview"><img alt="Post image preview">' +
      '<button type="button" class="upload-remove" data-action="clear-post-image" aria-label="Remove image">' + icon('x') + '</button></span>' +
      '</label>' +
      '<input type="file" id="post-image" accept="image/*" hidden>' +
      '<div class="form-hint">Optional. JPG or PNG, up to 4 MB.</div></div>' +
      '<div class="live-invite-done"><button class="btn btn-primary create-post-btn" type="submit">Create Post</button></div>' +
      '</form></div></div>';

    return {
      title: 'Create Post',
      html: html,
      mount: function () {
        const title = document.getElementById('post-title');
        const body = document.getElementById('post-body');
        const titleCounter = document.getElementById('post-title-counter');
        const bodyCounter = document.getElementById('post-body-counter');
        const file = document.getElementById('post-image');
        const preview = document.getElementById('post-image-preview');
        const previewImg = preview ? preview.querySelector('img') : null;
        const empty = document.getElementById('upload-plus');

        if (title && titleCounter) title.addEventListener('input', function () { titleCounter.textContent = title.value.length + '/60'; });
        if (body && bodyCounter) body.addEventListener('input', function () { bodyCounter.textContent = body.value.length + '/512'; });
        if (title) title.addEventListener('input', function () { title.closest('.form-row').classList.remove('has-error'); });

        function showPreview(src) {
          PB.getUI().postImage = src;
          if (previewImg) previewImg.src = src;
          preview.classList.add('show');
          if (empty) empty.style.display = 'none';
        }

        if (PB.getUI().postImage) showPreview(PB.getUI().postImage);

        if (file) {
          file.addEventListener('change', function () {
            const f = file.files && file.files[0];
            if (!f) return;
            if (!/^image\//.test(f.type)) { PB.toast('Choose an image file', 'error'); file.value = ''; return; }
            if (f.size > 4 * 1024 * 1024) { PB.toast('That image is over 4 MB', 'error'); file.value = ''; return; }
            const reader = new FileReader();
            reader.onload = function () { showPreview(String(reader.result)); };
            reader.readAsDataURL(f);
          });
        }
      }
    };
  }

  function artAvatar(svg, size) {
    return '<span class="avatar avatar-photo" style="width:' + size + 'px;height:' + size + 'px" aria-hidden="true">' + svg + '</span>';
  }

  function portraitSvg(variant) {
    const people = [
      { skin: '#c98b63', hair: '#2b211e', shirt: '#4f6d8f', bg1: '#ead8c8', bg2: '#d4b8a2' },
      { skin: '#8d5a3b', hair: '#17110f', shirt: '#6d8c5a', bg1: '#dfe7dc', bg2: '#c3d3c0' },
      { skin: '#e0b08a', hair: '#7b4a2b', shirt: '#b65f52', bg1: '#f3ddd3', bg2: '#e5c0b2' },
      { skin: '#a86d4a', hair: '#1f1a18', shirt: '#7b6ea8', bg1: '#e4e0f0', bg2: '#cfc7e5' }
    ];
    const p = people[Math.abs(variant) % people.length];
    const gid = 'pp-' + Math.random().toString(36).slice(2, 8);
    return '<svg viewBox="0 0 64 64" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.bg1 + '"/><stop offset="1" stop-color="' + p.bg2 + '"/></linearGradient></defs>' +
      '<rect width="64" height="64" fill="url(#' + gid + ')"/>' +
      '<rect x="27" y="37" width="10" height="10" rx="4" fill="' + p.skin + '"/>' +
      '<circle cx="32" cy="27" r="13" fill="' + p.skin + '"/>' +
      '<path d="M19 27c0-9 6-14 13-14s13 5 13 14c0 2-.4 3.6-1.1 5.2-1-7.2-5.1-10.6-11.9-10.6S20.1 25 19.1 32.2C18.4 30.6 19 28.8 19 27Z" fill="' + p.hair + '"/>' +
      '<circle cx="27.2" cy="27.5" r="1.3" fill="#2a211e"/><circle cx="36.8" cy="27.5" r="1.3" fill="#2a211e"/>' +
      '<path d="M28.2 33.4c1.8 1.5 5.8 1.5 7.6 0" stroke="#6b4130" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
      '<path d="M11 64c0-12.5 9.4-20 21-20s21 7.5 21 20Z" fill="' + p.shirt + '"/>' +
      '</svg>';
  }

  function landscapeSvg(variant) {
    const scenes = [
      { sky1: '#7fa6c8', sky2: '#f2c896', sun: '#ffe8b0', m1: '#7b8896', m2: '#4c5966', water: '#303b47' },
      { sky1: '#8bb9d8', sky2: '#bfe4e0', sun: '#fff3c6', m1: '#6e9c85', m2: '#3d6b5a', water: '#2a4d49' },
      { sky1: '#b4a6d0', sky2: '#f0b9a2', sun: '#ffe0a5', m1: '#8d7d9a', m2: '#5b4e67', water: '#3a3148' }
    ];
    const p = scenes[Math.abs(variant) % scenes.length];
    const gid = 'ls-' + Math.random().toString(36).slice(2, 8);
    return '<svg viewBox="0 0 64 64" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.sky1 + '"/><stop offset=".55" stop-color="' + p.sky2 + '"/><stop offset="1" stop-color="' + p.sky2 + '"/></linearGradient></defs>' +
      '<rect width="64" height="64" fill="url(#' + gid + ')"/>' +
      '<circle cx="44" cy="21" r="7" fill="' + p.sun + '"/>' +
      '<path d="M0 43 15 29 27 41 38 33 52 44 64 37v27H0Z" fill="' + p.m1 + '"/>' +
      '<path d="M0 50 12 41 25 50 39 42 53 51 64 45v19H0Z" fill="' + p.m2 + '"/>' +
      '<path d="M0 56h64v8H0z" fill="' + p.water + '"/>' +
      '<path d="M10 56h44M18 60h28" stroke="#6a7784" stroke-width="1" opacity=".55"/>' +
      '</svg>';
  }

  const MEMBER_PEOPLE = [
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/women/68.jpg',
    'https://randomuser.me/api/portraits/women/12.jpg',
    'https://randomuser.me/api/portraits/men/76.jpg',
    'https://randomuser.me/api/portraits/women/21.jpg',
    'https://randomuser.me/api/portraits/men/54.jpg',
    'https://randomuser.me/api/portraits/women/33.jpg',
    'https://randomuser.me/api/portraits/men/85.jpg',
    'https://randomuser.me/api/portraits/women/50.jpg'
  ];
  const MEMBER_SCENES = [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=96&amp;h=96&amp;fit=crop&amp;q=70',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=96&amp;h=96&amp;fit=crop&amp;q=70',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=96&amp;h=96&amp;fit=crop&amp;q=70',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=96&amp;h=96&amp;fit=crop&amp;q=70'
  ];
  const MEMBER_PHOTO_BY_INDEX = [
    MEMBER_PEOPLE[0], MEMBER_SCENES[0], MEMBER_PEOPLE[2], MEMBER_PEOPLE[3], MEMBER_PEOPLE[4],
    MEMBER_SCENES[1], MEMBER_PEOPLE[6], MEMBER_PEOPLE[7], MEMBER_PEOPLE[8],
    MEMBER_SCENES[2], 'https://randomuser.me/api/portraits/men/50.jpg',
    MEMBER_PEOPLE[5], 'https://randomuser.me/api/portraits/men/12.jpg', MEMBER_SCENES[3]
  ];

  function initialsFor(name) {
    const parts = String(name || '?').trim().split(/\s+/);
    if (!parts.length) return '?';
    return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)).toUpperCase();
  }

  function photoAvatar(url, name, size, fallbackUrl) {
    const onerror = fallbackUrl
      ? 'if(this.dataset.fb){this.src=this.dataset.fb;delete this.dataset.fb}else{this.remove()}'
      : 'this.remove()';
    return '<span class="avatar avatar-photo member-photo" style="width:' + size + 'px;height:' + size + 'px" aria-hidden="true">' +
      '<span class="member-photo-fallback">' + esc(initialsFor(name)) + '</span>' +
      '<img src="' + url + '" alt="" loading="lazy"' +
      (fallbackUrl ? ' data-fb="' + fallbackUrl + '"' : '') +
      ' onerror="' + onerror + '">' +
      '</span>';
  }

  /* Natural portrait photography for the invite lists. Each person keeps the same
     face across the New Live Show wizard and the live-room dialog, and falls back to
     a second photo host if the first one is unreachable. */
  const INVITE_PEOPLE = [
    {
      name: 'Julie Tran',
      photo: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=120&amp;h=120&amp;fit=crop&amp;crop=faces&amp;q=80',
      fallback: 'https://randomuser.me/api/portraits/women/21.jpg'
    },
    {
      name: 'Marcus Lee',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&amp;h=120&amp;fit=crop&amp;crop=faces&amp;q=80',
      fallback: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Nina Patel',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&amp;h=120&amp;fit=crop&amp;crop=faces&amp;q=80',
      fallback: 'https://randomuser.me/api/portraits/women/33.jpg'
    },
    {
      name: 'Sam Rivera',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&amp;h=120&amp;fit=crop&amp;crop=faces&amp;q=80',
      fallback: 'https://randomuser.me/api/portraits/men/54.jpg'
    },
    {
      name: 'Avery Brooks',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&amp;h=120&amp;fit=crop&amp;crop=faces&amp;q=80',
      fallback: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
      name: 'Theo Grant',
      photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&amp;h=120&amp;fit=crop&amp;crop=faces&amp;q=80',
      fallback: 'https://randomuser.me/api/portraits/men/76.jpg'
    }
  ];

  function invitePhoto(index, size, name) {
    let person = null;
    for (let i = 0; i < INVITE_PEOPLE.length; i++) {
      if (INVITE_PEOPLE[i].name === name) { person = INVITE_PEOPLE[i]; break; }
    }
    if (!person) person = INVITE_PEOPLE[index % INVITE_PEOPLE.length];
    return photoAvatar(person.photo, name, size, person.fallback);
  }

  function memberPhoto(index, size, name) {
    return photoAvatar(MEMBER_PHOTO_BY_INDEX[index % MEMBER_PHOTO_BY_INDEX.length], name, size);
  }

  function fanPhoto(index, size, name) {
    const photos = [
      MEMBER_PEOPLE[0], MEMBER_PEOPLE[1], MEMBER_PEOPLE[2], MEMBER_PEOPLE[4],
      MEMBER_PEOPLE[3], MEMBER_PEOPLE[6], MEMBER_PEOPLE[7], MEMBER_PEOPLE[8]
    ];
    return photoAvatar(photos[index % photos.length], name, size);
  }

  function fanPhotoByName(name, size) {
    const fans = PB.getData().topFans || [];
    let idx = 0;
    for (let i = 0; i < fans.length; i++) {
      if (fans[i].name === name) { idx = i; break; }
    }
    return fanPhoto(idx, size, name);
  }

  function memberAvatar(index, size) {
    const kind = index % 5;
    const art = (kind === 1 || kind === 2) ? landscapeSvg(index) : portraitSvg(index);
    return artAvatar(art, size);
  }

  function personAvatar(size, variant) {
    return artAvatar(portraitSvg(variant || 0), size);
  }

  function memberTier(points) {
    if (points >= 8000) return { name: 'Wing IV', cls: 'tier-4' };
    if (points >= 5000) return { name: 'Wing III', cls: 'tier-3' };
    if (points >= 1000) return { name: 'Wing II', cls: 'tier-2' };
    return { name: 'Wing I', cls: 'tier-1' };
  }

  function membersView() {
    const db = PB.getData();
    const rows = db.members.map(function (m, i) {
      const tier = memberTier(m.points);
      const rank = i + 1;
      const photo = m.name.indexOf('Danita') === 0 ? avatar('Danita', 24) : memberPhoto(i, 24, m.name);
      return '<div class="member-row" data-member data-search="' + esc(m.name.toLowerCase()) + '">' +
        '<span class="member-rank' + (rank <= 3 ? ' rank-' + rank : '') + '">' + rank + '</span>' +
        photo +
        '<div class="member-main"><span class="member-name">' + esc(m.name) + '</span></div>' +
        '<div class="member-stats">' +
        '<span class="member-heart">' + icon('heart-filled') + num(m.points) + '</span>' +
        '<span class="member-wings ' + tier.cls + '" title="Super Fan · ' + tier.name + '">' + icon('superfan') + '</span>' +
        '</div></div>';
    }).join('');

    const html = '<div class="page list-page">' +
      pageHead({
        title: 'Members',
        sub: 'Everyone in your fan club, ranked by the hearts they’ve earned.'
      }) +
      '<div class="card card-plain member-list-card">' +
      '<div id="member-rows">' + rows + '</div>' +
      '<div class="empty" id="member-empty" hidden>' + PB.emptySearch() +
      '<h3 class="empty-title">No members found</h3><p class="empty-text">Try a different name, or invite more listeners to your fan club.</p>' +
      '<div class="empty-actions"><button class="btn btn-secondary" data-action="clear-member-search">Clear search</button></div></div>' +
      '<div class="table-foot member-foot">' +
      '<span id="member-range"></span><div id="member-pager"></div></div>' +
      '</div></div>';

    return {
      title: 'Fan Club',
      html: html,
      mount: function () {
        PB.applyMemberFilter();
        const input = document.getElementById('member-search');
        if (input) {
          input.addEventListener('input', function () {
            PB.getUI().memberQuery = input.value;
            PB.applyMemberFilter();
          });
        }
      }
    };
  }

  function liveRoomView(r) {
    const db = PB.getData();
    const parts = r.path.split('/');
    const id = parts[2] || '';
    const showObj = db.shows.find(function (s) { return s.id === id; }) ||
      db.shows.find(function (s) { return s.status === 'live'; }) ||
      db.shows[0] || { id: '', title: 'Live Show Test', about: 'Welcome.' };
    const host = db.currentUser.name;
    const otherName = 'Patricia';
    const patriciaAvatar = function (size) { return memberPhoto(0, size, otherName); };
    const title = showObj.title || 'Live Show Test';
    const about = showObj.about || 'Welcome.';

    const listenerPeople = [
      { name: otherName, hearts: '12,835' },
      { name: 'Marcus Lee', hearts: '8,420' },
      { name: 'Nina Patel', hearts: '6,150' },
      { name: 'Sam Rivera', hearts: '4,387' },
      { name: 'Leo Martins', hearts: '2,860' },
      { name: 'Sofia Alvarez', hearts: '1,432' },
      { name: 'Noah Bennett', hearts: '986' },
      { name: 'Ava Thompson', hearts: '742' }
    ];
    const listenerRows = listenerPeople.map(function (p, i) {
      const av = i === 0 ? patriciaAvatar(28) : fanPhoto(i + 1, 28, p.name);
      return '<div class="live-listener">' + av +
        '<span class="live-listener-name">' + esc(p.name) + '</span>' +
        '<span class="live-heart">' + icon('heart-filled') + ' ' + p.hearts + '</span></div>';
    }).join('');

    const brandMark = '<svg class="live-brand-mark" viewBox="0 0 32 32" aria-hidden="true">' +
      '<circle cx="16" cy="23.4" r="2.6" fill="#8cc63f"/>' +
      '<path d="M10.6 20Q16 14.4 21.4 20" fill="none" stroke="#8cc63f" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M6.8 15.8Q16 6.2 25.2 15.8" fill="none" stroke="#8cc63f" stroke-width="2.4" stroke-linecap="round"/>' +
      '</svg>';

    const badges = '<span class="live-badge admin">Admin</span><span class="live-heart live-heart-box">' + icon('heart-filled') + ' 12,267</span><span class="live-badge super-icon" title="Super Fan">' + icon('superfan') + '</span>';
    const plain = '<span class="live-msg-name">' + esc(otherName) + '</span>';
    const full = plain + badges;
    const hostMeta = '<span class="live-msg-name">' + esc(host) + '</span><span class="live-badge host">Host</span>';
    const chat = [
      '<div class="live-msg">' + patriciaAvatar(28) +
        '<div class="live-msg-main"><div class="live-msg-meta">' + full + '</div>' +
        '<div class="live-bubble">Evening Danita! Tuned in from Toronto 🎧</div></div></div>',
      '<div class="live-msg highlight">' + patriciaAvatar(28) +
        '<div class="live-msg-main"><div class="live-msg-meta">' + plain + '</div>' +
        '<div class="live-bubble">That warm-up tip is already helping — thanks for sharing!</div></div></div>',
      '<div class="live-msg highlight gift">' + patriciaAvatar(28) +
        '<div class="live-msg-main"><div class="live-msg-meta">' + full + '</div>' +
        '<div class="live-bubble">sent gift <span class="live-gift-emoji">🌹</span> ×1 to ' + esc(host) + '</div></div></div>',
      '<div class="live-msg">' + patriciaAvatar(28) +
        '<div class="live-msg-main"><div class="live-msg-meta">' + plain + '</div>' +
        '<div class="live-bubble">Will you cover how you prep questions for guests?</div></div></div>',
      '<div class="live-msg mine"><div class="live-msg-main"><div class="live-msg-meta">' + hostMeta + '</div>' +
        '<div class="live-bubble">Great question, Patricia. I’ll get to that right after the break.</div></div>' + avatar(host, 28) + '</div>',
      '<div class="live-msg highlight gift">' + patriciaAvatar(28) +
        '<div class="live-msg-main"><div class="live-msg-meta">' + full + '</div>' +
        '<div class="live-bubble">sent gift <span class="live-gift-emoji">🍺</span> ×1 to ' + esc(host) + '</div></div></div>',
      '<div class="live-msg mine"><div class="live-msg-main"><div class="live-msg-meta">' + hostMeta + '</div>' +
        '<div class="live-bubble">Thanks for the support — really appreciate you being here!</div></div>' + avatar(host, 28) + '</div>',
      '<div class="live-msg">' + patriciaAvatar(28) +
        '<div class="live-msg-main"><div class="live-msg-meta">' + plain + '</div>' +
        '<div class="live-bubble">Anytime! This is my Tuesday ritual 😄</div></div></div>',
      '<div class="live-msg mine"><div class="live-msg-main"><div class="live-msg-meta">' + hostMeta + '</div>' +
        '<div class="live-bubble">😊</div></div>' + avatar(host, 28) + '</div>'
    ].join('');

    const plus = function () {
      return '<div class="live-cohost"><button class="live-add" data-action="invite-live-cohost" aria-label="Invite a co-host">' + icon('plus') + '</button>' +
        '<span class="live-cohost-name" aria-hidden="true">&nbsp;</span><span class="live-cohost-status" aria-hidden="true">&nbsp;</span></div>';
    };
    const cohost = function (name, status) {
      return '<div class="live-cohost">' + (name === 'Patricia' ? memberPhoto(0, 38, 'Patricia') : avatar(name, 38)) +
        '<span class="live-cohost-name">' + esc(name) + '</span>' +
        '<span class="live-cohost-status' + (status === 'Host' ? ' is-host' : '') + '">' + status + '</span></div>';
    };
    const cohosts = cohost(host, 'Host') + cohost('Patricia', 'Connected') +
      plus() + plus() + plus() + plus() + plus() + plus() + plus() + plus();

    const effects = [
      ['sparkles', 'boing'], ['smile', 'oh'], ['users', 'cheering'], ['heart', 'clap'],
      ['mic', 'crow'], ['smile', 'laugh'], ['music', 'whistle'], ['bell', 'beep'],
      ['mic', 'comedy'], ['check', 'correct'], ['clock', 'countdown'], ['eye', 'creepy lau…']
    ].map(function (e) {
      return '<button class="live-effect" data-action="live-effect" data-name="' + e[1] + '">' + icon(e[0]) + '<span>' + e[1] + '</span></button>';
    }).join('');

    const tracks = ['Sacred Rituals', 'Sacred Narratives', 'Joyous Fanfare', 'Reflective Lamentations'].map(function (name, i) {
      return '<button class="live-track' + (i === 3 ? ' active' : '') + '" data-action="select-track">' + icon('music') + '<span>' + name + '</span></button>';
    }).join('');

    const html = '<div class="live-room">' +
      '<header class="live-room-top">' +
      '<div class="live-brand">' + brandMark + '<span>Podbean <em>Live</em></span></div>' +
      '<div class="live-top-actions">' +
      '<button class="live-btn live-btn-green" data-action="live-share">' + icon('share') + 'Share</button>' +
      '<button class="live-btn live-btn-light" data-action="live-exit">Exit</button>' +
      '</div></header>' +
      '<div class="live-main">' +
      '<div class="live-col live-left">' +
      '<section class="live-panel live-onair">' +
      '<div class="live-onair-top"><span class="live-onair-title"><span class="live-onair-dot"></span>On Air</span><span class="live-onair-timer" id="live-timer">00:08:30</span></div>' +
      '<div class="live-onair-bottom"><div class="live-onair-meta"><span>Online: <b>' + (listenerPeople.length + 1) + '</b></span><span>Total: <b>' + (listenerPeople.length + 1) + '</b></span></div>' +
      '<div class="live-onair-actions"><button class="live-end" data-action="end-live-show" data-id="' + showObj.id + '">End</button>' +
      '<div class="menu-wrap live-settings-wrap" data-menu-fixed>' +
      '<button class="live-gear" data-menu-toggle aria-label="Room settings" aria-haspopup="true" aria-expanded="false">' + icon('settings') + '</button>' +
      '<div class="menu live-settings-menu" role="menu">' +
      '<div class="live-settings-row">Recording<button class="live-switch on" data-action="toggle-recording" data-menu-keep aria-pressed="true" aria-label="Recording"><span></span></button></div>' +
      '<button class="menu-item" role="menuitem" data-action="live-settings-item" data-settings="basic" data-name="Basic">Basic</button>' +
      '<button class="menu-item" role="menuitem" data-action="live-settings-item" data-settings="themes" data-name="Themes">Themes</button>' +
      '<button class="menu-item" role="menuitem" data-action="live-settings-item" data-settings="greeting" data-name="Greeting">Greeting</button>' +
      '<button class="menu-item" role="menuitem" data-action="live-settings-item" data-settings="admins" data-name="Admins">Admins (' + (db.admins ? db.admins.length : 2) + ')</button>' +
      '<button class="menu-item" role="menuitem" data-action="live-settings-item" data-settings="blocked" data-name="Blocked Users">Blocked Users (' + (db.blockedUsers ? db.blockedUsers.length : 5) + ')</button>' +
      '</div></div>' +
      '</div></div>' +
      '</section>' +
      '<section class="live-panel live-listeners" id="live-listeners-panel">' +
      '<button class="live-panel-head" data-action="toggle-listeners">Listeners (' + (listenerPeople.length + 1) + ')' + icon('chevron-up') + '</button>' +
      '<div class="live-listener-list">' +
      '<div class="live-listener is-host">' + avatar(host, 28) + '<span class="live-listener-name">' + esc(host) + '</span><span class="live-badge host">Host</span></div>' +
      listenerRows +
      '</div></section>' +
      '<section class="live-panel live-activity" data-tabs>' +
      '<div class="live-tabs">' +
      '<button class="tab live-tab active" data-tab="engagement">Engagement (1996)</button>' +
      '<button class="tab live-tab" data-tab="topgifts">Top Gifts (943)</button>' +
      '</div>' +
      '<div class="live-filter"><select class="live-select" aria-label="Activity period"><option>This Month</option><option>Last 7 days</option><option>All time</option></select></div>' +
      '<div class="tab-panel" data-panel="engagement">' +
      '<div class="live-gift-row"><span class="live-rank">1</span>' + patriciaAvatar(28) + '<span class="live-gift-name">' + esc(otherName) + '</span><span class="live-heart live-heart-value">' + icon('heart-filled') + ' 1996</span></div>' +
      '<div class="live-gift-row"><span class="live-rank">2</span>' + avatar(host, 28) + '<span class="live-gift-name">' + esc(host) + '</span><span class="live-heart live-heart-value">' + icon('heart-filled') + ' 1280</span></div>' +
      '</div>' +
      '<div class="tab-panel" data-panel="topgifts" hidden>' +
      '<div class="live-gift-row"><span class="live-medal">🥇</span>' + patriciaAvatar(28) + '<span class="live-gift-name">' + esc(otherName) + '</span><span class="live-gift-value">' + icon('coins') + ' 943</span></div>' +
      '</div></section>' +
      '</div>' +
      '<div class="live-col live-center">' +
      '<section class="live-panel live-chat">' +
      '<div class="live-chat-head"><div class="live-chat-title"><span class="live-title-dot"></span><span class="live-chat-title-text">' + esc(title) + '</span></div><div class="live-chat-about">About: <span>' + esc(about) + '</span></div></div>' +
      '<div class="live-chat-body" id="live-chat-body">' + chat + '</div>' +
      '<form class="live-composer" data-form="live-chat">' +
      '<input class="live-input" id="live-message-input" name="message" placeholder="Please input your message" autocomplete="off">' +
      '<button type="button" class="live-icon-btn" data-action="live-emoji" aria-label="Insert emoji">' + icon('smile') + '</button>' +
      '<button type="button" class="live-icon-btn" data-action="live-image" aria-label="Add image">' + icon('image') + '</button>' +
      '<button type="submit" class="live-send">Send</button>' +
      '</form></section>' +
      '</div>' +
      '<div class="live-col live-right">' +
      '<section class="live-panel"><div class="live-panel-head">Co-hosts/Speakers</div><div class="live-cohost-grid">' + cohosts + '</div></section>' +
      '<section class="live-panel"><div class="live-panel-head">Volume Control</div>' +
      '<div class="live-vol-row">' + avatar(host, 28) + '<span class="live-vol-name">' + esc(host) + '</span>' +
      '<input class="live-range" type="range" min="0" max="100" value="64" aria-label="' + esc(host) + ' volume">' +
      '<button class="live-mute" data-action="toggle-mute" aria-label="Mute ' + esc(host) + '" aria-pressed="false">' + icon('mic') + '</button></div>' +
      '<div class="live-vol-row">' + patriciaAvatar(28) + '<span class="live-vol-name">Patricia</span>' +
      '<input class="live-range" type="range" min="0" max="100" value="52" aria-label="Patricia volume">' +
      '<button class="live-mute" data-action="toggle-mute" aria-label="Mute Patricia" aria-pressed="false">' + icon('mic') + '</button></div>' +
      '</section>' +
      '<section class="live-panel live-tool-panel">' +
      '<button class="live-panel-head live-tool-head" data-action="live-accordion" data-tool="callin" aria-expanded="false">Call In' + icon('chevron-down', 'live-tool-chev') + '</button>' +
      '<div class="live-tool-body" data-tool-body="callin" hidden>' +
      '<div class="live-callin-row"><span>Allow Call-in</span><button class="live-switch on" data-action="toggle-callin" aria-pressed="true" aria-label="Allow call-in"><span></span></button></div>' +
      '<div class="live-inline-empty">' + icon('user') + '<span>No callers right now.</span></div>' +
      '</div></section>' +
      '<section class="live-panel live-tool-panel">' +
      '<button class="live-panel-head live-tool-head" data-action="live-accordion" data-tool="effects" aria-expanded="false">Audio Effects' + icon('chevron-down', 'live-tool-chev') + '</button>' +
      '<div class="live-tool-body" data-tool-body="effects" hidden><div class="live-effect-grid">' + effects + '</div></div></section>' +
      '<section class="live-panel live-tool-panel">' +
      '<button class="live-panel-head live-tool-head" data-action="live-accordion" data-tool="music" aria-expanded="false">Music' + icon('chevron-down', 'live-tool-chev') + '</button>' +
      '<div class="live-tool-body" data-tool-body="music" hidden>' +
      '<div class="live-music-player">' +
      '<button class="live-music-btn circle playing" data-action="toggle-music-play" aria-label="Pause">' + icon('pause') + '</button>' +
      '<button class="live-music-btn" data-action="music-loop" aria-label="Loop playlist">' + icon('repeat') + '</button>' +
      '<div class="live-quality"><button class="active" data-action="music-quality" data-q="low">Low</button><button data-action="music-quality" data-q="mid">Mid</button><button data-action="music-quality" data-q="high">High</button></div>' +
      '</div>' + tracks +
      '<button class="live-add-music" data-action="live-add-music">Add Music</button>' +
      '</div></section>' +
      '</div>' +
      '</div>' +
      '<footer class="live-status">' +
      '<div class="live-status-left">' +
      '<button class="live-status-item live-status-btn" data-action="toggle-sound-monitoring" aria-pressed="true">' + icon('headphones') + 'Sound Monitoring</button>' +
      '<button class="live-status-item live-status-btn" data-action="toggle-mute-popover" aria-expanded="false">' + icon('mic') + 'Mute' + icon('chevron-down') + '</button>' +
      '<span class="live-level"><span style="width:52%"></span></span>' +
      '</div>' +
      '<span class="live-status-right">' + icon('wifi') + 'Excellent</span>' +
      '<div class="live-mute-popover" id="live-mute-popover" hidden>' +
      '<div class="live-device-group">' +
      '<div class="live-device-title">' + icon('mic') + 'Microphone</div>' +
      '<button class="live-device active" data-action="select-device"><span class="live-device-check">' + icon('check') + '</span><span>Microphone (High Definition Audio Device)</span></button>' +
      '<button class="live-device" data-action="select-device"><span class="live-device-check"></span><span>Line In (Mixr AudioLink)</span></button>' +
      '</div>' +
      '<div class="live-device-group">' +
      '<div class="live-device-title">' + icon('headphones') + 'Speakers</div>' +
      '<button class="live-device active" data-action="select-device"><span class="live-device-check">' + icon('check') + '</span><span>Speakers (Mixr AudioLink)</span></button>' +
      '<button class="live-device" data-action="select-device"><span class="live-device-check"></span><span>Headphones (High Definition Audio Device)</span></button>' +
      '</div>' +
      '<div class="live-device-foot">' + icon('mic') + '<input type="range" class="live-range" min="0" max="100" value="64" aria-label="Microphone volume"></div>' +
      '</div>' +
      '</footer></div>';

    return {
      title: 'Live Room',
      html: html,
      mount: function () {
        const ui = PB.getUI();
        if (ui.liveRoomTimer) clearInterval(ui.liveRoomTimer);
        let seconds = 8 * 60 + 30;
        const timer = document.getElementById('live-timer');
        const pad = function (n) { return String(n).padStart(2, '0'); };
        const renderTime = function () {
          if (!timer) return;
          timer.textContent = pad(Math.floor(seconds / 3600)) + ':' + pad(Math.floor(seconds / 60) % 60) + ':' + pad(seconds % 60);
        };
        renderTime();
        ui.liveRoomTimer = setInterval(function () { seconds++; renderTime(); }, 1000);
        const body = document.getElementById('live-chat-body');
        if (body) body.scrollTop = body.scrollHeight;
        const volume = document.querySelector('.live-device-foot .live-range');
        if (volume) {
          const paint = function () {
            volume.style.backgroundImage = 'linear-gradient(90deg, #8cc63f 0 ' + volume.value + '%, #e9eaeb ' + volume.value + '% 100%)';
          };
          volume.addEventListener('input', paint);
          paint();
        }
        document.querySelectorAll('.live-vol-row .live-range').forEach(function (range) {
          const paint = function () {
            range.style.backgroundImage = 'linear-gradient(90deg, #8cc63f 0 ' + range.value + '%, #e9eaeb ' + range.value + '% 100%)';
          };
          range.addEventListener('input', paint);
          paint();
        });
      }
    };
  }

  function notFoundView() {
    return {
      title: 'Not found',
      html: '<div class="page"><div class="card"><div class="empty">' + PB.emptySearch() +
        '<h3 class="empty-title">We couldn’t find that page</h3>' +
        '<p class="empty-text">The link may be out of date, or the page has moved. Head back to your live shows to pick up where you left off.</p>' +
        '<div class="empty-actions"><a class="btn btn-primary" href="#/shows">Back to Live Shows</a></div></div></div></div>'
    };
  }

  window.PB.views = {
    shows: showsView,
    newShow: newShowView,
    invite: inviteView,
    statistics: statisticsView,
    earnings: earningsView,
    giftDetails: giftDetailsView,
    payouts: payoutsView,
    community: communityView,
    createPost: createPostView,
    members: membersView,
    liveRoom: liveRoomView,
    notFound: notFoundView
  };
  window.PB.invitePhoto = invitePhoto;
  window.PB.memberPhoto = memberPhoto;
})();
