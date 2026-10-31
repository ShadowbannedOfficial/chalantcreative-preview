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

  /* ---------- Contact form -> mailto ---------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var get = function (id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };

      var name = get('f-name');
      var brand = get('f-brand');
      var email = get('f-email');
      var need = get('f-need');
      var message = get('f-message');

      if (!name || !email || !message) {
        if (status) {
          status.textContent = 'Please add your name, email, and a line about the project.';
          status.classList.add('is-error');
        }
        return;
      }

      // The form is novalidate so we can style errors ourselves, which means
      // the address has to be checked here or a typo silently kills the mailto.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (status) {
          status.textContent = 'That email address does not look complete. Check it and try again.';
          status.classList.add('is-error');
        }
        return;
      }

      if (status) {
        status.classList.remove('is-error');
        status.textContent = '';
      }

      var subject = 'Project inquiry — ' + (brand || name);
      var body = [
        'Name: ' + name,
        'Brand: ' + (brand || '—'),
        'Email: ' + email,
        'Needs: ' + need,
        '',
        message
      ].join('\n');

      window.location.href = 'mailto:brian@chalantcreative.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      if (status) {
        status.textContent = 'Opening your mail app — just hit send.';
      }
    });
  }
})();
