// Ashoka House — Events page (Upcoming Events section only)

class EventsPage {
  constructor() {
    this.events = [];
    this.root = AshokaAPI.qs('[data-events-root]');
    this.init();
  }

  async init() {
    const data = await AshokaAPI.fetchJSON('./data/events.json');
    this.events = data?.events || [];

    this.renderUpcoming();
    this.renderAnnualSchedule();
  }


  parseMonthIndex(month) {
    const m = (month || '').trim().toLowerCase();
    const map = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11
    };
    return Object.prototype.hasOwnProperty.call(map, m) ? map[m] : null;
  }

  normalizeToLocalMidnight(d) {
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }

  getAcademicYearStart(referenceDate = new Date()) {
    const d = this.normalizeToLocalMidnight(referenceDate);
    if (!d) return new Date().getFullYear();

    const year = d.getFullYear();
    const month = d.getMonth();

    // Academic year runs April–March (April = month index 3).
    return month >= 3 ? year : year - 1;
  }

  getSessionYearForEvent(monthIndex, referenceDate = new Date()) {
    const academicStart = this.getAcademicYearStart(referenceDate);

    // Apr–Dec events fall in the academic-start calendar year;
    // Jan–Mar events fall in the following calendar year.
    return monthIndex < 3 ? academicStart + 1 : academicStart;
  }

  parseEventDate(event, referenceDate = new Date()) {
    if (!event) return null;

    const monthIndex = this.parseMonthIndex(event?.month);
    const yearRaw = (event?.year ?? '').toString().trim();
    if (monthIndex === null) return null;

    const year = yearRaw
      ? Number(yearRaw)
      : this.getSessionYearForEvent(monthIndex, referenceDate);
    if (!Number.isFinite(year)) return null;

    const dayRaw = (event?.day ?? '').toString().trim();

    // If day is missing/empty -> last day of the month
    let day;
    if (!dayRaw) {
      day = new Date(year, monthIndex + 1, 0).getDate();
    } else {
      const n = Number(dayRaw);
      if (!Number.isFinite(n)) return null;
      day = n;
    }

    const dt = new Date(year, monthIndex, day, 0, 0, 0, 0);
    if (Number.isNaN(dt.getTime())) return null;

    // Guard against overflowed dates (e.g., day=40)
    if (dt.getFullYear() !== year || dt.getMonth() !== monthIndex || dt.getDate() !== day) {
      return null;
    }

    return dt;
  }

  getTodayDate() {
    return this.normalizeToLocalMidnight(new Date());
  }

  formatMonthOrDate(event) {
    // Upcoming cards expect month/day formatting.
    // Use month if day is missing; otherwise show day (current UI only shows one value).
    const month = (event?.month || '').trim().toUpperCase();
    const day = (event?.day ?? '').toString().trim();
    return day ? day : month;
  }

  formatUpcomingDateLabel(event) {
    const month = (event?.month || '').trim();
    const day = (event?.day ?? '').toString().trim();
    if (!month) return '';

    const monthIndex = this.parseMonthIndex(month);
    if (monthIndex === null) return month.toUpperCase();

    const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthIndex];

    if (day) {
      const dayNum = Number(day);
      if (Number.isFinite(dayNum)) {
        return `${String(dayNum).padStart(2, '0')} ${monthAbbr}`;
      }
    }

    return monthAbbr;
  }

  getUpcomingEvents() {
    const today = this.getTodayDate();
    if (!today) return [];

    const items = (this.events || [])
      .map((e) => {
        const eventDate = this.parseEventDate(e, today);
        return { e, eventDate };
      })
      .filter((x) => x.e && x.eventDate);

    // Keep today + future; discard past.
    const upcomingCandidates = items.filter((x) => x.eventDate >= today);

    // Sort chronologically; break ties deterministically (not by JSON order).
    upcomingCandidates.sort((a, b) => {
      const byDate = a.eventDate - b.eventDate;
      if (byDate !== 0) return byDate;
      return (a.e?.title || '').localeCompare(b.e?.title || '', 'en', { sensitivity: 'base' });
    });

    return upcomingCandidates.slice(0, 1).map((x) => x.e);
  }

  isToday(event) {
    const today = this.getTodayDate();
    const eventDate = this.parseEventDate(event, today);
    if (!today || !eventDate) return false;
    return eventDate.getTime() === today.getTime();
  }



  renderUpcoming() {
    if (!this.root) return;

    const upcoming = this.getUpcomingEvents();

    // Build Upcoming section first; Annual section will be appended later.
    this.root.innerHTML = `
      <section class="page-section events-upcoming-section" aria-label="Upcoming events">
        <div class="container">
          <header class="section-header">
            <p class="eyebrow">Upcoming</p>
            <h2 class="section-title">Upcoming Events</h2>
            <p class="body-md">Events scheduled to take place next.</p>
          </header>

          <div class="events-upcoming__panel" data-upcoming-grid></div>

          <p class="events-upcoming__empty" data-upcoming-empty hidden>
            No upcoming events have been announced.
          </p>
        </div>
      </section>
    `;

    const grid = AshokaAPI.qs('[data-upcoming-grid]');
    const emptyEl = AshokaAPI.qs('[data-upcoming-empty]');

    if (!grid) return;

    if (!upcoming.length) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    const nextEvent = upcoming[0];

    grid.innerHTML = `
          <article class="events-upcoming__row" aria-label="Upcoming event">
            <time class="events-upcoming__date" datetime="">${this.formatUpcomingDateLabel(nextEvent)}</time>
            <div class="events-upcoming__info">
              <h3 class="events-upcoming__title">${nextEvent?.title || ''}</h3>
              <p class="events-upcoming__category">${nextEvent?.category || ''}</p>
              ${this.isToday(nextEvent) ? `<span class="events-upcoming__today">TODAY</span>` : ''}
            </div>
          </article>
        `;
  }

  getAnnualEvents() {
    // Annual schedule includes ALL events (upcoming flag ignored).
    // Expected dataset fields are: title, month, date, category, description, upcoming.
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

  formatDayOrDash(event) {
    // If only month is known, display —
    const hasDate = (event?.date || '').trim().length > 0;
    if (!hasDate) return '—';

    // Date might already be numeric or a formatted string; display it as-is.
    return (event.date || '').trim();
  }

  formatEventMonth(event) {
    return (event?.month || '').trim().toUpperCase();
  }

  formatCategory(category) {
    const c = (category || '').trim();
    if (!c) return '';
    // Render as subtle muted text (no pill/badge)
    return `<p class="events-annual__category">${c}</p>`;
  }



  renderAnnualSchedule() {
    // Rendered by js/events-annual.js (scrollable academic schedule).
    // Keep this function intentionally blank to avoid rendering duplicate sections.
  }

}



if (document.body.classList.contains('page-events')) {
  document.addEventListener('DOMContentLoaded', () => new EventsPage());
}


