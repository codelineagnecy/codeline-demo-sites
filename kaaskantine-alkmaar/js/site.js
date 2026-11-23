(function(){
'use strict';
window.__ll=1;
var root=document.documentElement;
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};

/* voortgang + header */
var vb=document.createElement('div');vb.className='voortgang';document.body.appendChild(vb);
var h=document.querySelector('.header');
function sc(){
  if(h)h.classList.toggle('gescrolld',window.scrollY>30);
  var m=document.documentElement.scrollHeight-window.innerHeight;
  vb.style.transform='scaleX('+(m>0?clamp(window.scrollY/m,0,1):0)+')';
}
sc();window.addEventListener('scroll',sc,{passive:true});
var kn=document.querySelector('.menu-knop'),nav=document.querySelector('.nav');
function sluitNav(){if(!nav)return;nav.classList.remove('open');kn.classList.remove('open');kn.setAttribute('aria-expanded','false');document.body.style.overflow=''}
if(kn&&nav){
  kn.addEventListener('click',function(){var o=nav.classList.toggle('open');kn.classList.toggle('open',o);kn.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''});
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
      if(n.tagName==='BR'){f.appendChild(n.cloneNode(true))}
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

/* statement: woorden vullen bij scrollen */
var fills=$('[data-fill]').map(function(el){
  var label=el.textContent.replace(/\s+/g,' ').trim();
  var f=document.createDocumentFragment();
  el.textContent.split(/(\s+)/).forEach(function(p){
    if(!p)return;
    if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(' '));return}
    var s=document.createElement('span');s.className='fw';s.textContent=p;f.appendChild(s);
  });
  el.textContent='';el.appendChild(f);el.setAttribute('aria-label',label);
  return {el:el,words:$('.fw',el)};
});
function vul(){
  var vh=window.innerHeight;
  fills.forEach(function(o){
    var r=o.el.getBoundingClientRect();
    if(r.bottom<-50||r.top>vh)return;
    var p=clamp((vh*.9-r.top)/(r.height+vh*.4),0,1),N=o.words.length;
    o.words.forEach(function(w,i){w.style.opacity=(reduce?1:.2+.8*clamp(p*(N+4)-i,0,3)/3).toFixed(2)});
  });
}
if(fills.length){window.addEventListener('scroll',vul,{passive:true});window.addEventListener('resize',vul);vul()}

/* reveal */
var targets=$('.reveal,.maskin').filter(function(e){return !e.hasAttribute('data-hero')});
function toon(e){e.classList.add('in');setTimeout(function(){e.classList.add('gezet')},3800)}
if('IntersectionObserver' in window){
  var map=[];
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){map.forEach(function(m){if(m.o===e.target)toon(m.t)});io.unobserve(e.target)}});
  },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  targets.forEach(function(e){
    var o=e.classList.contains('maskin')?e.parentNode:e;
    map.push({o:o,t:e});io.observe(o);
  });
  var sio=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){toon(e.target);sio.unobserve(e.target)}});
  },{threshold:.2});
  $('[data-split]').filter(function(e){return !e.hasAttribute('data-hero')}).forEach(function(e){sio.observe(e)});
}else{
  targets.forEach(function(e){e.classList.add('in','gezet')});
  $('[data-split]').forEach(function(e){e.classList.add('in')});
}

/* loader + paginawissel */
var loader=document.querySelector('.loader'),sluier=document.querySelector('.sluier'),done=false;
var eerste=!!loader&&!root.classList.contains('geenloader')&&!reduce;
try{sessionStorage.setItem('kaas','1')}catch(e){}
function klaar(){
  if(done)return;done=true;
  root.classList.add('ready');
  $('[data-hero]').forEach(function(e){toon(e)});
  if(loader){loader.classList.add('weg');setTimeout(function(){loader.style.display='none'},1400)}
}
function sluierWeg(){if(sluier){sluier.classList.remove('aan');sluier.classList.add('weg')}}
if(sluier){
  if(eerste||reduce){sluier.style.display='none'}
  else{sluier.classList.add('aan');requestAnimationFrame(function(){setTimeout(sluierWeg,60)})}
}
if(eerste){setTimeout(klaar,1000)}
else{setTimeout(klaar,reduce?0:250)}
window.addEventListener('load',function(){setTimeout(klaar,eerste?1000:0)});
window.addEventListener('pageshow',function(e){if(e.persisted&&sluier){sluier.style.display='';sluierWeg()}});
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href]');
  if(!a||!sluier||reduce)return;
  if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;
  if(a.target==='_blank'||a.hasAttribute('download'))return;
  var u;try{u=new URL(a.href,location.href)}catch(x){return}
  if(u.origin!==location.origin||u.pathname===location.pathname)return;
  e.preventDefault();
  sluier.style.display='';sluier.classList.remove('weg');void sluier.offsetWidth;sluier.classList.add('aan');
  setTimeout(function(){location.href=a.href},650);
});

