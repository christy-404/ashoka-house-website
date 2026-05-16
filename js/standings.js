// ==========================================
// ASHOKA HOUSE - STANDINGS SYSTEM
// DYNAMIC RANKINGS & MOMENTUM ENGINE
// ==========================================

class StandingsSystem {
    constructor() {
        this.events = [];
        this.standings = [];
        this.init();
    }

    async init() {
        await Promise.all([this.loadStandings(), this.loadEvents()]);
        if (this.events.length) {
            this.computeStandingsFromEvents();
        }
        this.renderTable();
        this.renderHouseDNA();
        this.setupRealtimeUpdates();
    }

    async loadStandings() {
        const data = await AshokaUtils.fetchJSON('./data/standings.json');
        if (data) {
            this.standings = data.standings;
        }
    }

    async loadEvents() {
        const data = await AshokaUtils.fetchJSON('./data/events.json');
        if (data) {
            this.events = data.events;
        }
    }

    renderTable() {
        const tbody = AshokaUtils.qs('.standings-table tbody');
        if (!tbody) return;

        tbody.innerHTML = this.standings.map((standing, index) => 
            this.createTableRow(standing, index)
        ).join('');
    }

    createTableRow(standing, index) {
        const bars = standing.recentTrend.map(value => 
            `<div class="bar" style="height: ${value}%"></div>`
        ).join('');

        return `
            <tr class="standing-row" style="animation-delay: ${index * 0.1}s">
                <td class="rank-cell rank-${standing.rank}">${standing.rank}</td>
                <td class="house-cell">
                    <span class="house-badge" style="background: ${standing.color}20; border-color: ${standing.color}">
                        ${this.getHouseBadge(standing.house)}
                    </span>
                    <span style="color: ${standing.color}">${standing.house.toUpperCase()}</span>
                </td>
                <td class="points-cell" style="color: ${standing.color}">${standing.points}</td>
                <td class="momentum-cell">
                    <div class="momentum-badge ${standing.momentum}">
                        ${standing.momentum === 'rising' ? '↑ Rising' : 
                          standing.momentum === 'stable' ? '→ Stable' : 
                          '↓ Dropping'}
                    </div>
                </td>
                <td class="recent-cell">
                    ${bars}
                </td>
            </tr>
        `;
    }

    renderHouseDNA() {
        const container = AshokaUtils.qs('.house-dna');
        if (!container) return;

        container.innerHTML = this.standings.map((standing, index) => 
            this.createDNACard(standing, index)
        ).join('');
    }

    createDNACard(standing, index) {
        const totalPoints = standing.sportPoints + standing.literaryPoints + 
                          standing.culturalPoints + standing.academicPoints;

        return `
            <div class="dna-card scale-in" style="animation-delay: ${index * 0.12}s">
                <div class="dna-header">
                    <div class="dna-badge" style="background: ${standing.color}20; border-color: ${standing.color}; color: ${standing.color}">
                        ${this.getHouseBadge(standing.house)}
                    </div>
                    <div class="dna-name">${standing.house}</div>
                </div>
                <div class="dna-items">
                    <div class="dna-item">
                        <span class="dna-label">Strength</span>
                        <span class="dna-value">${this.getStrength(standing)}</span>
                    </div>
                    <div class="dna-item">
                        <span class="dna-label">Trend</span>
                        <span class="dna-value">${standing.momentum}</span>
                    </div>
                    <div class="dna-item">
                        <span class="dna-label">Performance</span>
                        <span class="dna-value">${this.getPerformanceIndex(standing)}</span>
                    </div>
                    <div class="dna-item">
                        <span class="dna-label">Total Points</span>
                        <span class="dna-value" style="color: ${standing.color}">${standing.points}</span>
                    </div>
                    <div class="dna-item" style="border-bottom: none">
                        <span class="dna-label">Wins</span>
                        <span class="dna-value">${standing.wins}</span>
                    </div>
                </div>
            </div>
        `;
    }

    getHouseBadge(house) {
        const badges = {
            'Ashoka': '◆',
            'Shivaji': '◈',
            'Tagore': '●',
            'Raman': '◉'
        };
        return badges[house] || '◆';
    }

    computeStandingsFromEvents() {
        const baseHouseData = this.standings.reduce((acc, standing) => {
            acc[standing.house] = {
                ...standing,
                points: 0,
                sportPoints: 0,
                literaryPoints: 0,
                culturalPoints: 0,
                academicPoints: 0,
                wins: 0,
                recentTrend: standing.recentTrend || []
            };
            return acc;
        }, {});

        this.events.forEach(event => {
            const participants = event.houses || [];
            const share = participants.length ? event.points / participants.length : event.points;
            participants.forEach(house => {
                if (!baseHouseData[house]) return;
                baseHouseData[house].points += share;
                const categoryKey = `${event.category}Points`;
                baseHouseData[house][categoryKey] = (baseHouseData[house][categoryKey] || 0) + share;
            });
            if (event.winner && baseHouseData[event.winner]) {
                baseHouseData[event.winner].wins += 1;
            }
        });

        this.standings = Object.values(baseHouseData).map(standing => ({
            ...standing,
            points: Math.round(standing.points),
            sportPoints: Math.round(standing.sportPoints),
            literaryPoints: Math.round(standing.literaryPoints),
            culturalPoints: Math.round(standing.culturalPoints),
            academicPoints: Math.round(standing.academicPoints)
        }));

        this.standings.sort((a, b) => b.points - a.points);
        this.standings.forEach((standing, index) => {
            standing.rank = index + 1;
        });
    }

    getStrength(standing) {
        const categories = {
            sportPoints: 'Sports',
            literaryPoints: 'Literary',
            culturalPoints: 'Cultural',
            academicPoints: 'Academic'
        };

        let maxCategory = 'Sports';
        let maxValue = standing.sportPoints;

        Object.entries(categories).forEach(([key, value]) => {
            if (standing[key] > maxValue) {
                maxValue = standing[key];
                maxCategory = value;
            }
        });

        return maxCategory;
    }

    getPerformanceIndex(standing) {
        const avg = standing.points / 4;
        if (avg > 700) return 'Elite';
        if (avg > 600) return 'High';
        if (avg > 500) return 'Good';
        return 'Rising';
    }

    setupRealtimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.simulateLiveUpdates();
        }, 30000);
    }

    simulateLiveUpdates() {
        // Add random points to simulate live competition
        this.standings.forEach(standing => {
            const randomPoints = Math.floor(Math.random() * 50) - 20;
            standing.points = Math.max(standing.points + randomPoints, 1000);
        });

        // Re-sort by points
        this.standings.sort((a, b) => b.points - a.points);
        
        // Update ranks
        this.standings.forEach((standing, index) => {
            standing.rank = index + 1;
        });

        this.renderTable();
        this.renderHouseDNA();
        
        console.log('📊 Live standings updated');
    }
}

// Initialize standings system
if (document.querySelector('.standings-page')) {
    document.addEventListener('DOMContentLoaded', () => {
        new StandingsSystem();
    });
}

console.log('%cAshoka House - Standings System', 'color: #2d9d78; font-size: 12px; font-weight: bold;');
