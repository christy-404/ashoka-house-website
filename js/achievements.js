// ==========================================
// ASHOKA HOUSE - ACHIEVEMENTS SYSTEM
// FAIR RECOGNITION ENGINE
// ==========================================

class AchievementsSystem {
    constructor() {
        this.houseAchievements = [];
        this.individualAchievements = [];
        this.currentTab = 'house';
        this.init();
    }

    async init() {
        await this.loadAchievements();
        this.setupEventListeners();
        this.render();
    }

    async loadAchievements() {
        const data = await AshokaUtils.fetchJSON('./data/achievements.json');
        if (data) {
            this.houseAchievements = data.house_achievements;
            this.individualAchievements = data.individual_achievements;
        }
    }

    setupEventListeners() {
        const tabBtns = AshokaUtils.qsa('[data-achievement-tab]');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn));
        });
    }

    switchTab(btn) {
        const tab = btn.dataset.achievementTab;
        this.currentTab = tab;

        // Update active state
        AshokaUtils.qsa('[data-achievement-tab]').forEach(b => 
            AshokaUtils.removeClass(b, 'active')
        );
        AshokaUtils.addClass(btn, 'active');

        this.render();
    }

    render() {
        const container = AshokaUtils.qs('.achievements-grid');
        if (!container) return;

        const achievements = this.currentTab === 'house' 
            ? this.getBalancedAchievements(this.houseAchievements)
            : this.getBalancedAchievements(this.individualAchievements, 'house');

        if (achievements.length === 0) {
            container.innerHTML = '<div class="empty-state">No achievements yet</div>';
            return;
        }

        container.innerHTML = achievements.map((ach, index) => 
            this.createAchievementCard(ach, index, this.currentTab)
        ).join('');
    }

    createAchievementCard(achievement, index, type) {
        const isFeatured = achievement.featured;
        const houseLabel = type === 'house' ? achievement.house : achievement.house;
        
        return `
            <div class="achievement-card ${isFeatured ? 'featured-achievement' : ''} scale-in" 
                 style="animation-delay: ${index * 0.08}s">
                <div class="achievement-icon">${this.getIcon(achievement.category)}</div>
                <h3 class="achievement-title">${achievement.title}</h3>
                <span class="achievement-house">${houseLabel} House</span>
                <p class="achievement-desc">${achievement.description}</p>
                <div class="achievement-footer">
                    <span class="achievement-date">${AshokaUtils.formatDate(achievement.date)}</span>
                    ${isFeatured ? '<span class="achievement-badge">Featured</span>' : ''}
                </div>
            </div>
        `;
    }

    getIcon(category) {
        const icons = {
            'sports': '⚽',
            'literary': '📚',
            'cultural': '🎭',
            'academic': '🧪',
            'community': '🤝'
        };
        return icons[category] || '★';
    }

    getBalancedAchievements(achievements, criteria = 'house') {
        const groups = achievements.reduce((acc, achievement) => {
            const key = achievement[criteria] || 'other';
            acc[key] = acc[key] || [];
            acc[key].push(achievement);
            return acc;
        }, {});

        Object.values(groups).forEach(group => {
            group.sort((a, b) => Number(b.featured || false) - Number(a.featured || false));
        });

        const buckets = Object.keys(groups).sort();
        const balanced = [];
        let index = 0;

        while (true) {
            let added = false;
            buckets.forEach(key => {
                const item = groups[key][index];
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
}

// Initialize achievements system
if (document.querySelector('.achievements-page')) {
    document.addEventListener('DOMContentLoaded', () => {
        new AchievementsSystem();
    });
}

console.log('%cAshoka House - Achievements System', 'color: #2d9d78; font-size: 12px; font-weight: bold;');
