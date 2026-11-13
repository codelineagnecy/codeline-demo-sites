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
    o.words.forEach(function(w,i){w.style.opacity=(reduce?1:.18+.82*clamp(p*(N+4)-i,0,3)/3).toFixed(2)});
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
try{sessionStorage.setItem('nami','1')}catch(e){}
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
if(eerste){setTimeout(klaar,1900)}
else{setTimeout(klaar,reduce?0:250)}
window.addEventListener('load',function(){setTimeout(klaar,eerste?1900:0)});
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

/* parallax + marquee */
var par=$('[data-par]'),spoor=$('.band-spoor'),mx=0,last=window.scrollY,snel=0;
function lus(){
  var y=window.scrollY,d=y-last;last=y;snel+=(d-snel)*.1;
  if(!reduce){
    par.forEach(function(el){var r=el.parentNode.getBoundingClientRect();if(r.bottom<0||r.top>window.innerHeight)return;el.style.transform='translate3d(0,'+((r.top+r.height/2-window.innerHeight/2)*-.12).toFixed(1)+'px,0)'});
    spoor.forEach(function(s){var half=s.scrollWidth/2;mx-=1.1+Math.abs(snel)*.25;if(-mx>=half)mx+=half;s.style.transform='translate3d('+mx.toFixed(1)+'px,0,0)'});
  }
  requestAnimationFrame(lus);
}
requestAnimationFrame(lus);

/* draaiende cirkeltekst */
var ringen=$('[data-ring]');
function ringlus(){
  if(!reduce){ringen.forEach(function(r){var y=window.scrollY;r.style.transform='rotate('+((y*.12)%360).toFixed(1)+'deg)'})}
  requestAnimationFrame(ringlus);
}
if(ringen.length)requestAnimationFrame(ringlus);

/* sleepbare strip */
$('.strip').forEach(function(st){
  var down=false,sx=0,sl=0,moved=false;
  st.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=st.scrollLeft});
  window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>4){moved=true;st.classList.add('sleep')}st.scrollLeft=sl-dx});
  window.addEventListener('pointerup',function(){if(!down)return;down=false;st.classList.remove('sleep')});
});

