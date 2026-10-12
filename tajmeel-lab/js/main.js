(function () {
  'use strict';
  var d = document;
  var kop = d.querySelector('.kop');
  var knop = d.querySelector('.menu-knop');
  var nav = d.querySelector('.nav');

  /* Menu */
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
      es.forEach(function (e) { if (e.isIntersecting) { var t = e.target; t.classList.add('in'); io.unobserve(t); setTimeout(function () { t.classList.add('gezet'); }, 1500); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* Mini-boeking in de hero (zelfde voorbeeld-beschikbaarheid als het echte demo-systeem) */
  var dagen = d.getElementById('mini-dagen'), tijden = d.getElementById('mini-tijden');
  if (dagen && tijden && window.TL) {
    var TL = window.TL, lijst = TL.volgendeDagen(3), gekozen = lijst[0], tijd = null;
    var teken = function () {
      dagen.innerHTML = lijst.map(function (s) {
        var dt = TL.parse(s);
        return '<button type="button" class="dag' + (s === gekozen ? ' actief' : '') + '" data-d="' + s + '" aria-pressed="' + (s === gekozen) + '">' +
          TL.DAG_KORT[dt.getDay()] + '<b>' + dt.getDate() + '</b>' + TL.MAANDEN_KORT[dt.getMonth()] + '</button>';
      }).join('');
      var vrij = TL.tijdenVoor(gekozen).filter(function (x) { return x.vrij; }).slice(0, 3);
      if (!vrij.some(function (x) { return x.tijd === tijd; })) tijd = vrij.length ? vrij[0].tijd : null;
      tijden.innerHTML = vrij.map(function (x) {
        return '<button type="button" class="tijd' + (x.tijd === tijd ? ' actief' : '') + '" data-t="' + x.tijd + '" aria-pressed="' + (x.tijd === tijd) + '">' + x.tijd + '</button>';
      }).join('');
    };
    if (gekozen) {
      teken();
      dagen.addEventListener('click', function (e) { var b = e.target.closest('.dag'); if (b) { gekozen = b.dataset.d; teken(); } });
      tijden.addEventListener('click', function (e) { var b = e.target.closest('.tijd'); if (b) { tijd = b.dataset.t; teken(); } });
    }
  }

  /* Instagram: pas laden na klik (cookies van Instagram) */
  var igKnop = d.getElementById('ig-laad');
  if (igKnop) {
    igKnop.addEventListener('click', function () {
      d.querySelectorAll('.ig-kaart[data-code]').forEach(function (k) {
        var f = d.createElement('iframe');
        f.src = 'https://www.instagram.com/reel/' + k.dataset.code + '/embed/';
        f.title = 'Instagram-post van @tajmeellab';
        f.loading = 'lazy'; f.setAttribute('allowtransparency', 'true'); f.setAttribute('scrolling', 'no');
        k.textContent = ''; k.classList.add('geladen'); k.appendChild(f);
      });
      igKnop.parentNode.hidden = true;
    });
  }

  window.__tl = 1;
})();
