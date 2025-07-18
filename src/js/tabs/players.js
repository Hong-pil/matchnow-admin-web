// public/js/tabs/players.js

const Players = {
    // 선수 관리 HTML 템플릿
    template: `
        <div class="content-panel">
            <h2>🏃‍♂️ 선수 관리</h2>
            <div class="controls">
                <div class="form-group">
                    <label>선수명 (한국어)</label>
                    <input type="text" id="newPlayerName" class="form-control" placeholder="예: 손흥민">
                </div>
                <div class="form-group">
                    <label>선수명 (영어)</label>
                    <input type="text" id="newPlayerNameEn" class="form-control" placeholder="예: Son Heung-min">
                </div>
                <div class="form-group">
                    <label>포지션</label>
                    <input type="text" id="newPlayerPosition" class="form-control" placeholder="예: 공격수">
                </div>
                <button class="btn btn-success" id="addPlayerBtn">➕ 선수 추가</button>
                <button class="btn btn-primary" id="refreshPlayersBtn">🔄 새로고침</button>
            </div>
            <div id="playersData" class="data-list"></div>
        </div>
    `,

    // 렌더링
    async render() {
        console.log('🏃‍♂️ 선수 관리 로드');
        
        // 템플릿 렌더링
        Utils.renderContent(this.template);
        
        // 이벤트 리스너 등록
        this.attachEventListeners();
        
        // 데이터 로드
        await this.loadData();
    },

    // 이벤트 리스너 등록
    attachEventListeners() {
        document.getElementById('addPlayerBtn').addEventListener('click', () => this.create());
        document.getElementById('refreshPlayersBtn').addEventListener('click', () => this.loadData());
    },

    // 데이터 로드
    async loadData() {
        console.log('🏃‍♂️ 선수 데이터 로드');
        const container = document.getElementById('playersData');
        container.innerHTML = Utils.createLoadingHTML();

        try {
            const response = await CONFIG.api.get('/players?limit=50');
            const players = response.data.data.results || [];
            
            if (players.length === 0) {
                container.innerHTML = Utils.createEmptyStateHTML('등록된 선수가 없습니다.');
                return;
            }

            container.innerHTML = players.map(p => `
                <div class="data-card">
                    <h3>🏃‍♂️ ${p.name}</h3>
                    <p><strong>영어명:</strong> ${p.nameEn}</p>
                    ${p.position ? `<p><strong>포지션:</strong> ${p.position}</p>` : ''}
                    <p><strong>생성일:</strong> ${Utils.formatDate(p.createdAt)}</p>
                    <div style="margin-top: 15px;">
                        <button class="btn btn-danger" onclick="Players.delete('${p._id}')">🗑️ 삭제</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('선수 데이터 로드 실패:', error);
            container.innerHTML = '<div class="error">선수 데이터 로드에 실패했습니다.</div>';
        }
    },

    // 선수 생성
    async create() {
        const name = document.getElementById('newPlayerName').value.trim();
        const nameEn = document.getElementById('newPlayerNameEn').value.trim();
        const position = document.getElementById('newPlayerPosition').value.trim();
        
        if (!name || !nameEn) {
            Utils.showError('선수명은 필수입니다.');
            return;
        }

        try {
            const data = { name, nameEn };
            if (position) data.position = position;
            
            await CONFIG.api.post('/players', data);
            Utils.showSuccess('선수 추가 성공');
            document.getElementById('newPlayerName').value = '';
            document.getElementById('newPlayerNameEn').value = '';
            document.getElementById('newPlayerPosition').value = '';
            
            await this.loadData();
            
            // 대시보드 업데이트
            if (window.Dashboard) {
                await Dashboard.loadData();
            }
        } catch (error) {
            console.error('선수 추가 실패:', error);
            Utils.showError('선수 추가 실패');
        }
    },

    // 선수 삭제
    async delete(id) {
        if (!confirm('삭제하시겠습니까?')) return;
        
        try {
            await CONFIG.api.delete(`/players/${id}`);
            Utils.showSuccess('선수 삭제 성공');
            await this.loadData();
            
            // 대시보드 업데이트
            if (window.Dashboard) {
                await Dashboard.loadData();
            }
        } catch (error) {
            console.error('선수 삭제 실패:', error);
            Utils.showError('선수 삭제 실패');
        }
    }
};