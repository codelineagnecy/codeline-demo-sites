document.documentElement.classList.add('js');

// sticky nav background on scroll
const nav = document.querySelector('.nav');
function onScroll(){
  if(!nav) return;
  if(window.scrollY > 40){ nav.classList.add('scrolled'); }
  else{ nav.classList.remove('scrolled'); }
}
window.addEventListener('scroll', onScroll, { passive:true });
onScroll();

// mobile nav toggle
const burger = document.querySelector('.nav-burger');
const mobileNav = document.querySelector('.mobile-nav');
const mobileClose = document.querySelector('.mobile-nav-close');
function closeMobileNav(){ mobileNav && mobileNav.classList.remove('open'); }
if(burger && mobileNav){
  burger.addEventListener('click', () => mobileNav.classList.toggle('open'));
}
if(mobileClose){ mobileClose.addEventListener('click', closeMobileNav); }
document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', closeMobileNav));

// reveal on scroll
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
// safety net: force reveal everything after 2.5s regardless
setTimeout(() => { revealEls.forEach(el => el.classList.add('in')); }, 2500);