/* openingstijden + live status (Europe/Amsterdam) */
var SCHEMA={0:[10,20,19],1:null,2:[9,19,18],3:[9,19,18],4:[9,20,19],5:[9,20,19],6:[9,20,19]};
var DAGEN=['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
function ams(){
  try{
    var p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    var o={};p.forEach(function(x){o[x.type]=x.value});
    var map={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
    return {d:map[o.weekday],m:(parseInt(o.hour,10)%24)*60+parseInt(o.minute,10)};
  }catch(e){var n=new Date();return {d:n.getDay(),m:n.getHours()*60+n.getMinutes()}}
}
function fmt(h){return (h<10?'0':'')+h+':00'}
function status(){
  var n=ams(),s=SCHEMA[n.d],txt,open=false,sub='';
  if(!s){txt='Vandaag gesloten';
    sub='Dinsdag zijn we weer open vanaf 09:00.';}
  else if(n.m<s[0]*60){txt='Nu gesloten';sub='Vandaag open vanaf '+fmt(s[0])+'.'}
  else if(n.m<s[1]*60){open=true;txt='Nu geopend';sub='Open tot '+fmt(s[1])+(n.m<s[2]*60?' · keuken tot '+fmt(s[2]):' · keuken is gesloten')+'.'}
  else{txt='Nu gesloten';var nx=(n.d+1)%7,k=0;while(!SCHEMA[nx]&&k<7){nx=(nx+1)%7;k++}sub='Weer open '+(nx===(n.d+1)%7?'morgen':'op '+DAGEN[nx])+' vanaf '+fmt(SCHEMA[nx][0])+'.'}
  $('[data-status]').forEach(function(el){el.classList.toggle('open',open);el.querySelector('b').textContent=txt});
  $('[data-status-sub]').forEach(function(el){el.textContent=sub});
  $('.uren tr[data-dag]').forEach(function(tr){tr.classList.toggle('nu',parseInt(tr.getAttribute('data-dag'),10)===n.d)});
}
status();setInterval(status,60000);

/* menukaart: tabs, scrollspy, zoeken */
var tabs=$('.tab'),groepen=$('.groep'),balk=document.querySelector('.tab-balk');
function balkNaar(t){
  if(!balk||!t)return;
  balk.style.width=t.offsetWidth+'px';balk.style.transform='translateX('+t.offsetLeft+'px)';
  var wrap=t.parentNode;
  if(wrap.scrollWidth>wrap.clientWidth){var tgt=t.offsetLeft-(wrap.clientWidth-t.offsetWidth)/2;wrap.scrollTo({left:tgt,behavior:reduce?'auto':'smooth'})}
}
function zetTab(id){tabs.forEach(function(t){var on=t.getAttribute('data-t')===id;t.classList.toggle('aan',on);if(on){t.setAttribute('aria-current','true');balkNaar(t)}else t.removeAttribute('aria-current')})}
if(tabs.length){
  tabs.forEach(function(t){t.addEventListener('click',function(){
    var g=document.getElementById(t.getAttribute('data-t'));
    if(g){var y=g.getBoundingClientRect().top+window.scrollY-120;window.scrollTo({top:y,behavior:reduce?'auto':'smooth'})}
  })});
  zetTab(groepen[0].id);
  var spy=function(){
    var cur=groepen[0].id;
    groepen.forEach(function(g){if(!g.classList.contains('verberg')&&g.getBoundingClientRect().top<window.innerHeight*.38)cur=g.id});
    zetTab(cur);
  };
  window.addEventListener('scroll',spy,{passive:true});
  window.addEventListener('resize',function(){var a=document.querySelector('.tab.aan');balkNaar(a)});
  setTimeout(function(){balkNaar(document.querySelector('.tab.aan'))},60);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){balkNaar(document.querySelector('.tab.aan'))});
  if(location.hash){var gh=document.getElementById(location.hash.slice(1));if(gh&&gh.classList.contains('groep'))setTimeout(function(){window.scrollTo({top:gh.getBoundingClientRect().top+window.scrollY-120})},400)}
}
var zk=document.getElementById('zoek'),leeg=document.querySelector('.leeg');
if(zk){
  zk.addEventListener('input',function(){
    var q=zk.value.trim().toLowerCase(),tot=0;
    groepen.forEach(function(g){
      var n=0;
      $('.item',g).forEach(function(it){
        var hit=!q||it.textContent.toLowerCase().indexOf(q)>-1;
        it.classList.toggle('verberg',!hit);if(hit)n++;
      });
      g.classList.toggle('verberg',n===0);tot+=n;
    });
    if(leeg)leeg.classList.toggle('toon',tot===0);
  });
}

/* tafelkaart printen */
$('[data-print]').forEach(function(b){b.addEventListener('click',function(){window.print()})});

/* demo-formulier (niets wordt verzonden) */
var f=document.getElementById('vorm');
if(f){
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var ok=true;
    function chk(name,bad,msg){var v=f.querySelector('[data-v="'+name+'"]');var m=v.querySelector('.melding');if(bad){v.classList.add('fout');m.textContent=msg;m.hidden=false;ok=false}else{v.classList.remove('fout');m.hidden=true}}
    chk('naam',f.naam.value.trim().length<2,'Vul je naam in.');
    chk('email',!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()),'Vul een geldig e-mailadres in.');
    chk('bericht',f.bericht.value.trim().length<5,'Vertel kort wat je zoekt.');
    if(!ok){var x=f.querySelector('.fout input,.fout textarea');if(x)x.focus();return}
    var naam=f.naam.value.trim().split(' ')[0].replace(/[<>&"]/g,'');
    f.innerHTML='<div class="vorm-klaar"><div class="vink"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" pathLength="1"/><path d="M30 52 L45 66 L71 36" pathLength="1"/></svg></div><h3>Bedankt, '+naam+'</h3><p>Zo zou je aanvraag aankomen. In deze demo is er niets verzonden of opgeslagen.</p><a class="knop" href="index.html">Terug naar home <i class="pijl"></i></a></div>';
    f.scrollIntoView({behavior:'smooth',block:'center'});
  });
}
})();
