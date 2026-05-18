// Ashoka House — Homepage

class HomePage {
  constructor() {
    this.events = [];
    this.achievements = [];
    this.standings = [];
    this.leadership = [];
    this.gallery = [];
    this.init();
  }

  async init() {
    const [eventsData, achievementsData, standingsData, leadershipData, galleryData] =
      await Promise.all([
        AshokaAPI.fetchJSON('./data/events.json'),
        AshokaAPI.fetchJSON('./data/achievements.json'),
        AshokaAPI.fetchJSON('./data/standings.json'),
        AshokaAPI.fetchJSON('./data/leadership.json'),
        AshokaAPI.fetchJSON('./data/gallery.json')
      ]);

    this.events = eventsData?.events || [];
    this.achievements = achievementsData?.achievements || [];
    this.standings = standingsData?.standings || [];
    this.leadership = leadershipData?.leadership || [];
    this.gallery = galleryData?.items || [];

    this.renderHeroEvent();
    this.renderFeaturedEvent();
    this.renderAchievementsPreview();
    this.renderStandingsPreview();
    this.renderLeadershipPreview();
    this.renderGalleryGlimpse();
  }

  getFeaturedEvent() {
    const ongoing = this.events.filter((e) => e.status === 'ongoing');
    if (ongoing.length) return ongoing[0];
    const upcoming = this.events.filter((e) => e.status === 'upcoming');
    return upcoming.sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    )[0];
  }

  renderHeroEvent() {
    const container = AshokaAPI.qs('[data-hero-event]');
    if (!container) return;

    const event = this.getFeaturedEvent();
    if (!event) {
      container.hidden = true;
      return;
    }

    container.innerHTML = `
      <span class="hero__event-label">Upcoming focus</span>
      <span class="hero__event-title">${event.name}</span>
      <span class="hero__event-date">${AshokaAPI.formatDate(event.startDate)} · ${AshokaAPI.capitalize(event.category)}</span>
    `;
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

  renderAchievementsPreview() {
    const container = AshokaAPI.qs('[data-home-achievements]');
    if (!container) return;

    const items = this.achievements
      .filter((a) => a.house === 'Ashoka' || a.featured)
      .slice(0, 2);

    if (!items.length) {
      container.innerHTML = '<p class="empty-state">No achievements to display.</p>';
      return;
    }

    container.innerHTML = items
      .map(
        (item) => `
      <article class="card">
        <p class="eyebrow card__eyebrow">Recognition</p>
        <h3 class="card-title card__title">${item.title}</h3>
        <p class="body-md card__desc">${item.description}</p>
        <p class="caption card__foot">${AshokaAPI.formatDate(item.date)} · ${item.recipient}</p>
      </article>
    `
      )
      .join('');
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
}

if (document.body.classList.contains('page-home')) {
  document.addEventListener('DOMContentLoaded', () => new HomePage());
}
