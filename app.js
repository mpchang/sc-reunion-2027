/* ------------------------------------------------------------------
   app.js — renders the page from data.js.

   No framework, no build step. Everything reads from the constants in
   data.js so that swapping in a live data source later means changing
   where `state` comes from, and nothing else.
------------------------------------------------------------------ */

(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  /* --- dates ----------------------------------------------------- */

  /* Parse 'YYYY-MM-DD' as a local date. `new Date(str)` treats a bare
     ISO date as UTC, which shifts the day backwards west of Greenwich
     and would show Feb 3 to anyone in the US. */
  const parseDay = (iso) => {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const DAY_MS = 86400000;
  const startOfToday = () => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  };

  const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const shortDay = (iso) => {
    const d = parseDay(iso);
    return d ? `${WEEKDAY[d.getDay()]} ${d.getDate()}` : null;
  };

  /* every date in the trip window, inclusive */
  const tripDays = () => {
    const out = [];
    const last = parseDay(TRIP.end);
    for (let d = parseDay(TRIP.start); d <= last; d = new Date(d.getTime() + DAY_MS)) {
      out.push(new Date(d));
    }
    return out;
  };

  const isoOf = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  /* --- state ----------------------------------------------------- */

  /* PREVIEW lets us look at the finished design before real data
     exists. It only ever overlays; it never mutates the source data. */
  const state = (() => {
    if (!PREVIEW) {
      return { stay: STAY, households: HOUSEHOLDS };
    }
    return {
      stay: PREVIEW_DATA.stay,
      households: HOUSEHOLDS.map((h) => ({ ...h, ...(PREVIEW_DATA.households[h.id] || {}) })),
    };
  })();

  const adults = state.households.reduce(
    (n, h) => n + h.members.filter((m) => m.role !== 'kid').length, 0);
  const kids = state.households.reduce(
    (n, h) => n + h.members.filter((m) => m.role === 'kid').length, 0);
  const nights = Math.round((parseDay(TRIP.end) - parseDay(TRIP.start)) / DAY_MS);

  /* ---------------------------------------------------------------
     Backdrop
  --------------------------------------------------------------- */

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  function startBackdrop() {
    const stage = $('#backdropStage');
    const credit = $('#heroCredit');
    if (!stage || !Array.isArray(MEMORIES) || MEMORIES.length === 0) return;

    document.querySelector('.backdrop').classList.add('has-photos');

    /* The pool is far bigger than one visit needs, and every photo in
       the rotation is a full-size download. Take a random handful per
       visit instead: still a different hero each time, without pulling
       the whole library down someone's phone data. */
    const PER_VISIT = 6;
    const order = shuffle(MEMORIES).slice(0, PER_VISIT);
    let i = 0;

    const show = (shot) => {
      const layer = el('div', 'backdrop__shot');
      layer.style.backgroundImage = `url("${shot.src}")`;
      /* portrait shots need the crop pulled up off centre or the full-
         bleed frame cuts faces in half */
      if (shot.pos) layer.style.backgroundPosition = shot.pos;
      stage.appendChild(layer);
      requestAnimationFrame(() => layer.classList.add('is-live'));

      if (credit && shot.caption) {
        credit.textContent = shot.caption;
        credit.hidden = false;
      } else if (credit) {
        credit.hidden = true;
      }

      /* keep at most two layers so the crossfade has something to fade
         from without the DOM growing all session */
      while (stage.children.length > 2) stage.removeChild(stage.firstChild);
    };

    show(order[0]);
    if (order.length === 1) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    setInterval(() => {
      i = (i + 1) % order.length;
      show(order[i]);
    }, 7000);
  }

  /* veil deepens over the first screenful so body copy stays readable */
  function trackScroll() {
    const veil = $('#backdropVeil');
    if (!veil) return;
    let ticking = false;

    const update = () => {
      const p = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
      veil.style.opacity = (0.18 + p * 0.72).toFixed(3);
      ticking = false;
    };

    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------
     Countdown
  --------------------------------------------------------------- */

  function renderCountdown() {
    const num = $('#countdownNum');
    const unit = $('#countdownUnit');
    if (!num || !unit) return;

    const days = Math.round((parseDay(TRIP.start) - startOfToday()) / DAY_MS);

    if (days > 1)  { num.textContent = days;  unit.textContent = 'days out'; }
    else if (days === 1) { num.textContent = '1'; unit.textContent = 'day out'; }
    else if (days === 0) { num.textContent = 'Today'; unit.textContent = 'wheels down'; }
    else {
      const since = Math.round((startOfToday() - parseDay(TRIP.end)) / DAY_MS);
      if (since <= 0) { num.textContent = 'Now'; unit.textContent = 'we’re there'; }
      else { num.textContent = since; unit.textContent = 'days since'; }
    }
  }

  /* ---------------------------------------------------------------
     Tagline
  --------------------------------------------------------------- */

  function renderTagline() {
    [$('#tagline'), $('#footerTagline')].forEach((node) => {
      if (!node) return;
      if (!TRIP.tagline) { node.hidden = true; return; }
      node.textContent = TRIP.tagline;
    });
  }

  /* ---------------------------------------------------------------
     Facts
  --------------------------------------------------------------- */

  function renderFacts() {
    const host = $('#facts');
    if (!host) return;

    const s = parseDay(TRIP.start), e = parseDay(TRIP.end);
    const span = `${MONTH[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`;

    const stayVal =
      state.stay.status === 'booked' && state.stay.name ? state.stay.name :
      state.stay.status === 'shortlist' ? 'Narrowing it down' : 'Still looking';

    const facts = [
      { k: 'Where',    v: TRIP.destination, s: TRIP.region },
      { k: 'When',     v: span,             s: `${WEEKDAY[s.getDay()]} to ${WEEKDAY[e.getDay()]} · ${nights} nights` },
      { k: 'Who',      v: `${adults} adults${kids ? `, ${kids} kids` : ''}`, s: `${state.households.length} households` },
      { k: 'The villa',v: stayVal,          s: state.stay.area || 'To be confirmed' },
    ];

    facts.forEach((f) => {
      const card = el('div', 'fact');
      card.append(el('p', 'fact__key', f.k), el('p', 'fact__val', f.v), el('p', 'fact__sub', f.s));
      host.appendChild(card);
    });
  }

  /* ---------------------------------------------------------------
     Timeline

     One chart replaces the old arrivals board and the presence grid.
     A table made you read two times and compare them in your head; a
     timeline puts them next to each other, so who overlaps with whom is
     something you see rather than something you work out.

     Time of day is the whole point here, so an endpoint is only placed
     precisely when there's a flight time to place it with. Without one
     it sits at midday and is drawn hollow, which reads as "roughly
     here" instead of quietly lying about the hour.
  --------------------------------------------------------------- */

  const partySize = (h) => h.members.length;

  const parseAt = (iso, hhmm) => {
    const [y, m, d] = iso.split('-').map(Number);
    const [hh, mi] = (hhmm || '00:00').split(':').map(Number);
    return new Date(y, m - 1, d, hh, mi);
  };

  const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const nextDay  = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

  function endpoint(h, dir) {
    const f = (h.flights || []).find((x) => x.dir === dir);
    const date = (f && f.date) || (dir === 'in' ? h.arrive : h.depart);
    if (!date) return null;
    const time = (f && f.time) || null;
    return { h, dir, flight: f || null, exact: !!time, t: parseAt(date, time || '12:00') };
  }

  /* The axis is the trip window, widened if anyone's flight falls outside
     it — better to show an early arrival than to clip it off the chart. */
  function axisFor(points) {
    let lo = dayStart(parseDay(TRIP.start));
    let hi = nextDay(parseDay(TRIP.end));
    points.forEach((p) => {
      if (p.t < lo) lo = dayStart(p.t);
      if (p.t >= hi) hi = nextDay(p.t);
    });
    const days = [];
    for (let d = new Date(lo); d < hi; d = nextDay(d)) days.push(new Date(d));
    return { lo, hi, span: hi - lo, days };
  }

  const pctOf = (t, ax) => ((t - ax.lo) / ax.span) * 100;

  const clock = (d) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  function chip(p, ax) {
    const node = el('span', `tl__chip tl__chip--${p.dir}${p.exact ? '' : ' tl__chip--fuzzy'}`);
    node.style.left = `${pctOf(p.t, ax)}%`;

    const f = p.flight;
    const port = f ? (p.dir === 'in' ? f.from : f.to) : null;

    node.append(el('span', 'tl__time', p.exact ? clock(p.t) : shortDay(isoOf(p.t))));

    /* The flight number is the thing people actually come here to read,
       so it gets its own emphasis rather than being folded into one dim
       line with the airport code. */
    const line = el('span', 'tl__flight');
    if (f) {
      line.appendChild(el('b', 'tl__no', f.no || 'booked'));
      if (port) line.appendChild(el('span', 'tl__port', port));
    } else {
      line.textContent = 'time TBD';
    }
    node.append(line);

    node.title = `${p.h.short} ${p.dir === 'in' ? 'arrives' : 'leaves'} ` +
      `${shortDay(isoOf(p.t))}${p.exact ? ' at ' + clock(p.t) : ', time not confirmed'}` +
      (f ? ` — ${f.airline || ''} ${f.no || ''} ${port || ''}`.replace(/\s+/g, ' ') : '');
    return node;
  }

  function renderTimeline() {
    const host = $('#tlChart');
    if (!host) return;

    const rows = state.households.map((h) => ({
      h, in: endpoint(h, 'in'), out: endpoint(h, 'out'),
    }));

    const points = rows.flatMap((r) => [r.in, r.out]).filter(Boolean);
    const ax = axisFor(points);

    if (!points.length) {
      const empty = el('div', 'empty');
      empty.appendChild(el('p', 'empty__line', 'Nobody has booked yet.'));
      host.appendChild(empty);
    }

    /* day header */
    const head = el('div', 'tl__head');
    ax.days.forEach((d) => {
      const cell = el('div', 'tl__day');
      cell.style.left = `${pctOf(d, ax)}%`;
      cell.style.width = `${(nextDay(d) - d) / ax.span * 100}%`;
      cell.append(
        el('span', 'tl__dayName', WEEKDAY[d.getDay()]),
        el('span', 'tl__dayNum', String(d.getDate())));
      head.appendChild(cell);
    });
    host.appendChild(head);

    const body = el('div', 'tl__body');

    /* day gridlines live behind the rows */
    const back = el('div', 'tl__back');
    ax.days.forEach((d, i) => {
      if (!i) return;
      const line = el('div', 'tl__grid');
      line.style.left = `${pctOf(d, ax)}%`;
      back.appendChild(line);
    });

    body.appendChild(back);

    rows.forEach((r) => {
      const row = el('div', 'tl__row');
      const who = el('div', 'tl__who');
      who.append(
        el('span', 'tl__name', r.h.short),
        el('span', 'tl__party', `${partySize(r.h)}`));
      row.appendChild(who);

      const track = el('div', 'tl__track');

      if (r.in && r.out) {
        const bar = el('div', 'tl__bar');
        const l = pctOf(r.in.t, ax);
        bar.style.left = `${l}%`;
        bar.style.width = `${Math.max(pctOf(r.out.t, ax) - l, 0.4)}%`;
        bar.title = `${r.h.short}: ${shortDay(isoOf(r.in.t))} – ${shortDay(isoOf(r.out.t))}`;
        track.appendChild(bar);
      } else if (r.in || r.out) {
        const only = r.in || r.out;
        const stub = el('div', 'tl__bar tl__bar--open');
        stub.style.left = `${pctOf(only.t, ax)}%`;
        stub.title = `${r.h.short}: only one end confirmed`;
        track.appendChild(stub);
      } else {
        track.appendChild(el('span', 'tl__none', 'no dates yet'));
      }

      if (r.in) track.appendChild(chip(r.in, ax));
      if (r.out) track.appendChild(chip(r.out, ax));

      row.appendChild(track);
      body.appendChild(row);
    });

    host.appendChild(body);

    const key = el('p', 'tl__key');
    key.innerHTML =
      '<span class="tl__keyBar"></span> in town &nbsp; ' +
      '<em>hollow marker = day known, time not yet</em>';
    host.appendChild(key);
  }

  /* ---------------------------------------------------------------
     Buddy list

     The crew section is an AIM buddy list beside a profile pane: the
     seven screen names, then partners, then kids.
  --------------------------------------------------------------- */

  /* Everyone shows as online, whether or not they've sent dates. The
     list is a roster, not an RSVP tracker — the timeline above already
     says who has confirmed what, and greying out half the group to
     repeat it just made the section look like a graveyard. */

  /* AOL's running man, in the title bar where the app icon went */
  const RUNNER =
    '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">' +
    '<circle cx="15.2" cy="4" r="3.1" fill="#FFC700"/>' +
    '<path d="M13.8 8.2 L8.9 12.4 L4.3 11.1 M13.8 8.2 L17.6 10.8 L18.5 16.2 ' +
    'M11.7 11.9 L8.5 20.3 M14.6 13.2 L16.5 21" stroke="#FFC700" stroke-width="2.7" ' +
    'stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';

  const GROUPS = [
    { role: 'og',      label: 'Buddies'  },
    { role: 'partner', label: 'Partners' },
    { role: 'kid',     label: 'Kids'     },
  ];

  /* AIM's grey silhouette, for everyone without a buddy icon */
  const defaultIcon = (name, cls) =>
    el('span', `bud__icon bud__icon--none${cls ? ' ' + cls : ''}`, (name[0] || '?').toUpperCase());

  function titleBar(label) {
    const bar = el('div', 'aim__bar');
    const brand = el('span', 'aim__brand');
    brand.innerHTML = RUNNER;
    bar.append(brand, el('span', 'aim__title', label));
    const btns = el('span', 'aim__btns');
    btns.setAttribute('aria-hidden', 'true');
    ['–', '□', '✕'].forEach((g) => btns.appendChild(el('span', 'aim__btn', g)));
    bar.appendChild(btns);
    return bar;
  }

  function buddyRow(member, h, onSelect) {
    const isOg = member.role === 'og';
    const li = el('li');

    /* Only the seven ever had screen names, so only they have a profile
       to open. Partners and kids stay plain rows rather than looking
       clickable and doing nothing. */
    const row = el(isOg ? 'button' : 'div', 'bud');
    row.title = isOg ? `${h.lead} — ${h.short}` : `${member.name}, with ${h.short}`;

    if (isOg) {
      row.type = 'button';
      row.dataset.hid = h.id;
      row.addEventListener('click', () => onSelect(h));
    }

    if (isOg && h.photo) {
      const img = el('img', 'bud__icon');
      img.src = h.photo;
      img.alt = '';
      img.loading = 'lazy';
      img.addEventListener('error', () => img.replaceWith(defaultIcon(member.name)), { once: true });
      row.appendChild(img);
    } else {
      row.appendChild(defaultIcon(member.name));
    }

    row.appendChild(el('span', 'bud__sn', isOg ? (h.sn || h.lead) : member.name));

    /* Dates if we have them, silence if we don't — no row announces its
       own emptiness. */
    let meta = '';
    if (h.arrive && h.depart) meta = `${shortDay(h.arrive)} – ${shortDay(h.depart)}`;
    else if (h.arrive || h.depart) meta = shortDay(h.arrive || h.depart);
    if (meta) row.appendChild(el('span', 'bud__meta', meta));

    if (h.away) row.appendChild(el('span', 'bud__away', `“${h.away}”`));

    li.appendChild(row);
    return li;
  }

  /* --- the profile pane -------------------------------------------- */

  function renderProfile(h) {
    const host = $('#aimProfile');
    if (!host) return;
    host.textContent = '';

    host.appendChild(titleBar(h.sn || h.lead));

    const body = el('div', 'aim__info');

    const top = el('div', 'info__top');
    if (h.photo) {
      const img = el('img', 'info__face');
      img.src = h.photo;
      img.alt = h.lead;
      img.addEventListener('error', () => img.replaceWith(defaultIcon(h.lead, 'info__face')), { once: true });
      top.appendChild(img);
    } else {
      top.appendChild(defaultIcon(h.lead, 'info__face'));
    }

    const who = el('div', 'info__who');
    who.append(
      el('p', 'info__sn', h.sn || h.lead),
      el('p', 'info__real', h.lead));
    const stat = el('p', 'info__status');
    stat.append(el('span', 'info__dot'), document.createTextNode('Online'));
    who.appendChild(stat);
    top.appendChild(who);
    body.appendChild(top);

    if (h.away) body.appendChild(el('p', 'info__away', `“${h.away}”`));

    /* Coming with — skipped entirely for anyone travelling alone, rather
       than printing a heading over the word "nobody". */
    const along = h.members.filter((m) => m.role !== 'og');
    if (along.length) {
      body.appendChild(el('p', 'info__label', 'Coming with'));
      const ul = el('ul', 'info__along');
      along.forEach((m) => {
        const li = el('li', 'info__mate');
        li.append(defaultIcon(m.name), el('span', null, m.name),
          el('span', 'info__mateRole', m.role === 'kid' ? 'kid' : 'partner'));
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }

    /* Dates */
    body.appendChild(el('p', 'info__label', 'In Cabo'));
    body.appendChild(el('p', 'info__dates',
      h.arrive && h.depart ? `${shortDay(h.arrive)} – ${shortDay(h.depart)}`
      : (h.arrive || h.depart) ? `${shortDay(h.arrive || h.depart)} — one end still open`
      : 'Dates not in yet'));

    host.appendChild(body);
  }

  function renderCrew() {
    const host = $('#crewList');
    const count = $('#crewCount');
    if (!host) return;

    if (count) {
      count.textContent =
        `Seven of us left State College in ${TRIP.classYear}. ` +
        `${adults + kids} of us are showing up in Cabo.`;
    }

    /* The reveal goes on a wrapper, not on the windows themselves, so the
       revealed state's `transform: none` can't fight their own layout. */
    const shell = el('div', 'aim-shell');
    const split = el('div', 'aim-split');

    const win = el('div', 'aim');
    win.appendChild(titleBar('Buddy List'));

    const list = el('div', 'aim__list');

    const select = (h) => {
      list.querySelectorAll('.bud').forEach((b) => b.classList.remove('is-sel'));
      const row = list.querySelector(`.bud[data-hid="${h.id}"]`);
      if (row) row.classList.add('is-sel');
      renderProfile(h);
    };

    GROUPS.forEach((g, gi) => {
      const rows = [];
      state.households.forEach((h) => {
        h.members.filter((m) => m.role === g.role).forEach((m) => rows.push({ m, h }));
      });
      if (!rows.length) return;

      const head = el('button', 'aim__group');
      head.type = 'button';
      head.setAttribute('aria-expanded', 'true');
      head.append(
        el('span', 'aim__tri', '▼'),
        el('span', 'aim__gname', g.label),
        el('span', 'aim__gcount', `(${rows.length})`));

      const ul = el('ul', 'aim__buds');
      ul.id = `aimGroup${gi}`;
      head.setAttribute('aria-controls', ul.id);
      rows.forEach(({ m, h }) => ul.appendChild(buddyRow(m, h, select)));

      /* the triangles actually collapse, the way they did */
      head.addEventListener('click', () => {
        const open = head.getAttribute('aria-expanded') === 'true';
        head.setAttribute('aria-expanded', String(!open));
        head.querySelector('.aim__tri').textContent = open ? '▶' : '▼';
        ul.hidden = open;
      });

      list.append(head, ul);
    });

    win.appendChild(list);
    win.appendChild(el('p', 'aim__foot',
      'Click a buddy for their profile.'));

    const profile = el('div', 'aim aim--profile');
    profile.id = 'aimProfile';
    profile.setAttribute('aria-live', 'polite');

    split.append(win, profile);
    shell.appendChild(split);
    host.appendChild(shell);

    /* open on somebody, so the pane is never an empty box on load */
    if (state.households.length) select(state.households[0]);
  }

  /* ---------------------------------------------------------------
     House
  --------------------------------------------------------------- */

  function renderStay() {
    const host = $('#stayPanel');
    if (!host) return;
    const s = state.stay;

    if (s.status !== 'booked' || !s.name) {
      const status = el('p', 'stay__status', s.status === 'shortlist' ? 'Shortlisted' : 'Still looking');
      const line = el('p', 'stay__name',
        s.status === 'shortlist' ? 'Down to a few' : 'No villa yet');
      const sub = el('p', 'stay__meta',
        `One villa for ${adults + kids} people, ${nights} nights, walkable to something. ` +
        'Send links if you find a good one.');
      host.append(status, line, sub);
      return;
    }

    const status = el('p', 'stay__status stay__status--booked', 'Booked');
    host.appendChild(status);
    host.appendChild(el('p', 'stay__name', s.name));

    const meta = [s.area, s.bedrooms ? `${s.bedrooms} bedrooms` : null, `${nights} nights`]
      .filter(Boolean).join('  ·  ');
    host.appendChild(el('p', 'stay__meta', meta));

    if (s.notes) host.appendChild(el('p', 'stay__meta', s.notes));

    if (s.url) {
      const a = el('a', 'stay__link', 'Open the listing →');
      a.href = s.url;
      a.rel = 'noopener';
      a.target = '_blank';
      host.appendChild(a);
    }
  }

  /* ---------------------------------------------------------------
     Reveal on scroll
  --------------------------------------------------------------- */

  function watchReveals() {
    /* Anything listed here starts at opacity 0, so a name that no longer
       matches means that block never becomes visible. `.card` used to be
       the crew cards; it is now `.aim-shell`. */
    const targets = document.querySelectorAll(
      '.section .head, .section .panel, .facts, .aim-shell');
    targets.forEach((t) => t.classList.add('reveal'));

    if (!('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        const delay = Math.min(i * 60, 240);
        setTimeout(() => entry.target.classList.add('is-in'), delay);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    targets.forEach((t) => io.observe(t));

    /* Failsafe: the reveal starts elements at opacity 0, so if the
       observer never fires the page reads as blank. This is the one
       thing on the page that must not be able to hide the content. */
    setTimeout(() => targets.forEach((t) => t.classList.add('is-in')), 2500);
  }

  /* ---------------------------------------------------------------
     Go
  --------------------------------------------------------------- */

  startBackdrop();
  trackScroll();
  renderCountdown();
  renderTagline();
  renderFacts();
  renderTimeline();
  renderCrew();
  renderStay();
  watchReveals();
})();
