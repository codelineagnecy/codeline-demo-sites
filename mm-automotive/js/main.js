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

  // prijsindicatie
  var NUM='31850609425';
  var opt=[].slice.call(document.querySelectorAll('.optie'));
  var out=document.getElementById('totaal'),regels=document.getElementById('regels'),wa=document.getElementById('calc-wa');
  var SERVICE=25;
  function fmt(n){return '€'+n.toLocaleString('nl-NL')}
  function calc(){
    var som=0,namen=[];
    opt.forEach(function(o){
      var i=o.querySelector('input'),p=+o.dataset.prijs;
      o.classList.toggle('aan',i.checked);
      if(i.checked){som+=p;namen.push(o.dataset.naam)}
    });
    if(regels){
      regels.innerHTML=namen.length?namen.map(function(n){return '<div class="regel"><span>'+n+'</span><span>'+fmt(+opt.filter(function(o){return o.dataset.naam===n})[0].dataset.prijs)+'</span></div>'}).join('')+'<div class="regel"><span>Servicekosten</span><span>'+fmt(SERVICE)+'</span></div>':'<div class="regel"><span>Kies links wat je wilt laten doen</span></div>';
    }
    var tot=namen.length?som+SERVICE:0;
    if(out)out.textContent=fmt(tot);
    var tekst='Hoi! Ik heb interesse in een afspraak'+(namen.length?' voor: '+namen.join(', '):'')+'. Kunnen jullie meer info geven?';
    if(wa)wa.href='https://wa.me/'+NUM+'?text='+encodeURIComponent(tekst);
  }
  opt.forEach(function(o){o.querySelector('input').addEventListener('change',calc)});
  calc();

  window.__ll=1;
})();
