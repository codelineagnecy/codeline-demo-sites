(function () {
  "use strict";
  document.documentElement.classList.add("js");
  window.__gc = 1;

  // Menü auf kleinen Bildschirmen
  var knopf = document.querySelector(".menue"), nav = document.getElementById("nav");
  if (knopf && nav) {
    knopf.addEventListener("click", function () {
      var offen = nav.classList.toggle("offen");
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
      var t = knopf.querySelector(".menue-text");
      if (t) t.textContent = offen ? "Schließen" : "Menü";
    });
    function zu() {
      nav.classList.remove("offen");
      knopf.setAttribute("aria-expanded", "false");
      var t = knopf.querySelector(".menue-text");
      if (t) t.textContent = "Menü";
    }
    nav.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) zu(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") zu(); });
    document.addEventListener("click", function (e) { if (nav.classList.contains("offen") && !e.target.closest(".kopf")) zu(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 860) zu(); });
  }

  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Kopfzeile bekommt beim Scrollen einen weichen Schatten
  var kopf = document.querySelector(".kopf"), wartet = false;
  function rollen() { wartet = false; if (kopf) kopf.classList.toggle("gescrollt", window.scrollY > 8); }
  rollen();
  window.addEventListener("scroll", function () { if (!wartet) { wartet = true; requestAnimationFrame(rollen); } }, { passive: true });

  // Gruppen erscheinen nacheinander (gestaffelt)
  document.querySelectorAll(".karten, .infokarten, .aerzte, .zahlen, .namen, .weg, .wege, .bildpaar, .fakten").forEach(function (c) {
    c.classList.remove("reveal");
    var par = c.parentElement;
    if (par && par.classList.contains("reveal") && par.children.length === 1) par.classList.remove("reveal");
    Array.prototype.forEach.call(c.children, function (k, i) {
      k.classList.add("reveal");
      k.style.setProperty("--d", (i * 0.09).toFixed(2) + "s");
    });
  });
  // Zweispaltige Bereiche: Text und Bild kommen von den Seiten
  document.querySelectorAll(".zwei").forEach(function (z) {
    var k = z.children;
    if (k[0] && k[0].classList.contains("reveal")) k[0].classList.add("from-left");
    if (k[1] && k[1].classList.contains("reveal")) { k[1].classList.add("from-right"); k[1].style.setProperty("--d", ".12s"); }
  });
  document.querySelectorAll(".wechsel").forEach(function (w, i) {
    w.classList.remove("reveal");
    var bild = w.querySelector(".bild-block"), text = w.querySelector(".fliess");
    var links = i % 2 === 0;
    if (bild) { bild.classList.add("reveal", links ? "from-left" : "from-right"); }
    if (text) { text.classList.add("reveal", links ? "from-right" : "from-left"); text.style.setProperty("--d", ".12s"); }
  });
  document.querySelectorAll(".aufruf .innen, .abschnitt-kopf").forEach(function (e) { e.classList.add("reveal"); });
  document.querySelectorAll(".karten > *, .aerzte > *").forEach(function (e) { e.classList.add("zoom"); });

  // Zahlen zählen hoch
  function zaehlen(el) {
    var ziel = parseInt(el.getAttribute("data-zahl"), 10);
    if (ruhig || !ziel) { el.textContent = ziel; return; }
    var start = null;
    function schritt(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / 1300);
      el.textContent = Math.round(ziel * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(schritt);
    }
    el.textContent = "0";
    requestAnimationFrame(schritt);
  }
  var zahlen = document.querySelectorAll(".zahlen b");
  zahlen.forEach(function (b) { b.setAttribute("data-zahl", b.textContent.trim()); });

  var ziele = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        var b = e.target.querySelector && e.target.querySelector(".zahlen b, b[data-zahl]");
        if (e.target.matches && e.target.matches(".zahlen > *") && b) zaehlen(b);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    ziele.forEach(function (z) { obs.observe(z); });
  } else {
    ziele.forEach(function (z) { z.classList.add("in"); });
  }

  // Sprechzeiten: Wochentag (1 = Montag) -> [Beginn, Ende] in Minuten
  var zeiten = { 1: [450, 960], 2: [450, 960], 3: [450, 840], 4: [450, 960], 5: [450, 840] };
  var namen = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  function uhr(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return m ? h + ":" + String(m).padStart(2, "0") + " Uhr" : h + " Uhr";
  }
  try {
    var teile = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    var t = {};
    teile.forEach(function (p) { t[p.type] = p.value; });
    var tag = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(t.weekday);
    var jetzt = parseInt(t.hour, 10) % 24 * 60 + parseInt(t.minute, 10);
    var zeile = document.querySelector('tr[data-tag="' + tag + '"]');
    if (zeile) zeile.classList.add("heute");
    var z = zeiten[tag], text, offen = false;
    if (z && jetzt >= z[0] && jetzt < z[1]) { offen = true; text = "Jetzt geöffnet, heute bis " + uhr(z[1]); }
    else if (z && jetzt < z[0]) { text = "Heute geöffnet ab " + uhr(z[0]); }
    else {
      var n = tag;
      do { n = (n + 1) % 7; } while (!zeiten[n]);
      text = "Wieder geöffnet am " + namen[n] + " ab " + uhr(zeiten[n][0]);
    }
    document.querySelectorAll("[data-status]").forEach(function (s) {
      var sp = s.querySelector("span");
      if (sp) sp.textContent = text;
      s.classList.toggle("offen", offen);
    });
  } catch (e) { /* Standardtext bleibt stehen */ }

  // Terminanfrage: öffnet eine vorbereitete E-Mail
  var form = document.getElementById("terminform");
  if (form) {
    var meldung = document.getElementById("form-meldung");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      meldung.className = "";
      if (!form.checkValidity()) {
        meldung.className = "fehler";
        meldung.textContent = "Bitte füllen Sie alle Pflichtfelder (*) aus.";
        var erstes = form.querySelector(":invalid");
        if (erstes) erstes.focus();
        return;
      }
      var d = new FormData(form), geb = d.get("geburtsdatum").split("-").reverse().join(".");
      var zeilen = [
        "Terminanfrage über die Website", "",
        "Name: " + d.get("name"),
        "Geburtsdatum: " + geb,
        "Telefon: " + d.get("telefon"),
        "E-Mail: " + (d.get("email") || "-"),
        "Terminart: " + d.get("terminart"),
        "Überweisung vom Hausarzt: " + d.get("ueberweisung"),
        "Versicherung: " + d.get("versicherung"),
        "Kommentar: " + (d.get("kommentar") || "-")
      ];
      window.location.href = "mailto:info@gc-ob.de?subject=" + encodeURIComponent("Terminanfrage: " + d.get("terminart")) + "&body=" + encodeURIComponent(zeilen.join("\n"));
      meldung.textContent = "Ihr E-Mail-Programm wurde geöffnet. Bitte senden Sie die E-Mail dort ab.";
    });
  }
})();
