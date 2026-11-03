/* Chalant Creative — minimal vanilla JS.
   Core content works with JS disabled; this only adds polish. */
(function () {
  'use strict';

  /* ---------- Sticky nav state ---------- */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('is-stuck');
    else nav.classList.remove('is-stuck');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove('is-open');
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Scroll reveal ----------
     Progressive enhancement: elements start visible. We only hide the ones
     still below the fold, then reveal them as they come in. If anything in
     this block fails, the page is simply already visible. */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function revealAll() {
    revealEls.forEach(function (el) { el.classList.remove('is-pre'); el.classList.add('is-in'); });
  }

  window.__chalantRevealReady = true;

  if ('IntersectionObserver' in window && revealEls.length) {
    var fold = window.innerHeight;

    revealEls.forEach(function (el) {
      var box = el.getBoundingClientRect();
      if (box.top > fold - 60) el.classList.add('is-pre');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          entry.target.classList.remove('is-pre');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

    revealEls.forEach(function (el) { io.observe(el); });

    /* Safety net: nothing may stay hidden longer than a few seconds. */
    window.setTimeout(revealAll, 4000);
  }

  /* ---------- Reel video ----------
     Muted + playsinline so iOS will autoplay it. Reduced-motion users get the
     poster frame only; otherwise it only plays while on screen. */
  var reel = document.getElementById('reel');
  if (reel) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    var tryPlay = function () {
      reel.muted = true;
      var p = reel.play();
      if (p && p.catch) p.catch(function () {});
    };
    var applyMotionPref = function () {
      if (reduce && reduce.matches) {
        reel.removeAttribute('autoplay');
        reel.pause();
        try { reel.currentTime = 0; } catch (e) {}
        reel.load(); /* back to the poster */
      } else {
        tryPlay();
      }
    };
    applyMotionPref();
    if (reduce && reduce.addEventListener) reduce.addEventListener('change', applyMotionPref);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (reduce && reduce.matches) return;
          if (entry.isIntersecting) tryPlay(); else reel.pause();
        });
      }, { threshold: 0.15 }).observe(reel);
    }
  }
})();
