// Mohamed Shahmy — shared behaviour
(function () {
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');

  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Contact form: sends through FormSubmit (formsubmit.co) straight to the inbox in data-mail-form.
  // The first message ever sent triggers a one-time activation email to that inbox.
  document.querySelectorAll('[data-mail-form]').forEach(function (form) {
    var to = form.getAttribute('data-mail-form');
    var note = form.querySelector('.form-note');
    var btn = form.querySelector('button[type="submit"]');
    var label = btn ? btn.textContent : '';
    var say = function (msg, ok) {
      if (!note) return;
      note.innerHTML = msg;
      note.style.color = ok === false ? '#e5484d' : '';
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      if (d.get('_honey')) return; // bot filled the hidden field
      var data = {
        name: d.get('name'),
        email: d.get('email'),
        service: d.get('service'),
        message: d.get('message'),
        _subject: 'New enquiry: ' + (d.get('service') || 'General') + ' from ' + d.get('name'),
        _replyto: d.get('email'),
        _template: 'table',
        _captcha: 'false'
      };
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      say('Sending your message…');
      fetch('https://formsubmit.co/ajax/' + to, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) === 'true') {
            form.reset();
            say('Message sent. Thanks, ' + String(data.name).split(' ')[0].replace(/[<>&"]/g, '') + '! You’ll hear back within a day.', true);
            if (btn) btn.textContent = 'Sent';
            setTimeout(function () { if (btn) { btn.disabled = false; btn.textContent = label; } }, 4000);
          } else { throw new Error('not sent'); }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
          var mail = 'mailto:' + to + '?subject=' + encodeURIComponent(data._subject) + '&body=' + encodeURIComponent(data.message + '\n\n' + data.name + '\n' + data.email);
          say('Your message didn’t send. Check your connection and try again, or <a class="link" href="' + mail + '">send it by email</a> instead.', false);
        });
    });
  });

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal blocks as they enter the viewport
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !still) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  // Outline titles fill in as you scroll past them
  var fills = document.querySelectorAll('.fill');
  if (fills.length && !still) {
    var tick = false;
    var paint = function () {
      var vh = window.innerHeight;
      fills.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var p = (vh * 0.9 - r.top) / (vh * 0.55);
        el.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      });
      tick = false;
    };
    paint();
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(paint); } }, { passive: true });
    window.addEventListener('resize', paint);
  }

  // Hero avatar leans toward the pointer
  var av = document.querySelector('[data-follow]');
  if (av && !still && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) {
      var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      av.style.setProperty('--mx', (x * 28).toFixed(1) + 'px');
      av.style.setProperty('--my', (y * 18).toFixed(1) + 'px');
      av.style.setProperty('--mr', (x * 4).toFixed(2) + 'deg');
    });
  }

  // Scale big names so they span the full width on one line
  var fits = document.querySelectorAll('[data-fit]');
  if (fits.length) {
    var doFit = function () {
      fits.forEach(function (fit) {
        fit.style.fontSize = '';
        var base = parseFloat(getComputedStyle(fit).fontSize);
        var ratio = fit.clientWidth / fit.scrollWidth;
        fit.style.fontSize = Math.min(base * ratio * 0.995, 230) + 'px';
      });
    };
    doFit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(doFit);
    window.addEventListener('resize', doFit);
  }

  // Reels: silent previews play while on screen; tap opens a full-screen story viewer
  var reelSets = document.querySelectorAll('[data-reels]');
  if (reelSets.length) {
    var saveData = navigator.connection && navigator.connection.saveData;
    var autoplay = !still && !saveData;
    var load = function (v) { if (!v.getAttribute('src')) { v.src = v.dataset.src; } };
    if (autoplay && 'IntersectionObserver' in window) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting && en.intersectionRatio > 0.55) { load(v); var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
          else { v.pause(); }
        });
      }, { threshold: [0, 0.55, 1] });
      document.querySelectorAll('.reel video').forEach(function (v) { vio.observe(v); });
    }

    var ICON = {
      x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
      on: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
      off: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 6 6M22 9l-6 6"/></svg>',
      l: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
      r: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>'
    };
    var story = document.createElement('div');
    story.className = 'story';
    story.setAttribute('role', 'dialog');
    story.setAttribute('aria-modal', 'true');
    story.setAttribute('aria-label', 'Reel viewer');
    story.innerHTML =
      '<button class="story-btn story-nav prev" type="button" aria-label="Previous reel">' + ICON.l + '</button>' +
      '<div class="story-stage"><div class="story-bars"></div>' +
      '<div class="story-top"><span class="story-count"></span><span class="story-btns">' +
      '<button class="story-btn story-mute" type="button" aria-label="Mute">' + ICON.on + '</button>' +
      '<button class="story-btn story-close" type="button" aria-label="Close">' + ICON.x + '</button></span></div>' +
      '<video playsinline></video>' +
      '<button class="story-tap prev" type="button" aria-label="Previous reel"></button><button class="story-tap next" type="button" aria-label="Next reel"></button>' +
      '<div class="story-foot"><div class="reel-info"><div><b></b><span></span><div class="reel-stats"></div></div><a target="_blank" rel="noopener">Watch on Instagram</a></div></div></div>' +
      '<button class="story-btn story-nav next" type="button" aria-label="Next reel">' + ICON.r + '</button>';
    document.body.appendChild(story);
    var sv = story.querySelector('video'), bars = story.querySelector('.story-bars');
    var muteBtn = story.querySelector('.story-mute');
    var list = [], idx = 0, opener = null, muted = false;

    var show = function (i) {
      if (i < 0) i = 0;
      if (i >= list.length) { close(); return; }
      idx = i;
      var c = list[i].dataset;
      sv.src = c.src; sv.poster = c.poster; sv.muted = muted;
      var p = sv.play(); if (p && p.catch) p.catch(function () { muted = true; sv.muted = true; muteBtn.innerHTML = ICON.off; sv.play(); });
      story.querySelector('.story-count').textContent = (i + 1) + ' / ' + list.length;
      story.querySelector('.story-foot b').textContent = c.title;
      story.querySelector('.story-foot span').textContent = c.note;
      story.querySelector('.story-foot .reel-stats').innerHTML = list[i].querySelector('.reel-stats') ? list[i].querySelector('.reel-stats').innerHTML : '';
      story.querySelector('.story-foot a').href = c.url;
      bars.querySelectorAll('i').forEach(function (b, k) { b.style.width = k < i ? '100%' : '0'; });
    };
    var open = function (set, i, btn) {
      list = Array.prototype.slice.call(set.querySelectorAll('.reel'));
      bars.innerHTML = list.map(function () { return '<span><i></i></span>'; }).join('');
      opener = btn; muted = false; muteBtn.innerHTML = ICON.on; muteBtn.setAttribute('aria-label', 'Mute');
      document.querySelectorAll('.reel video').forEach(function (v) { v.pause(); });
      story.classList.add('is-open'); document.body.style.overflow = 'hidden';
      show(i); story.querySelector('.story-close').focus();
    };
    var close = function () {
      sv.pause(); sv.removeAttribute('src'); sv.load();
      story.classList.remove('is-open'); document.body.style.overflow = '';
      if (opener) opener.focus();
    };
    sv.addEventListener('timeupdate', function () {
      var b = bars.querySelectorAll('i')[idx];
      if (b && sv.duration) b.style.width = (sv.currentTime / sv.duration * 100) + '%';
    });
    sv.addEventListener('ended', function () { show(idx + 1); });
    story.querySelectorAll('.prev').forEach(function (b) { b.addEventListener('click', function () { show(idx - 1); }); });
    story.querySelectorAll('.next').forEach(function (b) { b.addEventListener('click', function () { show(idx + 1); }); });
    story.querySelector('.story-close').addEventListener('click', close);
    story.addEventListener('click', function (e) { if (e.target === story) close(); });
    muteBtn.addEventListener('click', function () {
      muted = !muted; sv.muted = muted;
      muteBtn.innerHTML = muted ? ICON.off : ICON.on; muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    });
    document.addEventListener('keydown', function (e) {
      if (!story.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
    var tx = null;
    story.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    story.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    });
    reelSets.forEach(function (set) {
      set.querySelectorAll('.reel').forEach(function (btn, i) {
        btn.addEventListener('click', function () { open(set, i, btn); });
      });
    });
  }

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
