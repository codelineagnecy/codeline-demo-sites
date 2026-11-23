/* De Kaaskantine bestelconcept: klantkant (demo, er wordt niets verzonden) */
(function(){
'use strict';
var K=window.KK;if(!K)return;
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function btn(cls,txt,type){var b=el('button',cls,txt);b.type=type||'button';return b}

var lijst=$('#bs-lijst'),cats=$('#bs-cats'),zoek=$('#bs-zoek'),status=$('#bs-status'),cartEl=$('#bs-cart'),view=$('#bs-view'),bar=$('#bs-bar'),modal=$('#bs-modal');
if(!lijst)return;
var S={cart:K.load('kk_cart',[]),view:'cart',last:null,form:{dag:'',tijd:'',naam:'',tel:'',mail:'',opm:''}};
var save=function(){K.save('kk_cart',S.cart)};
var count=function(){return S.cart.reduce(function(a,r){return a+r.q},0)};
var total=function(){return K.tot(S.cart)};

/* ---------- menu ---------- */
function badges(it,host){
  if(it.nieuw){host.appendChild(el('span','bdg','Nieuw'))}
  if(it.tag){host.appendChild(el('span','bdg',it.tag))}
  if(it.halal){host.appendChild(el('span','bdg hl','Ook halal'))}
}
function renderMenu(q){
  q=(q||'').trim().toLowerCase();lijst.innerHTML='';var n=0;
  K.MENU.forEach(function(c){
    var items=c.items.filter(function(i){return !q||(i.naam+' '+i.tekst).toLowerCase().indexOf(q)>-1});
    if(!items.length)return;
    var sec=el('section','bs-cat');sec.id='c-'+c.id;sec.appendChild(el('h2','',c.naam));
    items.forEach(function(it){
      n++;
      var b=btn('bs-item');b.setAttribute('data-id',it.id);b.setAttribute('aria-label',it.naam+', '+K.fmt(it.prijs)+', kies');
      var t=el('div','t'),h=el('b','',it.naam);badges(it,h);t.appendChild(h);
      if(it.tekst)t.appendChild(el('p','',it.tekst));
      t.appendChild(el('span','p',K.fmt(it.prijs)));
      b.appendChild(t);
      if(it.img){var im=el('img');im.src='img/'+it.img;im.alt='';im.loading='lazy';im.width=96;im.height=96;b.appendChild(im)}
      b.appendChild(el('span','add','+'));
      sec.appendChild(b);
    });
    lijst.appendChild(sec);
  });
  if(!n){lijst.appendChild(el('p','bs-leeg','Niets gevonden voor “'+q+'”.'))}
}
function renderCats(){
  cats.innerHTML='';
  K.MENU.forEach(function(c){var a=el('a','',c.naam);a.href='#c-'+c.id;a.setAttribute('data-c','c-'+c.id);cats.appendChild(a)});
}
cats.addEventListener('click',function(e){
  var a=e.target.closest('a');if(!a)return;e.preventDefault();
  var t=document.getElementById(a.getAttribute('data-c'));if(t){var y=t.getBoundingClientRect().top+window.scrollY-140;window.scrollTo({top:y,behavior:'smooth'})}
});
function spy(){
  var y=window.innerHeight*.3,best=null;
  $$('.bs-cat').forEach(function(s){if(s.getBoundingClientRect().top<=y)best=s});
  $$('a',cats).forEach(function(a){a.classList.toggle('nu',!!best&&a.getAttribute('data-c')===best.id)});
}
window.addEventListener('scroll',spy,{passive:true});
zoek.addEventListener('input',function(){renderMenu(zoek.value);spy()});

/* ---------- status ---------- */
function renderStatus(){
  status.innerHTML='';var open=K.isOpen();
  status.className='bs-status '+(open?'open':'dicht');
  status.appendChild(el('i','dot'));
  status.appendChild(el('span','',open?'Nu geopend. Bestel en haal af aan de Hofstraat 4.':'Op dit moment gesloten. Je kunt wel vooruit bestellen. Eerstvolgende opening: '+K.volgendeOpening()+'.'));
}

/* ---------- product-venster ---------- */
var mState=null;
function openModal(id){
  var it=K.find(id);if(!it)return;mState={it:it,q:1,v:it.halal?'Normaal':''};
  modal.innerHTML='';var card=el('div','bs-card');card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-label',it.naam);
  var x=btn('bs-x','×');x.setAttribute('aria-label','Sluiten');x.addEventListener('click',closeModal);card.appendChild(x);
  if(it.img){var im=el('img','bs-foto');im.src='img/'+it.img;im.alt=it.naam;card.appendChild(im)}
  var h=el('h3','',it.naam);card.appendChild(h);
  var meta=el('div','bs-meta');badges(it,meta);meta.appendChild(el('span','bs-prijs',K.fmt(it.prijs)));card.appendChild(meta);
  if(it.tekst)card.appendChild(el('p','bs-tekst',it.tekst));
  if(it.halal){
    var fs=el('fieldset','bs-opt');fs.appendChild(el('legend','','Variant'));
    ['Normaal','Halal'].forEach(function(v,i){
      var l=el('label','bs-radio'),r=el('input');r.type='radio';r.name='variant';r.value=v;r.checked=i===0;
      r.addEventListener('change',function(){mState.v=v});l.appendChild(r);l.appendChild(el('span','',v));fs.appendChild(l);
    });
    card.appendChild(fs);
  }
  var nl=el('label','bs-lbl','Opmerking (optioneel)');nl.setAttribute('for','bs-note');card.appendChild(nl);
  var ta=el('textarea');ta.id='bs-note';ta.placeholder='Bijvoorbeeld: zonder ui';ta.maxLength=140;card.appendChild(ta);
  var rij=el('div','bs-onder'),st=el('div','bs-step'),mn=btn('','−'),qq=el('span','q','1'),pl=btn('','+');
  mn.setAttribute('aria-label','Eén minder');pl.setAttribute('aria-label','Eén meer');
  var add=btn('knop vol bs-add');
  function upd(){qq.textContent=mState.q;add.textContent='Toevoegen · '+K.fmt(it.prijs*mState.q)}
  mn.addEventListener('click',function(){mState.q=Math.max(1,mState.q-1);upd()});
  pl.addEventListener('click',function(){mState.q=Math.min(20,mState.q+1);upd()});
  add.addEventListener('click',function(){addToCart(it.id,mState.v,ta.value.trim(),mState.q);closeModal()});
  st.appendChild(mn);st.appendChild(qq);st.appendChild(pl);rij.appendChild(st);rij.appendChild(add);card.appendChild(rij);upd();
  modal.appendChild(card);modal.hidden=false;document.body.style.overflow='hidden';
  requestAnimationFrame(function(){modal.classList.add('in');x.focus()});
}
function closeModal(){modal.classList.remove('in');modal.hidden=true;modal.innerHTML='';mState=null;if(!cartEl.classList.contains('open'))document.body.style.overflow=''}
modal.addEventListener('click',function(e){if(e.target===modal)closeModal()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(!modal.hidden)closeModal();else if(cartEl.classList.contains('open'))toggleSheet(false)}});
lijst.addEventListener('click',function(e){var b=e.target.closest('.bs-item');if(b)openModal(b.getAttribute('data-id'))});

/* ---------- mandje ---------- */
function addToCart(id,v,note,q){
  var key=[id,v,note].join('|'),r=S.cart.filter(function(x){return x.k===key})[0];
  if(r)r.q=Math.min(20,r.q+q);else S.cart.push({k:key,id:id,v:v,n:note,q:q});
  save();S.view='cart';render();flash();
}
function flash(){bar.classList.remove('puls');void bar.offsetWidth;bar.classList.add('puls')}
function setQ(k,d){
  var r=S.cart.filter(function(x){return x.k===k})[0];if(!r)return;
  r.q+=d;if(r.q<=0)S.cart=S.cart.filter(function(x){return x.k!==k});if(r.q>20)r.q=20;
  save();render();
}
function lineEl(r,ed){
  var it=K.find(r.id),li=el('li','bs-regel'),l=el('div','l'),nm=el('b','',(ed?'':r.q+'× ')+it.naam);
  l.appendChild(nm);
  if(r.v&&r.v!=='Normaal')l.appendChild(el('span','bs-var',r.v));
  if(r.n)l.appendChild(el('em','',r.n));
  li.appendChild(l);
  var rt=el('div','r');
  if(ed){
    var st=el('div','bs-step sm'),mn=btn('','−'),pl=btn('','+');
    mn.setAttribute('aria-label','Eén minder: '+it.naam);pl.setAttribute('aria-label','Eén meer: '+it.naam);
    mn.addEventListener('click',function(){setQ(r.k,-1)});pl.addEventListener('click',function(){setQ(r.k,1)});
    st.appendChild(mn);st.appendChild(el('span','q',String(r.q)));st.appendChild(pl);rt.appendChild(st);
  }
  rt.appendChild(el('span','pr',K.fmt(it.prijs*r.q)));li.appendChild(rt);return li;
}
function totaalRij(label,val,cls){var d=el('div','bs-tot '+(cls||''));d.appendChild(el('span','',label));d.appendChild(el('b','',val));return d}

function viewCart(){
  view.appendChild(el('span','label','Je bestelling'));
  var ul=el('ul','bs-regels');
  if(!S.cart.length){var li=el('li','bs-leeg','Je mandje is nog leeg. Kies links een product.');ul.appendChild(li)}
  S.cart.forEach(function(r){ul.appendChild(lineEl(r,true))});
  view.appendChild(ul);
  view.appendChild(totaalRij('Totaal',K.fmt(total())));
  var go=btn('knop vol bs-go','Verder naar afhalen');go.disabled=!S.cart.length;
  go.addEventListener('click',function(){S.view='form';render();cartEl.scrollTop=0});
  view.appendChild(go);
  view.appendChild(el('p','bs-noot','Afhalen aan de Hofstraat 4, Alkmaar.'));
}
function field(id,label,type,val,opts){
  opts=opts||{};var w=el('div','veld'+(opts.vol?' vol':''));w.setAttribute('data-v',id);
  var l=el('label','',label);l.setAttribute('for','f-'+id);w.appendChild(l);
  var i;if(type==='textarea'){i=el('textarea')}else{i=el('input');i.type=type}
  i.id='f-'+id;i.name=id;i.value=val||'';if(opts.ph)i.placeholder=opts.ph;if(opts.ac)i.autocomplete=opts.ac;if(opts.im)i.inputMode=opts.im;
  i.addEventListener('input',function(){S.form[id]=i.value;w.classList.remove('fout');var m=$('.melding',w);if(m)m.hidden=true});
  w.appendChild(i);var m=el('span','melding');m.hidden=true;w.appendChild(m);return w;
}
function viewForm(){
  var back=btn('bs-terug','← Terug naar mandje');back.addEventListener('click',function(){S.view='cart';render()});view.appendChild(back);
  view.appendChild(el('span','label','Afhalen'));
  var sl=K.slots(),f=S.form;
  var sel1=el('select');sel1.id='f-dag';var sel2=el('select');sel2.id='f-tijd';
  sl.forEach(function(d){var o=el('option','',d.label);o.value=d.key;sel1.appendChild(o)});
  if(!f.dag||!sl.some(function(d){return d.key===f.dag}))f.dag=sl.length?sl[0].key:'';
  sel1.value=f.dag;
  function tijden(){
    sel2.innerHTML='';var d=sl.filter(function(x){return x.key===sel1.value})[0];
    (d?d.tijden:[]).forEach(function(t){var o=el('option','',t);o.value=t;sel2.appendChild(o)});
    if(f.tijd&&d&&d.tijden.indexOf(f.tijd)>-1)sel2.value=f.tijd;else f.tijd=sel2.value;
  }
  sel1.addEventListener('change',function(){f.dag=sel1.value;f.tijd='';tijden()});
  sel2.addEventListener('change',function(){f.tijd=sel2.value});tijden();
  var g=el('div','velden');
  var a=el('div','veld'),la=el('label','','Dag');la.setAttribute('for','f-dag');a.appendChild(la);a.appendChild(sel1);
  var b=el('div','veld'),lb=el('label','','Tijd');lb.setAttribute('for','f-tijd');b.appendChild(lb);b.appendChild(sel2);
  g.appendChild(a);g.appendChild(b);view.appendChild(g);
  view.appendChild(el('span','label bs-l2','Jouw gegevens'));
  var g2=el('div','velden');
  g2.appendChild(field('naam','Naam','text',f.naam,{vol:1,ac:'name'}));
  g2.appendChild(field('tel','Telefoon','tel',f.tel,{ac:'tel',im:'tel',ph:'06 12345678'}));
  g2.appendChild(field('mail','E-mail (optioneel)','email',f.mail,{ac:'email'}));
  g2.appendChild(field('opm','Opmerking (optioneel)','textarea',f.opm,{vol:1}));
  view.appendChild(g2);
  view.appendChild(el('span','label bs-l2','Betalen'));
  var pay=el('div','bs-pay');
  var p1=el('label','bs-radio'),r1=el('input');r1.type='radio';r1.name='pay';r1.checked=true;p1.appendChild(r1);p1.appendChild(el('span','','Betalen bij afhalen'));pay.appendChild(p1);
  var p2=el('label','bs-radio off'),r2=el('input');r2.type='radio';r2.name='pay';r2.disabled=true;p2.appendChild(r2);p2.appendChild(el('span','','Online betalen (iDEAL) · kan later gekoppeld worden'));pay.appendChild(p2);
  view.appendChild(pay);
  var ul=el('ul','bs-regels bs-klein');S.cart.forEach(function(r){ul.appendChild(lineEl(r,false))});view.appendChild(ul);
  view.appendChild(totaalRij('Totaal',K.fmt(total())));
  var mel=el('p','m-melding');mel.hidden=true;view.appendChild(mel);
  var go=btn('knop vol bs-go','Bestelling plaatsen');
  go.addEventListener('click',function(){
    var bad=null;
    function err(id,msg){var w=$('[data-v='+id+']',view);w.classList.add('fout');var m=$('.melding',w);m.textContent=msg;m.hidden=false;if(!bad)bad=w}
    if(f.naam.trim().length<2)err('naam','Vul je naam in.');
    if(f.tel.replace(/\D/g,'').length<8)err('tel','Vul een telefoonnummer in.');
    if(f.mail&&!/^\S+@\S+\.\S+$/.test(f.mail.trim()))err('mail','Dit e-mailadres lijkt niet te kloppen.');
    if(!sel2.value){mel.textContent='Kies een afhaalmoment.';mel.hidden=false;return}
    if(bad){$('input,textarea',bad).focus();return}
    place();
  });
  view.appendChild(go);
  view.appendChild(el('p','demo-noot','Demo: er wordt niets verzonden. In de echte versie komt de bestelling direct bij De Kaaskantine binnen.'));
}
function place(){
  var f=S.form,sl=K.slots().filter(function(d){return d.key===f.dag})[0];
  var o={id:'o'+Date.now(),nr:K.nextNr(),ts:Date.now(),status:'nieuw',naam:f.naam.trim(),tel:f.tel.trim(),mail:f.mail.trim(),opm:f.opm.trim(),
    dag:f.dag,dagLabel:sl?sl.label:f.dag,tijd:f.tijd,regels:S.cart.map(function(r){return {id:r.id,v:r.v,n:r.n,q:r.q}}),totaal:total()};
  var all=K.orders();all.unshift(o);K.saveOrders(all);
  S.last=o.id;S.cart=[];save();S.view='klaar';S.form.opm='';render();cartEl.scrollTop=0;
  if(window.innerWidth<=1020){toggleSheet(true)}
}
function viewKlaar(){
  var o=K.orders().filter(function(x){return x.id===S.last})[0];
  if(!o){S.view='cart';return viewCart()}
  var w=el('div','bs-klaar');w.appendChild(el('div','vink'));
  var h=el('h3','','Bedankt, '+o.naam.split(' ')[0]);w.appendChild(h);
  w.appendChild(el('div','bs-nr',o.nr));
  w.appendChild(el('p','bs-sam','Afhalen: '+o.dagLabel.toLowerCase()+' om '+o.tijd+', Hofstraat 4 in Alkmaar.'));
  var tr=el('ol','bs-track'),cur=0;K.STATUS.forEach(function(s,i){if(s.id===o.status)cur=i});
  K.STATUS.forEach(function(s,i){var li=el('li',i<cur?'af':i===cur?'nu':'');li.appendChild(el('i'));li.appendChild(el('span','',s.kort));tr.appendChild(li)});
  w.appendChild(tr);w.appendChild(el('p','bs-stat',K.STATUS[cur].tekst));
  var ul=el('ul','bs-regels bs-klein');o.regels.forEach(function(r){ul.appendChild(lineEl(r,false))});w.appendChild(ul);
  w.appendChild(totaalRij('Totaal',K.fmt(o.totaal)));
  w.appendChild(el('p','demo-noot','Demo: open het bestellingenscherm van de eigenaar en verander de status. Hier zie je het meteen terug.'));
  var a=el('a','knop','Bekijk het eigenaarsscherm');a.href='keuken.html';a.target='_blank';a.rel='noopener';
  var n=btn('knop','Nieuwe bestelling');n.addEventListener('click',function(){S.view='cart';S.last=null;render()});
  var rij=el('div','bs-acties');rij.appendChild(a);rij.appendChild(n);w.appendChild(rij);
  view.appendChild(w);
}
function render(){
  view.innerHTML='';
  if(S.view==='form'&&!S.cart.length)S.view='cart';
  if(S.view==='form')viewForm();else if(S.view==='klaar')viewKlaar();else viewCart();
  var n=count();
  bar.classList.toggle('zicht',n>0||S.view==='klaar');
  $('.bs-bar-n',bar).textContent=S.view==='klaar'?'Bestelling geplaatst':n+(n===1?' product':' producten');
  $('.bs-bar-p',bar).textContent=S.view==='klaar'?'Bekijk status':K.fmt(total());
}

/* mobiel: mandje als sheet */
function toggleSheet(open){
  cartEl.classList.toggle('open',open);document.body.style.overflow=open?'hidden':'';
  var cl=$('.bs-sluit',cartEl);if(cl)cl.hidden=!open;
}
bar.addEventListener('click',function(){toggleSheet(true)});
var sluit=btn('bs-sluit','×');sluit.setAttribute('aria-label','Mandje sluiten');sluit.hidden=true;sluit.addEventListener('click',function(){toggleSheet(false)});cartEl.insertBefore(sluit,cartEl.firstChild);
document.addEventListener('click',function(e){if(cartEl.classList.contains('open')&&!cartEl.contains(e.target)&&!bar.contains(e.target)&&modal.hidden)toggleSheet(false)});
window.addEventListener('resize',function(){if(window.innerWidth>1020&&cartEl.classList.contains('open'))toggleSheet(false)});

/* live status vanuit het eigenaarsscherm */
var lastStatus='';
function poll(){
  if(S.view!=='klaar'||!S.last)return;
  var o=K.orders().filter(function(x){return x.id===S.last})[0];if(!o)return;
  if(o.status!==lastStatus){lastStatus=o.status;render()}
}
setInterval(poll,1200);window.addEventListener('storage',poll);

renderCats();renderMenu('');renderStatus();render();spy();
setInterval(renderStatus,60000);
})();
