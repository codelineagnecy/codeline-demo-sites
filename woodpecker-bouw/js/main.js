(function(){
  var h=document.querySelector('.header');
  function sc(){h&&h.classList.toggle('gescrolld',window.scrollY>10)}
  sc();window.addEventListener('scroll',sc,{passive:true});

  var kn=document.querySelector('.menu-knop'),nav=document.querySelector('.nav');
  if(kn&&nav){
    kn.addEventListener('click',function(){
      var o=nav.classList.toggle('open');kn.classList.toggle('open',o);kn.setAttribute('aria-expanded',o);
    });
    nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');kn.classList.remove('open');kn.setAttribute('aria-expanded','false')})});
  }

  var els=[].slice.call(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('in');io.unobserve(e.target);
          setTimeout(function(){e.target.classList.add('gezet')},1500);
        }
      });
    },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(e){io.observe(e)});
  }else{els.forEach(function(e){e.classList.add('in')})}

  window.__ll=1;
})();
