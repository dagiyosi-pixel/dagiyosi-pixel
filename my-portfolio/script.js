/* =========================================================================
   Dagiyosi - portfolio behaviour
   Vanilla JavaScript, no dependencies. Everything degrades gracefully.
   ========================================================================= */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return doc.getElementById(id); };

  /* Tells the inline head script that this file is alive. */
  root.classList.add('is-ready');

  /* ---------- Theme switching ---------- */
  var themeToggle = $('themeToggle');

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (err) { /* private mode */ }
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
      themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute('content', theme === 'light' ? '#f5f7fc' : '#070b16'); }
  }

  if (themeToggle) {
    setTheme(root.getAttribute('data-theme') || 'dark');
    themeToggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = $('navToggle');
  var navMenu = $('navMenu');

  function closeMenu() {
    if (!navToggle || !navMenu) { return; }
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    navMenu.classList.remove('is-open');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navToggle.setAttribute('aria-label', open ? 'Open navigation menu' : 'Close navigation menu');
      navMenu.classList.toggle('is-open', !open);
    });

    navMenu.addEventListener('click', function (event) {
      if (event.target.closest('a')) { closeMenu(); }
    });

    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { closeMenu(); }
    });

    doc.addEventListener('click', function (event) {
      if (!navMenu.classList.contains('is-open')) { return; }
      if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) { closeMenu(); }
    });
  }

  /* ---------- Header state, scroll progress, back to top ---------- */
  var header = $('siteHeader');
  var progress = $('progressBar');
  var toTop = $('toTop');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || doc.documentElement.scrollTop;
    var height = doc.documentElement.scrollHeight - window.innerHeight;
    var ratio = height > 0 ? (y / height) * 100 : 0;

    if (header) { header.classList.toggle('is-stuck', y > 12); }
    if (progress) { progress.style.width = ratio.toFixed(2) + '%'; }
    if (toTop) { toTop.classList.toggle('is-visible', y > 600); }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });

  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealables = doc.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window) || !root.classList.contains('js')) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        var el = entry.target;
        var siblings = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.transitionDelay = Math.min(siblings, 4) * 90 + 'ms';
        el.classList.add('is-visible');
        revealObserver.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(revealables, function (el) { revealObserver.observe(el); });
  }

  /* ---------- Active navigation link ---------- */
  var navLinks = doc.querySelectorAll('.nav-menu a[href^="#"]');

  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    Array.prototype.forEach.call(navLinks, function (link) { byId[link.getAttribute('href').slice(1)] = link; });

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) { return; }
        if (entry.isIntersecting) {
          Array.prototype.forEach.call(navLinks, function (other) { other.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    Object.keys(byId).forEach(function (id) {
      var section = doc.getElementById(id);
      if (section) { sectionObserver.observe(section); }
    });
  }

  /* ---------- Animated counters ---------- */
  var counters = doc.querySelectorAll('.count');

  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) { return; }
    if (reduceMotion) { el.textContent = String(target); return; }

    var start = performance.now();
    var duration = 1100;

    function step(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) { window.requestAnimationFrame(step); }
    }

    el.textContent = '0';
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && counters.length) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        runCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    Array.prototype.forEach.call(counters, function (el) { countObserver.observe(el); });
  }

  /* ---------- Typing headline ---------- */
  var typed = $('typed');
  var phrases = [
    'Web developer \u2014 frontend focused, full-stack capable',
    'Semantic HTML, modern CSS, TypeScript',
    'Responsive layouts that never break',
    'Accessible components, clean code',
    'Always shipping, always learning'
  ];

  if (typed && !reduceMotion) {
    var phraseIndex = 0;
    var charIndex = typed.textContent.length;
    var deleting = true;

    var tick = function () {
      var phrase = phrases[phraseIndex];
      typed.textContent = phrase.slice(0, charIndex);

      var delay = deleting ? 28 : 55;

      if (!deleting && charIndex === phrase.length) {
        deleting = true;
        delay = 2200;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 420;
      }

      charIndex += deleting ? -1 : 1;
      window.setTimeout(tick, delay);
    };

    window.setTimeout(tick, 1800);
  }

  /* ---------- Copy email address ---------- */
  var copyBtn = $('copyEmail');
  var copyFeedback = $('copyFeedback');

  function legacyCopy(value) {
    var field = doc.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    doc.body.appendChild(field);
    field.select();
    var ok = false;
    try { ok = doc.execCommand('copy'); } catch (err) { ok = false; }
    doc.body.removeChild(field);
    return ok;
  }

  if (copyBtn && copyFeedback) {
    copyBtn.addEventListener('click', function () {
      var value = copyBtn.getAttribute('data-email') || '';

      function done(ok) {
        copyFeedback.textContent = ok
          ? 'Copied ' + value + ' to your clipboard.'
          : 'Copy failed - the address is ' + value;
        window.setTimeout(function () { copyFeedback.textContent = ''; }, 4200);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(legacyCopy(value)); });
      } else {
        done(legacyCopy(value));
      }
    });
  }

  /* ---------- Footer year ---------- */
  var year = $('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }

})();
