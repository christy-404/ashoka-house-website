// Ashoka House — Institutional Preloader

class PreloaderSystem {
  constructor() {
    this.root = document.documentElement;
    this.preloader = document.querySelector('.preloader');
    this.fill = document.querySelector('.preloader-fill');
    this.percentEl = document.querySelector('.preloader-percent');
    this.statusEl = document.querySelector('.preloader-status');

    this.progress = 0;
    this.step = 2;
    this.intervalMs = 72;
    this.pauseMin = 45;
    this.pauseMax = 55;
    this.isPaused = false;
    this.assetsReady = false;
    this.timer = null;

    this.statusMessages = [
      'Loading typefaces',
      'Preparing layout',
      'Rendering interface',
      'Finalizing presentation'
    ];

    this.init();
  }

  init() {
    this.root.classList.remove('loaded');
    this.startProgressLoop();

    this.prepareAssets().then(() => {
      this.assetsReady = true;
    });

    setTimeout(() => {
      if (!this.root.classList.contains('loaded')) {
        this.finish();
      }
    }, 10000);
  }

  async prepareAssets() {
    const fontReady =
      document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve();

    const images = Array.from(document.images || []);
    const imageReady = images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = resolve;
            img.onerror = resolve;
          }
        })
    );

    const layoutReady = new Promise((resolve) => {
      const check = () => {
        const hero = document.querySelector('.hero, .page-hero');
        const nav = document.querySelector('.navbar');
        if (hero && nav) resolve();
        else requestAnimationFrame(check);
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', check, { once: true });
      } else {
        check();
      }
    });

    await Promise.race([
      Promise.all([fontReady, layoutReady, ...imageReady]),
      new Promise((resolve) => setTimeout(resolve, 4000))
    ]);
  }

  startProgressLoop() {
    this.timer = setInterval(() => {
      if (this.isPaused) return;

      const next = this.progress + this.step;

      if (
        !this.assetsReady &&
        next >= this.pauseMin &&
        next <= this.pauseMax
      ) {
        this.pauseAt(next);
        return;
      }

      this.setProgress(next);

      if (next >= 100) {
        clearInterval(this.timer);
        setTimeout(() => this.finish(), 280);
      }
    }, this.intervalMs);
  }

  pauseAt(value) {
    this.isPaused = true;
    this.setProgress(value);
    this.updateStatus(value);

    const resume = () => {
      if (!this.assetsReady) {
        setTimeout(resume, 120);
        return;
      }
      this.isPaused = false;
    };

    setTimeout(resume, 400);
  }

  setProgress(value) {
    this.progress = Math.min(value, 100);

    if (this.fill) {
      this.fill.style.width = `${this.progress}%`;
    }

    if (this.percentEl) {
      this.percentEl.textContent = `${this.progress}%`;
    }

    this.updateStatus(this.progress);
  }

  updateStatus(progress) {
    if (!this.statusEl) return;

    let message = this.statusMessages[0];
    if (progress < 30) message = this.statusMessages[0];
    else if (progress < 55) message = this.statusMessages[1];
    else if (progress < 80) message = this.statusMessages[2];
    else message = this.statusMessages[3];

    this.statusEl.textContent = message;
  }

  finish() {
    this.setProgress(100);

    if (this.preloader) {
      this.preloader.classList.add('complete');
    }

    requestAnimationFrame(() => {
      this.root.classList.add('loaded');

      setTimeout(() => {
        this.preloader?.remove();
        document.body.style.overflow = '';
      }, 600);
    });
  }
}

if (document.querySelector('.preloader')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PreloaderSystem());
  } else {
    new PreloaderSystem();
  }
}
