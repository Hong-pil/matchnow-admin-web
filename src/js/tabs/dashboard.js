// public/js/tabs/dashboard.js

const Dashboard = {
    // 대시보드 HTML 템플릿
    template: `
        <div class="content-panel">
            <h2>📊 대시보드</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3 id="countriesCount">0</h3>
                    <p>국가</p>
                </div>
                <div class="stat-card">
                    <h3 id="sportsCount">0</h3>
                    <p>스포츠 카테고리</p>
                </div>
                <div class="stat-card">
                    <h3 id="leaguesCount">0</h3>
                    <p>리그</p>
                </div>
                <div class="stat-card">
                    <h3 id="teamsCount">0</h3>
                    <p>팀</p>
                </div>
                <div class="stat-card">
                    <h3 id="playersCount">0</h3>
                    <p>선수</p>
                </div>
            </div>
        </div>
    `,

    // 대시보드 렌더링
    async render() {
        console.log('📊 대시보드 로드');
        
        // 템플릿 렌더링
        Utils.renderContent(this.template);
        
        // 데이터 로드 및 업데이트
        await this.loadData();
    },

    // 데이터 로드
    async loadData() {
        try {
            const data = await API.loadDashboardData();
            
            // 통계 업데이트
            document.getElementById('countriesCount').textContent = data.countries;
            document.getElementById('sportsCount').textContent = data.sports;
            document.getElementById('leaguesCount').textContent = data.leagues;
            document.getElementById('teamsCount').textContent = data.teams;
            document.getElementById('playersCount').textContent = data.players;
            
        } catch (error) {
            console.error('대시보드 데이터 로드 실패:', error);
            Utils.showError('대시보드 데이터를 불러올 수 없습니다.');
        }
    }
};