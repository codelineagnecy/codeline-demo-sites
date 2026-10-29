/* Gedeelde hulpfuncties + favorieten (opgeslagen in de browser van de bezoeker) */
(function(){
  var KEY='hutten-concept-favorieten';
  function lees(){try{var v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch(e){return window.__favMem||[]}}
  function schrijf(a){window.__favMem=a;try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}}

  var HF=window.HF={
    get:lees,
    has:function(id){return lees().indexOf(id)>-1},
    toggle:function(id){
      var a=lees(),i=a.indexOf(id);
      if(i>-1)a.splice(i,1);else a.push(id);
      schrijf(a);HF.paint();
      document.dispatchEvent(new CustomEvent('hf:change',{detail:{id:id}}));
    },
    paint:function(){
      var n=lees().length;
      ['fav-teller','fav-teller2'].forEach(function(i){var e=document.getElementById(i);if(e)e.textContent=n});
      var fl=document.querySelector('.fav-link');if(fl)fl.classList.toggle('heeft',n>0);
      [].forEach.call(document.querySelectorAll('[data-fav]'),function(b){
        var on=HF.has(b.getAttribute('data-fav'));
        b.classList.toggle('aan',on);b.setAttribute('aria-pressed',on);
        var sp=b.querySelector('span');if(sp)sp.textContent=on?'Bewaard':'Bewaar';
        b.setAttribute('aria-label',on?'Verwijder uit favorieten':'Bewaar als favoriet');
      });
    }
  };
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-fav]');
    if(!b)return;e.preventDefault();e.stopPropagation();HF.toggle(b.getAttribute('data-fav'));
  });

  /* helpers */
  function pt(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
  function eur(n){
    if(n==null)return '';
    if(Math.floor(n)===n)return '€ '+pt(n);
    var s=n.toFixed(2).split('.');return '€ '+pt(s[0])+','+s[1];
  }
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function prijzen(o){
    var L=[];
    if(o.koop)L.push(eur(o.koop)+' '+o.koopTxt);
    if(o.huur)L.push(eur(o.huur)+' '+o.huurPer);
    if(!L.length)L.push('Prijs op aanvraag');
    return L;
  }
  function huurMaand(o){return o.huur?(o.huurPer==='p.j.'?o.huur/12:o.huur):null}
  function badgeCls(o){return o.status==='Verhuurd'?'verhuurd':(o.status==='Onder optie'?'optie':'')}
  function ph(o){return '<div class="ph"><b>H</b><span>'+esc(o.type)+'</span><small>Foto volgt</small></div>'}
  function foto(o,lazy){
    return o.foto?'<img src="'+esc(o.foto)+'" alt="'+esc(o.type+' aan de '+o.adres+' in '+o.plaats)+'"'+(lazy?' loading="lazy"':'')+'>':ph(o);
  }
  function kaartje(o){
    var pc=(o.postcode?o.postcode+' ':'')+o.plaats;
    var sp='<li>'+IC.opp+'<span>'+o.opp+' m²</span></li>'+(o.bj?'<li>'+IC.bj+'<span>'+o.bj+'</span></li>':'')+'<li>'+IC.typ+'<span>'+esc(o.type)+'</span></li>';
    return '<a class="kaartje" href="object-'+esc(o.id)+'.html"><div class="kaartje-foto">'+foto(o,true)+'<span class="badge '+badgeCls(o)+'">'+esc(o.status)+'</span></div>'+
      '<div class="kaartje-body"><span class="k-adres">'+esc(o.adres)+'</span><span class="k-plaats">'+esc(pc)+'</span><ul class="k-specs">'+sp+'</ul><b class="k-prijs">'+esc(prijzen(o)[0])+'</b></div></a>';
  }
  var IC={
    opp:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9h5M15 4v5"/></svg>',
    bj:'<svg viewBox="0 0 24 24"><path d="M4 20V9l8-5 8 5v11z"/><path d="M10 20v-6h4v6"/></svg>',
    typ:'<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V8l7-4 7 4v13"/><path d="M9 12h2M13 12h2M9 16h2M13 16h2"/></svg>'
  };
  window.HU={eur:eur,esc:esc,prijzen:prijzen,huurMaand:huurMaand,badgeCls:badgeCls,ph:ph,foto:foto,kaartje:kaartje,IC:IC,
    beschikbaar:function(){return (window.OBJECTEN||[]).filter(function(o){return o.status!=='Verhuurd'})}};

  HF.paint();
})();
