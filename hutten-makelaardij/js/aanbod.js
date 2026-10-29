/* Funda-achtige zoekpagina: filters, sortering, paginering, favorieten */
(function(){
  var ALL=window.OBJECTEN||[],PER=8;
  var $=function(i){return document.getElementById(i)};
  var el={q:$('q'),soort:$('f-soort'),prijs:$('f-prijs'),type:$('f-type'),plaats:$('f-plaats'),opp:$('f-opp'),status:$('f-status'),sort:$('f-sort'),
          lijst:$('res-lijst'),leeg:$('res-leeg'),pag:$('pag'),titel:$('res-titel'),aantal:$('res-aantal'),fav:$('fav-toggle'),reset:$('f-reset')};
  var st={q:'',soort:'',prijs:'',type:'',plaats:'',opp:'',status:'',sort:'standaard',fav:false,page:1};

  /* plaatsen vullen */
  (function(){
    var s={};ALL.forEach(function(o){s[o.plaats]=1});
    Object.keys(s).sort().forEach(function(p){var o=document.createElement('option');o.value=p;o.textContent=p;el.plaats.appendChild(o)});
  })();

  /* prijsopties afhankelijk van koop/huur */
  var KOOP=[200000,300000,400000,600000],HUUR=[500,1000,1500,2500];
  function opt(v,t){var o=document.createElement('option');o.value=v;o.textContent=t;return o}
  function vulPrijs(){
    var keep=st.prijs,p=el.prijs;
    p.innerHTML='';p.appendChild(opt('','Prijs'));
    function groep(label,arr){var g=document.createElement('optgroup');g.label=label;arr.forEach(function(x){g.appendChild(x)});p.appendChild(g)}
    var k=KOOP.map(function(n){return opt('k:'+n,'Tot '+HU.eur(n))});
    var h=HUUR.map(function(n){return opt('h:'+n,'Tot '+HU.eur(n)+' p.m.')});
    if(st.soort==='koop')k.forEach(function(x){p.appendChild(x)});
    else if(st.soort==='huur')h.forEach(function(x){p.appendChild(x)});
    else{groep('Koopprijs',k);groep('Huurprijs',h)}
    var ok=[].some.call(p.options,function(o){return o.value===keep});
    st.prijs=ok?keep:'';p.value=st.prijs;
  }

  /* URL <-> state */
  function leesUrl(){
    var u;try{u=new URLSearchParams(location.search)}catch(e){return}
    ['q','soort','prijs','type','plaats','opp','status','sort'].forEach(function(k){var v=u.get(k);if(v)st[k]=v});
    if(u.get('fav')==='1')st.fav=true;
    var pg=parseInt(u.get('p'),10);if(pg>0)st.page=pg;
  }
  function schrijfUrl(){
    var u=new URLSearchParams();
    ['q','soort','prijs','type','plaats','opp','status'].forEach(function(k){if(st[k])u.set(k,st[k])});
    if(st.sort!=='standaard')u.set('sort',st.sort);
    if(st.fav)u.set('fav','1');
    if(st.page>1)u.set('p',st.page);
    var s=u.toString();
    try{history.replaceState(null,'',location.pathname+(s?'?'+s:''))}catch(e){}
  }

  function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,'')}

  function filter(){
    var q=norm(st.q);
    return ALL.filter(function(o){
      if(st.fav){if(!HF.has(o.id))return false}
      else if(st.status!=='alle'&&o.status==='Verhuurd')return false;
      if(st.soort&&o.soort!==st.soort&&o.soort!=='beide')return false;
      if(st.type&&o.type!==st.type)return false;
      if(st.plaats&&o.plaats!==st.plaats)return false;
      if(st.opp&&o.opp<+st.opp)return false;
      if(st.prijs){
        var m=st.prijs.split(':'),max=+m[1];
        if(m[0]==='k'){if(!o.koop||o.koop>max)return false}
        else{var hm=HU.huurMaand(o);if(hm==null||hm>max)return false}
      }
      if(q){
        var hay=norm([o.adres,o.postcode,o.plaats,o.type,o.status].join(' '));
        if(hay.indexOf(q)<0)return false;
      }
      return true;
    });
  }
  function sleutel(o){
    if(st.soort==='huur')return HU.huurMaand(o);
    if(st.soort==='koop')return o.koop;
    return o.koop!=null?o.koop:HU.huurMaand(o);
  }
  function sorteer(a){
    var i={};ALL.forEach(function(o,n){i[o.id]=n});
    var r=a.slice();
    if(st.sort==='prijs-op'||st.sort==='prijs-af'){
      var f=st.sort==='prijs-op'?1:-1;
      r.sort(function(x,y){
        var kx=sleutel(x),ky=sleutel(y);
        if(kx==null&&ky==null)return i[x.id]-i[y.id];
        if(kx==null)return 1;if(ky==null)return -1;
        return (kx-ky)*f||i[x.id]-i[y.id];
      });
    }else if(st.sort==='opp-af'||st.sort==='opp-op'){
      var g=st.sort==='opp-op'?1:-1;
      r.sort(function(x,y){return (x.opp-y.opp)*g||i[x.id]-i[y.id]});
    }
    return r;
  }

  function kaart(o){
    var E=HU.esc,href='object-'+E(o.id)+'.html';
    var pc=(o.postcode?o.postcode+' ':'')+o.plaats;
    var pr=HU.prijzen(o).map(function(l){return '<b>'+E(l)+'</b>'}).join('');
    var specs='<li>'+HU.IC.opp+'<span>'+o.opp+' m²</span></li>'+
      (o.bj?'<li>'+HU.IC.bj+'<span>Bouwjaar '+o.bj+'</span></li>':'')+
      '<li>'+HU.IC.typ+'<span>'+E(o.type)+'</span></li>';
    var on=HF.has(o.id);
    return '<article class="res">'+
      '<a class="res-foto" href="'+href+'" tabindex="-1" aria-hidden="true">'+HU.foto(o,true)+'<span class="badge '+HU.badgeCls(o)+'">'+E(o.status)+'</span></a>'+
      '<div class="res-body">'+
        '<div class="res-top"><a class="res-titel" href="'+href+'"><h3>'+E(o.adres)+'</h3></a>'+
        '<button type="button" class="hartje'+(on?' aan':'')+'" data-fav="'+E(o.id)+'" aria-pressed="'+on+'" aria-label="'+(on?'Verwijder uit favorieten':'Bewaar als favoriet')+'"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z"/></svg></button></div>'+
        '<p class="res-plaats">'+E(pc)+'</p>'+
        '<div class="res-prijs">'+pr+'</div>'+
        '<ul class="res-specs">'+specs+'</ul>'+
        '<div class="res-foot"><span>Hutten Makelaardij</span><a href="'+href+'">Bekijk object →</a></div>'+
      '</div></article>';
  }

  function titel(n){
    var t='Bedrijfsobjecten';
    if(st.fav)t='Mijn favorieten';
    else{
      if(st.type==='Bedrijfsruimte')t='Bedrijfsruimte';else if(st.type==='Kantoorruimte')t='Kantoorruimte';else if(st.type==='Winkelruimte')t='Winkelruimte';else if(st.type==='Belegging')t='Beleggingsobjecten';
      if(st.soort==='koop')t+=' te koop';else if(st.soort==='huur')t+=' te huur';
      if(st.plaats)t+=' in '+st.plaats;
    }
    el.titel.textContent=t;
    el.aantal.textContent=n+(n===1?' resultaat':' resultaten');
  }

  function pagina(total){
    var pages=Math.max(1,Math.ceil(total/PER)),h='';
    if(pages<2){el.pag.innerHTML='';return}
    function b(p,t,cls,dis){return '<button type="button" data-p="'+p+'" class="'+(cls||'')+'"'+(dis?' disabled':'')+' aria-label="'+(t==='‹'?'Vorige pagina':(t==='›'?'Volgende pagina':'Pagina '+t))+'"'+(p===st.page&&!cls?' aria-current="page"':'')+'>'+t+'</button>'}
    h+=b(st.page-1,'‹','pijl',st.page===1);
    for(var p=1;p<=pages;p++)h+=b(p,p,p===st.page?'on':'');
    h+=b(st.page+1,'›','pijl',st.page===pages);
    el.pag.innerHTML=h;
  }

  function sync(){
    el.q.value=st.q;el.soort.value=st.soort;el.type.value=st.type;el.plaats.value=st.plaats;el.opp.value=st.opp;el.status.value=st.status;el.sort.value=st.sort;el.prijs.value=st.prijs;
    el.fav.classList.toggle('on',st.fav);el.fav.setAttribute('aria-pressed',st.fav);
    [].forEach.call(document.querySelectorAll('.chip select'),function(s){s.parentNode.classList.toggle('actief',!!s.value&&s.id!=='f-sort')});
    var actief=st.q||st.soort||st.prijs||st.type||st.plaats||st.opp||st.status;
    el.reset.hidden=!actief;
  }

  function render(scroll){
    var rij=sorteer(filter()),total=rij.length,pages=Math.max(1,Math.ceil(total/PER));
    if(st.page>pages)st.page=pages;
    var van=(st.page-1)*PER;
    el.lijst.innerHTML=rij.slice(van,van+PER).map(kaart).join('');
    el.leeg.hidden=total>0;
    if(st.fav&&total===0)el.leeg.textContent='U heeft nog geen favorieten bewaard. Klik op het hartje bij een object om het hier terug te vinden.';
    else el.leeg.textContent='Geen objecten gevonden met deze filters. Pas de filters aan of neem contact op, dan zoeken wij mee.';
    titel(total);pagina(total);sync();schrijfUrl();
    if(scroll){var top=el.titel.getBoundingClientRect().top+window.scrollY-170;window.scrollTo({top:Math.max(0,top),behavior:'smooth'})}
  }

  /* events */
  var t;
  el.q.addEventListener('input',function(){clearTimeout(t);t=setTimeout(function(){st.q=el.q.value.trim();st.page=1;render()},180)});
  el.q.addEventListener('keydown',function(e){if(e.key==='Enter')e.preventDefault()});
  ['soort','prijs','type','plaats','opp','status','sort'].forEach(function(k){
    el[k].addEventListener('change',function(){
      st[k]=el[k].value;st.page=1;
      if(k==='soort')vulPrijs();
      render();
    });
  });
  el.fav.addEventListener('click',function(){st.fav=!st.fav;st.page=1;render()});
  el.reset.addEventListener('click',function(){
    st.q=st.soort=st.prijs=st.type=st.plaats=st.opp=st.status='';st.page=1;vulPrijs();render();
  });
  el.pag.addEventListener('click',function(e){
    var b=e.target.closest('button[data-p]');if(!b||b.disabled)return;
    st.page=+b.getAttribute('data-p');render(true);
  });
  document.addEventListener('hf:change',function(){if(st.fav)render();});

  leesUrl();vulPrijs();
  if(st.prijs){var pv=st.prijs;el.prijs.value=pv;if(el.prijs.value!==pv)st.prijs=''}
  render();
})();
