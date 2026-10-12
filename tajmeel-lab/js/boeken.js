/* Voorbeeld online boekingssysteem – DEMO. Er wordt niets verstuurd of opgeslagen. */
(function () {
  'use strict';
  var TL = window.TL;
  var data = JSON.parse(document.getElementById('tl-data').textContent);
  var BEH = data.behandelingen, GROEPEN = data.groepen, SALON = data.salon;
  var paneel = document.getElementById('paneel');
  var sam = document.getElementById('sam');
  var sb = document.getElementById('sb');
  if (!paneel || !TL) return;

  var S = { stap: 0, beh: null, datum: null, tijd: null, maand: null, f: { naam: '', tel: '', mail: '', opm: '', ok: false }, ref: '' };

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function svg(inner) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>'; }
  function beh(id) { return BEH.filter(function (b) { return b.id === id; })[0]; }
  function mobiel() { return window.matchMedia('(max-width: 860px)').matches; }
  function eerste(sel, root) { return (root || document).querySelector(sel); }

  /* ---------- Stappenbalk & samenvatting ---------- */
  function updateBalk() {
    [].forEach.call(sb.children, function (li, i) {
      li.classList.toggle('actief', i === S.stap);
      li.classList.toggle('klaar', i < S.stap || S.stap === 3);
      if (i === S.stap) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
  }
  function samRij(l, w, leeg) {
    return '<div class="sam-rij"><span class="l">' + l + '</span><span class="w' + (leeg ? ' leeg' : '') + '">' + (leeg ? 'Nog niet gekozen' : esc(w)) + '</span></div>';
  }
  function updateSam() {
    var b = S.beh ? beh(S.beh) : null;
    var h = '<h3>Jouw afspraak</h3>' +
      samRij('Behandeling', b ? b.naam : '', !b) +
      samRij('Datum', S.datum ? TL.lang(S.datum) : '', !S.datum) +
      samRij('Tijd', S.tijd || '', !S.tijd);
    if (S.f.naam.trim()) h += samRij('Naam', S.f.naam.trim(), false);
    h += '<p class="sam-adres"><b>' + esc(SALON.naam) + '</b><br>' + esc(SALON.adres) + '<br>' + esc(SALON.tel) + '</p>';
    sam.innerHTML = h;
  }

  /* ---------- Stap 0: behandeling ---------- */
  function stap0() {
    var h = '<div class="stap-in"><h2 tabindex="-1" id="stap-kop">Kies je behandeling</h2>' +
      '<p class="uitleg">Waarvoor wil je langskomen? Twijfel je? Kies dan het adviesgesprek.</p>';
    GROEPEN.forEach(function (g) {
      h += '<h3 class="groep-titel">' + esc(g.naam) + '</h3><div class="keuzes">';
      BEH.filter(function (b) { return b.groep === g.id; }).forEach(function (b) {
        h += '<button type="button" class="keuze" data-id="' + b.id + '" aria-pressed="' + (S.beh === b.id) + '">' +
          '<span class="icoon">' + svg(b.icoon) + '</span><span><b>' + esc(b.naam) + '</b><small>' + esc(b.kort) + '</small></span></button>';
      });
      h += '</div>';
    });
    h += '<div class="nav-rij"><button type="button" class="terug" hidden>← Terug</button>' +
      '<button type="button" class="knop" id="volgende"' + (S.beh ? '' : ' disabled') + '>Verder: dag &amp; tijd →</button></div></div>';
    paneel.innerHTML = h;
    paneel.querySelectorAll('.keuze').forEach(function (k) {
      k.addEventListener('click', function () {
        S.beh = k.dataset.id;
        paneel.querySelectorAll('.keuze').forEach(function (x) { x.setAttribute('aria-pressed', x === k ? 'true' : 'false'); });
        eerste('#volgende', paneel).disabled = false;
        updateSam();
      });
    });
    eerste('#volgende', paneel).addEventListener('click', function () { if (S.beh) ga(1); });
  }

  /* ---------- Stap 1: datum & tijd ---------- */
  function maandSleutel(j, m) { return j * 12 + m; }
  function tekenKal() {
    var el = document.getElementById('kal'); if (!el) return;
    var j = S.maand.j, m = S.maand.m, eersteDag = new Date(j, m, 1);
    var offset = (eersteDag.getDay() + 6) % 7, aantal = new Date(j, m + 1, 0).getDate();
    var nu = TL.vandaag(), nuIso = TL.iso(nu), einde = TL.laatste();
    var h = '<div class="kal-kop"><b>' + TL.MAANDEN[m] + ' ' + j + '</b><div class="kal-nav">' +
      '<button type="button" id="kal-vorige" aria-label="Vorige maand"' + (maandSleutel(j, m) <= maandSleutel(nu.getFullYear(), nu.getMonth()) ? ' disabled' : '') + '>‹</button>' +
      '<button type="button" id="kal-volgende" aria-label="Volgende maand"' + (maandSleutel(j, m) >= maandSleutel(einde.getFullYear(), einde.getMonth()) ? ' disabled' : '') + '>›</button></div></div>';
    h += '<div class="kalender" role="group" aria-label="Kies een dag">';
    ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'].forEach(function (n) { h += '<div class="dn" aria-hidden="true">' + n + '</div>'; });
    for (var i = 0; i < offset; i++) h += '<span class="leeg" aria-hidden="true"></span>';
    for (var dg = 1; dg <= aantal; dg++) {
      var s = TL.iso(new Date(j, m, dg)), vrij = TL.dagVrij(s);
      h += '<button type="button" data-d="' + s + '"' + (vrij ? '' : ' disabled') + (s === nuIso ? ' class="vandaag"' : '') +
        ' aria-pressed="' + (S.datum === s) + '" aria-label="' + TL.lang(s) + (vrij ? '' : ', niet beschikbaar') + '">' + dg + '</button>';
    }
    h += '</div>';
    el.innerHTML = h;
    el.querySelectorAll('.kalender button').forEach(function (b) {
      b.addEventListener('click', function () {
        if (S.datum !== b.dataset.d) { S.datum = b.dataset.d; S.tijd = null; }
        tekenKal(); tekenTijden(); updateSam(); updateVolgende1();
        if (mobiel()) { var t = document.getElementById('tijden'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
      });
    });
    var v = document.getElementById('kal-vorige'), n = document.getElementById('kal-volgende');
    v.addEventListener('click', function () { var d = new Date(S.maand.j, S.maand.m - 1, 1); S.maand = { j: d.getFullYear(), m: d.getMonth() }; tekenKal(); });
    n.addEventListener('click', function () { var d = new Date(S.maand.j, S.maand.m + 1, 1); S.maand = { j: d.getFullYear(), m: d.getMonth() }; tekenKal(); });
  }
  function tekenTijden() {
    var el = document.getElementById('tijden'); if (!el) return;
    if (!S.datum) { el.innerHTML = '<div class="tijden-kop">Kies een tijd</div><div class="leeg-melding">Kies eerst een dag in de kalender.</div>'; return; }
    var lijst = TL.tijdenVoor(S.datum), vrij = lijst.filter(function (x) { return x.vrij; }).length;
    var h = '<div class="tijden-kop">' + TL.lang(S.datum) + '</div>' +
      '<p class="uitleg" style="margin-bottom:12px">' + vrij + (vrij === 1 ? ' tijd' : ' tijden') + ' vrij (voorbeeld)</p><div class="tijden-raster">';
    lijst.forEach(function (x) {
      h += '<button type="button" class="tijdknop" data-t="' + x.tijd + '"' + (x.vrij ? '' : ' disabled') + ' aria-pressed="' + (S.tijd === x.tijd) + '">' + x.tijd + '</button>';
    });
    h += '</div>';
    el.innerHTML = h;
    el.querySelectorAll('.tijdknop').forEach(function (b) {
      b.addEventListener('click', function () {
        S.tijd = b.dataset.t;
        el.querySelectorAll('.tijdknop').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        updateSam(); updateVolgende1();
      });
    });
  }
  function updateVolgende1() { var b = document.getElementById('volgende'); if (b) b.disabled = !(S.datum && S.tijd); }
  function stap1() {
    var b = beh(S.beh);
    var h = '<div class="stap-in"><h2 tabindex="-1" id="stap-kop">Kies dag en tijd</h2>' +
      '<p class="uitleg">Voor: <b>' + esc(b.naam) + '</b>. Grijze dagen en doorgestreepte tijden zijn bezet.</p>' +
      '<div class="datum-tijd"><div id="kal"></div><div id="tijden"></div></div>' +
      '<div class="nav-rij"><button type="button" class="terug" id="terug">← Terug</button>' +
      '<button type="button" class="knop" id="volgende" disabled>Verder: gegevens →</button></div></div>';
    paneel.innerHTML = h;
    if (S.datum && !TL.dagVrij(S.datum)) { S.datum = null; S.tijd = null; }
    if (!S.maand) {
      var basis = S.datum ? TL.parse(S.datum) : (TL.volgendeDagen(1)[0] ? TL.parse(TL.volgendeDagen(1)[0]) : TL.vandaag());
      S.maand = { j: basis.getFullYear(), m: basis.getMonth() };
    }
    tekenKal(); tekenTijden(); updateVolgende1();
    document.getElementById('terug').addEventListener('click', function () { ga(0); });
    document.getElementById('volgende').addEventListener('click', function () { if (S.datum && S.tijd) ga(2); });
  }

  /* ---------- Stap 2: gegevens ---------- */
  function veld(id, label, type, extra, fout, ac) {
    return '<div class="veld" id="v-' + id + '"><label for="f-' + id + '">' + label + '</label>' +
      '<input id="f-' + id + '" name="' + id + '" type="' + type + '" autocomplete="' + ac + '" value="' + esc(S.f[id]) + '" ' + extra + ' aria-describedby="e-' + id + '">' +
      '<div class="foutmelding" id="e-' + id + '" role="alert">' + fout + '</div></div>';
  }
  function stap2() {
    var h = '<div class="stap-in"><h2 tabindex="-1" id="stap-kop">Jouw gegevens</h2>' +
      '<p class="uitleg">Zo weet de salon wie er komt. In deze demo wordt er niets verstuurd of opgeslagen.</p>' +
      '<form class="formulier" id="form" novalidate>' +
      veld('naam', 'Naam *', 'text', 'required', 'Vul je naam in.', 'name') +
      '<div class="rij2">' + veld('tel', 'Telefoonnummer *', 'tel', 'required inputmode="tel"', 'Vul een geldig telefoonnummer in.', 'tel') +
      veld('mail', 'E-mailadres (optioneel)', 'email', 'inputmode="email"', 'Dit e-mailadres lijkt niet te kloppen.', 'email') + '</div>' +
      '<div class="veld"><label for="f-opm">Opmerking (optioneel)</label><textarea id="f-opm" name="opm" placeholder="Bijvoorbeeld: een vraag of iets wat de salon moet weten.">' + esc(S.f.opm) + '</textarea></div>' +
      '<label class="vink" id="v-ok"><input type="checkbox" id="f-ok"' + (S.f.ok ? ' checked' : '') + '><span>Ik begrijp dat dit een voorbeeld is en dat mijn gegevens niet worden verstuurd. In de echte versie hoort hier de toestemming voor het verwerken van je gegevens.</span></label>' +
      '<div class="veld fout" id="e-ok-wrap" style="margin:0" hidden><div class="foutmelding" id="e-ok" role="alert">Vink het vakje aan om verder te gaan.</div></div>' +
      '<div class="nav-rij"><button type="button" class="terug" id="terug">← Terug</button>' +
      '<button type="submit" class="knop goud">Afspraak bevestigen</button></div></form></div>';
    paneel.innerHTML = h;
    var f = document.getElementById('form');
    ['naam', 'tel', 'mail'].forEach(function (id) {
      document.getElementById('f-' + id).addEventListener('input', function (e) {
        S.f[id] = e.target.value;
        document.getElementById('v-' + id).classList.remove('fout');
        if (id === 'naam') updateSam();
      });
    });
    document.getElementById('f-opm').addEventListener('input', function (e) { S.f.opm = e.target.value; });
    document.getElementById('f-ok').addEventListener('change', function (e) {
      S.f.ok = e.target.checked;
      document.getElementById('v-ok').classList.remove('fout'); document.getElementById('e-ok-wrap').hidden = true;
    });
    document.getElementById('terug').addEventListener('click', function () { ga(1); });
    f.addEventListener('submit', function (e) { e.preventDefault(); valideer(); });
  }
  function valideer() {
    var fouten = [];
    var naam = S.f.naam.trim(), cijfers = S.f.tel.replace(/\D/g, ''), mail = S.f.mail.trim();
    function markeer(id, slecht) {
      var w = document.getElementById('v-' + id), inp = document.getElementById('f-' + id);
      w.classList.toggle('fout', slecht);
      inp.setAttribute('aria-invalid', slecht ? 'true' : 'false');
      if (slecht) fouten.push(inp);
    }
    markeer('naam', naam.length < 2);
    markeer('tel', cijfers.length < 9 || cijfers.length > 14);
    markeer('mail', mail !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail));
    if (!S.f.ok) {
      document.getElementById('v-ok').classList.add('fout'); document.getElementById('e-ok-wrap').hidden = false;
      fouten.push(document.getElementById('f-ok'));
    }
    if (fouten.length) { fouten[0].focus(); return; }
    var abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', r = 'TL-';
    for (var i = 0; i < 4; i++) r += abc.charAt(Math.floor(Math.random() * abc.length));
    S.ref = r;
    ga(3);
  }

  /* ---------- Stap 3: klaar ---------- */
  function ics() {
    var b = beh(S.beh), d = TL.parse(S.datum), uur = +S.tijd.slice(0, 2);
    function stamp(h) { return d.getFullYear() + TL.pad(d.getMonth() + 1) + TL.pad(d.getDate()) + 'T' + TL.pad(h) + '00' + '00'; }
    function t(x) { return x.replace(/([,;\\])/g, '\\$1'); }
    var nu = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    var regels = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CodeLine Agency//Demo boekingssysteem//NL', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:' + S.ref + '@demo.tajmeel-lab', 'DTSTAMP:' + nu, 'DTSTART:' + stamp(uur), 'DTEND:' + stamp(uur + 1),
      'SUMMARY:' + t('Afspraak ' + SALON.naam + ' – ' + b.naam + ' (demo)'), 'LOCATION:' + t(SALON.adres),
      'DESCRIPTION:' + t('Voorbeeld-afspraak uit een demo van CodeLine Agency. Referentie ' + S.ref + '. Er is niets echt geboekt.'),
      'END:VEVENT', 'END:VCALENDAR'];
    var blob = new Blob([regels.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'afspraak-tajmeel-lab.ics';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function stap3() {
    var b = beh(S.beh);
    var h = '<div class="stap-in klaar"><div class="vink-groot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.500 4.500L19 7.500"/></svg></div>' +
      '<h2 tabindex="-1" id="stap-kop">Je aanvraag is ontvangen</h2>' +
      '<div class="ref">' + esc(S.ref) + '</div>' +
      '<p class="detail"><b>' + esc(b.naam) + '</b><br>' + TL.lang(S.datum) + ' om ' + S.tijd + '<br>' + esc(SALON.naam) + ', ' + esc(SALON.adres) + '</p>' +
      '<p class="detail" style="font-size:.9rem">Dit is een demo: er is niets verstuurd en er is geen echte afspraak gemaakt. In de echte versie kan hier een bevestiging per e-mail of WhatsApp volgen.</p>' +
      '<div class="knop-rij"><button type="button" class="knop goud" id="ics">Zet in mijn agenda</button>' +
      '<a class="knop rand" href="' + esc(SALON.telHref) + '">Bel de salon</a>' +
      '<button type="button" class="knop rand" id="opnieuw">Nieuwe afspraak</button></div></div>';
    paneel.innerHTML = h;
    document.getElementById('ics').addEventListener('click', ics);
    document.getElementById('opnieuw').addEventListener('click', function () {
      S = { stap: 0, beh: null, datum: null, tijd: null, maand: null, f: { naam: '', tel: '', mail: '', opm: '', ok: false }, ref: '' };
      ga(0, true);
    });
  }

  /* ---------- Navigatie ---------- */
  function ga(n, scrollNaarBoven) {
    S.stap = n; render();
    var kop = document.getElementById('stap-kop');
    if (kop) kop.focus({ preventScroll: true });
    var balk = document.getElementById('sb');
    if (balk && (mobiel() || scrollNaarBoven)) balk.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function render() {
    updateBalk(); updateSam();
    [stap0, stap1, stap2, stap3][S.stap]();
  }

  /* Voorselectie via ?b=<behandeling> */
  try {
    var q = new URLSearchParams(location.search).get('b');
    if (q && beh(q)) { S.beh = q; S.stap = 1; }
  } catch (e) { /* oudere browsers: negeren */ }
  render();
})();
