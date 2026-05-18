// Ashoka House — Global Preloader System
// Elegant preloader with smart loading detection

class AshokaPreloader {
  constructor() {
    this.preloader = document.querySelector('.preloader');
    this.progressBar = document.querySelector('.preloader__progress-bar');
    this.percentDisplay = document.querySelector('.preloader__percent');
    this.progress = 0;
    this.targetProgress = 0;
    this.isComplete = false;
    
    if (!this.preloader) return;
    
    this.init();
  }

  init() {
    // Start loading animation
    this.startSimulatedProgress();
    
    // Listen for page ready signals
    this.detectPageReady();
    
    // Ensure preloader stays at least 800ms
    this.minDisplayTime = new Promise(resolve => 
      setTimeout(resolve, 800)
    );
  }

  startSimulatedProgress() {
    // Increment by 2 every 80-150ms for smooth, intentional feel
    this.progressInterval = setInterval(() => {
      if (this.isComplete) {
        clearInterval(this.progressInterval);
        return;
      }

      // Slow down as we approach 90%
      let increment;
      if (this.progress < 30) {
        increment = 2;
      } else if (this.progress < 70) {
        increment = Math.random() > 0.7 ? 2 : 0;
      } else if (this.progress < 90) {
        increment = Math.random() > 0.9 ? 2 : 0;
      } else {
        increment = 0; // Stay at 90% until page is ready
      }

      this.setProgress(this.progress + increment);
    }, 110);
  }

  detectPageReady() {
    Promise.all([
      this.waitForDOM(),
      this.waitForFonts(),
      this.waitForCriticalAssets(),
    ]).then(() => {
      this.completeLoading();
    });
  }

  waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  waitForFonts() {
    return new Promise(resolve => {
      if ('fonts' in document) {
        document.fonts.ready.then(resolve);
      } else {
        // Fallback: wait 1s if fonts API not available
        setTimeout(resolve, 1000);
      }
    });
  }

  waitForCriticalAssets() {
    return new Promise(resolve => {
      // Wait for critical elements
      const navbar = document.querySelector('.navbar');
      const hero = document.querySelector('.page-hero, .hero');
      
      const checkReady = () => {
        // Check if critical elements are rendered and stable
        if (navbar && hero) {
          // Allow layout to stabilize
          setTimeout(resolve, 200);
        } else {
          setTimeout(checkReady, 100);
        }
      };

      // Start checking after DOM is ready
      if (document.readyState !== 'loading') {
        checkReady();
      } else {
        document.addEventListener('DOMContentLoaded', checkReady);
      }
    });
  }

  setProgress(value) {
    this.progress = Math.min(Math.max(value, 0), 100);
    
    if (this.progressBar) {
      this.progressBar.style.width = `${this.progress}%`;
    }
    
    if (this.percentDisplay) {
      this.percentDisplay.textContent = `${this.progress}%`;
    }
  }

  completeLoading() {
    clearInterval(this.progressInterval);
    
    // Animate to 100
    this.animateToCompletion();
  }

  animateToCompletion() {
    Promise.resolve(this.minDisplayTime).then(() => {
      // Complete progress bar
      this.setProgress(100);
      this.isComplete = true;
      
      // Small delay before fade out
      setTimeout(() => {
        this.fadeOut();
      }, 200);
    });
  }

  fadeOut() {
    if (!this.preloader) return;
    
    this.preloader.classList.add('is-hidden');
    
    // Remove from DOM after animation
    setTimeout(() => {
      this.preloader.remove();
    }, 600);
  }
}

// Initialize preloader when DOM is ready
if (document.querySelector('.preloader')) {
  document.addEventListener('DOMContentLoaded', () => {
    new AshokaPreloader();
  });
  
  // Fallback initialization if already loaded
  if (document.readyState !== 'loading') {
    new AshokaPreloader();
  }
}
