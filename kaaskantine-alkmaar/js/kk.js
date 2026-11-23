/* De Kaaskantine bestelconcept: gedeelde data en hulpfuncties (demo) */
(function(){
'use strict';
var K=window.KK={};
K.fmt=function(n){return '€'+n.toFixed(2).replace('.',',')};

/* menu: overgenomen van hun Instagram-highlights en bestelpagina */
K.MENU=[
 {id:'specials',naam:'Specials',items:[
  {id:'dikkenek',naam:'Broodje Dikke Nek',tekst:'Rib eye, truffelmayonaise, gepofte tomaat, rucola, gebakken ui en rode ui.',prijs:9,img:'dikkenek.jpg'},
  {id:'brandalarm',naam:'Broodje Brandalarm',tekst:'Malse hete kippendij, chipotlemayonaise, rode ui en gebakken ui.',prijs:9,nieuw:1,halal:1},
  {id:'dakduif',naam:'Broodje Dakduif',tekst:'Pulled chicken, little gem, limoenmayonaise, rode ui, gebakken ui en bosui.',prijs:9},
  {id:'kaaskop',naam:'Broodje Kaaskop',tekst:'Brie, honing-mosterdmayonaise, rucola en walnoten.',prijs:9},
  {id:'donmorta',naam:'Broodje Don Morta',tekst:'Mortadella, stracciatella, pesto en pistachecrumble.',prijs:10.25,nieuw:1,img:'don-morta.jpg'},
  {id:'tunasmelt',naam:'Broodje Tuna Smelt',tekst:'Tonijn met rode ui, mosterd, ketchup, mayonaise, kaas, chiliolie en gegrilde paprikapoeder, afgemaakt met gesmolten kaas.',prijs:9},
  {id:'karel',naam:'Brioche Krokante Karel',tekst:'Gefrituurde kippendij, coleslaw, uiencompote en srirachamayonaise op een brioche.',prijs:10.25,nieuw:1,halal:1},
  {id:'baastrami',naam:'Broodje Baastrami',tekst:'Pastrami met rucola, truffelmayonaise, rode ui en srirachamayonaise.',prijs:10,nieuw:1},
  {id:'rendang',naam:'Broodje Rendang',tekst:'Langzaam gegaard, zoet en mals stoofvlees met krokante kentang, bosui en een romige saus.',prijs:9.5,tag:'Weekend special'}
 ]},
 {id:'klassiekers',naam:'Klassiekers',items:[
  {id:'bal',naam:'Broodje Bal',tekst:'Broodje bal in jus met huisgemaakte pindasaus.',prijs:5.5},
  {id:'ossenworst',naam:'Broodje Ossenworst',tekst:'',prijs:7},
  {id:'grillworst',naam:'Broodje Grillworst',tekst:'',prijs:7},
  {id:'grillworstkaas',naam:'Broodje Grillworst kaas',tekst:'',prijs:7.5},
  {id:'grillworstjal',naam:'Broodje Grillworst kaas & jalapeño',tekst:'',prijs:7.5},
  {id:'filet',naam:'Broodje Filet José',tekst:'',prijs:7.5},
  {id:'tonijn',naam:'Broodje Tonijnsalade',tekst:'',prijs:7},
  {id:'oudekaas',naam:'Broodje Oude kaas',tekst:'',prijs:6},
  {id:'jongekaas',naam:'Broodje Jonge kaas',tekst:'',prijs:5.5}
 ]},
 {id:'zoet',naam:'Zoet',items:[
  {id:'chocochip',naam:'Dough Department Choco Chip',tekst:'The Original NYC Cookies vanuit Alkmaar. 140 gram, knapperig van buiten en gooey van binnen.',prijs:5.5,img:'koekjes.jpg'},
  {id:'triplechoco',naam:'Dough Department Triple Choco',tekst:'The Original NYC Cookies vanuit Alkmaar. 140 gram.',prijs:5.5},
  {id:'redvelvet',naam:'Dough Department Red Velvet',tekst:'The Original NYC Cookies vanuit Alkmaar. 140 gram.',prijs:5.5}
 ]},
 {id:'drinken',naam:'Drinken',items:[
  {id:'aranciata',naam:'Galvanina Aranciata Rossa',tekst:'',prijs:3.95},
  {id:'pesca',naam:'Galvanina Té alla Pesca',tekst:'',prijs:3.95},
  {id:'pompelmo',naam:'Galvanina Pompelmo Rosso',tekst:'',prijs:3.95},
  {id:'kombucha',naam:'Kombucha',tekst:'',prijs:3.95},
  {id:'thijsappel',naam:'Thijs Appel (bio)',tekst:'',prijs:3.95},
  {id:'thijsgember',naam:'Thijs Gember (bio)',tekst:'',prijs:3.95},
  {id:'thijsaardbei',naam:'Thijs Aardbei (bio)',tekst:'',prijs:3.95},
  {id:'cola',naam:'Cola',tekst:'',prijs:4.2}
 ]}
];
var idx={};K.MENU.forEach(function(c){c.items.forEach(function(i){i.cat=c.id;idx[i.id]=i})});
K.find=function(id){return idx[id]};

/* openingstijden (zondag=0): [open, dicht] in uren. Maandag en dinsdag niet genoemd, dus gesloten. */
K.HOURS={0:[10,16],3:[10,17],4:[10,17],5:[10,17],6:[10,17]};
K.LEAD=20;   /* minuten voorbereiding voor 'vandaag' (instelbaar) */
K.STEP=15;
var DAG=['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
var MAAND=['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
K.dagnaam=function(i){return DAG[i]};

/* tijd in Amsterdam */
K.nu=function(d){
  var p={},parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d||new Date());
  parts.forEach(function(x){p[x.type]=x.value});
  var y=+p.year,m=+p.month,da=+p.day,h=(+p.hour)%24,mi=+p.minute;
  var dow=new Date(Date.UTC(y,m-1,da)).getUTCDay();
  return {y:y,m:m,d:da,h:h,mi:mi,dow:dow,min:h*60+mi};
};
var pad=function(n){return ('0'+n).slice(-2)};
K.isOpen=function(){var n=K.nu(),u=K.HOURS[n.dow];return !!u&&n.min>=u[0]*60&&n.min<u[1]*60};

/* beschikbare afhaalmomenten voor de komende 8 dagen */
K.slots=function(){
  var n=K.nu(),out=[];
  for(var i=0;i<8&&out.length<6;i++){
    var dt=new Date(Date.UTC(n.y,n.m-1,n.d+i)),dow=dt.getUTCDay(),u=K.HOURS[dow];if(!u)continue;
    var start=u[0]*60,eind=u[1]*60-K.STEP;
    if(i===0){var min=n.min+K.LEAD;min=Math.ceil(min/K.STEP)*K.STEP;if(min>start)start=min}
    var tijden=[];for(var t=start;t<=eind;t+=K.STEP)tijden.push(pad(Math.floor(t/60))+':'+pad(t%60));
    if(!tijden.length)continue;
    var key=dt.getUTCFullYear()+'-'+pad(dt.getUTCMonth()+1)+'-'+pad(dt.getUTCDate());
    var lab=(i===0?'Vandaag':i===1?'Morgen':DAG[dow].charAt(0).toUpperCase()+DAG[dow].slice(1))+' '+dt.getUTCDate()+' '+MAAND[dt.getUTCMonth()];
    out.push({key:key,label:lab,tijden:tijden,i:i});
  }
  return out;
};
K.volgendeOpening=function(){
  var n=K.nu();
  for(var i=0;i<8;i++){
    var dt=new Date(Date.UTC(n.y,n.m-1,n.d+i)),dow=dt.getUTCDay(),u=K.HOURS[dow];if(!u)continue;
    if(i===0&&n.min>=u[0]*60)continue;
    return (i===0?'vandaag':i===1?'morgen':DAG[dow])+' om '+pad(u[0])+':00';
  }
  return '';
};

/* opslag (localStorage met geheugen als vangnet) */
var mem={};
K.load=function(k,def){try{var v=localStorage.getItem(k);return v?JSON.parse(v):def}catch(e){return mem[k]!==undefined?mem[k]:def}};
K.save=function(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
K.orders=function(){return K.load('kk_orders',[])};
K.saveOrders=function(a){K.save('kk_orders',a)};
K.nextNr=function(){var n=(K.load('kk_nr',100)||100)+1;K.save('kk_nr',n);return 'KK-'+n};
K.STATUS=[
 {id:'nieuw',kort:'Ontvangen',tekst:'Je bestelling is ontvangen.'},
 {id:'bereiding',kort:'In bereiding',tekst:'We zijn je bestelling aan het maken.'},
 {id:'klaar',kort:'Klaar',tekst:'Je bestelling staat klaar om af te halen.'},
 {id:'afgehaald',kort:'Afgehaald',tekst:'Bedankt en smakelijk!'}
];
K.tot=function(regels){var s=0;regels.forEach(function(r){var it=K.find(r.id);if(it)s+=it.prijs*r.q});return s};
})();
