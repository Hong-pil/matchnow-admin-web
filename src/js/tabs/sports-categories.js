// public/js/tabs/sports-categories.js

const SportsCategories = {
    // 스포츠 카테고리 관리 HTML 템플릿
    template: `
        <div class="content-panel">
            <h2>🏃 스포츠 카테고리 관리</h2>
            <div class="controls">
                <div class="form-group">
                    <label>카테고리명 (한국어)</label>
                    <input type="text" id="newSportsName" class="form-control" placeholder="예: 축구">
                </div>
                <div class="form-group">
                    <label>카테고리명 (영어)</label>
                    <input type="text" id="newSportsNameEn" class="form-control" placeholder="예: football">
                </div>
                <button class="btn btn-success" id="addSportsBtn">➕ 카테고리 추가</button>
                <button class="btn btn-primary" id="refreshSportsBtn">🔄 새로고침</button>
            </div>
            <div id="sportsData" class="data-list"></div>
        </div>
    `,

    // 렌더링
    async render() {
        console.log('🏃 스포츠 카테고리 관리 로드');
        
        // 템플릿 렌더링
        Utils.renderContent(this.template);
        
        // 이벤트 리스너 등록
        this.attachEventListeners();
        
        // 데이터 로드
        await this.loadData();
    },

    // 이벤트 리스너 등록
    attachEventListeners() {
        document.getElementById('addSportsBtn').addEventListener('click', () => this.create());
        document.getElementById('refreshSportsBtn').addEventListener('click', () => this.loadData());
    },

    // 데이터 로드
    async loadData() {
        console.log('🏃 스포츠 카테고리 데이터 로드');
        const container = document.getElementById('sportsData');
        container.innerHTML = Utils.createLoadingHTML();

        try {
            const response = await CONFIG.api.get('/sports-categories?limit=50');
            const sports = response.data.data.results || [];
            
            if (sports.length === 0) {
                container.innerHTML = Utils.createEmptyStateHTML('등록된 카테고리가 없습니다.');
                return;
            }

            container.innerHTML = sports.map(s => `
                <div class="data-card">
                    <h3>🏃 ${s.name}</h3>
                    <p><strong>영어명:</strong> ${s.nameEn}</p>
                    <p><strong>생성일:</strong> ${Utils.formatDate(s.createdAt)}</p>
                    <div style="margin-top: 15px;">
                        <button class="btn btn-danger" onclick="SportsCategories.delete('${s._id}')">🗑️ 삭제</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('스포츠 카테고리 데이터 로드 실패:', error);
            container.innerHTML = '<div class="error">스포츠 카테고리 데이터 로드에 실패했습니다.</div>';
        }
    },

    // 스포츠 카테고리 생성
    async create() {
        const name = document.getElementById('newSportsName').value.trim();
        const nameEn = document.getElementById('newSportsNameEn').value.trim();
        
        if (!name || !nameEn) {
            Utils.showError('모든 필드를 입력하세요.');
            return;
        }

        try {
            await CONFIG.api.post('/sports-categories', { name, nameEn });
            Utils.showSuccess('카테고리 추가 성공');
            document.getElementById('newSportsName').value = '';
            document.getElementById('newSportsNameEn').value = '';
            await this.loadData();
            
            // 대시보드 업데이트
            if (window.Dashboard) {
                await Dashboard.loadData();
            }
        } catch (error) {
            console.error('스포츠 카테고리 추가 실패:', error);
            Utils.showError('카테고리 추가 실패');
        }
    },

    // 스포츠 카테고리 삭제
    async delete(id) {
        if (!confirm('삭제하시겠습니까?')) return;
        
        try {
            await CONFIG.api.delete(`/sports-categories/${id}`);
            Utils.showSuccess('카테고리 삭제 성공');
            await this.loadData();
            
            // 대시보드 업데이트
            if (window.Dashboard) {
                await Dashboard.loadData();
            }
        } catch (error) {
            console.error('스포츠 카테고리 삭제 실패:', error);
            Utils.showError('카테고리 삭제 실패');
        }
    }
};