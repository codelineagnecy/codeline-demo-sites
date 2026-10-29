(function(){
  var WA='31318519002';
  var A=window.AANBOD||[], V=window.VERHUURD||[];
  var TYPE={bedrijfsunit:'Bedrijfsunit',kantoor:'Kantoorruimte',praktijk:'Praktijkruimte',winkel:'Winkelruimte'};
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function m2(o){return o.oppervlakte?('ca. '+o.oppervlakte+' m²'):'Meerdere units'}
  function waLink(o){return 'https://wa.me/'+WA+'?text='+encodeURIComponent('Hallo Hutten Makelaardij, ik heb interesse in '+o.titel+' ('+o.plaats+'). Kunnen jullie mij meer informatie geven?')}

  var grid=document.getElementById('aanbod-grid'),count=document.getElementById('aanbod-aantal'),leeg=document.getElementById('aanbod-leeg');
  var fSoort=document.getElementById('f-soort'),fType=document.getElementById('f-type'),fPlaats=document.getElementById('f-plaats');

  function plaatsen(){var s={};A.forEach(function(o){s[o.plaats]=1});return Object.keys(s).sort()}
  if(fPlaats){plaatsen().forEach(function(p){var op=document.createElement('option');op.value=p;op.textContent=p;fPlaats.appendChild(op)})}

  function kaart(o,i){
    return '<article class="object reveal'+(i%3?' d'+(i%3):'')+'" data-id="'+esc(o.id)+'" tabindex="0" role="button" aria-label="Bekijk '+esc(o.titel)+'">'+
      '<div class="object-foto"><img src="'+esc(o.foto)+'" alt="'+esc(o.alt)+'" loading="lazy"><span class="badge">'+esc(o.status)+'</span></div>'+
      '<div class="object-body"><span class="object-meta">'+esc(TYPE[o.type]||o.type)+' · '+esc(o.plaats)+'</span>'+
      '<h3>'+esc(o.titel)+'</h3><p>'+esc(o.korte)+'</p>'+
      '<div class="object-rij"><b>'+esc(o.prijs)+'</b><span>'+esc(m2(o))+'</span></div></div></article>';
  }
  function render(){
    if(!grid)return;
    var s=fSoort.value,t=fType.value,p=fPlaats.value;
    var lijst=A.filter(function(o){return (!s||o.soort===s||(s==='huur'&&o.prijs2)||(s==='koop'&&o.prijs2))&&(!t||o.type===t)&&(!p||o.plaats===p)});
    grid.innerHTML=lijst.map(kaart).join('');
    count.textContent=lijst.length+(lijst.length===1?' object':' objecten');
    leeg.hidden=lijst.length>0;
    [].slice.call(grid.querySelectorAll('.reveal')).forEach(function(e){e.classList.add('in','gezet')});
  }
  [fSoort,fType,fPlaats].forEach(function(f){f&&f.addEventListener('change',render)});
  var reset=document.getElementById('f-reset');
  reset&&reset.addEventListener('click',function(){fSoort.value='';fType.value='';fPlaats.value='';render()});

  /* initiële render met reveal-animatie via main.js */
  if(grid){
    var s0=fSoort.value;
    var lijst=A;
    grid.innerHTML=lijst.map(kaart).join('');
    count.textContent=lijst.length+' objecten';
  }

  /* verhuurd */
  var vg=document.getElementById('verhuurd-lijst');
  if(vg){
    vg.innerHTML=V.map(function(o,i){
      return '<li class="reveal'+(i%3?' d'+(i%3):'')+'"><span class="v-badge">Verhuurd</span><h3>'+esc(o.titel)+'</h3><span class="v-plaats">'+esc(o.plaats)+'</span><p>'+esc(o.omschrijving)+'</p></li>';
    }).join('');
  }

  /* detail dialoog */
  var dlg=document.getElementById('detail');
  function open(id){
    var o=A.filter(function(x){return x.id===id})[0]; if(!o||!dlg)return;
    dlg.querySelector('.d-inhoud').innerHTML=
      '<div class="d-foto"><img src="'+esc(o.foto)+'" alt="'+esc(o.alt)+'"></div>'+
      '<div class="d-tekst"><span class="object-meta">'+esc(TYPE[o.type]||o.type)+' · '+esc(o.plaats)+(o.wijk?' · '+esc(o.wijk):'')+'</span>'+
      '<h2>'+esc(o.titel)+'</h2>'+
      '<div class="d-prijs"><b>'+esc(o.prijs)+'</b>'+(o.prijs2?'<span>'+esc(o.prijs2)+'</span>':'')+'<em>'+esc(m2(o))+'</em></div>'+
      '<p class="d-lead">'+esc(o.tekst)+'</p>'+
      '<ul class="kenmerken">'+o.kenmerken.map(function(k){return '<li>'+esc(k)+'</li>'}).join('')+'</ul>'+
      '<div class="d-knoppen"><a class="knop goud" href="'+waLink(o)+'" target="_blank" rel="noopener">Bezichtiging aanvragen</a><a class="knop rand" href="tel:+31318519002">Bel 0318-519002</a></div>'+
      '<p class="d-noot">Gegevens volgens de Instagram-post van Hutten Makelaardij. Vraag naar de actuele beschikbaarheid en voorwaarden.</p></div>';
    if(typeof dlg.showModal==='function'){dlg.showModal()}else{dlg.setAttribute('open','')}
    document.documentElement.classList.add('vast');
  }
  function sluit(){if(dlg){if(typeof dlg.close==='function'&&dlg.open){dlg.close()}else{dlg.removeAttribute('open')}document.documentElement.classList.remove('vast')}}
  if(grid){
    grid.addEventListener('click',function(e){var c=e.target.closest('.object');if(c)open(c.getAttribute('data-id'))});
    grid.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('object')){e.preventDefault();open(e.target.getAttribute('data-id'))}});
  }
  if(dlg){
    dlg.addEventListener('click',function(e){if(e.target===dlg||e.target.closest('.d-sluit'))sluit()});
    dlg.addEventListener('close',function(){document.documentElement.classList.remove('vast')});
  }
  /* waardebepaling formulier-knop naar WhatsApp */
  var wb=document.getElementById('waardebepaling');
  wb&&wb.addEventListener('click',function(e){e.preventDefault();window.open('https://wa.me/'+WA+'?text='+encodeURIComponent('Hallo Hutten Makelaardij, ik wil graag vrijblijvend de waarde van mijn bedrijfspand laten bepalen.'),'_blank','noopener')});
})();
