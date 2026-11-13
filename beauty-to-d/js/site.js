(function(){
  window.__ll=1;
  var root=document.documentElement;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var $=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};

  /* voortgangsbalk */
  var vb=document.createElement('div');vb.className='voortgang';document.body.appendChild(vb);

  /* header + menu */
  var h=document.querySelector('.header');
  function sc(){
    if(h)h.classList.toggle('gescrolld',window.scrollY>30);
    var m=document.documentElement.scrollHeight-window.innerHeight;
    vb.style.transform='scaleX('+(m>0?clamp(window.scrollY/m,0,1):0)+')';
  }
  sc();window.addEventListener('scroll',sc,{passive:true});
  var kn=document.querySelector('.menu-knop'),nav=document.querySelector('.nav');
  function sluitNav(){if(!nav)return;nav.classList.remove('open');kn.classList.remove('open');kn.setAttribute('aria-expanded','false');document.body.style.overflow='';h.classList.remove('menu-open')}
  if(kn&&nav){
    kn.addEventListener('click',function(){var o=nav.classList.toggle('open');kn.classList.toggle('open',o);kn.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':'';h.classList.toggle('menu-open',o)});
    $('a',nav).forEach(function(a){a.addEventListener('click',sluitNav)});
  }

  /* woorden splitsen */
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
        if(n.tagName==='BR'||n.tagName==='IMG'||n.classList.contains('chip')){f.appendChild(n.cloneNode(true))}
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

  /* tekst die zich vult bij scrollen */
  var fills=$('[data-fill]').map(function(el){
    var label=el.textContent.replace(/\s+/g,' ').trim();
    var f=document.createDocumentFragment(),n=0;
    (function walk(node,out){
      [].slice.call(node.childNodes).forEach(function(c){
        if(c.nodeType===3){
          c.textContent.split(/(\s+)/).forEach(function(p){
            if(!p)return;
            if(/^\s+$/.test(p)){out.appendChild(document.createTextNode(' '));return}
            var s=document.createElement('span');s.className='fw';s.textContent=p;out.appendChild(s);n++;
          });
        }else if(c.nodeType===1){var k=c.cloneNode(false);walk(c,k);out.appendChild(k)}
      });
    })(el,f);
    el.textContent='';el.appendChild(f);el.setAttribute('aria-label',label);
    return {el:el,words:$('.fw',el)};
  });
  function vul(){
    var vh=window.innerHeight;
    fills.forEach(function(o){
      var r=o.el.getBoundingClientRect();
      if(r.bottom<-50||r.top>vh)return;
      var p=clamp((vh*.88-r.top)/(r.height+vh*.42),0,1),N=o.words.length;
      o.words.forEach(function(w,i){w.style.opacity=(reduce?1:.16+.84*clamp(p*(N+4)-i,0,3)/3).toFixed(2)});
    });
  }
  if(fills.length){window.addEventListener('scroll',vul,{passive:true});window.addEventListener('resize',vul);vul()}

  /* reveal bij scrollen */
  var targets=$('.reveal,.maskin,.split').filter(function(e){return !e.hasAttribute('data-hero')});
  function toon(e){e.classList.add('in');setTimeout(function(){e.classList.add('gezet')},3800)}
  if('IntersectionObserver' in window){
    var map=[];
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){map.forEach(function(m){if(m.o===e.target)toon(m.t)});io.unobserve(e.target)}
      });
    },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    targets.forEach(function(e){
      var o=e.classList.contains('maskin')?e.parentNode:e;
      map.push({o:o,t:e});io.observe(o);
    });
    var gio=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('toon');gio.unobserve(e.target)}});
    },{threshold:.06,rootMargin:'0px 0px -4% 0px'});
    $('.groep').forEach(function(g){gio.observe(g)});
  }else{
    targets.forEach(function(e){e.classList.add('in','gezet')});
    $('.groep').forEach(function(g){g.classList.add('toon')});
  }

  /* loader / paginawissel */
  var loader=document.querySelector('.loader'),sluier=document.querySelector('.sluier'),started=Date.now(),done=false;
  var eerste=!!loader&&!root.classList.contains('geenloader')&&!reduce;
  try{sessionStorage.setItem('btd','1')}catch(e){}
  function klaar(){
    if(done)return;done=true;
    root.classList.add('ready');
    $('[data-hero]').forEach(function(e){toon(e)});
    if(loader){loader.classList.add('weg');setTimeout(function(){loader.style.display='none'},1500)}
  }
  function sluierWeg(){if(sluier){sluier.style.transform='';sluier.style.transition='';sluier.classList.add('weg')}}
  if(sluier){
    if(eerste||reduce){sluier.style.display='none'}
    else{requestAnimationFrame(function(){setTimeout(sluierWeg,60)})}
  }
  if(!eerste){setTimeout(klaar,reduce?0:450)}
  else{
    var wacht=function(){var rest=Math.max(0,2300-(Date.now()-started));setTimeout(klaar,rest)};
    if(document.readyState==='complete')wacht();else window.addEventListener('load',wacht);
    setTimeout(klaar,4000);
  }
  if(sluier&&!reduce){
    document.addEventListener('click',function(ev){
      if(ev.defaultPrevented||ev.button!==0||ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey)return;
      var a=ev.target.closest&&ev.target.closest('a[href]');
      if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
      var u;try{u=new URL(a.href,location.href)}catch(e){return}
      if(u.origin!==location.origin||u.pathname===location.pathname)return;
      ev.preventDefault();
      sluier.style.display='block';sluier.classList.remove('weg');
      sluier.style.transition='none';sluier.style.transform='translateY(101%)';
      void sluier.offsetWidth;
      sluier.style.transition='transform .7s cubic-bezier(.65,0,.35,1)';sluier.style.transform='translateY(0)';
      setTimeout(function(){location.href=u.href},720);
    });
    window.addEventListener('pageshow',function(ev){if(ev.persisted){sluier.style.display='';sluierWeg()}});
  }

  /* parallax */
  var par=$('[data-par]');
  function upd(){
    var vh=window.innerHeight;
    par.forEach(function(e){
      var r=e.parentNode.getBoundingClientRect();
      if(r.bottom<-200||r.top>vh+200)return;
      var f=parseFloat(e.getAttribute('data-par'))||.08;
      e.style.transform='translate3d(0,'+((r.top+r.height/2-vh/2)*f).toFixed(1)+'px,0)';
    });
  }
  if(par.length&&!reduce){window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd()}

  /* marquees en badge: schuiven mee met scrollsnelheid */
  var spoor=$('.band-spoor').map(function(s,i){
    s.innerHTML=s.innerHTML+s.innerHTML;
    return {el:s,x:0,dir:i%2?1:-1,half:0};
  });
  var badge=document.querySelector('.zwevend svg'),draai=0,lastY=window.scrollY,vel=0;
  function meet(){spoor.forEach(function(o){o.half=o.el.scrollWidth/2;if(o.dir>0)o.x=-o.half*.5})}
  window.addEventListener('resize',meet);window.addEventListener('load',meet);meet();
  function lus(){
    var y=window.scrollY;vel=vel*.9+(y-lastY)*.1;lastY=y;
    var s=Math.abs(vel);
    spoor.forEach(function(o){
      if(!o.half)o.half=o.el.scrollWidth/2;
      o.x+=o.dir*(.7+s*.5);
      if(o.dir<0&&o.x<=-o.half)o.x+=o.half;
      if(o.dir>0&&o.x>=0)o.x-=o.half;
      o.el.style.transform='translate3d('+o.x.toFixed(1)+'px,0,0)';
    });
    if(badge){draai+=.35+s*.6;badge.style.transform='rotate('+draai.toFixed(1)+'deg)'}
    requestAnimationFrame(lus);
  }
  if(!reduce&&(spoor.length||badge))requestAnimationFrame(lus);

  /* cursor + magnetische knoppen */
  if(fine&&!reduce){
    var c=document.createElement('div');c.className='cursor';document.body.appendChild(c);
    var cx=0,cy=0,tx=0,ty=0,aan=false;
    window.addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;if(!aan){aan=true;cx=tx;cy=ty;c.classList.add('aan')}});
    document.addEventListener('mouseleave',function(){c.classList.remove('aan');aan=false});
    (function ct(){cx+=(tx-cx)*.18;cy+=(ty-cy)*.18;c.style.transform='translate3d('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px,0)';requestAnimationFrame(ct)})();
    document.addEventListener('mouseover',function(e){var t=e.target.closest&&e.target.closest('a,button,.kaart,.principe');c.classList.toggle('groot',!!t)});
    $('.knop,.zwevend').forEach(function(b){
      b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.25).toFixed(1)+'px)'});
      b.addEventListener('mouseleave',function(){b.style.transform=''});
    });
  }

  /* behandelmenu: tabs */
  var tabs=$('.tab');
  if(tabs.length){
    var groepen=$('.groep'),balk=document.querySelector('.tab-balk');
    var zet=function(){var t=document.querySelector('.tab.aan');if(t&&balk){balk.style.width=t.offsetWidth+'px';balk.style.transform='translateX('+t.offsetLeft+'px)'}};
    var kies=function(k,scrollNaar){
      tabs.forEach(function(t){var on=t.getAttribute('data-k')===k;t.classList.toggle('aan',on);t.setAttribute('aria-selected',on)});
      zet();
      groepen.forEach(function(g){
        var show=k==='alles'||g.id===k;
        g.hidden=!show;g.classList.remove('toon');
        if(show){
          $('.gerecht',g).forEach(function(r,i){r.style.setProperty('--n',i)});
          void g.offsetWidth;setTimeout(function(){g.classList.add('toon')},40);
        }
      });
      if(scrollNaar){var y=document.querySelector('.kaart-lijst').getBoundingClientRect().top+window.scrollY-120;window.scrollTo({top:y,behavior:reduce?'auto':'smooth'})}
      try{history.replaceState(null,'',k==='alles'?location.pathname:'#'+k)}catch(e){}
    };
    tabs.forEach(function(t){t.addEventListener('click',function(){kies(t.getAttribute('data-k'),true)})});
    window.addEventListener('resize',zet);
    var hsh=(location.hash||'').replace('#','');
    kies(groepen.some(function(g){return g.id===hsh})?hsh:'alles',false);
    window.addEventListener('load',zet);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(zet);
  }
})();
