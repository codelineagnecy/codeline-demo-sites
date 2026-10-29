(function(){
  var f=document.getElementById('contactform');if(!f)return;
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var d=new FormData(f),naam=(d.get('naam')||'').toString().trim();
    if(!naam){var i=f.querySelector('[name=naam]');i.focus();i.setCustomValidity('Vul uw naam in');i.reportValidity();i.addEventListener('input',function(){i.setCustomValidity('')},{once:true});return}
    var t='Hallo Hutten Makelaardij, mijn naam is '+naam+'.\nOnderwerp: '+d.get('onderwerp');
    if(d.get('tel'))t+='\nTelefoon: '+d.get('tel');
    if((d.get('bericht')||'').toString().trim())t+='\n\n'+d.get('bericht').toString().trim();
    window.open('https://wa.me/31318519002?text='+encodeURIComponent(t),'_blank','noopener');
  });
})();
