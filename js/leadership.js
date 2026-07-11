// Ashoka House — Leadership page renderer and accordion system

const LeadershipPage = {
  container: null,
  sections: [],

  async init() {
    if (!document.querySelector('.page-leadership')) return;

    document.addEventListener('DOMContentLoaded', async () => {
      this.container = document.querySelector('.leadership-content');
      if (!this.container) return;

      const data = await AshokaAPI.fetchJSON('./data/leadership.json');
      if (!data || !Array.isArray(data.leadership)) {
        this.container.innerHTML = '<div class="leadership-empty body-copy">Leadership information could not be loaded.</div>';
        return;
      }

      this.sections = data.leadership;
      this.render();
      this.bindEvents();
    });
  },

  render() {
    this.container.innerHTML = this.sections.map(section => this.renderSection(section)).join('');
  },

  renderSection(section) {
    return `
      <div class="leadership-section" data-section-key="${section.key}">
        <div class="leadership-section-heading">
          <button class="leadership-section-toggle" type="button" aria-expanded="false" aria-controls="panel-${section.key}">
            <span>${section.section}</span>
            <span class="section-toggle-icon" aria-hidden="true">+</span>
          </button>
          <p class="leadership-section-summary body-copy">${section.description}</p>
        </div>
        <div id="panel-${section.key}" class="leadership-section-panel" role="region" aria-hidden="true">
          <div class="leadership-grid">
            ${section.cards.map(card => this.renderCard(card)).join('')}
          </div>
        </div>
      </div>
    `;
  },

  renderCard(card) {
    if (card.type === 'teacher') {
      return `
        <article class="leadership-card" data-card-id="${card.id}" aria-expanded="false">
          <button class="leadership-card__header" type="button" aria-controls="card-details-${card.id}" aria-expanded="false">
            <div class="leadership-card__main">
              <p class="leadership-card__name">${card.name}</p>
              <p class="leadership-card__designation">${card.designation}</p>
            </div>
            <span class="leadership-card__toggle" aria-hidden="true">+</span>
          </button>

          <div id="card-details-${card.id}" class="leadership-card__details" aria-hidden="true">
            <div class="leadership-card__detail-item">
              <span class="leadership-card__label">Subject</span>
              <span class="leadership-card__value">${card.subject}</span>
            </div>
            <div class="leadership-card__detail-item">
              <span class="leadership-card__label">Position</span>
              <span class="leadership-card__value">${card.position}</span>
            </div>
          </div>
        </article>
      `;
    }

    // Student card
    return `
      <article class="leadership-card" data-card-id="${card.id}" aria-expanded="false">
        <button class="leadership-card__header" type="button" aria-controls="card-details-${card.id}" aria-expanded="false">
          <div class="leadership-card__main">
            <p class="leadership-card__name">${card.name}</p>
            <p class="leadership-card__class">Class ${card.classYear}${card.section ? `-${card.section}` : ''}</p>
          </div>
          <span class="leadership-card__toggle" aria-hidden="true">+</span>
        </button>

        <div id="card-details-${card.id}" class="leadership-card__details" aria-hidden="true">
          <div class="leadership-card__detail-item">
            <span class="leadership-card__label">Position</span>
            <span class="leadership-card__value">${card.position}</span>
          </div>
        </div>
      </article>
    `;
  },

  bindEvents() {
    this.container.addEventListener('click', event => {
      const sectionToggle = event.target.closest('.leadership-section-toggle');
      if (sectionToggle) {
        const section = sectionToggle.closest('.leadership-section');
        const key = section?.dataset.sectionKey;
        if (key) this.toggleSection(key);
        return;
      }

      const cardSummary = event.target.closest('.leadership-card__header');
      if (cardSummary) {
        const card = cardSummary.closest('.leadership-card');
        if (card) this.toggleCard(card);
      }
    });
  },

  toggleSection(key) {
    const sections = this.container.querySelectorAll('.leadership-section');
    sections.forEach(section => {
      const isTarget = section.dataset.sectionKey === key;
      if (isTarget) {
        const isOpen = section.classList.contains('open');
        if (isOpen) {
          this.closeSection(section);
        } else {
          this.openSection(section);
        }
      } else {
        this.closeSection(section);
      }
    });

    this.closeAllCards();
  },

  openSection(section) {
    const panel = section.querySelector('.leadership-section-panel');
    const toggle = section.querySelector('.leadership-section-toggle');
    section.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
  },

  closeSection(section) {
    const panel = section.querySelector('.leadership-section-panel');
    const toggle = section.querySelector('.leadership-section-toggle');
    section.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
  },

  toggleCard(card) {
    const openCard = this.container.querySelector('.leadership-card.open');
    if (openCard && openCard !== card) {
      this.closeCard(openCard);
    }

    const isOpen = card.classList.toggle('open');
    const header = card.querySelector('.leadership-card__header');
    const details = card.querySelector('.leadership-card__details');

    header.setAttribute('aria-expanded', isOpen);
    card.setAttribute('aria-expanded', isOpen);
    details.setAttribute('aria-hidden', !isOpen);
  },

  closeCard(card) {
    const header = card.querySelector('.leadership-card__header');
    const details = card.querySelector('.leadership-card__details');
    card.classList.remove('open');
    header?.setAttribute('aria-expanded', 'false');
    card.setAttribute('aria-expanded', 'false');
    details?.setAttribute('aria-hidden', 'true');
  },

  closeAllCards() {
    const openCards = this.container.querySelectorAll('.leadership-card.open');
    openCards.forEach(card => this.closeCard(card));
  }
};

LeadershipPage.init();
