// ==========================================
// ASHOKA HOUSE - EVENTS SYSTEM
// DYNAMIC RENDERING & FILTERING
// ==========================================

class EventsSystem {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.init();
    }

    async init() {
        await this.loadEvents();
        this.setupEventListeners();
        this.render();
    }

    async loadEvents() {
        const data = await AshokaUtils.fetchJSON('./data/events.json');
        if (data) {
            this.events = data.events;
            this.filteredEvents = [...this.events];
        }
    }

    setupEventListeners() {
        // Status filter buttons
        const statusBtns = AshokaUtils.qsa('[data-status-filter]');
        statusBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleStatusFilter(btn));
        });
        
        // Category filter buttons
        const categoryBtns = AshokaUtils.qsa('[data-category-filter]');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleCategoryFilter(btn));
        });
        
        // Event card clicks
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.event-card');
            if (card && e.target.closest('.event-action')) {
                const eventId = card.dataset.eventId;
                this.showEventDetail(eventId);
            }
        });
    }

    handleStatusFilter(btn) {
        const status = btn.dataset.statusFilter;
        this.currentFilter = status;
        
        // Update active state
        AshokaUtils.qsa('[data-status-filter]').forEach(b => 
            AshokaUtils.removeClass(b, 'active')
        );
        AshokaUtils.addClass(btn, 'active');
        
        this.applyFilters();
    }

    handleCategoryFilter(btn) {
        const category = btn.dataset.categoryFilter;
        this.currentCategory = category;
        
        // Update active state
        AshokaUtils.qsa('[data-category-filter]').forEach(b => 
            AshokaUtils.removeClass(b, 'active')
        );
        AshokaUtils.addClass(btn, 'active');
        
        this.applyFilters();
    }

    applyFilters() {
        this.filteredEvents = this.events.filter(event => {
            const statusMatch = this.currentFilter === 'all' || event.status === this.currentFilter;
            const categoryMatch = this.currentCategory === 'all' || event.category === this.currentCategory;
            return statusMatch && categoryMatch;
        });

        // Sort by status priority
        const statusPriority = { ongoing: 0, upcoming: 1, completed: 2 };
        this.filteredEvents.sort((a, b) => 
            statusPriority[a.status] - statusPriority[b.status]
        );

        this.render();
    }

    render() {
        const container = AshokaUtils.qs('.events-grid');
        if (!container) return;

        if (this.filteredEvents.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1;" class="empty-state">
                    <div class="empty-state-icon">◉</div>
                    <h3 class="empty-state-title">No Events Found</h3>
                    <p class="empty-state-desc">Try adjusting your filters to find events.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredEvents.map((event, index) => 
            this.createEventCard(event, index)
        ).join('');
    }

    createEventCard(event, index) {
        const daysUntil = event.status === 'upcoming' ? AshokaUtils.daysUntil(event.startDate) : null;
        
        return `
            <div class="event-card slide-in-up" data-event-id="${event.id}" style="animation-delay: ${index * 0.1}s">
                <div class="event-header">
                    <span class="event-category ${event.category}">${event.category.toUpperCase()}</span>
                    <span class="event-status ${event.status}">
                        ${event.status === 'ongoing' ? '● Active' : 
                          event.status === 'upcoming' ? '◉ Soon' : 
                          '✓ Completed'}
                    </span>
                </div>
                <h3 class="event-title">${event.name}</h3>
                <p class="event-description">${event.description}</p>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <span class="event-meta-label">Date</span>
                        <span class="event-meta-value">${AshokaUtils.formatDate(event.startDate)}</span>
                    </div>
                    <div class="event-meta-item">
                        <span class="event-meta-label">Houses</span>
                        <span class="event-meta-value">${event.houses.length}</span>
                    </div>
                </div>
                <div class="event-progress-container">
                    <div class="event-progress-label">
                        <span>Progress</span>
                        <span>${event.progress}%</span>
                    </div>
                    <div class="event-progress-bar">
                        <div class="event-progress" style="width: ${event.progress}%"></div>
                    </div>
                </div>
                <div class="event-footer">
                    <span class="event-points">+${event.points} points</span>
                    <button class="event-action">VIEW</button>
                </div>
            </div>
        `;
    }

    showEventDetail(eventId) {
        const event = this.events.find(e => e.id === parseInt(eventId));
        if (!event) return;

        const modal = document.createElement('div');
        modal.className = 'event-modal active';
        modal.innerHTML = `
            <div class="event-modal-content">
                <button class="event-modal-close">×</button>
                <h2 class="event-modal-title">${event.name}</h2>
                <p class="event-modal-desc">${event.description}</p>
                <div class="event-modal-details">
                    <div class="event-modal-detail">
                        <div class="event-modal-detail-label">Start Date</div>
                        <div class="event-modal-detail-value">${AshokaUtils.formatDate(event.startDate)}</div>
                    </div>
                    <div class="event-modal-detail">
                        <div class="event-modal-detail-label">End Date</div>
                        <div class="event-modal-detail-value">${AshokaUtils.formatDate(event.endDate)}</div>
                    </div>
                    <div class="event-modal-detail">
                        <div class="event-modal-detail-label">Participants</div>
                        <div class="event-modal-detail-value">${event.participants}</div>
                    </div>
                    <div class="event-modal-detail">
                        <div class="event-modal-detail-label">Points</div>
                        <div class="event-modal-detail-value">+${event.points}</div>
                    </div>
                    <div class="event-modal-detail">
                        <div class="event-modal-detail-label">Status</div>
                        <div class="event-modal-detail-value">${event.status.toUpperCase()}</div>
                    </div>
                    <div class="event-modal-detail">
                        <div class="event-modal-detail-label">Progress</div>
                        <div class="event-modal-detail-value">${event.progress}%</div>
                    </div>
                </div>
                <div style="padding: 1.5rem; background: rgba(45, 157, 120, 0.1); border-left: 3px solid #2d9d78; border-radius: 8px;">
                    <p style="font-size: 0.9rem; color: #c0c9d4;">
                        <strong>Participating Houses:</strong><br>
                        ${event.houses.join(', ')}
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.event-modal-close');
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
}

// Initialize events system on events page
if (document.querySelector('.events-page')) {
    document.addEventListener('DOMContentLoaded', () => {
        new EventsSystem();
    });
}

console.log('%cAshoka House - Events System', 'color: #2d9d78; font-size: 12px; font-weight: bold;');
