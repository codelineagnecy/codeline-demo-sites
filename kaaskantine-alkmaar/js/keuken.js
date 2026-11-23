/* De Kaaskantine bestelconcept: eigenaarsscherm (demo, alleen in deze browser) */
(function(){
'use strict';
var K=window.KK;if(!K)return;
var board=document.getElementById('kk-bord');if(!board)return;
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
var NEXT={nieuw:'bereiding',bereiding:'klaar',klaar:'afgehaald'};
var NEXTTXT={nieuw:'Start bereiding',bereiding:'Markeer als klaar',klaar:'Markeer als afgehaald'};
var filterAf=false;

function setStatus(id,st){
  var a=K.orders();a.forEach(function(o){if(o.id===id)o.status=st});K.saveOrders(a);draw();
}
function ticket(o){
  var t=el('article','tk st-'+o.status);
  var kop=el('div','tk-kop');kop.appendChild(el('b','',o.nr));kop.appendChild(el('span','tk-tijd',(o.dagLabel||'').split(' ')[0]+' '+o.tijd));t.appendChild(kop);
  var wie=el('div','tk-wie');wie.appendChild(el('span','',o.naam));
  if(o.tel){var a=el('a','',o.tel);a.href='tel:'+o.tel.replace(/[^\d+]/g,'');wie.appendChild(a)}
  t.appendChild(wie);
  var ul=el('ul','tk-regels');
  o.regels.forEach(function(r){
    var it=K.find(r.id);if(!it)return;var li=el('li');
    li.appendChild(el('b','',r.q+'×'));var s=el('span','',it.naam+(r.v&&r.v!=='Normaal'?' ('+r.v+')':''));li.appendChild(s);
    if(r.n)li.appendChild(el('em','',r.n));ul.appendChild(li);
  });
  t.appendChild(ul);
  if(o.opm)t.appendChild(el('p','tk-opm','Opmerking: '+o.opm));
  var f=el('div','tk-voet');f.appendChild(el('b','',K.fmt(o.totaal)));f.appendChild(el('span','','Betalen bij afhalen'));t.appendChild(f);
  if(NEXT[o.status]){var b=el('button','knop vol tk-knop',NEXTTXT[o.status]);b.type='button';b.addEventListener('click',function(){setStatus(o.id,NEXT[o.status])});t.appendChild(b)}
  return t;
}
function draw(){
  var all=K.orders(),sig=JSON.stringify(all)+filterAf;
  if(draw.sig===sig){return}draw.sig=sig;
  board.innerHTML='';
  K.STATUS.forEach(function(s){
    var kol=el('section','kol'),list=all.filter(function(o){return o.status===s.id});
    var h=el('h2');h.appendChild(document.createTextNode(s.kort+' '));h.appendChild(el('span','n',String(list.length)));kol.appendChild(h);
    if(!list.length)kol.appendChild(el('p','kol-leeg','Geen bestellingen'));
    list.slice().sort(function(a,b){return a.ts-b.ts}).forEach(function(o){kol.appendChild(ticket(o))});
    board.appendChild(kol);
  });
  var tot=all.filter(function(o){return o.status!=='afgehaald'}).length;
  document.getElementById('kk-aantal').textContent=tot+(tot===1?' lopende bestelling':' lopende bestellingen');
}
function klok(){
  var n=K.nu(),open=K.isOpen(),e=document.getElementById('kk-open');
  e.className='bs-status '+(open?'open':'dicht');e.innerHTML='';e.appendChild(el('i','dot'));
  e.appendChild(el('span','',(open?'Nu geopend':'Nu gesloten')+' · '+('0'+n.h).slice(-2)+':'+('0'+n.mi).slice(-2)+' · '+(open?'bestellingen worden direct getoond.':'eerstvolgende opening: '+K.volgendeOpening()+'.')));
}
var demoNamen=[['Sanne de Vries','06 12 34 56 78'],['Mehmet Yildiz','06 98 76 54 32'],['Lotte Bakker','06 55 44 33 22'],['Jesse Smit','06 11 22 33 44']];
var demoSets=[[['dikkenek',1],['bal',1],['cola',1]],[['donmorta',2],['chocochip',2]],[['karel',1],['brandalarm',1],['kombucha',2]],[['rendang',1],['pesca',1]]];
document.getElementById('kk-demo').addEventListener('click',function(){
  var sl=K.slots()[0],k=Math.floor(Math.random()*demoNamen.length),set=demoSets[Math.floor(Math.random()*demoSets.length)];
  var reg=set.map(function(x){return {id:x[0],v:K.find(x[0]).halal?'Normaal':'',n:'',q:x[1]}});
  var o={id:'o'+Date.now(),nr:K.nextNr(),ts:Date.now(),status:'nieuw',naam:demoNamen[k][0],tel:demoNamen[k][1],mail:'',opm:'',dag:sl?sl.key:'',dagLabel:sl?sl.label:'Vandaag',tijd:sl?sl.tijden[0]:'12:00',regels:reg,totaal:K.tot(reg)};
  var a=K.orders();a.unshift(o);K.saveOrders(a);draw();
});
var wis=document.getElementById('kk-wis'),wisT=null;
wis.addEventListener('click',function(){
  if(!wis.classList.contains('zeker')){wis.classList.add('zeker');wis.textContent='Zeker weten? Klik nogmaals';wisT=setTimeout(function(){wis.classList.remove('zeker');wis.textContent='Alles wissen'},4000);return}
  clearTimeout(wisT);wis.classList.remove('zeker');wis.textContent='Alles wissen';K.saveOrders([]);draw();
});
window.addEventListener('storage',draw);
setInterval(draw,1500);setInterval(klok,20000);
klok();draw();
})();
