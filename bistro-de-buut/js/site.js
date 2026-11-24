/* Bistro DeBuut · conceptsite door CodeLine Agency */
(function(){
'use strict';
var d=document,root=d.documentElement;
var $=function(s,c){return (c||d).querySelector(s)};
var $$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
root.classList.add('ready');

/* header */
var header=$('.header');
function sc(){if(header)header.classList.toggle('gescrolld',window.scrollY>30)}
window.addEventListener('scroll',sc,{passive:true});sc();

/* mobiel menu */
var mk=$('.menu-knop'),nav=$('.nav');
if(mk&&nav){
  mk.addEventListener('click',function(){var o=nav.classList.toggle('open');mk.setAttribute('aria-expanded',o?'true':'false');d.body.style.overflow=o?'hidden':''});
  $$('a',nav).forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');mk.setAttribute('aria-expanded','false');d.body.style.overflow=''})});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');mk.setAttribute('aria-expanded','false');d.body.style.overflow=''}});
}

/* reveal */
var rv=$$('.reveal');
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  rv.forEach(function(r){io.observe(r)});
}else{rv.forEach(function(r){r.classList.add('in')})}

/* menu: scrollspy */
var mn=$$('.tabs a');
if(mn.length){
  var secs=mn.map(function(a){return d.getElementById(a.getAttribute('href').slice(1))}).filter(Boolean);
  var spy=function(){
    var y=window.innerHeight*.3,best=null;
    secs.forEach(function(s){if(s.getBoundingClientRect().top<=y)best=s});
    mn.forEach(function(a){var on=best&&a.getAttribute('href')==='#'+best.id;a.classList.toggle('nu',!!on);if(on){a.setAttribute('aria-current','true');var n=a.parentNode;if(n.scrollWidth>n.clientWidth){n.scrollTo({left:a.offsetLeft-20,behavior:'smooth'})}}else a.removeAttribute('aria-current')});
  };
  window.addEventListener('scroll',spy,{passive:true});spy();
}

/* open / gesloten (Amsterdam-tijd): do t/m ma 10:30 - 20:30 */
var op=$('[data-open]');
if(op){
  var upd=function(){
    var pr={},fm=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false});
    fm.formatToParts(new Date()).forEach(function(x){pr[x.type]=x.value});
    var dn={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[pr.weekday],m=(+pr.hour%24)*60+(+pr.minute);
    var open=dn!==2&&dn!==3,nu=open&&m>=630&&m<1230,t=op.querySelector('span');
    op.classList.remove('open','dicht');
    if(nu){op.classList.add('open');t.textContent='Nu open · tot 20:30'}
    else{
      op.classList.add('dicht');
      var nxt;
      if(open&&m<630)nxt='vandaag om 10:30';
      else if(dn===1||dn===2||dn===3)nxt='donderdag om 10:30';
      else nxt='morgen om 10:30';
      t.textContent='Nu gesloten · opent '+nxt;
    }
  };
  upd();setInterval(upd,60000);
}

/* reserveringsformulier -> WhatsApp-bericht */
var f=$('#res-form');
if(f){
  var dag=$('#r-datum'),tijd=$('#r-tijd'),pers=$('#r-pers'),naam=$('#r-naam'),opm=$('#r-opm'),mel=$('.m-melding',f);
  var pad=function(n){return ('0'+n).slice(-2)};
  for(var h=10.5;h<=20;h+=.5){var hh=Math.floor(h),mm=h%1?'30':'00',o=d.createElement('option');o.value=o.textContent=pad(hh)+':'+mm;tijd.appendChild(o)}
  tijd.value='18:00';
  for(var i=1;i<=12;i++){var p=d.createElement('option');p.value=i;p.textContent=i+(i===1?' persoon':' personen');pers.appendChild(p)}
  pers.value='2';
  var t=new Date();dag.min=t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate());
  var fail=function(id,msg){var w=$('[data-v='+id+']',f);w.classList.add('fout');var m=$('.melding',w);m.textContent=msg;m.hidden=false};
  $$('input,select',f).forEach(function(i){i.addEventListener('input',function(){var w=i.closest('.veld');w.classList.remove('fout');var m=$('.melding',w);if(m)m.hidden=true;mel.hidden=true})});
  f.addEventListener('submit',function(e){
    e.preventDefault();$$('.veld',f).forEach(function(w){w.classList.remove('fout');var m=$('.melding',w);if(m)m.hidden=true});mel.hidden=true;
    var bad=false,dt=dag.value?new Date(dag.value+'T12:00:00'):null,today=new Date();today.setHours(0,0,0,0);
    if(!dt||isNaN(dt)){fail('datum','Kies een datum.');bad=true}
    else if(dt<today){fail('datum','Kies een datum in de toekomst.');bad=true}
    else if(dt.getDay()===2||dt.getDay()===3){fail('datum','Op dinsdag en woensdag is het restaurant gesloten.');bad=true}
    if(naam.value.trim().length<2){fail('naam','Vul je naam in.');bad=true}
    if(bad){var first=$('.veld.fout input,.veld.fout select',f);if(first)first.focus();return}
    var lang=dt.toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'});
    var tx='Hallo Bistro DeBuut! Ik wil graag een tafel reserveren.\n\nDatum: '+lang+'\nTijd: '+tijd.value+'\nAantal personen: '+pers.value+'\nNaam: '+naam.value.trim()+(opm.value.trim()?'\nOpmerking: '+opm.value.trim():'')+'\n\nKunnen jullie bevestigen of dit past? Alvast bedankt!';
    window.open('https://wa.me/31627419869?text='+encodeURIComponent(tx),'_blank','noopener');
    mel.textContent='WhatsApp is geopend met je aanvraag. De reservering is pas definitief nadat het restaurant hem bevestigt.';mel.style.color='#d4b78f';mel.hidden=false;
  });
}

/* QR-tafelkaartje printen */
var pa4=$('#print-a4'),pa6=$('#print-a6');
function drukaf(a6){
  var st=d.createElement('style');st.id='pg';st.textContent='@page{size:'+(a6?'A6':'A4')+';margin:0}';d.head.appendChild(st);
  d.body.classList.toggle('print-a6',!!a6);
  var done=function(){var s=$('#pg');if(s)s.remove();d.body.classList.remove('print-a6');window.removeEventListener('afterprint',done)};
  window.addEventListener('afterprint',done);window.print();
}
if(pa4)pa4.addEventListener('click',function(){drukaf(false)});
if(pa6)pa6.addEventListener('click',function(){drukaf(true)});
})();
