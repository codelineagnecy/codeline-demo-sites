document.documentElement.classList.add('js');

// Reveal on scroll with safety-net fallback
(function(){
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function(el){ io.observe(el); });
  } else {
    els.forEach(function(el){ el.classList.add('in'); });
  }
  // Safety net: force-reveal everything after 2.5s regardless
  setTimeout(function(){
    els.forEach(function(el){ el.classList.add('in'); });
  }, 2500);
})();

// Sticky nav on scroll
(function(){
  var nav = document.querySelector('.nav');
  if (!nav) return;
  function onScroll(){
    if (window.scrollY > 30) { nav.classList.add('solid'); }
    else { nav.classList.remove('solid'); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Mobile burger menu (single overlay, avoids stacking two fixed panels)
(function(){
  var burger = document.querySelector('.nav-burger');
  var menu = document.querySelector('.mobile-nav');
  if (!burger || !menu) return;
  burger.addEventListener('click', function(){
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      menu.classList.remove('open');
    });
  });
})();
