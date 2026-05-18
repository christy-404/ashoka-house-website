// Ashoka House — Page Initialization

class PageInitializer {
  constructor() {
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }

    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains('loaded')) {
        this.onPageReady();
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    if (document.documentElement.classList.contains('loaded')) {
      this.onPageReady();
    }
  }

  setup() {
    this.markElementsForReveal();
    this.setupIntersectionObservers();
  }

  markElementsForReveal() {
    document
      .querySelectorAll(
        '.home-section, .portal-card, .inst-card, .event-card, .achievement-card, .leadership-card, .page-hero'
      )
      .forEach((el) => {
        if (!el.hasAttribute('data-reveal')) {
          el.setAttribute('data-reveal', '');
        }
      });
  }

  setupIntersectionObservers() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
  }

  onPageReady() {
    this.initializeTabs();
  }

  initializeTabs() {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.switchTab(btn));
    });
  }

  switchTab(btn) {
    const tabGroup = btn.closest('.achievement-tabs, .event-tabs');
    const section = btn.closest('section');
    if (!tabGroup || !section) return;

    tabGroup.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    section.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));

    const tabName =
      btn.getAttribute('data-achievement-tab') || btn.getAttribute('data-tab');
    const active = section.querySelector(`#${tabName}`);
    active?.classList.add('active');
  }
}

new PageInitializer();
