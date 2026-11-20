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

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
