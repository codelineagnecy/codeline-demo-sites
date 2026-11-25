/* THE BOX Scheveningen · conceptsite door CodeLine Agency */
(function(){
'use strict';
var d=document,root=d.documentElement;
var $=function(s,c){return (c||d).querySelector(s)};
var $$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
root.classList.add('ready');
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}}

/* taal */
function zetTaal(l){root.setAttribute('data-l',l);root.setAttribute('lang',l);ls('box-l',l);$$('.taal button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.set===l?'true':'false')});klok()}
$$('.taal button').forEach(function(b){b.addEventListener('click',function(){zetTaal(b.dataset.set)})});

/* mobiel menu */
var mk=$('.menu-knop'),nav=$('.nav');
function sluit(){if(nav){nav.classList.remove('open');if(mk)mk.setAttribute('aria-expanded','false');d.body.style.overflow=''}}
if(mk&&nav){
  mk.addEventListener('click',function(){var o=nav.classList.toggle('open');mk.setAttribute('aria-expanded',o?'true':'false');d.body.style.overflow=o?'hidden':''});
  $$('a',nav).forEach(function(a){a.addEventListener('click',sluit)});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')sluit()});
  window.addEventListener('resize',function(){if(window.innerWidth>900)sluit()});
}

/* reveal */
var rv=$$('.reveal');
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.1,rootMargin:'0px 0px -30px 0px'});
  rv.forEach(function(r){io.observe(r)});
}else{rv.forEach(function(r){r.classList.add('in')})}

/* open / dicht (Europe/Amsterdam, dagelijks 10:00-23:00 volgens Instagram) */
var OPEN=10*60,DICHT=23*60;
function ams(){
  try{
    var p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    var h=0,m=0;p.forEach(function(x){if(x.type==='hour')h=parseInt(x.value,10)%24;if(x.type==='minute')m=parseInt(x.value,10)});
    return h*60+m;
  }catch(e){var n=new Date();return n.getHours()*60+n.getMinutes()}
}
function status(min){
  if(min>=OPEN&&min<DICHT){
    var rest=DICHT-min;
    return {open:true,nl:rest<=60?'Nu open · sluit over '+rest+' min':'Nu open · tot 23:00',en:rest<=60?'Open now · closes in '+rest+' min':'Open now · until 11 pm'};
  }
  return {open:false,nl:min<OPEN?'Nu dicht · opent om 10:00':'Nu dicht · morgen weer om 10:00',en:min<OPEN?'Closed now · opens at 10 am':'Closed now · opens tomorrow at 10 am'};
}
function klok(){
  var s=status(ams());
  $$('.open-pill').forEach(function(p){
    p.classList.toggle('open',s.open);p.classList.toggle('dicht',!s.open);
    var n=$('.nl',p),e=$('.en',p);if(n)n.textContent=s.nl;if(e)e.textContent=s.en;
  });
}
klok();setInterval(klok,60000);

/* "Open op mijn tijd?" */
var tt=$('#tijd');
if(tt){
  var uit=$('#tijd-uit');
  var upd=function(){
    if(!tt.value){uit.hidden=true;return}
    var a=tt.value.split(':'),min=parseInt(a[0],10)*60+parseInt(a[1],10);
    var ok=min>=OPEN&&min<DICHT;
    uit.hidden=false;uit.className='uitslag '+(ok?'ok':'nee');
    $('.nl',uit).textContent=ok?'Ja, dan zijn we open. Tot dan!':'Dan zijn we dicht. Open is dagelijks van 10:00 tot 23:00.';
    $('.en',uit).textContent=ok?'Yes, we are open then. See you!':'We are closed then. Open daily from 10 am to 11 pm.';
  };
  tt.addEventListener('input',upd);tt.addEventListener('change',upd);
}

/* "Mag ik naar binnen?" */
var ck=$('#checker');
if(ck){
  var ant={},uitk=$('.uitslag',ck),vr=$$('.vraag',ck);
  var toon=function(){
    if(Object.keys(ant).length<vr.length){uitk.className='uitslag';return}
    var ok=Object.keys(ant).every(function(k){return ant[k]==='ja'});
    uitk.className='uitslag '+(ok?'ok':'nee');
    $('.nl',uitk).textContent=ok?'Top, dan ben je welkom. Neem je ID mee en kom langs!':'Helaas, dan kun je nu niet naar binnen. Voldoe je aan beide regels? Dan zien we je graag.';
    $('.en',uitk).textContent=ok?'Great, you are welcome. Bring your ID and drop by!':'Sorry, then you cannot come in right now. Once you meet both rules, we would love to see you.';
  };
  $$('.jn button',ck).forEach(function(b){b.addEventListener('click',function(){
    var q=b.closest('.vraag');ant[q.dataset.q]=b.dataset.v;
    $$('button',q).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});toon();
  })});
}

/* leeftijdspoort */
var po=$('.poort');
if(po){
  var tekst=$('.nee-tekst',po);
  if(ss('box-18')!=='ja'){po.classList.add('open');d.body.style.overflow='hidden';var ja0=$('[data-ja]',po);if(ja0)setTimeout(function(){ja0.focus()},50)}
  $('[data-ja]',po).addEventListener('click',function(){ss('box-18','ja');po.classList.remove('open');d.body.style.overflow=''});
  $('[data-nee]',po).addEventListener('click',function(){tekst.style.display='block'});
}

/* taal initialiseren (na alle handlers) */
zetTaal(root.getAttribute('data-l')||'nl');
})();
