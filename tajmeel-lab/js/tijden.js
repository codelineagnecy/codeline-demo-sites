/* Voorbeeld-beschikbaarheid voor de demo. Alle tijden zijn VOORBEELDWAARDEN (geen echte agenda). */
(function () {
  'use strict';
  var MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  var MAANDEN_KORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  var DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  var DAG_KORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  var SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  var VOORUIT = 59; // dagen vooruit boekbaar

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function vandaag() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function laatste() { var d = vandaag(); d.setDate(d.getDate() + VOORUIT); return d; }

  function hash(s) {
    var x = 2166136261;
    for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); }
    x ^= x >>> 13; x = Math.imul(x, 0x5bd1e995); x ^= x >>> 15;
    return x >>> 0;
  }

  function tijdenVoor(isoStr) {
    var d = parse(isoStr), nu = new Date(), t0 = vandaag(), t1 = laatste();
    return SLOTS.map(function (t) {
      var vrij = true;
      if (d < t0 || d > t1) vrij = false;
      else if (d.getDay() === 0) vrij = false; // voorbeeld: zondag gesloten
      else {
        var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), +t.slice(0, 2), 0);
        if (start - nu < 2 * 3600 * 1000) vrij = false;
        else if (hash(isoStr + '|' + t) % 100 < 38) vrij = false; // "al bezet"
      }
      return { tijd: t, vrij: vrij };
    });
  }
  function dagVrij(isoStr) { return tijdenVoor(isoStr).some(function (x) { return x.vrij; }); }
  function volgendeDagen(n) {
    var res = [], d = vandaag();
    for (var i = 0; i <= VOORUIT && res.length < n; i++) {
      var s = iso(d);
      if (dagVrij(s)) res.push(s);
      d.setDate(d.getDate() + 1);
    }
    return res;
  }
  function lang(isoStr) { var d = parse(isoStr); return DAGEN[d.getDay()] + ' ' + d.getDate() + ' ' + MAANDEN[d.getMonth()]; }

  window.TL = {
    MAANDEN: MAANDEN, MAANDEN_KORT: MAANDEN_KORT, DAGEN: DAGEN, DAG_KORT: DAG_KORT, SLOTS: SLOTS,
    iso: iso, parse: parse, vandaag: vandaag, laatste: laatste, tijdenVoor: tijdenVoor, dagVrij: dagVrij,
    volgendeDagen: volgendeDagen, lang: lang, pad: pad
  };
})();
