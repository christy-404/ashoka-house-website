// ==========================================
// ASHOKA HOUSE - NAVIGATION CONTROLS
// Lightweight page nav helper
// ==========================================

const navMenu = document.querySelector('.nav-menu');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav-link');

const closeMobileNav = () => {
    navMenu?.classList.remove('active');
    navToggle?.classList.remove('active');
};

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu?.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeMobileNav();
    });
});

const highlightActiveNav = () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const linkPath = href.split('/').pop();

        if (linkPath === currentPath || (linkPath === 'index.html' && currentPath === 'index.html')) {
            link.classList.add('active');
        } else if (!linkPath && currentPath === 'index.html') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
};

window.addEventListener('DOMContentLoaded', highlightActiveNav);
window.addEventListener('popstate', highlightActiveNav);

window.addEventListener('click', (event) => {
    if (!event.target.closest('.navbar')) {
        closeMobileNav();
    }
});

console.log('%cAshoka House - Navigation script loaded', 'color: #2d9d78; font-weight: bold;');
