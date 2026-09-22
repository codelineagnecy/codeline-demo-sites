document.documentElement.classList.add('js');

(function(){
  var burger = document.querySelector('.nav-burger');
  var menu = document.querySelector('.mobile-nav');
  if (burger && menu) {
    burger.addEventListener('click', function(){
      menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        menu.classList.remove('open');
      });
    });
  }
})();

(function(){
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function(el){ io.observe(el); });
  } else {
    els.forEach(function(el){ el.classList.add('in'); });
  }

  // safety net: force-reveal everything after 2.5s regardless
  setTimeout(function(){
    els.forEach(function(el){ el.classList.add('in'); });
  }, 2500);
})();

(function(){
  var nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', function(){
    if (window.scrollY > 10) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });
})();
