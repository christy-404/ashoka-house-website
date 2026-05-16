// ==========================================
// ASHOKA HOUSE - UTILITIES & HELPERS
// ==========================================

const AshokaUtils = {
    // DOM Helpers
    qs: (selector) => document.querySelector(selector),
    qsa: (selector) => document.querySelectorAll(selector),
    
    // Class management
    addClass: (element, className) => element?.classList.add(className),
    removeClass: (element, className) => element?.classList.remove(className),
    toggleClass: (element, className) => element?.classList.toggle(className),
    hasClass: (element, className) => element?.classList.contains(className),
    
    // Data fetching
    async fetchJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            return null;
        }
    },
    
    // Animation helpers
    fadeIn: (element, duration = 300) => {
        element.style.opacity = '0';
        element.style.display = 'block';
        void element.offsetWidth; // Trigger reflow
        element.style.transition = `opacity ${duration}ms ease-out`;
        element.style.opacity = '1';
    },
    
    fadeOut: (element, duration = 300) => {
        element.style.transition = `opacity ${duration}ms ease-out`;
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    },
    
    slideInUp: (element, duration = 400) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(40px)';
        element.style.display = 'block';
        void element.offsetWidth;
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    },
    
    // Number formatting
    formatNumber: (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },
    
    // Date formatting
    formatDate: (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    },
    
    // Calculate days until date
    daysUntil: (dateStr) => {
        const targetDate = new Date(dateStr);
        const today = new Date();
        const diff = targetDate - today;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },
    
    // Event status calculation
    getEventStatus: (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (now < start) return 'upcoming';
        if (now > end) return 'completed';
        return 'ongoing';
    },
    
    // Sort objects
    sortByProperty: (array, property, ascending = true) => {
        return [...array].sort((a, b) => {
            if (ascending) {
                return a[property] > b[property] ? 1 : -1;
            } else {
                return a[property] < b[property] ? 1 : -1;
            }
        });
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
};

// ==========================================
// ASHOKA HOUSE - NAVIGATION SYSTEM
// ==========================================

class NavigationSystem {
    constructor() {
        this.navbar = AshokaUtils.qs('.navbar');
        this.navMenu = AshokaUtils.qs('.navbar-menu');
        this.navToggle = AshokaUtils.qs('.navbar-toggle');
        this.navLinks = AshokaUtils.qsa('.navbar-link');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollBehavior();
        this.setupActiveIndicator();
    }

    setupEventListeners() {
        // Mobile menu toggle
        this.navToggle?.addEventListener('click', () => this.toggleMobileMenu());
        
        // Close menu when link is clicked
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.handleLinkClick(link));
        });
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar')) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        AshokaUtils.toggleClass(this.navMenu, 'active');
        AshokaUtils.toggleClass(this.navToggle, 'active');
    }

    closeMobileMenu() {
        AshokaUtils.removeClass(this.navMenu, 'active');
        AshokaUtils.removeClass(this.navToggle, 'active');
    }

    handleLinkClick(link) {
        this.closeMobileMenu();
        this.updateActiveLink(link);
    }

    updateActiveLink(activeLink) {
        this.navLinks.forEach(link => AshokaUtils.removeClass(link, 'active'));
        AshokaUtils.addClass(activeLink, 'active');
    }

    setupScrollBehavior() {
        window.addEventListener('scroll', AshokaUtils.throttle(() => {
            this.updateNavbarBackground();
            this.updateActiveLinkOnScroll();
        }, 100));
    }

    updateNavbarBackground() {
        if (window.scrollY > 50) {
            this.navbar.style.background = 'rgba(10, 14, 20, 0.85)';
            this.navbar.style.backdropFilter = 'blur(25px)';
        } else {
            this.navbar.style.background = 'rgba(10, 14, 20, 0.7)';
            this.navbar.style.backdropFilter = 'blur(20px)';
        }
    }

    setupActiveIndicator() {
        // Set active link based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href.includes(currentPage) || (currentPage === '' && href === 'index.html')) {
                AshokaUtils.addClass(link, 'active');
            }
        });
    }

    updateActiveLinkOnScroll() {
        const sections = AshokaUtils.qsa('section[id]');
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });
        
        this.navLinks.forEach(link => {
            AshokaUtils.removeClass(link, 'active');
            if (link.getAttribute('href').includes(currentSection)) {
                AshokaUtils.addClass(link, 'active');
            }
        });
    }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    new NavigationSystem();
});

// ==========================================
// SCROLL TO TOP BUTTON
// ==========================================

class ScrollToTopButton {
    constructor() {
        this.create();
        this.setupEventListeners();
    }

    create() {
        this.button = document.createElement('button');
        this.button.innerHTML = '↑';
        this.button.className = 'scroll-to-top';
        this.button.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #2d9d78, #3db08a);
            border: 1px solid rgba(45, 157, 120, 0.3);
            color: white;
            border-radius: 50%;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: bold;
            z-index: 999;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            box-shadow: 0 0 20px rgba(45, 157, 120, 0.2);
        `;
        document.body.appendChild(this.button);
    }

    setupEventListeners() {
        window.addEventListener('scroll', AshokaUtils.throttle(() => {
            this.updateVisibility();
        }, 200));
        
        this.button.addEventListener('click', () => this.scrollToTop());
        this.button.addEventListener('mouseover', () => this.handleHover(true));
        this.button.addEventListener('mouseleave', () => this.handleHover(false));
    }

    updateVisibility() {
        if (window.scrollY > 300) {
            this.button.style.display = 'flex';
        } else {
            this.button.style.display = 'none';
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    handleHover(isHovering) {
        if (isHovering) {
            this.button.style.boxShadow = '0 0 40px rgba(45, 157, 120, 0.4)';
        } else {
            this.button.style.boxShadow = '0 0 20px rgba(45, 157, 120, 0.2)';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ScrollToTopButton();
});

console.log('%cAshoka House Platform - Navigation & Utils', 'color: #2d9d78; font-size: 14px; font-weight: bold;');
