document.documentElement.classList.add('js');

// Sticky nav background on scroll
const nav = document.querySelector('.nav');
function onScroll(){
  if(window.scrollY > 40){ nav.classList.add('scrolled'); }
  else{ nav.classList.remove('scrolled'); }
}
window.addEventListener('scroll', onScroll);
onScroll();

// Mobile nav toggle
const burger = document.querySelector('.nav-burger');
const mobileNav = document.querySelector('.mobile-nav');
const mobileClose = document.querySelector('.mobile-nav-close');
if(burger && mobileNav){
  burger.addEventListener('click', () => mobileNav.classList.add('open'));
}
if(mobileClose && mobileNav){
  mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
}
if(mobileNav){
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileNav.classList.remove('open'));
  });
}

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}
// Safety net in case IO misses something
setTimeout(() => { revealEls.forEach(el => el.classList.add('in')); }, 2500);

// Shade slider (open / half / dicht)
(function(){
  const frame = document.querySelector('.shade-frame');
  if(!frame) return;
  const imgs = frame.querySelectorAll('img');
  const tag = frame.querySelector('.shade-tag');
  const btns = document.querySelectorAll('.shade-ctrl button');
  function show(i){
    imgs.forEach((im,n)=> im.classList.toggle('on', n===i));
    btns.forEach((b,n)=> b.classList.toggle('on', n===i));
    if(tag) tag.textContent = btns[i].dataset.label;
  }
  btns.forEach((b,n)=> b.addEventListener('click', ()=> show(n)));
  show(0);
})();
