(function () {
  "use strict";
  document.documentElement.classList.add("js");

  // Menü auf kleinen Bildschirmen
  var knopf = document.querySelector(".menue"), nav = document.getElementById("nav");
  if (knopf && nav) {
    knopf.addEventListener("click", function () {
      var offen = nav.classList.toggle("offen");
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
      knopf.textContent = offen ? "Schließen" : "Menü";
    });
  }

  // Dezentes Einblenden
  var ziele = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
    }, { threshold: 0.08 });
    ziele.forEach(function (z) { obs.observe(z); });
    setTimeout(function () { ziele.forEach(function (z) { z.classList.add("in"); }); }, 2500);
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
