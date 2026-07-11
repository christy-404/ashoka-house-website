// Ashoka House — Homepage

class HomePage {
  constructor() {
    this.events = [];
    this.standings = [];
    this.leadership = [];
    this.gallery = [];
    this.heroCarousel = null;
    this.init();
  }

  async init() {
    this.initHeroCarousel();
  }

  getFeaturedEvent() {
    const ongoing = this.events.filter((e) => e.status === 'ongoing');
    if (ongoing.length) return ongoing[0];
    const upcoming = this.events.filter((e) => e.status === 'upcoming');
    return upcoming.sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    )[0];
  }

  renderFeaturedEvent() {
    const container = AshokaAPI.qs('[data-home-featured-event]');
    if (!container) return;

    const event = this.getFeaturedEvent();
    if (!event) {
      container.innerHTML = '<p class="empty-state">No events scheduled.</p>';
      return;
    }

    container.innerHTML = `
      <article class="card card--featured">
        <p class="eyebrow card__eyebrow">Featured event</p>
        <h3 class="card-title card__title">${event.name}</h3>
        <p class="body-md card__desc">${event.description}</p>
        <dl class="meta-list">
          <div>
            <dt>Category</dt>
            <dd>${AshokaAPI.capitalize(event.category)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd><span class="tag tag--status">${AshokaAPI.capitalize(event.status)}</span></dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>${AshokaAPI.formatDate(event.startDate)}</dd>
          </div>
        </dl>
        <a href="./events.html" class="text-link">View all events</a>
      </article>
    `;
  }

  renderStandingsPreview() {
    const container = AshokaAPI.qs('[data-home-standings]');
    if (!container || !this.standings.length) return;

    const sorted = [...this.standings].sort((a, b) => a.rank - b.rank);

    container.innerHTML = `
      <article class="card">
        <p class="eyebrow card__eyebrow">House standings</p>
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-rank" scope="col">#</th>
              <th scope="col">House</th>
              <th class="col-points" scope="col">Points</th>
            </tr>
          </thead>
          <tbody>
            ${sorted
              .map(
                (row) => `
              <tr class="${row.house === 'Ashoka' ? 'is-highlight' : ''}">
                <td class="col-rank">${row.rank}</td>
                <td>${row.house}</td>
                <td class="col-points">${row.points.toLocaleString('en-IN')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <p style="margin-top: var(--space-6);">
          <a href="./standings.html" class="text-link">Full standings</a>
        </p>
      </article>
    `;
  }

  renderLeadershipPreview() {
    const container = AshokaAPI.qs('[data-home-leadership]');
    if (!container) return;

    const leaders = this.leadership
      .filter((l) => l.house === 'Ashoka' || l.category === 'principal')
      .slice(0, 3);

    if (!leaders.length) {
      container.innerHTML = '<p class="empty-state">Leadership profiles coming soon.</p>';
      return;
    }

    container.innerHTML = `
      <article class="card">
        <p class="eyebrow card__eyebrow">Leadership</p>
        ${leaders
          .map(
            (leader) => `
          <div class="leader-row">
            <span class="leader-row__avatar">${leader.initials}</span>
            <div>
              <p class="leader-row__name">${leader.name}</p>
              <p class="leader-row__role">${leader.role}</p>
            </div>
          </div>
        `
          )
          .join('')}
        <p style="margin-top: var(--space-6);">
          <a href="./leadership.html" class="text-link">Meet leadership</a>
        </p>
      </article>
    `;
  }

  renderGalleryGlimpse() {
    const container = AshokaAPI.qs('[data-home-gallery]');
    if (!container) return;

    const items = this.gallery.slice(0, 4);
    if (!items.length) {
      container.innerHTML = '<p class="empty-state">Gallery coming soon.</p>';
      return;
    }

    container.innerHTML = `
      <div class="grid-4">
        ${items
          .map(
            (item) => `
          <a href="./gallery.html" class="gallery-tile">
            <span class="gallery-tile__fill" aria-hidden="true"></span>
            <span class="gallery-tile__label">${item.title}</span>
          </a>
        `
          )
          .join('')}
      </div>
    `;
  }

  initHeroCarousel() {
    const hero = AshokaAPI.qs('.hero');
    if (!hero) return;

    this.heroCarousel = new HeroCarousel(hero);
  }
}

class HeroCarousel {
  constructor(heroEl) {
    this.hero = heroEl;
    this.bgContainer = heroEl.querySelector('.hero__bg');
    this.slides = [];
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.autoplayTimer = null;
    this.autoplayPaused = false;
    this.userInteracted = false;
    this.interactionTimer = null;
    this.maxSlidesToCheck = 10;

    this.init();
  }

  async init() {
    await this.discoverSlides();
    if (this.slides.length === 0) return;

    this.buildCarousel();
    if (this.slides.length > 1) {
      this.bindEvents();
      this.startAutoplay();
    }
  }

  async discoverSlides() {
    // Clear existing slides to prevent duplicates on rebuild/resize
    this.slides = [];
    const discoveredUrls = new Set();

    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const orientation = isMobile ? 'portrait' : 'landscape';
    const basePath = `./assets/hero/${orientation}`;

    for (let i = 1; i <= this.maxSlidesToCheck; i++) {
      const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
      let found = false;

      for (const ext of extensions) {
        const url = `${basePath}/hero${i}${ext}`;
        const exists = await this.checkImageExists(url);
        if (exists && !discoveredUrls.has(url)) {
          discoveredUrls.add(url);
          this.slides.push({
            url,
            alt: `Ashoka House hero image ${i}`,
            index: this.slides.length
          });
          found = true;
          break;
        }
      }

      if (!found && i === 1) {
        // Fallback to original hero image if no carousel images found
        const fallbackUrl = './assets/hero/homehero.jpg';
        const fallbackExists = await this.checkImageExists(fallbackUrl);
        if (fallbackExists && !discoveredUrls.has(fallbackUrl)) {
          discoveredUrls.add(fallbackUrl);
          this.slides.push({
            url: fallbackUrl,
            alt: 'Ashoka House hero image',
            index: this.slides.length
          });
        }
        break;
      } else if (!found) {
        break;
      }
    }

    console.log("Images discovered:", this.slides.map(s => s.url));
    console.log("Slides created:", this.slides.length);

    // Listen for orientation/resize changes to re-discover
    window.matchMedia('(max-width: 640px)').addEventListener('change', () => {
      this.handleResize();
    });
  }

  checkImageExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  buildCarousel() {
    // Clear existing background
    this.bgContainer.innerHTML = '';

    // Create carousel wrapper
    this.carousel = document.createElement('div');
    this.carousel.className = 'hero-carousel';
    this.carousel.setAttribute('role', 'region');
    this.carousel.setAttribute('aria-label', 'Hero image carousel');
    this.carousel.setAttribute('aria-roledescription', 'carousel');

    // Create slides
    this.slideElements = this.slides.map((slide, index) => {
      const slideEl = document.createElement('div');
      slideEl.className = `hero-carousel__slide${index === 0 ? ' is-active' : ''}`;
      slideEl.style.backgroundImage = `url("${slide.url}")`;
      slideEl.setAttribute('aria-hidden', index !== 0);
      slideEl.setAttribute('data-slide-index', index);
      return slideEl;
    });

    this.slideElements.forEach(el => this.carousel.appendChild(el));

    // Create navigation arrows (desktop only)
    this.prevBtn = document.createElement('button');
    this.prevBtn.className = 'hero-carousel__nav hero-carousel__nav--prev';
    this.prevBtn.setAttribute('aria-label', 'Previous slide');
    this.prevBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    this.nextBtn = document.createElement('button');
    this.nextBtn.className = 'hero-carousel__nav hero-carousel__nav--next';
    this.nextBtn.setAttribute('aria-label', 'Next slide');
    this.nextBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    this.carousel.appendChild(this.prevBtn);
    this.carousel.appendChild(this.nextBtn);

    // Create pagination dots
    this.dotsContainer = document.createElement('div');
    this.dotsContainer.className = 'hero-carousel__dots';
    this.dotsContainer.setAttribute('role', 'tablist');
    this.dotsContainer.setAttribute('aria-label', 'Slide indicators');

    this.dotElements = this.slides.map((_, index) => {
      const dot = document.createElement('button');
      dot.className = `hero-carousel__dot${index === 0 ? ' is-active' : ''}`;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', index === 0);
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.setAttribute('data-dot-index', index);
      if (index === 0) dot.setAttribute('tabindex', '0');
      else dot.setAttribute('tabindex', '-1');
      return dot;
    });

    this.dotElements.forEach(el => this.dotsContainer.appendChild(el));
    this.carousel.appendChild(this.dotsContainer);

    // Re-append gradient on top
    const gradient = this.hero.querySelector('.hero__gradient');
    if (gradient) {
      this.carousel.appendChild(gradient);
    }

    this.bgContainer.appendChild(this.carousel);

    // Update background-attachment for carousel slides
    this.updateBackgroundAttachment();
  }

  updateBackgroundAttachment() {
    // Carousel slides should use fixed attachment for the magazine-cover effect
    this.slideElements.forEach(slide => {
      slide.style.backgroundAttachment = 'fixed';
      slide.style.backgroundSize = 'cover';
      slide.style.backgroundPosition = 'center';
      slide.style.backgroundRepeat = 'no-repeat';
    });
  }

  bindEvents() {
    // Navigation arrows
    this.prevBtn.addEventListener('click', () => this.goToPrev());
    this.nextBtn.addEventListener('click', () => this.goToNext());

    // Dots
    this.dotElements.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });

    // Keyboard navigation
    this.hero.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Pause autoplay on hover/focus
    this.hero.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.hero.addEventListener('mouseleave', () => this.resumeAutoplay());
    this.hero.addEventListener('focusin', () => this.pauseAutoplay());
    this.hero.addEventListener('focusout', () => this.resumeAutoplay());

    // Touch/swipe support
    this.bindTouchEvents();

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.pauseAutoplay();
      else this.resumeAutoplay();
    });
  }

  bindTouchEvents() {
    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    this.hero.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = true;
      this.pauseAutoplay();
    }, { passive: true });

    this.hero.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;
      // Only prevent scroll if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        e.preventDefault();
      }
    }, { passive: false });

    this.hero.addEventListener('touchend', (e) => {
      if (!isSwiping) return;
      isSwiping = false;
      const deltaX = e.changedTouches[0].clientX - startX;
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) this.goToPrev();
        else this.goToNext();
      }
      this.scheduleAutoplayResume();
    }, { passive: true });
  }

  handleKeydown(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.goToPrev();
      this.onUserInteraction();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.goToNext();
      this.onUserInteraction();
    }
  }

  goToPrev() {
    if (this.isTransitioning) return;
    const newIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(newIndex);
  }

  goToNext() {
    if (this.isTransitioning) return;
    const newIndex = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(newIndex);
  }

  goToSlide(index) {
    if (this.isTransitioning || index === this.currentIndex) return;
    this.isTransitioning = true;
    this.onUserInteraction();

    // Update slide states
    this.slideElements[this.currentIndex].classList.remove('is-active');
    this.slideElements[this.currentIndex].setAttribute('aria-hidden', 'true');
    this.slideElements[index].classList.add('is-active');
    this.slideElements[index].setAttribute('aria-hidden', 'false');

    // Update dot states
    this.dotElements[this.currentIndex].classList.remove('is-active');
    this.dotElements[this.currentIndex].setAttribute('aria-selected', 'false');
    this.dotElements[this.currentIndex].setAttribute('tabindex', '-1');
    this.dotElements[index].classList.add('is-active');
    this.dotElements[index].setAttribute('aria-selected', 'true');
    this.dotElements[index].setAttribute('tabindex', '0');
    this.dotElements[index].focus({ preventScroll: true });

    this.currentIndex = index;

    // Reset transition lock after fade duration
    setTimeout(() => {
      this.isTransitioning = false;
    }, 1000);
  }

  onUserInteraction() {
    this.userInteracted = true;
    this.pauseAutoplay();
    this.scheduleAutoplayResume();
  }

  scheduleAutoplayResume() {
    clearTimeout(this.interactionTimer);
    this.interactionTimer = setTimeout(() => {
      this.userInteracted = false;
      this.resumeAutoplay();
    }, 8000); // Resume after 8 seconds of inactivity
  }

  startAutoplay() {
    this.autoplayTimer = setInterval(() => {
      if (!this.autoplayPaused && !this.userInteracted && !this.isTransitioning) {
        this.goToNext();
      }
    }, 6000); // 6 seconds per slide
  }

  pauseAutoplay() {
    this.autoplayPaused = true;
  }

  resumeAutoplay() {
    this.autoplayPaused = false;
  }

  async handleResize() {
    // Re-discover slides for new orientation
    const oldSlidesCount = this.slides.length;
    await this.discoverSlides();
    if (this.slides.length !== oldSlidesCount || this.slides.length > 1) {
      this.rebuildCarousel();
    }
  }

  rebuildCarousel() {
    // Save current index relative to new slides
    const oldIndex = this.currentIndex;
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Clear autoplay timer
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
    if (this.interactionTimer) {
      clearTimeout(this.interactionTimer);
      this.interactionTimer = null;
    }

    // Safely remove existing carousel
    if (this.carousel) {
      this.carousel.remove();
      this.carousel = null;
    }

    // Rebuild
    this.buildCarousel();

    // Only bind events and start autoplay if multiple slides
    if (this.slides.length > 1) {
      this.bindEvents();
      this.startAutoplay();
    }

    // Go to closest matching slide
    if (oldIndex < this.slides.length) {
      this.goToSlide(oldIndex);
    }
  }
}

if (document.body.classList.contains('page-home')) {
  document.addEventListener('DOMContentLoaded', () => new HomePage());
}