// public/js/tabs/leagues.js

const Leagues = {
    // 리그 관리 HTML 템플릿
    template: `
        <div class="content-panel">
            <h2>🏆 리그 관리</h2>
            <div class="controls">
                <div class="form-group">
                    <label>리그명</label>
                    <input type="text" id="newLeagueName" class="form-control" placeholder="예: 프리미어 리그">
                </div>
                <div class="form-group">
                    <label>리그 약칭</label>
                    <input type="text" id="newLeagueNameShort" class="form-control" placeholder="예: EPL">
                </div>
                <div class="form-group">
                    <label>국가</label>
                    <select id="newLeagueCountry" class="form-control">
                        <option value="">국가를 선택하세요</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>스포츠 카테고리</label>
                    <select id="newLeagueSports" class="form-control">
                        <option value="">스포츠를 선택하세요</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>설명</label>
                    <input type="text" id="newLeagueDescription" class="form-control" placeholder="리그 설명">
                </div>
                <div class="form-group">
                    <label>BATS ID</label>
                    <input type="text" id="newLeagueBatsId" class="form-control" placeholder="예: 94">
                </div>
                <button class="btn btn-success" id="addLeagueBtn">➕ 리그 추가</button>
                <button class="btn btn-primary" id="refreshLeaguesBtn">🔄 새로고침</button>
            </div>
            <div id="leaguesData" class="data-list"></div>
        </div>
    `,

    // 렌더링
    async render() {
        console.log('🏆 리그 관리 로드');
        
        // 템플릿 렌더링
        Utils.renderContent(this.template);
        
        // 셀렉트 옵션 업데이트
        await API.loadSelectOptions();
        
        // 이벤트 리스너 등록
        this.attachEventListeners();
        
        // 데이터 로드
        await this.loadData();
    },

    // 이벤트 리스너 등록
    attachEventListeners() {
        document.getElementById('addLeagueBtn').addEventListener('click', () => this.create());
        document.getElementById('refreshLeaguesBtn').addEventListener('click', () => this.loadData());
    },

    // 데이터 로드
    async loadData() {
        console.log('🏆 리그 데이터 로드');
        const container = document.getElementById('leaguesData');
        container.innerHTML = Utils.createLoadingHTML();

        try {
            const response = await CONFIG.api.get('/leagues?limit=50');
            const leagues = response.data.data.result || [];
            
            if (leagues.length === 0) {
                container.innerHTML = Utils.createEmptyStateHTML('등록된 리그가 없습니다.');
                return;
            }

            container.innerHTML = leagues.map(l => `
                <div class="data-card">
                    <h3>🏆 ${l.name}</h3>
                    ${l.nameShort ? `<p><strong>약칭:</strong> ${l.nameShort}</p>` : ''}
                    <p><strong>국가:</strong> ${l.country?.name || 'N/A'}</p>
                    <p><strong>스포츠:</strong> ${l.sportsCategory?.name || 'N/A'}</p>
                    <p><strong>설명:</strong> ${l.description}</p>
                    <p><strong>BATS ID:</strong> ${l.batsId}</p>
                    <div style="margin-top: 15px;">
                        <button class="btn btn-danger" onclick="Leagues.delete('${l._id}')">🗑️ 삭제</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('리그 데이터 로드 실패:', error);
            container.innerHTML = '<div class="error">리그 데이터 로드에 실패했습니다.</div>';
        }
    },

    // 리그 생성
    async create() {
        const name = document.getElementById('newLeagueName').value.trim();
        const nameShort = document.getElementById('newLeagueNameShort').value.trim();
        const countryId = document.getElementById('newLeagueCountry').value;
        const sportsCategoryId = document.getElementById('newLeagueSports').value;
        const description = document.getElementById('newLeagueDescription').value.trim();
        const batsId = document.getElementById('newLeagueBatsId').value.trim();
        
        if (!name || !countryId || !sportsCategoryId || !description || !batsId) {
            Utils.showError('필수 필드를 모두 입력하세요 (리그명, 국가, 스포츠, 설명, BATS ID).');
            return;
        }

        try {
            const data = {
                name,
                countryId,
                sportsCategoryId,
                description,
                batsId
            };
            
            if (nameShort) data.nameShort = nameShort;
            
            await CONFIG.api.post('/leagues', data);
            Utils.showSuccess('리그 추가 성공');
            
            // 폼 초기화
            document.getElementById('newLeagueName').value = '';
            document.getElementById('newLeagueNameShort').value = '';
            document.getElementById('newLeagueCountry').value = '';
            document.getElementById('newLeagueSports').value = '';
            document.getElementById('newLeagueDescription').value = '';
            document.getElementById('newLeagueBatsId').value = '';
            
            await this.loadData();
            
            // 대시보드 업데이트
            if (window.Dashboard) {
                await Dashboard.loadData();
            }
        } catch (error) {
            console.error('리그 추가 실패:', error);
            Utils.showError('리그 추가 실패: ' + (error.response?.data?.message || error.message));
        }
    },

    // 리그 삭제
    async delete(id) {
        if (!confirm('삭제하시겠습니까?')) return;
        
        try {
            await CONFIG.api.delete(`/leagues/${id}`);
            Utils.showSuccess('리그 삭제 성공');
            await this.loadData();
            
            // 대시보드 업데이트
            if (window.Dashboard) {
                await Dashboard.loadData();
            }
        } catch (error) {
            console.error('리그 삭제 실패:', error);
            Utils.showError('리그 삭제 실패');
        }
    }
};