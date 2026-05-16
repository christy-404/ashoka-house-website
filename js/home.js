// ==========================================
// ASHOKA HOUSE - HOME PAGE SYSTEM
// Dynamic previews, ticker, featured event, and house DNA
// ==========================================

class HomeSystem {
    constructor() {
        this.events = [];
        this.houseAchievements = [];
        this.individualAchievements = [];
        this.standings = [];
        this.leadership = [];
        this.init();
    }

    async init() {
        const [eventsData, achievementsData, standingsData, leadershipData] = await Promise.all([
            AshokaUtils.fetchJSON('./data/events.json'),
            AshokaUtils.fetchJSON('./data/achievements.json'),
            AshokaUtils.fetchJSON('./data/standings.json'),
            AshokaUtils.fetchJSON('./data/leadership.json')
        ]);

        this.events = eventsData?.events || [];
        this.houseAchievements = achievementsData?.house_achievements || [];
        this.individualAchievements = achievementsData?.individual_achievements || [];
        this.standings = standingsData?.standings || [];
        this.leadership = leadershipData?.leadership || [];

        this.renderFeaturedEvent();
        this.renderAchievementPreview();
        this.renderLeaderRotation();
        this.renderTimeline();
        this.renderHouseDNA();
        this.renderStatusTicker();
        this.initTickerLoop();
    }

    renderFeaturedEvent() {
        const container = AshokaUtils.qs('.featured-event-card');
        if (!container) return;

        const featured = this.getFeaturedEvent();
        if (!featured) {
            container.innerHTML = '<div class="premium-card"><p>No featured event available.</p></div>';
            return;
        }

        container.innerHTML = `
            <div class="premium-card featured-event-card-inner">
                <div class="section-label">Featured Event</div>
                <h2 class="section-title">${featured.name}</h2>
                <p class="section-subtitle">${featured.description}</p>
                <div class="event-details-grid">
                    <div class="event-detail">
                        <span>Category</span>
                        <strong>${this.formatCategory(featured.category)}</strong>
                    </div>
                    <div class="event-detail">
                        <span>Status</span>
                        <strong>${this.formatStatus(featured.status)}</strong>
                    </div>
                    <div class="event-detail">
                        <span>Start</span>
                        <strong>${AshokaUtils.formatDate(featured.startDate)}</strong>
                    </div>
                    <div class="event-detail">
                        <span>Points</span>
                        <strong>${featured.points}</strong>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${featured.progress}%"></div>
                </div>
                <div class="featured-meta">
                    <span>${featured.houses.length} Houses</span>
                    <span>${featured.participants} Participants</span>
                    <span>${featured.progress}% complete</span>
                </div>
            </div>
        `;
    }

    getFeaturedEvent() {
        const ongoing = this.events.filter(event => event.status === 'ongoing');
        if (ongoing.length) return ongoing[0];

        const upcoming = this.events.filter(event => event.status === 'upcoming');
        return upcoming[0] || this.events[0];
    }

