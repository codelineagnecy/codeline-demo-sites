(function () {
  "use strict";
  document.documentElement.classList.add("js");
  window.__hf = 1;

  // Menu
  var knop = document.querySelector(".menu-knop"), nav = document.getElementById("nav");
  function sluit() {
    if (!nav) return;
    nav.classList.remove("open");
    if (knop) { knop.setAttribute("aria-expanded", "false"); var t = knop.querySelector(".menu-tekst"); if (t) t.textContent = "Menu"; }
  }
  if (knop && nav) {
    knop.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      knop.setAttribute("aria-expanded", open ? "true" : "false");
      var t = knop.querySelector(".menu-tekst"); if (t) t.textContent = open ? "Sluiten" : "Menu";
    });
    nav.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) sluit(); });
    document.addEventListener("click", function (e) { if (nav.classList.contains("open") && !e.target.closest(".kop")) sluit(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") sluit(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 860) sluit(); });
  }

  // Kop krijgt een rand bij scrollen
  var kop = document.querySelector(".kop"), wacht = false;
  function rol() { wacht = false; if (kop) kop.classList.toggle("gescrolld", window.scrollY > 8); }
  rol();
  window.addEventListener("scroll", function () { if (!wacht) { wacht = true; requestAnimationFrame(rol); } }, { passive: true });

  // Gestaffeld inzoomen/verschijnen
  document.querySelectorAll(".diensten, .stappen, .galerij, .contact-kaarten").forEach(function (c) {
    Array.prototype.forEach.call(c.children, function (k, i) {
      k.classList.add("reveal");
      if (c.classList.contains("galerij") || c.classList.contains("diensten")) k.classList.add("zoom");
      k.style.setProperty("--d", (i * 0.09).toFixed(2) + "s");
    });
  });
  var doelen = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    doelen.forEach(function (d) { obs.observe(d); });
  } else { doelen.forEach(function (d) { d.classList.add("in"); }); }

  // Lightbox
  var lb = document.createElement("div");
  lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Vergrote foto");
  lb.innerHTML = '<button type="button" aria-label="Sluiten">&times;</button><img alt="">';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector("img");
  function lbSluit() { lb.classList.remove("open"); document.body.style.overflow = ""; }
  document.querySelectorAll(".foto").forEach(function (f) {
    f.addEventListener("click", function () {
      var im = f.querySelector("img");
      lbImg.src = im.getAttribute("src"); lbImg.alt = im.getAttribute("alt") || "";
      lb.classList.add("open"); document.body.style.overflow = "hidden";
    });
  });
  lb.addEventListener("click", lbSluit);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") lbSluit(); });
})();