/* parallax + marquee + ringen */
var par=$('[data-par]'),spoor=$('.band-spoor'),ringen=[],mx=0,last=window.scrollY,snel=0;
function lus(){
  var y=window.scrollY,d=y-last;last=y;snel+=(d-snel)*.1;
  if(!reduce){
    par.forEach(function(el){var r=el.parentNode.getBoundingClientRect();if(r.bottom<0||r.top>window.innerHeight)return;el.style.transform='translate3d(0,'+((r.top+r.height/2-window.innerHeight/2)*-.1).toFixed(1)+'px,0)'});
    spoor.forEach(function(s){var half=s.scrollWidth/2;mx-=1.1+Math.abs(snel)*.25;if(-mx>=half)mx+=half;s.style.transform='translate3d('+mx.toFixed(1)+'px,0,0)'});
    ringen.forEach(function(r){r.style.transform='rotate('+((y*.12)%360).toFixed(1)+'deg)'});
  }
  requestAnimationFrame(lus);
}
requestAnimationFrame(lus);

/* sleepbare strip */
$('.strip').forEach(function(st){
  var down=false,sx=0,sl=0;
  st.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;sx=e.clientX;sl=st.scrollLeft});
  window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>4)st.classList.add('sleep');st.scrollLeft=sl-dx});
  window.addEventListener('pointerup',function(){if(!down)return;down=false;st.classList.remove('sleep')});
});


/* lightbox */
var items=$('.g-item');
if(items.length){
  var lb=document.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Foto bekijken');
  lb.innerHTML='<button class="x" aria-label="Sluiten">&times;</button><button class="v" aria-label="Vorige">&#8249;</button><button class="n" aria-label="Volgende">&#8250;</button><figure><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="><figcaption></figcaption></figure>';
  document.body.appendChild(lb);
  var cur=0,li=lb.querySelector('img'),lc=lb.querySelector('figcaption');
  var open=function(i){cur=(i+items.length)%items.length;var it=items[cur];li.src=it.getAttribute('data-groot');li.alt=it.getAttribute('data-alt')||'';lc.textContent=it.getAttribute('data-cap')||'';lb.classList.add('open');document.body.style.overflow='hidden';lb.querySelector('.x').focus()};
  var sluit=function(){lb.classList.remove('open');document.body.style.overflow=''};
  items.forEach(function(it,i){it.addEventListener('click',function(){open(i)})});
  lb.querySelector('.x').onclick=sluit;lb.querySelector('.v').onclick=function(){open(cur-1)};lb.querySelector('.n').onclick=function(){open(cur+1)};
  lb.addEventListener('click',function(e){if(e.target===lb)sluit()});
  document.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;if(e.key==='Escape')sluit();if(e.key==='ArrowLeft')open(cur-1);if(e.key==='ArrowRight')open(cur+1)});
}


/* menu: sticky categorienav met scrollspy */
var mn=$('.menu-nav a');
if(mn.length&&'IntersectionObserver' in window){
  var secs=mn.map(function(a){return document.querySelector(a.getAttribute('href'))}).filter(Boolean);
  function spy(){
    var y=window.innerHeight*.35,best=null;
    secs.forEach(function(s){if(s.getBoundingClientRect().top<=y)best=s});
    mn.forEach(function(a){var on=best&&a.getAttribute('href')==='#'+best.id;a.classList.toggle('nu',!!on);if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
  }
  window.addEventListener('scroll',spy,{passive:true});spy();
}
})();
