(function(){
  window.__ll=1;
  var root=document.documentElement;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};

  /* header + menu */
  var h=document.querySelector('.header');
  function sc(){if(h&&!h.hasAttribute('data-solid'))h.classList.toggle('gescrolld',window.scrollY>24)}
  sc();window.addEventListener('scroll',sc,{passive:true});
  var kn=document.querySelector('.menu-knop'),nav=document.querySelector('.nav');
  if(kn&&nav){
    kn.addEventListener('click',function(){var o=nav.classList.toggle('open');kn.classList.toggle('open',o);kn.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''});
    $('a',nav).forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');kn.classList.remove('open');kn.setAttribute('aria-expanded','false');document.body.style.overflow=''})});
  }

  /* woorden splitsen voor koppen */
  var idx;
  function splitNode(node){
    var f=document.createDocumentFragment();
    [].slice.call(node.childNodes).forEach(function(n){
      if(n.nodeType===3){
        n.textContent.split(/(\s+)/).forEach(function(p){
          if(!p)return;
          if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(' '));return}
          var w=document.createElement('span');w.className='w';
          var i=document.createElement('i');i.textContent=p;i.style.setProperty('--i',idx++);
          w.appendChild(i);f.appendChild(w);
        });
      }else if(n.nodeType===1){
        if(n.tagName==='BR'){f.appendChild(n.cloneNode())}
        else{var c=n.cloneNode(false);c.appendChild(splitNode(n));f.appendChild(c)}
      }
    });
    return f;
  }
  $('[data-split]').forEach(function(el){
    var label=el.textContent.replace(/\s+/g,' ').trim();
    idx=0;var f=splitNode(el);el.textContent='';el.appendChild(f);
    el.setAttribute('aria-label',label);
    $('.w',el).forEach(function(w){w.setAttribute('aria-hidden','true')});
  });

  /* reveal bij scrollen */
  var targets=$('.reveal,.maskin,.split').filter(function(e){return !e.hasAttribute('data-hero')});
  function toon(e){
    e.classList.add('in');
    setTimeout(function(){e.classList.add('gezet')},3600);
  }
  if('IntersectionObserver' in window){
    var map=[];
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          map.forEach(function(m){if(m.o===e.target)toon(m.t)});
          io.unobserve(e.target);
        }
      });
    },{threshold:.14,rootMargin:'0px 0px -6% 0px'});
    targets.forEach(function(e){
      /* een weggeknipt element (clip-path) kruist nooit; observeer dan de ouder */
      var o=e.classList.contains('maskin')?e.parentNode:e;
      map.push({o:o,t:e});io.observe(o);
    });
    var gio=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('toon');gio.unobserve(e.target)}});
    },{threshold:.08,rootMargin:'0px 0px -4% 0px'});
    $('.groep').forEach(function(g){gio.observe(g)});
  }else{
    targets.forEach(function(e){e.classList.add('in','gezet')});
    $('.groep').forEach(function(g){g.classList.add('toon')});
  }

  /* hero na loader */
  var loader=document.querySelector('.loader'),started=Date.now(),done=false;
  function klaar(){
    if(done)return;done=true;
    root.classList.add('ready');
    $('[data-hero]').forEach(function(e){toon(e)});
    if(loader){loader.classList.add('weg');setTimeout(function(){loader.style.display='none'},1400)}
  }
  if(!loader||reduce){klaar()}
  else{
    var wacht=function(){var rest=Math.max(0,2000-(Date.now()-started));setTimeout(klaar,rest)};
    if(document.readyState==='complete')wacht();else window.addEventListener('load',wacht);
    setTimeout(klaar,3600);
  }

  /* parallax */
  var par=$('[data-par]');
  if(par.length&&!reduce){
    var tick=false;
    var upd=function(){
      tick=false;var vh=window.innerHeight;
      par.forEach(function(e){
        var r=e.parentNode.getBoundingClientRect();
        if(r.bottom<-200||r.top>vh+200)return;
        var f=parseFloat(e.getAttribute('data-par'))||.08;
        var d=(r.top+r.height/2-vh/2)*f;
        e.style.transform='translate3d(0,'+d.toFixed(1)+'px,0)';
      });
    };
    window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});
    window.addEventListener('resize',upd);upd();
  }

  /* menukaart: filter */
  var tabs=$('.tab');
  if(tabs.length){
    var groepen=$('.groep');
    var kies=function(k,scrollNaar){
      tabs.forEach(function(t){var on=t.getAttribute('data-k')===k;t.classList.toggle('aan',on);t.setAttribute('aria-selected',on)});
      groepen.forEach(function(g){
        var show=k==='alles'||g.id===k;
        g.hidden=!show;
        g.classList.remove('toon');
        if(show){
          $('.gerecht',g).forEach(function(r,i){r.style.setProperty('--n',i)});
          void g.offsetWidth;
          setTimeout(function(){g.classList.add('toon')},40);
        }
      });
      if(scrollNaar){var y=document.querySelector('.kaart-lijst').getBoundingClientRect().top+window.scrollY-130;window.scrollTo({top:y,behavior:reduce?'auto':'smooth'})}
      try{history.replaceState(null,'',k==='alles'?location.pathname:'#'+k)}catch(e){}
    };
    tabs.forEach(function(t){t.addEventListener('click',function(){kies(t.getAttribute('data-k'),true)})});
    var hsh=(location.hash||'').replace('#','');
    kies(groepen.some(function(g){return g.id===hsh})?hsh:'alles',false);
  }
})();
