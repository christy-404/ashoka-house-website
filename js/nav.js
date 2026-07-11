// Ashoka House — Navigation

const navbar = document.querySelector('.navbar');
const navMenu = document.querySelector('.navbar__menu');
const navToggle = document.querySelector('.navbar__toggle');
const navLinks = document.querySelectorAll('.navbar__link');

const closeMobileNav = () => {
  navMenu?.classList.remove('is-open');
  navToggle?.classList.remove('is-open');
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Open menu');
};

navToggle?.addEventListener('click', () => {
  const isOpen = navMenu?.classList.toggle('is-open');
  navToggle?.classList.toggle('is-open', isOpen);
  navToggle?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  navToggle?.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

navToggle?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    navToggle.click();
  }
});

navLinks.forEach((link) => {
  link.addEventListener('click', closeMobileNav);
});

const highlightActiveNav = () => {
  const current = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const path = href.split('/').pop().split('#')[0] || 'index.html';
    const isHome =
      (current === '' || current === 'index.html') &&
      (path === '' || path === 'index.html');

    link.classList.toggle('is-active', path === current || isHome);
  });
};

window.addEventListener('DOMContentLoaded', highlightActiveNav);

window.addEventListener('click', (e) => {
  if (!e.target.closest('.navbar')) {
    closeMobileNav();
  }
});

if (navbar) {
  const hero = document.querySelector('.hero');
  const contentSection = document.querySelector('.page-home .site-main > .section:first-of-type');
  let heroFrameId = null;

  const updateHeroScroll = () => {
    if (!hero || !contentSection) return;

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const heroHeight = hero.offsetHeight || window.innerHeight || 1;
    const progress = Math.min(Math.max(scrollY / heroHeight, 0), 1);
    const heroOpacity = Math.max(0, 1 - progress);
    const contentTranslateY = progress * 88;
    const shadowAlpha = progress > 0.02 && progress < 0.98 ? progress * 0.12 : 0;

    hero.style.opacity = heroOpacity.toFixed(3);
    contentSection.style.transform = `translate3d(0, -${contentTranslateY}px, 0)`;
    contentSection.style.boxShadow = shadowAlpha > 0
      ? `0 10px 30px rgba(0, 0, 0, ${shadowAlpha.toFixed(3)})`
      : 'none';
  };

  const onScroll = () => {
    const offset = window.scrollY;
    navbar.classList.toggle('navbar--scrolled', offset > 12 && offset <= 180);
    navbar.classList.toggle('navbar--solid', offset > 180);

    if (!heroFrameId) {
      heroFrameId = window.requestAnimationFrame(() => {
        updateHeroScroll();
        heroFrameId = null;
      });
    }
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}
