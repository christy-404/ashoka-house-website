// Ashoka House — Core API (fetch + DOM helpers)

const AshokaAPI = {
  qs: (selector, root = document) => root.querySelector(selector),
  qsa: (selector, root = document) => [...root.querySelectorAll(selector)],

  async fetchJSON(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`AshokaAPI: failed to load ${url}`, error);
      return null;
    }
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};
