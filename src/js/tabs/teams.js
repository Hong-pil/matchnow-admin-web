// public/js/tabs/teams.js

const Teams = {
    // 팀 관리 HTML 템플릿
    template: `
        <div class="content-panel">
            <h2>⚽ 팀 관리</h2>
            <div class="controls">
                <div class="form-group">
                    <label>팀명</label>
                    <input type="text" id="newTeamName" class="form-control" placeholder="예: 토트넘">
                </div>
                <div class="form-group">
                    <label>팀 설명</label>
                    <input type="text" id="newTeamDescription" class="form-control" placeholder="팀 설명">
                </div>
                <div class="form-group">
                    <label>국가</label>
                    <select id="newTeamCountry" class="form-control">
                        <option value="">국가를 선택하세요</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>스포츠 카테고리</label>
                    <select id="newTeamSports" class="form-control">
                        <option value="">스포츠를 선택하세요</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>홈구장</label>
                    <input type="text" id="newTeamStadium" class="form-control" placeholder="예: Tottenham Hotspur Stadium">
                </div>
                <div class="form-group">
                    <label>BATS ID</label>
                    <input type="text" id="newTeamBatsId" class="form-control" placeholder="예: 8910">
                </div>
                <button class="btn btn-success" id="addTeamBtn">➕ 팀 추가</button>
                <button class="btn btn-primary" id="refreshTeamsBtn">🔄 새로고침</button>
            </div>
            <div id="teamsData" class="data-list"></div>
        </div>
    `,

    // 렌더링
    async render() {
        console.log('⚽ 팀 관리 로드');
        
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
        document.getElementById('addTeamBtn').addEventListener('click', () => this.create());
        document.getElementById('refreshTeamsBtn').addEventListener('click', () => this.loadData());
    },

    // 데이터 로드
    async loadData() {
        console.log('⚽ 팀 데이터 로드');
        const container = document.getElementById('teamsData');
        container.innerHTML = Utils.createLoadingHTML();

        try {
            const response = await CONFIG.api.get('/teams?limit=50');
            const teams = response.data.data.result || [];
            
            if (teams.length === 0) {
                container.innerHTML = Utils.createEmptyStateHTML('등록된 팀이 없습니다.');
                return;
            }

            container.innerHTML = teams.map(t => `
                <div class="data-card">
                    <h3>⚽ ${t.name}</h3>
                    ${t.description ? `<p><strong>설명:</strong> ${t.description}</p>` : ''}
                    <p><strong>국가:</strong> ${t.country?.name || 'N/A'}</p>
                    <p><strong>스포츠:</strong> ${t.sportsCategory?.name || 'N/A'}</p>
                    ${t.stadiumName ? `<p><strong>홈구장:</strong> ${t.stadiumName}</p>` : ''}
                    <p><strong>선수 수:</strong> ${t.players?.length || 0}명</p>
                    ${t.batsId ? `<p><strong>BATS ID:</strong> ${t.batsId}</p>` : ''}
                    <div style="margin-top: 15px;">
                        <button class="btn btn-danger" onclick="Teams.delete('${t._id}')">🗑️ 삭제</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('팀 데이터 로드 실패:', error);
            container.innerHTML = '<div class="error">팀 데이터 로드에 실패했습니다.</div>';
        }
    },

    // 팀 생성
    async create() {
        const name = document.getElementById('newTeamName').value.trim();
        const description = document.getElementById('newTeamDescription').value.trim();
        const countryId = document.getElementById('newTeamCountry').value;
        const sportsCategoryId = document.getElementById('newTeamSports').value;
        const stadiumName = document.getElementById('newTeamStadium').value.trim();
        const batsId = document.getElementById('newTeamBatsId').value.trim();
        
        if (!name || !countryId || !sportsCategoryId) {
            Utils.showError('필수 필드를 모두 입력하세요 (팀명, 국가, 스포츠).');
            return;
        }

        try {
            const data = {
                name,
                countryId,
                sportsCategoryId,
                players: [] // 빈 선수 배열
            };
            
            if (description) data.description = description;
            if (stadiumName) data.stadiumName = stadiumName;
            if (batsId) data.batsId = batsId;
            
            await CONFIG.api.post('/teams', data);
            Utils.showSuccess('팀 추가 성공');
            
            // 폼 초기화
            document.getElementById('newTeamName').value = '';
            document.getElementById('newTeamDescription').value = '';
            document.getElementById('newTeamCountry').value = '';
            document.getElementById('newTeamSports').value = '';
            document.getElementById('newTeamStadium').value = '';
            document.getElementById('newTeamBatsId').value = '';
            
            await this.loadData();
            
            // 대시보드 업데이트
            if (window.Dashboard) {
                await Dashboard.loadData();
            }
        } catch (error) {
            console.error('팀 추가 실패:', error);
            Utils.showError('팀 추가 실패: ' + (error.response?.data?.message || error.message));
        }
    },

    // 팀 삭제
    async delete(id) {
        if (!confirm('삭제하시겠습니까?')) return;
        
        try {
            await CONFIG.api.delete(`/teams/${id}`);
            Utils.showSuccess('팀 삭제 성공');
            await this.loadData();
            
            // 대시보드 업데이트
            if (window.Dashboard) {
                await Dashboard.loadData();
            }
        } catch (error) {
            console.error('팀 삭제 실패:', error);
            Utils.showError('팀 삭제 실패');
        }
    }
};