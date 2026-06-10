'use strict';

// Stagger the feature list items in once the card is visible
(function () {
  var featureItems = document.querySelectorAll('.feature-item');

  if (!featureItems.length) return;

  // If IntersectionObserver is available, trigger when card scrolls into view
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          triggerFeatures();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    var card = document.querySelector('.status-card');
    if (card) observer.observe(card);
  } else {
    // Fallback: trigger after a short delay
    setTimeout(triggerFeatures, 900);
  }

  function triggerFeatures() {
    featureItems.forEach(function (item, index) {
      var delay = parseInt(item.getAttribute('data-delay') || index, 10);
      setTimeout(function () {
        item.classList.add('visible');
      }, 120 * delay + 200);
    });
  }
})();

// Subtle parallax on the ambient orb — adds depth without distraction
(function () {
  var orb = document.querySelector('.bg-orb');
  if (!orb) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  var ticking = false;

  document.addEventListener('mousemove', function (e) {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
      var yRatio = (e.clientY / window.innerHeight - 0.5) * 2;
      orb.style.transform = 'translateX(calc(-50% + ' + (xRatio * 18) + 'px)) translateY(' + (yRatio * 12) + 'px)';
      ticking = false;
    });
  });
})();

// Mark the current year dynamically if a year element exists in the footer
(function () {
  var yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();