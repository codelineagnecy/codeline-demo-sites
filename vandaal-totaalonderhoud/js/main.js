// Van Daal Totaal Onderhoud — interactions

// Progressive enhancement flag: only elements matching `.js .reveal`
// get hidden-then-revealed. Without this, content is visible by default.
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  // Sticky nav on scroll
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add('solid');
      else nav.classList.remove('solid');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile nav toggle
  const burger = document.querySelector('.nav-burger');
  const links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', () => {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));

    // Safety net: if a section never intersects (e.g. an automated
    // screenshot tool that doesn't scroll, or a very tall viewport),
    // reveal everything anyway after a short delay so content is
    // never permanently stuck invisible.
    window.setTimeout(() => {
      revealEls.forEach(el => el.classList.add('in'));
      io.disconnect();
    }, 2500);
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }
});
