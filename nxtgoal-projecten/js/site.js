/* NXTGOAL Projecten · conceptsite door CodeLine Agency */
(function(){
'use strict';
var d=document,root=d.documentElement;
var $=function(s,c){return (c||d).querySelector(s)};
var $$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
root.classList.add('ready');

/* mobiel menu */
var mk=$('.menu-knop'),nav=$('.nav');
function sluit(){if(nav){nav.classList.remove('open');if(mk)mk.setAttribute('aria-expanded','false');d.body.style.overflow=''}}
if(mk&&nav){
  mk.addEventListener('click',function(){var o=nav.classList.toggle('open');mk.setAttribute('aria-expanded',o?'true':'false');d.body.style.overflow=o?'hidden':''});
  $$('a',nav).forEach(function(a){a.addEventListener('click',sluit)});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')sluit()});
  window.addEventListener('resize',function(){if(window.innerWidth>860)sluit()});
}

/* reveal */
var rv=$$('.reveal');
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.1,rootMargin:'0px 0px -30px 0px'});
  rv.forEach(function(r){io.observe(r)});
}else{rv.forEach(function(r){r.classList.add('in')})}

/* kleurspeler */
var huis=$('#huis');
if(huis){
  var delen={deur:'--deur',kozijn:'--kozijn',gevel:'--gevel'};
  var actief='deur';
  var namen={};
  var bn=$$('.onderdelen button'),bk=$$('.kleuren button'),nm=$('.kleurnaam');
  bn.forEach(function(b){b.addEventListener('click',function(){actief=b.dataset.deel;bn.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});upd()})});
  var huidig={deur:bk[0],kozijn:bk[1],gevel:bk[2]};
  function upd(){var k=huidig[actief];bk.forEach(function(x){x.setAttribute('aria-pressed',x===k?'true':'false')});nm.textContent=({deur:'Deur',kozijn:'Kozijnen',gevel:'Gevelhout'})[actief]+': '+k.dataset.naam}
  bk.forEach(function(b){b.addEventListener('click',function(){huidig[actief]=b;huis.style.setProperty(delen[actief],b.dataset.hex);upd()})});
  huis.style.setProperty('--deur',bk[0].dataset.hex);huis.style.setProperty('--kozijn',bk[1].dataset.hex);huis.style.setProperty('--gevel',bk[2].dataset.hex);
  upd();
}

/* filter + lightbox op projectenpagina */
var fl=$$('.filter button');
if(fl.length){
  fl.forEach(function(b){b.addEventListener('click',function(){
    fl.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
    var t=b.dataset.f;
    $$('.proj').forEach(function(p){p.hidden=!(t==='alle'||(p.dataset.t||'').split(' ').indexOf(t)>-1)});
  })});
}
var lb=$('.lb');
if(lb){
  var items=$$('[data-lb]'),pos=0,im=$('img',lb),cp=$('figcaption',lb);
  function toon(i){pos=(i+items.length)%items.length;var f=items[pos];im.src=f.dataset.lb;im.alt=f.dataset.alt||'';cp.textContent=f.dataset.cap||''}
  function open(i){toon(i);lb.classList.add('open');d.body.style.overflow='hidden';$('.x',lb).focus()}
  function dicht(){lb.classList.remove('open');d.body.style.overflow=''}
  items.forEach(function(f,i){f.addEventListener('click',function(){open(i)})});
  $('.x',lb).addEventListener('click',dicht);
  $('.vor',lb).addEventListener('click',function(){toon(pos-1)});
  $('.volg',lb).addEventListener('click',function(){toon(pos+1)});
  lb.addEventListener('click',function(e){if(e.target===lb)dicht()});
  d.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;if(e.key==='Escape')dicht();if(e.key==='ArrowLeft')toon(pos-1);if(e.key==='ArrowRight')toon(pos+1)});
}

/* offerteformulier -> WhatsApp-bericht */
var f=$('#offerte-form');
if(f){
  var naam=$('#o-naam'),plaats=$('#o-plaats'),klus=$('#o-klus'),bericht=$('#o-bericht'),mel=$('.m-melding',f);
  var fail=function(id,msg){var w=$('[data-v='+id+']',f);w.classList.add('fout');var m=$('.melding',w);m.textContent=msg;m.hidden=false};
  $$('input,select,textarea',f).forEach(function(i){i.addEventListener('input',function(){var w=i.closest('.veld');w.classList.remove('fout');var m=$('.melding',w);if(m)m.hidden=true;mel.hidden=true})});
  f.addEventListener('submit',function(e){
    e.preventDefault();$$('.veld',f).forEach(function(w){w.classList.remove('fout');var m=$('.melding',w);if(m)m.hidden=true});mel.hidden=true;
    var bad=false;
    if(naam.value.trim().length<2){fail('naam','Vul je naam in.');bad=true}
    if(!klus.value){fail('klus','Kies waar het over gaat.');bad=true}
    if(bad){var first=$('.veld.fout input,.veld.fout select',f);if(first)first.focus();return}
    var tx='Hallo NXTGOAL Projecten! Ik wil graag een vrijblijvende offerte aanvragen.\n\nNaam: '+naam.value.trim()+(plaats.value.trim()?'\nPlaats: '+plaats.value.trim():'')+'\nGaat over: '+klus.value+(bericht.value.trim()?'\nBericht: '+bericht.value.trim():'')+'\n\nKunnen jullie contact met mij opnemen? Alvast bedankt!';
    window.open('https://wa.me/31613309566?text='+encodeURIComponent(tx),'_blank','noopener');
    mel.textContent='WhatsApp is geopend met je aanvraag. Ging er iets mis? Bel gerust 06 13 30 95 66.';mel.hidden=false;
  });
}
})();
