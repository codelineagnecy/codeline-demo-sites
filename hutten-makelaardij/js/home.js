(function(){
  var data=window.OBJECTEN||[],bes=HU.beschikbaar();
  var n=document.getElementById('hz-aantal');if(n)n.textContent=bes.length;

  var pl=document.getElementById('hz-plaats');
  if(pl){
    var set={};bes.forEach(function(o){set[o.plaats]=1});
    Object.keys(set).sort().forEach(function(p){var op=document.createElement('option');op.textContent=p;op.value=p;pl.appendChild(op)});
  }

  var form=document.getElementById('home-zoek'),hid=document.getElementById('hz-soort');
  if(form){
    [].forEach.call(form.querySelectorAll('.zoek-tabs button'),function(b){
      b.addEventListener('click',function(){
        [].forEach.call(form.querySelectorAll('.zoek-tabs button'),function(x){x.classList.remove('on')});
        b.classList.add('on');hid.value=b.getAttribute('data-soort');
      });
    });
  }

  var grid=document.getElementById('home-grid');
  if(grid){
    var met=bes.filter(function(o){return o.foto}).slice(0,3);
    grid.innerHTML=met.map(HU.kaartje).join('');
  }
})();
