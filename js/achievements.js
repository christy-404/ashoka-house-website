// Ashoka House — Achievements page

class AchievementsPage {
  constructor() {
    this.achievements = [];
    this.category = 'all';
    this.root = AshokaAPI.qs('[data-achievements-root]');
    this.init();
  }

  async init() {
    const data = await AshokaAPI.fetchJSON('./data/achievements.json');
    this.achievements = data?.achievements || [];
    this.bindCategoryFilters();
    this.render();
  }

  bindCategoryFilters() {
    AshokaAPI.qsa('[data-category]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.category = btn.dataset.category;
        AshokaAPI.qsa('[data-category]').forEach((b) =>
          b.classList.toggle('is-active', b === btn)
        );
        this.root?.classList.toggle('is-filtered', this.category !== 'all');
        this.render();
      });
    });
  }

  getFiltered() {
    if (this.category === 'all') return this.achievements;
    return this.achievements.filter((a) => a.category === this.category);
  }

  getFeatured(list) {
    if (!list.length) return null;
    const featured = list.find((a) => a.featured);
    if (featured) return featured;
    const ashokaMajor = list.find(
      (a) => a.house === 'Ashoka' && a.tier === 'major' && a.type === 'house'
    );
    if (ashokaMajor) return ashokaMajor;
    return list[0];
  }

  formatCategory(category) {
    const labels = {
      sports: 'Sports',
      cultural: 'Cultural',
      academic: 'Academic',
      leadership: 'Leadership',
      house: 'House contributions'
    };
    return labels[category] || AshokaAPI.capitalize(category);
  }

  getYear(dateStr) {
    return new Date(dateStr).getFullYear();
  }

  itemsForTier(list, tierKey) {
    const withoutFeatured = (items) => {
      const featured = this.getFeatured(list);
      const id = featured?.id;
      return id ? items.filter((a) => a.id !== id) : items;
    };

    if (tierKey === 'individual') {
      return withoutFeatured(list.filter((a) => a.type === 'individual'));
    }

    return withoutFeatured(
      list.filter((a) => a.type === 'house' && a.tier === tierKey)
    );
  }

  renderFeatured(list) {
    const container = AshokaAPI.qs('[data-achievements-featured]');
    if (!container) return;

    const item = this.getFeatured(list);
    if (!item) {
      container.innerHTML = '<p class="empty-state">No achievements recorded yet.</p>';
      return;
    }

    const eventRow = item.event
      ? `<div class="achievement-card__meta-row">
          <span class="achievement-card__meta-label">Event</span>
          <span class="achievement-card__meta-value">${item.event}</span>
        </div>`
      : '';

    container.innerHTML = `
      <article class="card card--featured">
        <div class="achievements-featured__layout">
        <div>
          <span class="achievements-featured__badge">Featured recognition</span>
          <p class="eyebrow card__eyebrow" style="margin-top: var(--space-4);">${this.formatCategory(item.category)}</p>
          <h2 class="section-title card__title">${item.title}</h2>
          <p class="body-md card__desc">${item.description}</p>
          <dl class="meta-list">
            <div>
              <dt>Recipient</dt>
              <dd>${item.recipient}</dd>
            </div>
            <div>
              <dt>House</dt>
              <dd>${item.house} House</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>${AshokaAPI.formatDate(item.date)}</dd>
            </div>
          </dl>
          ${eventRow}
        </div>
        <div class="achievements-featured__date">
          ${AshokaAPI.formatDate(item.date)}
          <span class="achievements-featured__year">${this.getYear(item.date)}</span>
        </div>
        </div>
      </article>
    `;
  }

  renderCard(item) {
    const tierBadge =
      item.tier === 'hall'
        ? '<span class="achievement-card__badge">Legacy</span>'
        : '';

    const eventRow = item.event
      ? `<div class="achievement-card__meta-row">
          <span class="achievement-card__meta-label">Event</span>
          <span class="achievement-card__meta-value">${item.event}</span>
        </div>`
      : '';

    return `
      <article class="achievement-card">
        <div class="achievement-card__top">
          <span class="tag tag--category">${this.formatCategory(item.category)}</span>
          ${tierBadge}
        </div>
        <h3 class="achievement-card__title">${item.title}</h3>
        <p class="achievement-card__recipient">${item.recipient}</p>
        <p class="achievement-card__desc">${item.description}</p>
        <div class="achievement-card__meta">
          <div class="achievement-card__meta-row">
            <span class="achievement-card__meta-label">Date</span>
            <span class="achievement-card__meta-value">${AshokaAPI.formatDate(item.date)}</span>
          </div>
          <div class="achievement-card__meta-row">
            <span class="achievement-card__meta-label">House</span>
            <span class="achievement-card__meta-value">${item.house} House</span>
          </div>
          ${eventRow}
        </div>
      </article>
    `;
  }

  renderTier(tierKey, list) {
    const section = AshokaAPI.qs(`[data-tier-section="${tierKey}"]`);
    const grid = AshokaAPI.qs(`[data-achievements-grid="${tierKey}"]`);
    const countEl = AshokaAPI.qs(`[data-tier-count="${tierKey}"]`);

    if (!section || !grid) return;

    const items = this.itemsForTier(list, tierKey).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    section.classList.toggle('is-empty', items.length === 0);

    if (countEl) {
      countEl.textContent =
        items.length === 1 ? '1 entry' : `${items.length} entries`;
    }

    grid.innerHTML =
      items.length === 0
        ? ''
        : items.map((item) => this.renderCard(item)).join('');
  }

  render() {
    const list = this.getFiltered();
    const tiers = ['recent', 'major', 'hall', 'individual'];

    const hasVisible = tiers.some(
      (tier) => this.itemsForTier(list, tier).length > 0
    );

    const emptyEl = AshokaAPI.qs('[data-achievements-empty]');
    if (emptyEl) {
      emptyEl.hidden = hasVisible || list.length > 0;
    }

    this.renderFeatured(list);
    tiers.forEach((tier) => this.renderTier(tier, list));
  }
}

if (document.body.classList.contains('page-achievements')) {
  document.addEventListener('DOMContentLoaded', () => new AchievementsPage());
}
