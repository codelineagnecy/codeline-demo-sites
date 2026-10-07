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
