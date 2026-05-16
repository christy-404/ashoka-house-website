// ==========================================
// ASHOKA HOUSE - PAGE INITIALIZATION SYSTEM
// Handles rendering orchestration and page reveals
// ==========================================

class PageInitializer {
    constructor() {
        this.isReady = false;
        this.init();
    }

    init() {
        // Wait for preloader to complete and document to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }

        // Also listen for the loaded class being added
        this.observeDocumentReady();
    }

    observeDocumentReady() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.target === document.documentElement) {
                    if (document.documentElement.classList.contains('loaded')) {
                        this.onPageReady();
                        observer.disconnect();
                    }
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    setup() {
        // Prepare elements for reveal
        this.markElementsForReveal();
        this.setupIntersectionObservers();
        this.setupScrollListeners();
    }

    markElementsForReveal() {
        // Mark major content sections for reveal
        const sections = document.querySelectorAll('section, .section-header, .premium-card, .event-card, .achievement-card, .leadership-card');
        sections.forEach((section, index) => {
            if (!section.hasAttribute('data-reveal')) {
                section.setAttribute('data-reveal', '');
            }
        });
    }

    setupIntersectionObservers() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.querySelectorAll('[data-reveal]').forEach(el => {
                el.classList.add('revealed');
            });
            return;
        }

        // Observe elements entering viewport
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
                        this.revealElement(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    }

    revealElement(element) {
        element.classList.add('revealed', 'reveal-in');
    }

    setupScrollListeners() {
        // Setup scroll-based animations
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.onScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    onScroll() {
        // Update navbar on scroll
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(10, 14, 20, 0.85)';
                navbar.style.backdropFilter = 'blur(25px)';
            } else {
                navbar.style.background = 'rgba(10, 14, 20, 0.7)';
                navbar.style.backdropFilter = 'blur(20px)';
            }
        }

        // Update parallax
        const heroRight = document.querySelector('.hero-right');
        if (heroRight && window.scrollY < window.innerHeight) {
            heroRight.style.transform = `translateY(${window.scrollY * 0.3}px)`;
        }
    }

    onPageReady() {
        this.isReady = true;
        this.initializePageElements();
        this.setupAnimations();
    }

    initializePageElements() {
        // Initialize elements now that page is ready
        this.initializeCountdowns();
        this.initializeStats();
        this.initializeTabs();
        this.initializeButtons();
        this.initializeScrollToTop();
    }

    initializeCountdowns() {
        const countdownValues = document.querySelectorAll('.countdown-value');
        if (countdownValues.length === 0) return;

        const now = new Date();
        const targetDate = new Date(now.getTime() + 24 * 24 * 60 * 60 * 1000);

        const tick = () => {
            const current = new Date();
            const difference = targetDate - current;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                document.querySelector('[data-type="days"]')?.textContent = String(days).padStart(2, '0');
                document.querySelector('[data-type="hours"]')?.textContent = String(hours).padStart(2, '0');
                document.querySelector('[data-type="minutes"]')?.textContent = String(minutes).padStart(2, '0');
                document.querySelector('[data-type="seconds"]')?.textContent = String(seconds).padStart(2, '0');
            }
        };

        tick();
        setInterval(tick, 1000);
    }

    initializeStats() {
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.dataset.animated) {
                        this.animateStat(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        statValues.forEach(value => observer.observe(value));
    }

    animateStat(element) {
        element.dataset.animated = 'true';
        const target = parseInt(element.dataset.target) || parseInt(element.textContent);
        const duration = 2000;
        const start = Date.now();

        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * easeProgress);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target.toLocaleString();
            }
        };

        animate();
    }

    initializeTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        if (tabBtns.length === 0) return;

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn));
        });

        // Set first tab as active
        document.querySelectorAll('.achievement-tabs, .event-tabs').forEach(tabGroup => {
            const firstBtn = tabGroup.querySelector('.tab-btn');
            if (firstBtn && !firstBtn.classList.contains('active')) {
                firstBtn.classList.add('active');
            }
        });
    }

    switchTab(btn) {
        const tabGroup = btn.closest('.achievement-tabs, .event-tabs');
        if (!tabGroup) return;

        const tabContainer = btn.closest('section');
        if (!tabContainer) return;

        // Deactivate all buttons in group
        tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Hide all tab contents
        tabContainer.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show active tab
        const tabName = btn.getAttribute('data-achievement-tab') || btn.getAttribute('data-tab');
        const activeTab = tabContainer.querySelector(`#${tabName}`) || tabContainer.querySelector(`[data-tab-id="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    initializeButtons() {
        const buttons = document.querySelectorAll('.btn, .filter-btn, .category-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.tagName === 'A' && btn.getAttribute('href') === '#') {
                    e.preventDefault();
                }
            });
        });
    }

    initializeScrollToTop() {
        const scrollTopBtn = document.createElement('button');
        scrollTopBtn.innerHTML = '↑';
        scrollTopBtn.className = 'scroll-to-top';
        scrollTopBtn.setAttribute('aria-label', 'Scroll to top');

        scrollTopBtn.style.cssText = `
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

        document.body.appendChild(scrollTopBtn);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.style.display = 'flex';
            } else {
                scrollTopBtn.style.display = 'none';
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        scrollTopBtn.addEventListener('mouseover', () => {
            scrollTopBtn.style.boxShadow = '0 0 40px rgba(45, 157, 120, 0.4)';
        });

        scrollTopBtn.addEventListener('mouseleave', () => {
            scrollTopBtn.style.boxShadow = '0 0 20px rgba(45, 157, 120, 0.2)';
        });
    }

    setupAnimations() {
        // Add stagger animations
        const cardElements = document.querySelectorAll('.event-card, .achievement-card, .leadership-card, .premium-card');
        cardElements.forEach((card, index) => {
            if (!card.style.animationDelay) {
                card.style.animationDelay = `${index * 0.05}s`;
            }
        });
    }
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PageInitializer();
    });
} else {
    new PageInitializer();
}

console.log('%c✨ Ashoka House - Premium Platform Initialized', 'color: #2d9d78; font-size: 14px; font-weight: bold;');
