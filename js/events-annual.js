// Ashoka House — Annual Event Schedule
// Renders under the existing Upcoming Events section on events.html

class EventsAnnualSchedule {
  constructor() {
    this.events = [];
    this.root = AshokaAPI.qs('[data-events-root]');
    this.init();
  }

  async init() {
    const data = await AshokaAPI.fetchJSON('./data/events.json');
    this.events = data?.events || [];

    this.renderAnnualSchedule();
  }

  getAnnualEvents() {
    // Annual schedule includes ALL events (upcoming flag ignored).
    return (this.events || []).filter((e) => e && e.month);
  }

  getMonthSortKey(month) {
    const m = (month || '').trim().toLowerCase();
    const map = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12
    };

    return map[m] || 999;
  }

  formatMonthLabel(month) {
    return (month || '').trim().toUpperCase();
  }

  formatDayOrDash(event) {
    const raw = (event?.day ?? event?.date ?? '').toString().trim();
    if (!raw || raw === 'null' || raw === 'undefined') return '—';

    // If day is not a number, still display it as-is (but unknown day must show —)
    if (raw.length === 0) return '—';
    return raw;
  }

  getDaySortValue(event) {
    const raw = (event?.day ?? event?.date ?? '').toString().trim();
    if (!raw || raw === 'null' || raw === 'undefined') return Number.POSITIVE_INFINITY;
    const n = Number(raw);
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
  }

  escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '<')
      .replaceAll('>', '>')
      .replaceAll('"', '"')
      .replaceAll("'", '&#039;');
  }

  renderAnnualSchedule() {
    if (!this.root) return;

    const annual = this.getAnnualEvents();

    const sectionTitle = 'Annual Event Schedule';
    const subtitle = 'Official calendar of inter-house activities for the current academic year.';

    if (!annual.length) {
      // Compact empty state similar height as Upcoming empty state container.
      this.root.insertAdjacentHTML(
        'beforeend',
        `
          <section class="page-section events-annual" aria-label="Annual event schedule">
            <div class="container">
              <header class="section-header events-annual__header">
                <p class="eyebrow">Calendar</p>
                <h2 class="section-title">${this.escapeHtml(sectionTitle)}</h2>
                <p class="body-md">${this.escapeHtml(subtitle)}</p>
              </header>

              <div class="events-annual__scroll" role="region" aria-label="Annual event schedule empty">
                <div class="events-annual__empty">No annual events have been added yet.</div>
              </div>
            </div>
          </section>
        `
      );
      return;
    }

    // Group by month
    const monthGroups = new Map();
    for (const e of annual) {
      const month = (e?.month || '').trim();
      const key = month.toLowerCase();
      if (!monthGroups.has(key)) monthGroups.set(key, []);
      monthGroups.get(key).push(e);
    }

    const sortedMonths = [...monthGroups.keys()].sort(
      (a, b) => this.getMonthSortKey(a) - this.getMonthSortKey(b)
    );

    const monthBlocks = sortedMonths
      .map((monthKey) => {
        const group = monthGroups.get(monthKey) || [];

        // Sort chronologically: unknown day => bottom
        const sortedGroup = group
          .slice()
          .sort((a, b) => this.getDaySortValue(a) - this.getDaySortValue(b));

        const monthLabel = this.formatMonthLabel(monthKey);

        const rows = sortedGroup
          .map((e) => {
            const day = this.formatDayOrDash(e);
            const title = this.escapeHtml(e?.title || '');
            return `
              <tr class="events-annual__row">
                <td class="events-annual__date" aria-label="Date">${this.escapeHtml(day)}</td>
                <td class="events-annual__event" aria-label="Event title">${title}</td>
              </tr>
            `;
          })
          .join('');

        return `
          <div class="events-annual__month-block" aria-label="${monthLabel}">
            <div class="events-annual__month-divider" aria-hidden="true"></div>
            <h3 class="events-annual__month-title">${this.escapeHtml(monthLabel)}</h3>
            <table class="events-annual__table" role="presentation">
              <thead>
                <tr>
                  <th class="events-annual__th-date" scope="col">Date</th>
                  <th class="events-annual__th-event" scope="col">Event</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        `;
      })
      .join('');

    this.root.insertAdjacentHTML(
      'beforeend',
      `
        <section class="page-section events-annual" aria-label="Annual event schedule">
          <div class="container">
            <header class="section-header events-annual__header">
              <p class="eyebrow">Calendar</p>
              <h2 class="section-title">Annual CCA Event Schedule</h2>
              <p class="body-md">${this.escapeHtml(subtitle)}</p>
              <p class="events-annual__notice">
                <em>This schedule is subject to change based on official school announcements and administrative decisions.</em>
              </p>
              <div class="events-annual__official">
                <span class="events-annual__official-label">Official Schedule</span>
                <a
                  class="events-annual__official-link"
                  href="assets/uploadfiles/cla_schedule_secondary_section_2026.docx"
                  target="_blank"
                  rel="noopener noreferrer"
                >View the officially released event calendar →</a>
              </div>
            </header>

            <div class="events-annual__scroll" role="region" aria-label="Annual event schedule">
              ${monthBlocks}
            </div>
          </div>
        </section>
      `
    );
  }
}

if (document.body.classList.contains('page-events')) {
  document.addEventListener('DOMContentLoaded', () => new EventsAnnualSchedule());
}

