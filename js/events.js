// Ashoka House — Events page

class EventsPage {
  constructor() {
    this.events = [];
    this.category = 'all';
    this.root = AshokaAPI.qs('[data-events-root]');
    this.init();
  }

  async init() {
    const data = await AshokaAPI.fetchJSON('./data/events.json');
    this.events = data?.events || [];

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

  getFilteredEvents() {
    if (this.category === 'all') return this.events;

    if (this.category === 'house') {
      return this.events.filter((e) => e.category === 'house');
    }

    return this.events.filter((e) => e.category === this.category);
  }

  getFeaturedEvent(events) {
    if (!events.length) return null;

    const upcoming = events
      .filter((e) => e.status === 'upcoming')
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    if (upcoming.length) return upcoming[0];

    const ongoing = events.filter((e) => e.status === 'ongoing');
    if (ongoing.length) return ongoing[0];

    return events[0];
  }

  formatDateRange(event) {
    const start = AshokaAPI.formatDate(event.startDate);
    const end = AshokaAPI.formatDate(event.endDate);
    if (start === end) return start;
    return `${start} – ${end}`;
  }

  formatCategory(category) {
    const labels = {
      sports: 'Sports',
      cultural: 'Cultural',
      academic: 'Academic',
      literary: 'Literary',
      house: 'House activities'
    };
    return labels[category] || AshokaAPI.capitalize(category);
  }

  statusTagClass(status) {
    return `tag tag--status tag--${status}`;
  }

  renderFeatured(events) {
    const container = AshokaAPI.qs('[data-events-featured]');
    if (!container) return;

    const event = this.getFeaturedEvent(events);
    if (!event) {
      container.innerHTML = '<p class="empty-state">No events scheduled.</p>';
      return;
    }

    const venue = event.venue
      ? `<p class="events-featured__venue">${event.venue}</p>`
      : '';

    const cta = event.registrationUrl
      ? `<a href="${event.registrationUrl}" class="btn btn--primary">Register</a>`
      : '';

    container.innerHTML = `
      <article class="card card--featured">
        <div class="events-featured__main">
          <p class="eyebrow card__eyebrow">Featured · ${this.formatCategory(event.category)}</p>
          <h2 class="section-title card__title">${event.name}</h2>
          <p class="body-md card__desc">${event.description}</p>
          <dl class="meta-list">
            <div>
              <dt>Status</dt>
              <dd><span class="${this.statusTagClass(event.status)}">${AshokaAPI.capitalize(event.status)}</span></dd>
            </div>
            <div>
              <dt>Schedule</dt>
              <dd>${this.formatDateRange(event)}</dd>
            </div>
            <div>
              <dt>Houses</dt>
              <dd>${(event.houses || []).join(', ')}</dd>
            </div>
          </dl>
          ${cta}
        </div>
        <aside class="events-featured__aside">
          <p class="events-featured__date">${AshokaAPI.formatDate(event.startDate)}</p>
          ${venue}
        </aside>
      </article>
    `;
  }

  renderCard(event) {
    const venueRow = event.venue
      ? `<div class="event-card__meta-row">
          <span class="event-card__meta-label">Venue</span>
          <span class="event-card__meta-value">${event.venue}</span>
        </div>`
      : '';

    const winner =
      event.status === 'completed' && event.winner
        ? `<p class="event-card__winner">Winner · ${event.winner} House</p>`
        : '';

    const cta = event.registrationUrl
      ? `<div class="event-card__cta">
          <a href="${event.registrationUrl}" class="btn btn--primary">Register</a>
        </div>`
      : '';

    return `
      <article class="event-card" data-event-id="${event.id}">
        <div class="event-card__top">
          <span class="tag tag--category">${this.formatCategory(event.category)}</span>
          <span class="${this.statusTagClass(event.status)}">${AshokaAPI.capitalize(event.status)}</span>
        </div>
        <h3 class="event-card__title">${event.name}</h3>
        <p class="event-card__desc">${event.description}</p>
        <div class="event-card__meta">
          <div class="event-card__meta-row">
            <span class="event-card__meta-label">Date</span>
            <span class="event-card__meta-value">${this.formatDateRange(event)}</span>
          </div>
          ${venueRow}
        </div>
        ${winner}
        ${cta}
      </article>
    `;
  }

  renderStatusSection(status, events) {
    const section = AshokaAPI.qs(`[data-status-section="${status}"]`);
    const grid = AshokaAPI.qs(`[data-events-grid="${status}"]`);
    const countEl = AshokaAPI.qs(`[data-status-count="${status}"]`);

    if (!section || !grid) return;

    const items = events
      .filter((e) => e.status === status)
      .sort((a, b) => {
        if (status === 'upcoming') {
          return new Date(a.startDate) - new Date(b.startDate);
        }
        if (status === 'completed') {
          return new Date(b.endDate) - new Date(a.endDate);
        }
        return 0;
      });

    section.classList.toggle('is-empty', items.length === 0);

    if (countEl) {
      countEl.textContent =
        items.length === 1 ? '1 event' : `${items.length} events`;
    }

    if (items.length === 0) {
      grid.innerHTML = '';
      return;
    }

    grid.innerHTML = items.map((e) => this.renderCard(e)).join('');
  }

  render() {
    const events = this.getFilteredEvents();
    const featured = this.getFeaturedEvent(events);
    const featuredId = featured?.id;

    const listEvents = featuredId
      ? events.filter((e) => e.id !== featuredId)
      : events;

    const emptyEl = AshokaAPI.qs('[data-events-empty]');
    const hasInStatus = ['ongoing', 'upcoming', 'completed'].some((s) =>
      listEvents.some((e) => e.status === s)
    );

    if (emptyEl) {
      emptyEl.hidden = hasInStatus || events.length > 0;
    }

    this.renderFeatured(events);

    ['ongoing', 'upcoming', 'completed'].forEach((status) =>
      this.renderStatusSection(status, listEvents)
    );
  }
}

if (document.body.classList.contains('page-events')) {
  document.addEventListener('DOMContentLoaded', () => new EventsPage());
}