    renderAchievementPreview() {
        const container = AshokaUtils.qs('.achievement-preview');
        if (!container) return;

        const achievements = this.getBalancedAchievements(this.houseAchievements).slice(0, 3);
        container.innerHTML = `
            <div class="section-label">Recent Recognition</div>
            <div class="achievement-preview-grid">
                ${achievements.map((achievement, index) => `
                    <div class="premium-card preview-card" style="animation-delay: ${index * 0.08}s">
                        <div class="badge ${achievement.category}">${achievement.house} House</div>
                        <h3>${achievement.title}</h3>
                        <p>${achievement.description}</p>
                        <div class="achievement-preview-meta">
                            <span>${AshokaUtils.formatDate(achievement.date)}</span>
                            <span>${achievement.points} pts</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getBalancedAchievements(achievements) {
        const groups = achievements.reduce((acc, item) => {
            acc[item.house] = acc[item.house] || [];
            acc[item.house].push(item);
            return acc;
        }, {});

        Object.values(groups).forEach(list => list.sort((a, b) => Number(b.featured) - Number(a.featured)));

        const houses = Object.keys(groups);
        const balanced = [];
        let index = 0;

        while (true) {
            let added = false;
            houses.forEach(house => {
                const item = groups[house][index];
                if (item) {
                    balanced.push(item);
                    added = true;
                }
            });
            if (!added) break;
            index += 1;
        }

        return balanced;
    }

    renderLeaderRotation() {
        const container = AshokaUtils.qs('.leader-rotation');
        if (!container) return;

        const leaders = this.leadership.slice(0, 4);
        container.innerHTML = `
            <div class="section-label">Featured Leaders</div>
            <div class="leader-rotation-inner">
                ${leaders.map((leader, index) => `
                    <div class="leader-rotation-card ${index === 0 ? 'active' : ''}" data-index="${index}">
                        <div class="leader-avatar">${leader.initials}</div>
                        <h3>${leader.name}</h3>
                        <p class="leader-role">${leader.role}</p>
                        <p class="leader-summary">${leader.bio}</p>
                    </div>
                `).join('')}
            </div>
            <div class="leader-rotation-controls">
                ${leaders.map((_, index) => `<button class="leader-dot ${index === 0 ? 'active' : ''}" aria-label="Show leader ${index + 1}" data-index="${index}"></button>`).join('')}
            </div>
        `;

        container.querySelectorAll('.leader-dot').forEach(dot => {
            dot.addEventListener('click', () => this.showLeaderCard(Number(dot.dataset.index)));
        });
    }

    showLeaderCard(index) {
        const cards = document.querySelectorAll('.leader-rotation-card');
        const dots = document.querySelectorAll('.leader-dot');
        cards.forEach(card => card.classList.toggle('active', Number(card.dataset.index) === index));
        dots.forEach(dot => dot.classList.toggle('active', Number(dot.dataset.index) === index));
    }

    initTickerLoop() {
        const dots = document.querySelectorAll('.leader-dot');
        let activeIndex = 0;
        setInterval(() => {
            activeIndex = (activeIndex + 1) % dots.length;
            this.showLeaderCard(activeIndex);
        }, 5000);
    }

    renderTimeline() {
        const container = AshokaUtils.qs('.timeline-grid');
        if (!container) return;

        const upcoming = this.events
            .filter(event => event.status === 'upcoming')
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .slice(0, 4);

        container.innerHTML = upcoming.map((event, index) => `
            <div class="timeline-card premium-card" style="animation-delay: ${index * 0.08}s">
                <div class="timeline-date">${AshokaUtils.formatDate(event.startDate)}</div>
                <h3>${event.name}</h3>
                <p>${event.description}</p>
                <div class="timeline-meta">
                    <span>${event.category.toUpperCase()}</span>
                    <span>${event.houses.length} Houses</span>
                </div>
            </div>
        `).join('');
    }

    renderHouseDNA() {
        const container = AshokaUtils.qs('.house-dna');
        if (!container) return;

        const houses = this.standings.slice(0, 4);
        container.innerHTML = houses.map((standing, index) => `
            <div class="dna-card premium-card" style="animation-delay: ${index * 0.08}s">
                <div class="dna-heading">
                    <div class="dna-badge" style="background: ${standing.color}20; border-color: ${standing.color}; color: ${standing.color};">${standing.house}</div>
                    <span class="dna-momentum ${standing.momentum}">${standing.momentum.toUpperCase()}</span>
                </div>
                <div class="dna-value">${standing.points} pts</div>
                <p class="dna-description">${standing.description}</p>
                <div class="dna-scores">
                    <span>Sport ${standing.sportPoints}</span>
                    <span>Academic ${standing.academicPoints}</span>
                    <span>Cultural ${standing.culturalPoints}</span>
                </div>
            </div>
        `;
    }

    renderStatusTicker() {
        const ticker = AshokaUtils.qs('.ticker-content');
        if (!ticker) return;

        const eventHighlights = this.events.slice(0, 4).map(event => {
            return `${event.name} ${event.status === 'ongoing' ? 'is active now' : event.status === 'upcoming' ? 'starts soon' : 'has completed.'}`;
        });

        const leaders = this.leadership.slice(0, 2).map(leader => `${leader.name} now featured in leadership spotlight`);
        const trend = this.standings.slice(0, 2).map(standing => `${standing.house} is ${standing.momentum} with ${standing.points} points`);

        ticker.innerHTML = [...eventHighlights, ...leaders, ...trend].map(item => `
            <div class="ticker-item">${item}</div>
        `).join('');
    }
}

if (document.querySelector('.hero')) {
    document.addEventListener('DOMContentLoaded', () => new HomeSystem());
}

console.log('%cAshoka House - Home System Initialized', 'color: #2d9d78; font-size: 12px; font-weight: bold;');
