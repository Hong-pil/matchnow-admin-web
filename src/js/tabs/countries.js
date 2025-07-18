// public/js/tabs/countries.js

const Countries = {
    // 국가 관리 HTML 템플릿
    template: `
        <div class="content-panel">
            <h2>🌍 국가 관리</h2>
            <div class="controls">
                <div class="form-group">
                    <label>새 국가 추가</label>
                    <input type="text" id="newCountryName" class="form-control" placeholder="국가명을 입력하세요">
                </div>
                <button class="btn btn-success" id="addCountryBtn">➕ 국가 추가</button>
                <button class="btn btn-primary" id="refreshCountriesBtn">🔄 새로고침</button>
            </div>
            <div id="countriesData" class="data-list"></div>
        </div>
    `,

    // 렌더링
    async render() {
        console.log('🌍 국가 관리 로드');
        
        // 템플릿 렌더링
        Utils.renderContent(this.template);
        
        // 이벤트 리스너 등록
        this.attachEventListeners();
        
        // 데이터 로드
        await this.loadData();
    },

    // 이벤트 리스너 등록
    attachEventListeners() {
        document.getElementById('addCountryBtn').addEventListener('click', () => this.create());
        document.getElementById('refreshCountriesBtn').addEventListener('click', () => this.loadData());
        
        // Enter 키 이벤트
        document.getElementById('newCountryName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.create();
            }
        });
    },

    // 데이터 로드
    async loadData() {
        console.log('🌍 국가 데이터 로드');
        const container = document.getElementById('countriesData');
        container.innerHTML = Utils.createLoadingHTML();

        try {
            const response = await CONFIG.api.get('/countries?limit=50');
            const countries = response.data.data.results || [];
            
            if (countries.length === 0) {
                container.innerHTML = Utils.createEmptyStateHTML('등록된 국가가 없습니다.');
                return;
            }

            container.innerHTML = countries.map(country => `
                <div class="data-card">
                    <h3>🌍 ${country.name}</h3>
                    <p><strong>ID:</strong> ${country._id}</p>
                    <p><strong>생성일:</strong> ${Utils.formatDate(country.createdAt)}</p>
                    <div style="margin-top: 15px;">
                        <button class="btn btn-danger" onclick="Countries.delete('${country._id}')">🗑️ 삭제</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('국가 데이터 로드 실패:', error);
            container.innerHTML = '<div class="error">국가 데이터 로드에 실패했습니다.</div>';
        }
    },

    // 국가 생성
    async create() {
        const name = document.getElementById('newCountryName').value.trim();
        if (!name) {
            Utils.showError('국가명을 입력하세요.');
            return;
        }

        try {
            await CONFIG.api.post('/countries', { name });
            Utils.showSuccess('국가 추가 성공');
            document.getElementById('newCountryName').value = '';
            await this.loadData();
            
            // 대시보드 업데이트
            if (window.Dashboard) {
                await Dashboard.loadData();
            }
        } catch (error) {
            console.error('국가 추가 실패:', error);
            Utils.showError('국가 추가 실패');
        }
    },

    // 국가 삭제
    async delete(id) {
        if (!confirm('삭제하시겠습니까?')) return;
        
        try {
            await CONFIG.api.delete(`/countries/${id}`);
            Utils.showSuccess('국가 삭제 성공');
            await this.loadData();
            
            // 대시보드 업데이트
            if (window.Dashboard) {
                await Dashboard.loadData();
            }
        } catch (error) {
            console.error('국가 삭제 실패:', error);
            Utils.showError('국가 삭제 실패');
        }
    }
};