(function(){
'use strict';
var CATS=(window.BTD&&window.BTD.cats)||[];
var ALL={};CATS.forEach(function(c){c.items.forEach(function(i){i.cat=c.k;ALL[i.id]=i})});
var $=function(s,r){return (r||document).querySelector(s)};
var paneel=$('#paneel'),samen=$('#bsamen'),stappen=$('#bstappen');
if(!paneel||!CATS.length)return;
var MAAND=['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
var DAG=['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
var S={stap:1,sel:[],cat:CATS[0].k,maand:null,dag:null,tijd:null,klant:{naam:'',email:'',tel:'',opm:''},ref:''};
var vandaag=new Date();vandaag.setHours(0,0,0,0);
var maxDag=new Date(vandaag);maxDag.setDate(maxDag.getDate()+90);
S.maand=new Date(vandaag.getFullYear(),vandaag.getMonth(),1);

function pad(n){return n<10?'0'+n:''+n}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function eur(n){return '€ '+n}
function tijdStr(m){return pad(Math.floor(m/60))+':'+pad(m%60)}
function dur(m){if(m<60)return m+' min';var h=Math.floor(m/60),r=m%60;return h+' uur'+(r?' '+r+' min':'')}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function hash(str){var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)}
function tot(){var m=0,p=0;S.sel.forEach(function(id){m+=ALL[id].min;p+=ALL[id].prijs});return {min:m,prijs:p}}
function datumLang(d){return DAG[d.getDay()]+' '+d.getDate()+' '+MAAND[d.getMonth()]}

/* fictieve beschikbaarheid: 30-minuten blokken, 09:00-18:00 */
function vrij(isoStr,blok){return hash(isoStr+'-'+blok)%100>=34}
function slotsVoor(d,min){
  var res=[],n=Math.ceil(min/30),is=iso(d),nu=new Date();
  var isVandaag=is===iso(nu),nuMin=nu.getHours()*60+nu.getMinutes()+60;
  if(d.getDay()===0||d<vandaag||d>maxDag)return res;
  for(var s=540;s+n*30<=1080;s+=30){
    if(isVandaag&&s<=nuMin)continue;
    var ok=true;for(var k=0;k<n;k++){if(!vrij(is,(s+k*30)/30)){ok=false;break}}
    if(ok)res.push(s);
  }
  return res;
}

/* url voorselectie */
try{
  var q=new URLSearchParams(location.search);
  var b=q.get('b'),k=q.get('k');
  if(b){b.split(',').forEach(function(id){if(ALL[id]&&S.sel.indexOf(id)<0)S.sel.push(id)});if(S.sel.length)S.cat=ALL[S.sel[0]].cat}
  if(k&&CATS.some(function(c){return c.k===k}))S.cat=k;
}catch(e){}

function zetStappen(){
  [].forEach.call(stappen.children,function(li){
    var n=+li.getAttribute('data-s');
    li.classList.toggle('aan',n===S.stap);
    li.classList.toggle('klaar',n<S.stap);
    if(n===S.stap)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');
  });
}
function toon(html,anim){
  paneel.innerHTML=html;
  if(anim!==false){paneel.classList.remove('anim');void paneel.offsetWidth;paneel.classList.add('anim')}
  zetStappen();samenVul();
}
function puls(){samen.classList.remove('puls');void samen.offsetWidth;samen.classList.add('puls')}

function samenVul(){
  var h='<h3>Jouw afspraak</h3>';
  if(!S.sel.length){h+='<p class="leeg-s">Kies een of meer behandelingen om te beginnen.</p>';samen.innerHTML=h;return}
  S.sel.forEach(function(id){var i=ALL[id];h+='<div class="regel"><span>'+esc(i.naam)+'</span><span>'+eur(i.prijs)+'</span></div>'});
  var t=tot();
  h+='<span class="meta">Duur</span><div class="meta-w">'+dur(t.min)+'</div>';
  if(S.dag){h+='<span class="meta">Wanneer</span><div class="meta-w">'+esc(datumLang(S.dag))+(S.tijd!=null?', '+tijdStr(S.tijd):'')+'</div>'}
  h+='<div class="tot"><small>Totaal</small><span>'+eur(t.prijs)+'</span></div>';
  samen.innerHTML=h;
}

/* stap 1 */
function stap1(anim){
  S.stap=1;
  var h='<h2 class="ptitel">Kies je behandeling</h2><p class="psub">Selecteer één of meer behandelingen. De duur en prijs tellen we voor je op.</p><div class="chips" role="tablist">';
  CATS.forEach(function(c){
    var n=S.sel.filter(function(id){return ALL[id].cat===c.k}).length;
    h+='<button class="chip-k'+(c.k===S.cat?' aan':'')+'" data-cat="'+c.k+'" type="button">'+esc(c.titel)+(n?'<i>'+n+'</i>':'')+'</button>';
  });
  h+='</div><div class="beh-lijst">';
  CATS.filter(function(c){return c.k===S.cat})[0].items.forEach(function(i){
    var a=S.sel.indexOf(i.id)>=0;
    h+='<button type="button" class="beh'+(a?' aan':'')+'" data-id="'+i.id+'" aria-pressed="'+a+'"><span><b>'+esc(i.naam)+(i.tag?'<span class="tag">'+esc(i.tag)+'</span>':'')+'</b><small>'+esc(i.desc)+'</small><em>'+dur(i.min)+'</em></span><span class="beh-p">'+eur(i.prijs)+'</span><span class="vink-c"></span></button>';
  });
  h+='</div><div class="pnav"><span></span><button type="button" class="knop goud" id="v1"'+(S.sel.length?'':' disabled')+'>Kies datum &amp; tijd <i class="pijl"></i></button></div>';
  toon(h,anim);
  paneel.querySelectorAll('.chip-k').forEach(function(b){b.onclick=function(){S.cat=b.getAttribute('data-cat');stap1(false)}});
  paneel.querySelectorAll('.beh').forEach(function(b){b.onclick=function(){
    var id=b.getAttribute('data-id'),ix=S.sel.indexOf(id);
    if(ix>=0)S.sel.splice(ix,1);else S.sel.push(id);
    /* beschikbaarheid hangt van duur af */
    if(S.dag&&S.tijd!=null&&slotsVoor(S.dag,tot().min).indexOf(S.tijd)<0){S.tijd=null}
    stap1(false);puls();
  }});
  $('#v1').onclick=function(){stap2()};
}

/* stap 2 */
function stap2(anim){
  S.stap=2;
  var t=tot();
  var h='<h2 class="ptitel">Kies datum &amp; tijd</h2><p class="psub">Beschikbaarheid hieronder is fictief en bedoeld als demo. Totale duur: '+dur(t.min)+'.</p><div class="dt"><div class="kal"></div><div class="slotbox"></div></div>';
  h+='<div class="pnav"><button type="button" class="knop" id="t2">Terug</button><button type="button" class="knop goud" id="v2" disabled>Vul je gegevens in <i class="pijl"></i></button></div>';
  toon(h,anim);
  kalender();slotsTonen();
  $('#t2').onclick=function(){stap1()};
  $('#v2').onclick=function(){stap3()};
  knop2();
}
function knop2(){var b=$('#v2');if(b){if(S.dag&&S.tijd!=null)b.removeAttribute('disabled');else b.setAttribute('disabled','')}}
function kalender(){
  var box=$('.kal');if(!box)return;
  var t=tot(),m=S.maand,y=m.getFullYear(),mo=m.getMonth();
  var eerste=new Date(y,mo,1),start=(eerste.getDay()+6)%7,dagen=new Date(y,mo+1,0).getDate();
  var vorigOk=new Date(y,mo,0)>=vandaag,volgOk=new Date(y,mo+1,1)<=maxDag;
  var h='<div class="kal-kop"><button type="button" class="kal-pijl" id="kV" aria-label="Vorige maand"'+(vorigOk?'':' disabled')+'>&#8249;</button><b>'+MAAND[mo]+' '+y+'</b><button type="button" class="kal-pijl" id="kN" aria-label="Volgende maand"'+(volgOk?'':' disabled')+'>&#8250;</button></div>';
  h+='<div class="kal-wd"><span>ma</span><span>di</span><span>wo</span><span>do</span><span>vr</span><span>za</span><span>zo</span></div><div class="kal-g">';
  for(var i=0;i<start;i++)h+='<span></span>';
  for(var d=1;d<=dagen;d++){
    var dt=new Date(y,mo,d),n=slotsVoor(dt,t.min).length,cls='dag-k';
    if(n)cls+=' vrij';
    if(iso(dt)===iso(vandaag))cls+=' vandaag';
    if(S.dag&&iso(S.dag)===iso(dt))cls+=' aan';
    h+='<button type="button" class="'+cls+'" data-d="'+iso(dt)+'"'+(n?'':' disabled')+' aria-label="'+esc(datumLang(dt))+(n?'':', niet beschikbaar')+'">'+d+'</button>';
  }
  h+='</div>';
  box.innerHTML=h;
  $('#kV').onclick=function(){S.maand=new Date(y,mo-1,1);kalender()};
  $('#kN').onclick=function(){S.maand=new Date(y,mo+1,1);kalender()};
  box.querySelectorAll('.dag-k').forEach(function(b){b.onclick=function(){
    var p=b.getAttribute('data-d').split('-');S.dag=new Date(+p[0],+p[1]-1,+p[2]);S.tijd=null;
    kalender();slotsTonen();samenVul();puls();knop2();
  }});
}
function slotsTonen(){
  var box=$('.slotbox');if(!box)return;
  if(!S.dag){box.innerHTML='<h3>Tijden</h3><p class="leeg">Kies eerst een dag in de kalender.</p>';return}
  var sl=slotsVoor(S.dag,tot().min);
  var h='<h3>'+esc(datumLang(S.dag))+'</h3>';
  if(!sl.length){box.innerHTML=h+'<p class="leeg">Geen tijden beschikbaar op deze dag.</p>';return}
  var ochtend=sl.filter(function(s){return s<720}),middag=sl.filter(function(s){return s>=720});
  h+='<div class="slots">';
  function blok(naam,l){if(!l.length)return '';var x='<div class="slot-groep">'+naam+'</div>';l.forEach(function(s){x+='<button type="button" class="slot'+(S.tijd===s?' aan':'')+'" data-t="'+s+'">'+tijdStr(s)+'</button>'});return x}
  h+=blok('Ochtend',ochtend)+blok('Middag',middag)+'</div>';
  box.innerHTML=h;
  box.querySelectorAll('.slot').forEach(function(b){b.onclick=function(){
    S.tijd=+b.getAttribute('data-t');
    box.querySelectorAll('.slot').forEach(function(x){x.classList.toggle('aan',x===b)});
    samenVul();puls();knop2();
  }});
}

/* stap 3 */
function stap3(anim){
  S.stap=3;
  var k=S.klant;
  var h='<h2 class="ptitel">Jouw gegevens</h2><p class="psub">Bijna klaar. Vul een naam en e-mailadres in.</p><form class="vorm" id="vorm" novalidate>'+
  veld('naam','Naam','text',k.naam,'name',false)+veld('email','E-mailadres','email',k.email,'email',false)+veld('tel','Telefoon (optioneel)','tel',k.tel,'tel',false)+
  '<div class="veld vol"><label for="f-opm">Opmerking (optioneel)</label><textarea id="f-opm" name="opm" placeholder="Bijvoorbeeld: gevoelige huid of een specifieke wens">'+esc(k.opm)+'</textarea></div>'+
  '<p class="demo-noot">Dit is een demo: er wordt niets verstuurd of opgeslagen op een server. Gebruik gerust een verzonnen naam en e-mailadres.</p></form>'+
  '<div class="pnav"><button type="button" class="knop" id="t3">Terug</button><button type="button" class="knop goud" id="v3">Bevestig afspraak <i class="pijl"></i></button></div>';
  toon(h,anim);
  $('#t3').onclick=function(){bewaarForm();stap2()};
  $('#v3').onclick=bevestig;
  $('#vorm').onsubmit=function(e){e.preventDefault();bevestig()};
}
function veld(id,lab,type,val,ac){
  return '<div class="veld" data-v="'+id+'"><label for="f-'+id+'">'+lab+'</label><input id="f-'+id+'" name="'+id+'" type="'+type+'" autocomplete="'+ac+'" value="'+esc(val)+'"><span class="melding" hidden></span></div>';
}
function bewaarForm(){
  var f=$('#vorm');if(!f)return;
  S.klant={naam:f.naam.value.trim(),email:f.email.value.trim(),tel:f.tel.value.trim(),opm:f.opm.value.trim()};
}
function bevestig(){
  bewaarForm();
  var ok=true;
  function fout(id,msg){var v=paneel.querySelector('[data-v="'+id+'"]');var m=v.querySelector('.melding');
    if(msg){v.classList.add('fout');m.textContent=msg;m.hidden=false;ok=false}else{v.classList.remove('fout');m.hidden=true}}
  fout('naam',S.klant.naam.length<2?'Vul je naam in.':'');
  fout('email',/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(S.klant.email)?'':'Vul een geldig e-mailadres in.');
  fout('tel',(!S.klant.tel||/^[0-9 +()\-]{6,}$/.test(S.klant.tel))?'':'Controleer het telefoonnummer.');
  if(!ok){var e=paneel.querySelector('.fout input');if(e)e.focus();return}
  S.ref='BTD-'+(1000+hash(iso(S.dag)+S.tijd+S.klant.naam)%9000);
  var t=tot();
  try{sessionStorage.setItem('btd-boeking',JSON.stringify({ref:S.ref,ids:S.sel,naam:S.klant.naam,iso:iso(S.dag),tijd:S.tijd,dur:t.min,total:t.prijs}))}catch(e){}
  stap4();
}

/* stap 4 */
function stap4(){
  S.stap=4;
  var t=tot(),namen=S.sel.map(function(id){return esc(ALL[id].naam)}).join(', ');
  var kon='';for(var i=0;i<26;i++){var a=Math.random()*Math.PI*2,r=70+Math.random()*90;kon+='<span style="--x:'+Math.round(Math.cos(a)*r)+'px;--y:'+Math.round(Math.sin(a)*r)+'px;animation-delay:'+(0.8+Math.random()*.3).toFixed(2)+'s"></span>'}
  var h='<div class="klaar-wrap"><div class="check"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" pathLength="1"/><path d="M38 62 L54 78 L84 44" pathLength="1"/></svg><div class="konfetti" aria-hidden="true">'+kon+'</div></div>'+
  '<h2>Tot snel, '+esc(S.klant.naam.split(' ')[0])+'</h2><p class="psub" style="margin:0 auto">Je afspraak is (in deze demo) bevestigd.</p><span class="ref">Referentie '+S.ref+'</span>'+
  '<div class="klaar-kaart"><div><span>Behandeling</span><span>'+namen+'</span></div><div><span>Wanneer</span><span>'+esc(datumLang(S.dag))+', '+tijdStr(S.tijd)+'</span></div><div><span>Duur</span><span>'+dur(t.min)+'</span></div><div><span>Totaal</span><span>'+eur(t.prijs)+'</span></div></div>'+
  '<div class="klaar-knoppen"><a class="knop goud" href="agenda.html">Bekijk in de agenda <i class="pijl"></i></a><button type="button" class="knop" id="ics">Zet in je agenda (.ics)</button><button type="button" class="knop" id="nieuw">Nieuwe afspraak</button></div></div>';
  toon(h);
  puls();
  $('#ics').onclick=ics;
  $('#nieuw').onclick=function(){S.sel=[];S.dag=null;S.tijd=null;S.ref='';try{sessionStorage.removeItem('btd-boeking')}catch(e){}stap1()};
  try{paneel.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}
}
function ics(){
  var t=tot(),d=S.dag,s=S.tijd,e=s+t.min;
  function f(m){return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'T'+pad(Math.floor(m/60))+pad(m%60)+'00'}
  var txt=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Concept//Beauty to D demo//NL','BEGIN:VEVENT','UID:'+S.ref+'@demo','DTSTAMP:'+f(0).slice(0,8)+'T000000','DTSTART:'+f(s),'DTEND:'+f(e),'SUMMARY:Demo-afspraak: '+S.sel.map(function(id){return ALL[id].naam}).join(' + '),'DESCRIPTION:Demo-afspraak (fictief). Referentie '+S.ref,'END:VEVENT','END:VCALENDAR'].join('\r\n');
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/calendar'}));a.download='afspraak-'+S.ref+'.ics';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);
}

stap1(false);
})();
