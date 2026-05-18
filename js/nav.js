// Ashoka House — Navigation

const navbar = document.querySelector('.navbar');
const navMenu = document.querySelector('.navbar__menu');
const navToggle = document.querySelector('.navbar__toggle');
const navLinks = document.querySelectorAll('.navbar__link');

const closeMobileNav = () => {
  navMenu?.classList.remove('is-open');
  navToggle?.classList.remove('is-open');
};

navToggle?.addEventListener('click', () => {
  navMenu?.classList.toggle('is-open');
  navToggle?.classList.toggle('is-open');
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
  const onScroll = () => {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
