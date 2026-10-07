(function () {
  "use strict";
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Menü auf kleinen Bildschirmen
  var knopf = document.querySelector(".menue"), nav = document.getElementById("nav");
  if (knopf && nav) {
    knopf.addEventListener("click", function () {
      var offen = nav.classList.toggle("offen");
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
      knopf.textContent = offen ? "Schließen" : "Menü";
      document.body.style.overflow = offen ? "hidden" : "";
    });
  }

  // Kopfzeile, Fortschrittslinie und Parallaxe
  var kopf = document.querySelector(".kopf"), linie = document.querySelector(".fortschritt");
  var schichten = ruhig ? [] : Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var wartet = false;
  function rollen() {
    wartet = false;
    var y = window.scrollY, hoehe = document.documentElement.scrollHeight - window.innerHeight;
    if (kopf) kopf.classList.toggle("gescrollt", y > 30);
    if (linie) linie.style.transform = "scaleX(" + (hoehe > 0 ? Math.min(1, y / hoehe) : 0) + ")";
    schichten.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var mitte = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = "translate3d(0," + (mitte * -parseFloat(el.dataset.parallax || "0.1")).toFixed(1) + "px,0)";
    });
  }
  rollen();
  window.addEventListener("scroll", function () { if (!wartet) { wartet = true; requestAnimationFrame(rollen); } }, { passive: true });
  window.addEventListener("resize", rollen);

  // Einblenden beim Scrollen und Hochzählen der Zahlen
  function zaehlen(el) {
    var ziel = parseInt(el.dataset.zahl, 10), start = null;
    if (ruhig || !ziel) { el.textContent = ziel; return; }
    function schritt(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / 1400);
      el.textContent = Math.round(ziel * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(schritt);
    }
    requestAnimationFrame(schritt);
  }
  var ziele = document.querySelectorAll(".zeig, .zeig-bild, .zeitleiste, [data-zahl]");
  if ("IntersectionObserver" in window) {
    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("sichtbar");
        if (e.target.hasAttribute("data-zahl")) zaehlen(e.target);
        beobachter.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    ziele.forEach(function (z) { beobachter.observe(z); });
  } else {
    ziele.forEach(function (z) { z.classList.add("sichtbar"); });
  }

  // Leistungen auf der Startseite: Bildtafel folgt dem Zeiger
  var eintraege = document.querySelectorAll(".l-liste a[data-tafel]");
  function waehle(a) {
    eintraege.forEach(function (x) { x.classList.toggle("aktiv", x === a); });
    document.querySelectorAll(".l-tafel figure").forEach(function (f) { f.classList.toggle("aktiv", f.id === a.dataset.tafel); });
  }
  eintraege.forEach(function (a) {
    a.addEventListener("mouseenter", function () { waehle(a); });
    a.addEventListener("focus", function () { waehle(a); });
  });

  // Vorhang beim Wechsel zwischen den Seiten
  if (!ruhig) {
    document.addEventListener("click", function (ev) {
      var a = ev.target.closest ? ev.target.closest("a[href]") : null;
      if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      var href = a.getAttribute("href");
      if (a.target || !/^[a-z0-9-]+\.html(#.*)?$/i.test(href)) return;
      var hier = (location.pathname.split("/").pop() || "index.html");
      if (href.split("#")[0] === hier) return;
      ev.preventDefault();
      document.documentElement.classList.add("geht");
      setTimeout(function () { location.href = href; }, 520);
    });
    window.addEventListener("pageshow", function () { document.documentElement.classList.remove("geht"); });
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
    var zeile = document.querySelector('.tag[data-tag="' + tag + '"]');
    if (zeile) zeile.classList.add("heute");
    var status = document.getElementById("status");
    if (status) {
      var text = status.querySelector("span"), z = zeiten[tag];
      if (z && jetzt >= z[0] && jetzt < z[1]) {
        status.classList.add("offen");
        text.textContent = "Jetzt geöffnet, heute bis " + uhr(z[1]);
      } else if (z && jetzt < z[0]) {
        text.textContent = "Heute geöffnet ab " + uhr(z[0]);
      } else {
        var n = tag;
        do { n = (n + 1) % 7; } while (!zeiten[n]);
        text.textContent = "Wieder geöffnet am " + namen[n] + " ab " + uhr(zeiten[n][0]);
      }
    }
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
