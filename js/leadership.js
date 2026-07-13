/**
 * Leadership page — data-driven rendering
 * Fetches leadership.json and renders sections.
 * House Council is rendered as a scrollable table; other sections use cards.
 */

const LEADERSHIP_DATA_URL = './data/leadership.json';

async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to load ${url}`, error);
    return null;
  }
}

const SELECTORS = {
  container: '.leadership-content',
  empty: '.leadership-empty',
};

const SELECTORS_CSS = {
  section: 'leadership-section',
  sectionHeading: 'leadership-section-heading',
  sectionToggle: 'leadership-section-toggle',
  sectionTitle: 'leadership-section__title',
  sectionDescription: 'leadership-section__description',
  sectionPanel: 'leadership-section-panel',
  cardGrid: 'leadership-grid',
  card: 'leadership-card',
  cardHeader: 'leadership-card__header',
  cardMain: 'leadership-card__main',
  cardName: 'leadership-card__name',
  cardDesignation: 'leadership-card__designation',
  cardClass: 'leadership-card__class',
  cardToggle: 'leadership-card__toggle',
  cardDetails: 'leadership-card__details',
  detailItem: 'leadership-card__detail-item',
  detailLabel: 'leadership-card__label',
  detailValue: 'leadership-card__value',
  // Roster action panel
  rosterAction: 'council-roster-action',
  rosterActionTitle: 'council-roster-action__title',
  rosterActionDescription: 'council-roster-action__description',
  rosterActionTrigger: 'council-roster-action__trigger',
  // Modal classes
  modal: 'council-modal',
  modalBackdrop: 'council-modal__backdrop',
  modalCard: 'council-modal__card',
  modalHeader: 'council-modal__header',
  modalTitle: 'council-modal__title',
  modalDescription: 'council-modal__description',
  modalClose: 'council-modal__close',
  modalBody: 'council-modal__body',
  // Table-specific classes (used inside modal)
  tableWrapper: 'council-table-wrapper',
  table: 'council-table',
  tableHeader: 'council-table__header',
  tableHeaderCell: 'council-table__header-cell',
  tableBody: 'council-table__body',
  tableRow: 'council-table__row',
  tableCell: 'council-table__cell',
  tableCellRole: 'council-table__cell--role',
  tableCellName: 'council-table__cell--name',
  tableCellClass: 'council-table__cell--class',
};

function createElement(tag, className = '', innerHTML = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

function createPersonEntry(member) {
  const entry = createElement('article', SELECTORS_CSS.card);
  entry.dataset.id = member.id;

  const header = createElement('header', SELECTORS_CSS.cardHeader);
  header.innerHTML = `
    <div class="${SELECTORS_CSS.cardMain}">
      <h3 class="${SELECTORS_CSS.cardName}">${escapeHtml(member.name)}</h3>
      <p class="${SELECTORS_CSS.cardDesignation}">${escapeHtml(member.position)}</p>
      ${member.classYear ? `<span class="${SELECTORS_CSS.cardClass}">${escapeHtml(member.classYear)}${member.section ? ' ' + escapeHtml(member.section) : ''}</span>` : ''}
    </div>
    <button type="button" class="${SELECTORS_CSS.cardToggle}" aria-label="Toggle details" aria-expanded="false">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </button>
  `;

  const details = createElement('div', SELECTORS_CSS.cardDetails);

  if (member.type === 'teacher') {
    if (member.designation) {
      details.appendChild(createDetailItem('Designation', member.designation));
    }
    if (member.subject) {
      details.appendChild(createDetailItem('Subject', member.subject));
    }
  } else if (member.type === 'student') {
    if (member.classYear) {
      details.appendChild(createDetailItem('Class', `${member.classYear}${member.section ? ' ' + member.section : ''}`));
    }
    if (member.position) {
      details.appendChild(createDetailItem('Position', member.position));
    }
  }

  entry.appendChild(header);
  entry.appendChild(details);

  // Toggle details on click
  const toggleBtn = header.querySelector(`.${SELECTORS_CSS.cardToggle}`);
  header.addEventListener('click', (e) => {
    if (e.target.closest(`.${SELECTORS_CSS.cardToggle}`)) return;
    entry.classList.toggle('open');
    const isOpen = entry.classList.contains('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    entry.classList.toggle('open');
    const isOpen = entry.classList.contains('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  return entry;
}

function createRosterActionPanel() {
  const panel = createElement('div', SELECTORS_CSS.rosterAction);
  panel.innerHTML = `
    <div class="${SELECTORS_CSS.rosterActionTitle}">House Council</div>
    <button type="button" class="${SELECTORS_CSS.rosterActionTrigger}" aria-label="Open House Council roster">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
  `;
  return panel;
}

function createRosterModal(memberList) {
  const modal = createElement('div', SELECTORS_CSS.modal);
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'council-modal-title');
  modal.innerHTML = `
    <div class="${SELECTORS_CSS.modalBackdrop}" tabindex="-1"></div>
    <div class="${SELECTORS_CSS.modalCard}">
      <header class="${SELECTORS_CSS.modalHeader}">
        <h2 id="council-modal-title" class="${SELECTORS_CSS.modalTitle}">House Council</h2>
        <button type="button" class="${SELECTORS_CSS.modalClose}" aria-label="Close roster">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </header>
      <div class="council-modal__table-header" role="rowheader">
        <div class="council-columns">
          <div class="council-column council-column--role" role="columnheader">ROLE</div>
          <div class="council-column council-column--name" role="columnheader">NAME</div>
          <div class="council-column council-column--class" role="columnheader">CLASS</div>
        </div>
      </div>
      <div class="${SELECTORS_CSS.modalBody}">
        <div class="council-rows" role="listbox"></div>
      </div>
    </div>
  `;

  const rowsContainer = modal.querySelector('.council-rows');
  memberList.forEach(member => {
    const row = createElement('div', 'council-row');
    row.setAttribute('role', 'option');
    row.innerHTML = `
      <div class="council-cell council-cell--role">${escapeHtml(member.position)}</div>
      <div class="council-cell council-cell--name">${escapeHtml(member.name)}</div>
      <div class="council-cell council-cell--class">${escapeHtml(member.classYear)}${member.section ? ' ' + escapeHtml(member.section) : ''}</div>
    `;
    rowsContainer.appendChild(row);
  });

  // Close handlers
  const closeBtn = modal.querySelector(`.${SELECTORS_CSS.modalClose}`);
  const backdrop = modal.querySelector(`.${SELECTORS_CSS.modalBackdrop}`);

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    setTimeout(() => modal.remove(), 250);
  };

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  // ESC key
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  document.addEventListener('keydown', handleKeydown);

  return modal;
}

function createDetailItem(label, value) {
  const item = createElement('div', SELECTORS_CSS.detailItem);
  item.innerHTML = `
    <span class="${SELECTORS_CSS.detailLabel}">${escapeHtml(label)}</span>
    <span class="${SELECTORS_CSS.detailValue}">${escapeHtml(value)}</span>
  `;
  return item;
}

function createTable(memberList) {
  const wrapper = createElement('div', SELECTORS_CSS.tableWrapper);
  const table = createElement('table', SELECTORS_CSS.table);
  table.setAttribute('role', 'table');
  table.setAttribute('aria-label', 'House Council roster');

  // Header
  const thead = createElement('thead', SELECTORS_CSS.tableHeader);
  thead.innerHTML = `
    <tr>
      <th class="${SELECTORS_CSS.tableHeaderCell} ${SELECTORS_CSS.tableCellRole}" scope="col">ROLE</th>
      <th class="${SELECTORS_CSS.tableHeaderCell} ${SELECTORS_CSS.tableCellName}" scope="col">NAME</th>
      <th class="${SELECTORS_CSS.tableHeaderCell} ${SELECTORS_CSS.tableCellClass}" scope="col">CLASS</th>
    </tr>
  `;

  // Body
  const tbody = createElement('tbody', SELECTORS_CSS.tableBody);
  memberList.forEach(member => {
    const row = createElement('tr', SELECTORS_CSS.tableRow);
    row.innerHTML = `
      <td class="${SELECTORS_CSS.tableCell} ${SELECTORS_CSS.tableCellRole}" data-label="Role">${escapeHtml(member.position)}</td>
      <td class="${SELECTORS_CSS.tableCell} ${SELECTORS_CSS.tableCellName}" data-label="Name">${escapeHtml(member.name)}</td>
      <td class="${SELECTORS_CSS.tableCell} ${SELECTORS_CSS.tableCellClass}" data-label="Class">${escapeHtml(member.classYear)}${member.section ? ' ' + escapeHtml(member.section) : ''}</td>
    `;
    tbody.appendChild(row);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  wrapper.appendChild(table);

  return wrapper;
}

function createSection(sectionData) {
  const section = createElement('section', SELECTORS_CSS.section);
  section.dataset.key = sectionData.key;

  const heading = createElement('div', SELECTORS_CSS.sectionHeading);
  heading.innerHTML = `
    <button type="button" class="${SELECTORS_CSS.sectionToggle}" aria-expanded="false" aria-controls="panel-${sectionData.key}">
      <span class="${SELECTORS_CSS.sectionTitle}">${escapeHtml(sectionData.section)}</span>
      <span class="section-toggle-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </span>
    </button>
    ${sectionData.description ? `<p class="${SELECTORS_CSS.sectionDescription}">${escapeHtml(sectionData.description)}</p>` : ''}
  `;

  const panel = createElement('div', SELECTORS_CSS.sectionPanel);
  panel.id = `panel-${sectionData.key}`;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', `heading-${sectionData.key}`);

  const content = createElement('div', SELECTORS_CSS.cardGrid);

  if (sectionData.key === 'house_council') {
    // Render roster action panel instead of inline table
    const rosterAction = createRosterActionPanel();
    content.appendChild(rosterAction);

    // Add click handler to open modal
    const trigger = rosterAction.querySelector(`.${SELECTORS_CSS.rosterActionTrigger}`);
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const modal = createRosterModal(sectionData.cards);
      document.body.appendChild(modal);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      // Force reflow then open
      requestAnimationFrame(() => {
        modal.classList.add('open');
      });
    });
  } else {
    // Render as person entries (nested collapsibles)
    sectionData.cards.forEach(cardData => {
      const entry = createPersonEntry(cardData);
      content.appendChild(entry);
    });
  }

  panel.appendChild(content);

  // Toggle panel on button click
  const toggleBtn = heading.querySelector(`.${SELECTORS_CSS.sectionToggle}`);
  toggleBtn.addEventListener('click', () => {
    const isOpen = section.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  section.appendChild(heading);
  section.appendChild(panel);

  return section;
}

function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

async function initLeadership() {
  const container = document.querySelector(SELECTORS.container);
  const empty = document.querySelector(SELECTORS.empty);

  if (!container) return;

  try {
    const data = await fetchJSON(LEADERSHIP_DATA_URL);

    if (empty) empty.remove();

    data.leadership.forEach(sectionData => {
      const section = createSection(sectionData);
      container.appendChild(section);
    });
  } catch (err) {
    console.error('Failed to load leadership data:', err);
    if (empty) {
      empty.textContent = 'Failed to load leadership information. Please try again later.';
    }
  }
}

document.addEventListener('DOMContentLoaded', initLeadership);