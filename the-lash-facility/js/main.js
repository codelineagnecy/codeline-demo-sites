(function () {
  'use strict';
  var d = document;
  var kop = d.querySelector('.kop');
  var knop = d.querySelector('.menu-knop');
  var nav = d.querySelector('.nav');

  /* Menu (mobiel) */
  function zet(open) {
    if (!knop || !nav) return;
    nav.classList.toggle('open', open);
    knop.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (knop && nav) {
    knop.addEventListener('click', function () { zet(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) zet(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') zet(false); });
    d.addEventListener('click', function (e) { if (!e.target.closest('.kop')) zet(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 860) zet(false); });
  }

  /* Kop-schaduw */
  function scroll() { if (kop) kop.classList.toggle('gescrolld', window.scrollY > 8); }
  window.addEventListener('scroll', scroll, { passive: true });
  scroll();

  /* Reveal */
  var items = [].slice.call(d.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var t = e.target; t.classList.add('in'); io.unobserve(t);
          setTimeout(function () { t.classList.add('gezet'); }, 1500);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  window.__ll = 1;
})();
