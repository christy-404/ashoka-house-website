// ==========================================
// ASHOKA HOUSE - LEADERSHIP SYSTEM
// INSTITUTIONAL HIERARCHY
// ==========================================

class LeadershipSystem {
    constructor() {
        this.leaders = [];
        this.init();
    }

    async init() {
        await this.loadLeaders();
        this.renderLeaders();
        this.setupEventListeners();
    }

    async loadLeaders() {
        const data = await AshokaUtils.fetchJSON('./data/leadership.json');
        if (data) {
            this.leaders = data.leadership;
        }
    }

    renderLeaders() {
        // Group by category
        const groupedByCategory = this.groupByCategory();

        const container = AshokaUtils.qs('.leadership-container');
        if (!container) return;

        container.innerHTML = Object.entries(groupedByCategory).map(([category, leaders]) => 
            this.createCategorySection(category, leaders)
        ).join('');
    }

    groupByCategory() {
        const categoryLabels = {
            'principal': 'Principal',
            'vice_principal': 'Vice Principal',
            'house_master': 'House Masters',
            'school_council': 'School Council',
            'house_council': 'Ashoka House Council'
        };

        const grouped = {};
        this.leaders.forEach(leader => {
            const category = leader.category;
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(leader);
        });

        return grouped;
    }

    createCategorySection(category, leaders) {
        const categoryLabels = {
            'principal': { label: 'Principal', icon: '👨‍💼' },
            'vice_principal': { label: 'Vice Principal', icon: '👩‍💼' },
            'house_master': { label: 'House Masters', icon: '📚' },
            'school_council': { label: 'School Council', icon: '🎓' },
            'house_council': { label: 'Ashoka House Council', icon: '◆' }
        };

        const categoryInfo = categoryLabels[category] || { label: category, icon: '◆' };

        return `
            <div class="leadership-section">
                <h2 class="leadership-category-title">
                    <span class="leadership-category-icon">${categoryInfo.icon}</span>
                    ${categoryInfo.label}
                </h2>
                <div class="leadership-grid">
                    ${leaders.map((leader, index) => 
                        this.createLeaderCard(leader, index)
                    ).join('')}
                </div>
            </div>
        `;
    }

    createLeaderCard(leader, index) {
        const isFeatured = leader.featured;

        return `
            <div class="leader-card ${isFeatured ? 'featured-leader' : ''} scale-in" 
                 data-leader-id="${leader.id}"
                 style="animation-delay: ${index * 0.08}s">
                ${isFeatured ? '<div class="featured-badge">Featured</div>' : ''}
                <div class="leader-image">
                    <div class="leader-avatar">${leader.initials}</div>
                </div>
                <h3 class="leader-name">${leader.name}</h3>
                <p class="leader-role">${leader.role}</p>
                <p class="leader-bio">${leader.bio}</p>
                <div class="leader-contact">
                    <a class="leader-link" data-leader-id="${leader.id}">View Profile</a>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Leader card clicks
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.leader-card');
            if (card && e.target.closest('.leader-link')) {
                e.preventDefault();
                const leaderId = card.dataset.leaderId;
                this.showLeaderModal(leaderId);
            }
        });

        // Close modal on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('leader-modal')) {
                e.target.remove();
            }
        });

        // Close modal on button click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('leader-modal-close')) {
                e.target.closest('.leader-modal').remove();
            }
        });
    }

    showLeaderModal(leaderId) {
        const leader = this.leaders.find(l => l.id === parseInt(leaderId));
        if (!leader) return;

        const modal = document.createElement('div');
        modal.className = 'leader-modal active';
        modal.innerHTML = `
            <div class="leader-modal-content">
                <button class="leader-modal-close">×</button>
                <div class="leader-modal-avatar">${leader.initials}</div>
                <h2 class="leader-modal-name">${leader.name}</h2>
                <p class="leader-modal-role">${leader.role}</p>
                <p class="leader-modal-bio">${leader.bio}</p>
                <div class="leader-modal-contact">
                    <div class="leader-modal-contact-label">Email</div>
                    <div class="leader-modal-contact-value">${leader.email}</div>
                </div>
                <div class="leader-modal-description">
                    <strong>Role & Responsibilities</strong><br>
                    ${this.getRoleDescription(leader.category, leader.house || '')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        AshokaUtils.slideInUp(modal.querySelector('.leader-modal-content'), 400);

        // Close on close button
        modal.querySelector('.leader-modal-close').addEventListener('click', () => {
            modal.remove();
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    getRoleDescription(category, house) {
        const descriptions = {
            'principal': 'Leading the entire institution with vision and strategic excellence. Responsible for overall academic excellence, institutional governance, and student welfare.',
            'vice_principal': 'Supporting the principal in academic oversight and student discipline. Ensuring quality education and maintaining institutional standards.',
            'house_master': `Guiding ${house} House members toward excellence. Organizing house activities, discipline, and fostering house spirit and pride.`,
            'school_council': 'Representing the student body in school governance. Leading school-wide initiatives and student welfare programs.',
            'house_council': 'Leading Ashoka House members. Organizing events, coordinating competitions, and ensuring house cohesion and excellence.'
        };

        return descriptions[category] || 'Leading and supporting institutional excellence.';
    }
}

// Initialize leadership system
if (document.querySelector('.leadership-page')) {
    document.addEventListener('DOMContentLoaded', () => {
        new LeadershipSystem();
    });
}

console.log('%cAshoka House - Leadership System', 'color: #2d9d78; font-size: 12px; font-weight: bold;');
