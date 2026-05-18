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
          <p class="standings-featured__statement">${leader.statement}</p>
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
        <td class="col-rank">${row.rank}</td>
        <td class="col-house">
          <span class="house-cell">
            <span class="house-dot" style="--house-color: ${row.color}"></span>
            ${row.house}
          </span>
        </td>
        <td class="col-points">${row.points.toLocaleString('en-IN')}</td>
        <td class="col-events">${row.eventsParticipated}</td>
        <td class="col-wins">${row.majorWins}</td>
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
