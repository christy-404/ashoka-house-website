// ==========================================
// ASHOKA HOUSE - ELEGANT PRELOADER SYSTEM
// Cinematic Loading Experience
// ==========================================

class PreloaderSystem {
  constructor() {
    this.preloader = document.querySelector('.preloader');
    this.progressFill = document.querySelector('.preloader-bar');
    this.progressText = document.querySelector('.preloader-percent');
    this.statusText = document.querySelector('.preloader-status');

    this.currentProgress = 0;
    this.targetProgress = 100;
    this.stepSize = 2;
    this.intervalMs = 64; // Reduced by 20% from 80ms
    this.pauseRange = { min: 45, max: 55 };
    this.isPaused = false;
    this.pauseDuration = 960; // Reduced by 20% from 1200ms

    this.statusMessages = [
      'Initializing institutional systems...',
      'Loading competition database...',
      'Synchronizing leadership network...',
      'Calibrating command interface...',
      'Rendering operational displays...',
      'Establishing secure connections...',
      'Finalizing system orchestration...'
    ];

    this.init();
  }

  init() {
    // Keep page visible under the overlay; the preloader covers the full viewport.
    document.documentElement.style.opacity = '1';
    document.documentElement.style.visibility = 'visible';

    // Safety timeout - force completion after 8 seconds
    setTimeout(() => {
      if (!document.documentElement.classList.contains('loaded')) {
        console.warn('Preloader safety timeout triggered');
        this.complete();
      }
    }, 8000);

    // Start loading sequence
    this.startLoading();

    // Prepare critical assets
    this.prepareAssets().then(() => {
      this.beginProgression();
    });
  }

  async prepareAssets() {
    // Wait for fonts
    const fontReady = document.fonts && document.fonts.ready
      ? document.fonts.ready
      : Promise.resolve();

    // Wait for images
    const images = Array.from(document.images || []);
    const imagePromises = images.map(img =>
      new Promise(resolve => {
        if (img.complete) resolve();
        else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      })
    );

    // Check for critical elements (non-blocking)
    const criticalElements = ['.navbar', '.hero'];
    const elementPromises = criticalElements.map(selector =>
      new Promise(resolve => {
        const checkElement = () => {
          if (document.querySelector(selector)) {
            resolve();
          } else {
            // Try again after a short delay, but don't recurse infinitely
            setTimeout(() => {
              if (document.querySelector(selector)) {
                resolve();
              } else {
                resolve(); // Resolve anyway to prevent hanging
              }
            }, 100);
          }
        };
        checkElement();
      })
    );

    // Combine all readiness checks with shorter timeout
    await Promise.race([
      Promise.all([fontReady, ...imagePromises, ...elementPromises]),
      new Promise(resolve => setTimeout(resolve, 1500)) // Reduced from 3000ms
    ]);
  }

  startLoading() {
    // Make preloader visible
    if (this.preloader) {
      this.preloader.style.opacity = '1';
      this.preloader.style.visibility = 'visible';
    }

    // Update status initially
    this.updateStatus(0);
  }

  beginProgression() {
    const progressInterval = setInterval(() => {
      if (this.isPaused) return;

      this.currentProgress += this.stepSize;

      // Check if we should pause
      if (this.currentProgress >= this.pauseRange.min && this.currentProgress <= this.pauseRange.max && !this.isPaused) {
        this.pauseProgression();
        return;
      }

      // Update progress
      this.updateProgress(this.currentProgress);

      // Check completion
      if (this.currentProgress >= this.targetProgress) {
        clearInterval(progressInterval);
        setTimeout(() => this.complete(), 300);
      }
    }, this.intervalMs);
  }

  pauseProgression() {
    this.isPaused = true;
    this.updateStatus(this.currentProgress);

    setTimeout(() => {
      this.isPaused = false;
      this.updateStatus(this.currentProgress);
    }, this.pauseDuration);
  }

  updateProgress(progress) {
    const clampedProgress = Math.min(progress, 100);

    if (this.progressFill) {
      this.progressFill.style.width = `${clampedProgress}%`;
    }

    if (this.progressText) {
      this.progressText.textContent = `${clampedProgress}%`;
    }

    this.updateStatus(clampedProgress);
  }

  updateStatus(progress) {
    if (!this.statusText) return;

    let message = 'Initializing systems...';

    if (progress < 20) {
      message = this.statusMessages[0];
    } else if (progress < 40) {
      message = this.statusMessages[1];
    } else if (progress < 60) {
      message = this.statusMessages[2];
    } else if (progress < 80) {
      message = this.statusMessages[3];
    } else if (progress < 100) {
      message = this.statusMessages[4];
    } else {
      message = 'System ready';
    }

    this.statusText.textContent = message;
  }

  complete() {
    // Mark as complete
    if (this.preloader) {
      this.preloader.classList.add('complete');
    }

    // Reveal the page
    setTimeout(() => {
      document.documentElement.style.opacity = '1';
      document.documentElement.style.visibility = 'visible';
      document.documentElement.classList.add('loaded');

      // Remove preloader
      if (this.preloader) {
        this.preloader.remove();
      }
    }, 600);
  }
}

// Initialize preloader
if (document.querySelector('.preloader')) {
  document.addEventListener('DOMContentLoaded', () => {
    new PreloaderSystem();
  });
}

console.log('%cAshoka House - Elegant Preloader Initialized', 'color: #1a6b5a; font-weight: bold;');