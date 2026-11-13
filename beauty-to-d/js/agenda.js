(function(){
'use strict';
var CATS=(window.BTD&&window.BTD.cats)||[];
var ITEMS=[];CATS.forEach(function(c){c.items.forEach(function(i){i.cat=c.k;ITEMS.push(i)})});
var ALL={};ITEMS.forEach(function(i){ALL[i.id]=i});
var $=function(s){return document.querySelector(s)};
var bord=$('#bord');if(!bord||!ITEMS.length)return;
var MAAND=['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
var DAG=['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
var NAMEN=['Sanne','Lotte','Mila','Fleur','Noor','Eva','Roos','Iris','Femke','Julia','Anna','Lieke'];
var LET='ABCDEFGHJKLMNPRSTVW';
function pad(n){return n<10?'0'+n:''+n}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function tijdStr(m){return pad(Math.floor(m/60))+':'+pad(m%60)}
function eur(n){return '€ '+n}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function hash(str){var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)}

var nieuw=null;
try{nieuw=JSON.parse(sessionStorage.getItem('btd-boeking')||'null')}catch(e){}
var dag=new Date();dag.setHours(0,0,0,0);
if(nieuw&&nieuw.iso){var p=nieuw.iso.split('-');dag=new Date(+p[0],+p[1]-1,+p[2])}
else if(dag.getDay()===0)dag.setDate(dag.getDate()+1);

/* fictieve afspraken per dag en ruimte; start/duur in blokken van 30 min vanaf 09:00 */
function zaad(is,kamer){
  var res=[],cur=0,n=0;
  while(cur<17){
    var h=hash(is+'-'+kamer+'-'+n);n++;
    if(h%100<30){cur+=1+(h>>>8)%2;continue}
    var it=ITEMS[(h>>>4)%ITEMS.length],du=Math.ceil(it.min/30);
    if(cur+du>18)break;
    res.push({st:cur,du:du,it:it,naam:NAMEN[(h>>>12)%NAMEN.length]+' '+LET[(h>>>16)%LET.length]+'.',kamer:kamer});
    cur+=du+(h>>>20)%2;
  }
  return res;
}
function render(){
  var is=iso(dag);
  $('#agDatum').textContent=DAG[dag.getDay()]+' '+dag.getDate()+' '+MAAND[dag.getMonth()];
  var banner=$('#agNieuw');
  var zon=dag.getDay()===0;
  var lijst=[];
  if(!zon){
    lijst=zaad(is,1).concat(zaad(is,2));
    if(nieuw&&nieuw.iso===is){
      var st=(nieuw.tijd-540)/30,du=Math.ceil(nieuw.dur/30);
      lijst=lijst.filter(function(a){return !(a.kamer===1&&a.st<st+du&&a.st+a.du>st)});
      lijst.push({st:st,du:du,kamer:1,nw:true,naam:nieuw.naam,txt:nieuw.ids.map(function(id){return ALL[id]?ALL[id].naam:id}).join(' + '),cat:ALL[nieuw.ids[0]]?ALL[nieuw.ids[0]].cat:'skin',prijs:nieuw.total,min:nieuw.dur});
    }
  }
  if(nieuw&&nieuw.iso===is){
    banner.hidden=false;
    banner.innerHTML='<i></i><span><strong>Nieuwe online afspraak</strong> van '+esc(nieuw.naam)+': '+esc(nieuw.ids.map(function(id){return ALL[id]?ALL[id].naam:id}).join(' + '))+' om '+tijdStr(nieuw.tijd)+' (ref. '+esc(nieuw.ref)+'). Zo ziet de salon het meteen in de agenda.</span>';
  }else banner.hidden=true;

  var tijden='<div class="bord-t">';
  for(var m=540;m<1080;m+=30)tijden+='<span>'+tijdStr(m)+'</span>';
  tijden+='</div>';
  var kol=['',''],aant=0,min=0,omz=0;
  lijst.sort(function(a,b){return a.st-b.st});
  lijst.forEach(function(a,i){
    var cat=a.nw?a.cat:a.it.cat,txt=a.nw?a.txt:a.it.naam,du=a.nw?a.min:a.it.min,pr=a.nw?a.prijs:a.it.prijs;
    aant++;min+=du;omz+=pr;
    kol[a.kamer-1]+='<div class="afspr c-'+cat+(a.nw?' nieuw':'')+'" style="--st:'+a.st+';--du:'+a.du+';--i:'+i+'"><b>'+esc(a.naam)+'</b><span>'+tijdStr(540+a.st*30)+' – '+tijdStr(540+(a.st+a.du)*30)+'</span><span>'+esc(txt)+'</span></div>';
  });
  if(zon){bord.innerHTML=tijden+'<div class="ag-gesloten"><div><h3 style="font-family:var(--serif);font-weight:400;font-size:1.8rem;margin-bottom:6px">Gesloten (voorbeeld)</h3><p>Op zondag zijn er in dit voorbeeld geen afspraken.</p></div></div>'}
  else bord.innerHTML=tijden+'<div class="bord-k">'+kol[0]+'</div><div class="bord-k">'+kol[1]+'</div>';
  $('#stA').textContent=aant;
  $('#stB').textContent=Math.min(100,Math.round(min/(2*540)*100))+'%';
  $('#stO').textContent=eur(omz);
}
function verschuif(n){dag=new Date(dag.getFullYear(),dag.getMonth(),dag.getDate()+n);if(dag.getDay()===0&&n!==0)dag.setDate(dag.getDate()+n)}
$('#agVorige').onclick=function(){verschuif(-1);render()};
$('#agVolgende').onclick=function(){verschuif(1);render()};
$('#agVandaag').onclick=function(){dag=new Date();dag.setHours(0,0,0,0);if(dag.getDay()===0)dag.setDate(dag.getDate()+1);render()};
render();
})();
