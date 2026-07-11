// Ashoka House — Standings page

class StandingsPage {
  constructor() {
    this.standings = [];
    this.highlights = [];
    this.init();
  }

  async init() {
    const data = await AshokaAPI.fetchJSON('./data/standings.json');
    this.standings = (data?.standings || []).sort((a, b) => a.rank - b.rank);
    this.highlights = data?.highlights || [];
    this.render();
  }

  renderFeatured() {
    const container = AshokaAPI.qs('[data-standings-featured]');
    if (!container) return;

    const allZeros = this.standings.length && this.standings.every((row) => row.points === 0 && row.eventsParticipated === 0);
    if (allZeros) {
      container.innerHTML = `
        <article class="card card--featured standings-featured__layout">
          <div class="standings-featured__rank">
            &mdash;
            <span>Status</span>
          </div>
          <div>
            <div class="standings-featured__house status-main">
              <span class="standings-featured__dot" style="--house-color: #b2b2b2"></span>
              <div>
                <p class="eyebrow card__eyebrow standings-featured__status-label">CURRENT STATUS</p>
                <h2 class="standings-featured__name standings-featured__status-title">Standings Yet To Begin</h2>
              </div>
            </div>
          </div>
          <div class="standings-featured__points">
            <p class="standings-featured__points-value">0</p>
            <p class="standings-featured__points-label">Total points</p>
          </div>
        </article>
      `;
      return;
    }

    const leader = this.standings[0];
    if (!leader) {
      container.innerHTML = '<p class="empty-state">Standings unavailable.</p>';
      return;
    }

    container.innerHTML = `
      <article class="card card--featured standings-featured__layout">
        <div class="standings-featured__rank">
          ${leader.rank}
          <span>Rank</span>
        </div>
        <div>
          <div class="standings-featured__house">
            <span class="standings-featured__dot" style="--house-color: ${leader.color}"></span>
            <div>
              <p class="eyebrow card__eyebrow">Leading house</p>
              <h2 class="standings-featured__name">${leader.house} House</h2>
            </div>
          </div>
        </div>
        <div class="standings-featured__points">
          <p class="standings-featured__points-value">${leader.points.toLocaleString('en-IN')}</p>
          <p class="standings-featured__points-label">Total points</p>
        </div>
      </article>
    `;
  }

  renderTable() {
    const tbody = AshokaAPI.qs('[data-standings-table]');
    if (!tbody) return;

    tbody.innerHTML = this.standings
      .map(
        (row) => `
      <tr class="${row.house === 'Ashoka' ? 'is-ashoka' : ''}">
        <td class="col-rank" data-label="Rank">${row.rank}</td>
        <td class="col-house" data-label="House">
          <span class="house-cell">
            <span class="house-dot" style="--house-color: ${row.color}"></span>
            ${row.house}
          </span>
        </td>
        <td class="col-points" data-label="Points">${row.points.toLocaleString('en-IN')}</td>
        <td class="col-events" data-label="Events">${row.eventsParticipated}</td>
      </tr>
    `
      )
      .join('');
  }

  renderSummary() {
    const container = AshokaAPI.qs('[data-standings-summary]');
    if (!container || !this.highlights.length) {
      container?.closest('.standings-summary')?.remove();
      return;
    }

    container.innerHTML = this.highlights
      .map(
        (item) => `
      <article class="standings-summary__item">
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </article>
    `
      )
      .join('');
  }

  render() {
    this.renderFeatured();
    this.renderTable();
    this.renderSummary();
  }
}

if (document.body.classList.contains('page-standings')) {
  document.addEventListener('DOMContentLoaded', () => new StandingsPage());
}
