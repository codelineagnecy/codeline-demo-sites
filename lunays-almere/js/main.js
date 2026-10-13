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

  /* Openingstijden volgens Instagram-bio (Europe/Amsterdam) */
  var TIJDEN = { 0: [12, 18], 1: null, 2: [11, 18], 3: [11, 18], 4: [11, 18], 5: [11, 18], 6: [11, 18] };
  var DAGNAAM = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  function nuAmsterdam() {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      var dagen = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { dag: dagen[o.weekday], u: (+o.hour) % 24, m: +o.minute };
    } catch (e) { var n = new Date(); return { dag: n.getDay(), u: n.getHours(), m: n.getMinutes() }; }
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function volgendeOpen(nu) {
    for (var i = 1; i <= 7; i++) {
      var dag = (nu.dag + i) % 7;
      if (TIJDEN[dag]) return (i === 1 ? 'morgen' : DAGNAAM[dag]) + ' om ' + pad(TIJDEN[dag][0]) + ':00';
    }
    return '';
  }
  var chip = d.getElementById('open-chip');
  var nu = nuAmsterdam();
  if (chip) {
    var t = TIJDEN[nu.dag], minuten = nu.u * 60 + nu.m;
    if (t && minuten >= t[0] * 60 && minuten < t[1] * 60) {
      chip.classList.add('open');
      chip.textContent = 'Nu geopend · tot ' + pad(t[1]) + ':00';
    } else if (t && minuten < t[0] * 60) {
      chip.textContent = 'Vandaag open vanaf ' + pad(t[0]) + ':00';
    } else {
      chip.textContent = 'Nu gesloten · weer open ' + volgendeOpen(nu);
    }
  }
  var vandaag = d.querySelector('.uren li[data-dag="' + nu.dag + '"]');
  if (vandaag) vandaag.classList.add('vandaag');

  /* Menukaart: filter + zoeken */
  var chips = [].slice.call(d.querySelectorAll('.chip'));
  var groepen = [].slice.call(d.querySelectorAll('.menu-groep'));
  var zoek = d.getElementById('zoek');
  var leeg = d.getElementById('leeg');
  if (chips.length && groepen.length) {
    var actief = 'alles';
    var norm = function (s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
    var pas = function () {
      var q = norm(zoek ? zoek.value.trim() : '');
      var totaal = 0;
      groepen.forEach(function (g) {
        var pastGroep = actief === 'alles' || g.dataset.groep === actief;
        var n = 0;
        [].forEach.call(g.querySelectorAll('.item'), function (it) {
          var ok = pastGroep && (!q || norm(it.textContent).indexOf(q) !== -1);
          it.hidden = !ok; if (ok) n++;
        });
        g.hidden = n === 0; totaal += n;
      });
      if (leeg) leeg.hidden = totaal !== 0;
    };
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        actief = c.dataset.groep;
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        pas();
      });
    });
    if (zoek) zoek.addEventListener('input', pas);
    pas();
  }

  window.__ll = 1;
})();
