// public/js/tabs/football-schedule.js (업데이트됨)
const FootballSchedule = {
    // 현재 선택된 날짜 상태
    currentDate: new Date(),
    
    // 수정 중인 경기 ID
    editingMatchId: null,

    // 축구 경기 일정 HTML 템플릿
    template: `
        <div class="content-panel">
            <h2>⚽ 축구 경기 일정</h2>
            
            <!-- 날짜 선택 섹션 -->
            <div class="date-selector-section">
                <h3>📅 날짜 선택</h3>
                <div class="date-controls">
                    <button class="btn btn-info" id="prevDayBtn">◀ 어제</button>
                    <input type="date" id="datePicker" class="form-control date-picker">
                    <button class="btn btn-info" id="nextDayBtn">내일 ▶</button>
                    <button class="btn btn-primary" id="todayBtn">오늘</button>
                </div>
                <div class="selected-date-display">
                    <span id="selectedDateText">오늘 날짜</span>
                </div>
            </div>

            <div class="match-tabs">
                <button class="match-tab active" id="upcoming-tab">예정된 경기</button>
                <button class="match-tab" id="inplay-tab">진행 중인 경기</button>
                <button class="match-tab" id="ended-tab">종료된 경기</button>
            </div>

            <div class="controls">
                <button class="btn btn-primary" id="refreshMatchesBtn">🔄 새로고침</button>
                <button class="btn btn-info" id="loadLeaguesBtn">🏆 리그 목록 보기</button>
                <button class="btn btn-success" id="autoSyncBtn">🔄 자동 동기화</button>
                <button class="btn btn-warning" id="addMatchBtn">➕ 경기 추가</button>
            </div>

            <div id="matchesData" class="data-list"></div>
            
            <div id="matchesPagination" class="pagination" style="display: none;"></div>
        </div>

        <!-- 경기 수정/추가 모달 -->
        <div id="matchModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modalTitle">경기 수정</h3>
                    <button class="btn btn-sm btn-danger" id="closeModalBtn">✕</button>
                </div>
                <div class="modal-body">
                    <form id="matchForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label>홈팀 이름</label>
                                <input type="text" id="homeTeamName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>원정팀 이름</label>
                                <input type="text" id="awayTeamName" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>리그 이름</label>
                                <input type="text" id="leagueName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>경기 시간 (Unix timestamp)</label>
                                <input type="number" id="matchTime" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>경기 상태</label>
                                <select id="matchStatus" class="form-control" required>
                                    <option value="0">예정</option>
                                    <option value="1">진행중</option>
                                    <option value="3">종료</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>스코어 (예: 2-1)</label>
                                <input type="text" id="matchScore" class="form-control" placeholder="2-1">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>관리자 노트</label>
                            <textarea id="adminNote" class="form-control" rows="3"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">저장</button>
                            <button type="button" class="btn btn-secondary" id="cancelBtn">취소</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,

    // 렌더링
    async render() {
        console.log('⚽ 축구 경기 일정 로드');
        
        // 템플릿 렌더링
        Utils.renderContent(this.template);
        
        // 현재 날짜로 초기화
        this.currentDate = new Date();
        this.updateDateDisplay();
        
        // 이벤트 리스너 등록
        this.attachEventListeners();
        
        // 초기 데이터 로드
        await this.loadMatches();
    },

    // 이벤트 리스너 등록
    attachEventListeners() {
        // 기존 탭 이벤트
        document.getElementById('upcoming-tab').addEventListener('click', () => this.switchMatchType('upcoming'));
        document.getElementById('inplay-tab').addEventListener('click', () => this.switchMatchType('inplay'));
        document.getElementById('ended-tab').addEventListener('click', () => this.switchMatchType('ended'));
        document.getElementById('refreshMatchesBtn').addEventListener('click', () => this.loadMatches());
        document.getElementById('loadLeaguesBtn').addEventListener('click', () => this.loadLeagues());
        
        // 새로운 기능 이벤트
        document.getElementById('autoSyncBtn').addEventListener('click', () => this.autoSync());
        document.getElementById('addMatchBtn').addEventListener('click', () => this.showAddMatchModal());
        
        // 날짜 선택 이벤트
        document.getElementById('prevDayBtn').addEventListener('click', () => this.changeDate(-1));
        document.getElementById('nextDayBtn').addEventListener('click', () => this.changeDate(1));
        document.getElementById('todayBtn').addEventListener('click', () => this.setToday());
        document.getElementById('datePicker').addEventListener('change', (e) => this.setDateFromPicker(e.target.value));
        
        // 모달 이벤트
        document.getElementById('closeModalBtn').addEventListener('click', () => this.hideModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.hideModal());
        document.getElementById('matchForm').addEventListener('submit', (e) => this.saveMatch(e));
        
        // 모달 외부 클릭 시 닫기
        document.getElementById('matchModal').addEventListener('click', (e) => {
            if (e.target.id === 'matchModal') {
                this.hideModal();
            }
        });
    },

    // Enhanced API 사용하여 경기 데이터 로드
    async loadMatches() {
        console.log(`⚽ ${CONFIG.state.currentMatchType} 경기 로드 (Enhanced API)`);
        
        const container = document.getElementById('matchesData');
        container.innerHTML = Utils.createLoadingHTML('축구 경기 데이터를 불러오는 중...');

        try {
            let endpoint = '';
            const dateParam = this.formatDateForAPI(this.currentDate);
            
            // Enhanced API 엔드포인트 사용
            switch (CONFIG.state.currentMatchType) {
                case 'upcoming':
                    endpoint = `/enhanced-football/matches/upcoming?page=${CONFIG.state.currentPage}&day=${dateParam}`;
                    break;
                case 'inplay':
                    endpoint = '/enhanced-football/matches/inplay';
                    break;
                case 'ended':
                    endpoint = `/enhanced-football/matches/ended?page=${CONFIG.state.currentPage}&day=${dateParam}`;
                    break;
            }

            console.log('🌐 Enhanced API 요청:', CONFIG.API_BASE + endpoint);
            const response = await CONFIG.api.get(endpoint);
            console.log('📦 Enhanced API 응답:', response.data);
            
            const data = response.data.data;
            
            if (!data || !data.results || data.results.length === 0) {
                const dateText = this.isSameDate(this.currentDate, new Date()) ? '오늘' : this.formatDateKorean(this.currentDate);
                container.innerHTML = Utils.createEmptyStateHTML(`${dateText}에 ${this.getMatchTypeText(CONFIG.state.currentMatchType)} 경기가 없습니다.`);
                document.getElementById('matchesPagination').style.display = 'none';
                return;
            }

            console.log(`✅ ${data.results.length}개의 경기를 찾았습니다 (수정된 경기: ${data.stats?.modified_matches || 0}개)`);

            // 경기 카드들 렌더링 (Enhanced 버전)
            container.innerHTML = data.results.map(match => this.createEnhancedMatchCard(match)).join('');
            
            // 통계 정보 표시
            if (data.stats) {
                this.displayMatchStats(data.stats);
            }
            
            // 페이지네이션 업데이트
            if (CONFIG.state.currentMatchType !== 'inplay' && data.pager) {
                this.updatePagination(data.pager);
            } else {
                document.getElementById('matchesPagination').style.display = 'none';
            }

        } catch (error) {
            console.error('❌ Enhanced 축구 경기 로드 실패:', error);
            
            let errorMessage = 'Enhanced 축구 경기 데이터 로드에 실패했습니다.';
            if (error.response?.status === 404) {
                errorMessage = 'Enhanced API 서비스를 찾을 수 없습니다.';
            }
            
            container.innerHTML = `<div class="error">${errorMessage}<br><small>일반 API로 대체 시도 중...</small></div>`;
            
            // Fallback to original API
            setTimeout(() => this.loadMatchesFallback(), 1000);
        }
    },

    // 기존 API로 폴백
    async loadMatchesFallback() {
        console.log('🔄 기존 API로 폴백');
        // 여기에 기존 loadMatches 로직을 넣거나 간단한 에러 처리
        const container = document.getElementById('matchesData');
        container.innerHTML = `<div class="error">Enhanced API를 사용할 수 없습니다. 관리자에게 문의하세요.</div>`;
    },

    // Enhanced 경기 카드 생성 (수정/삭제 버튼 포함)
    createEnhancedMatchCard(match) {
        const matchTime = Utils.formatMatchTime(match.time);
        const isModified = match.isModified || false;
        const isLocalOnly = match.isLocalOnly || false;

        let statusClass = 'status-upcoming';
        let statusText = '예정';
        
        if (match.time_status === '1') {
            statusClass = 'status-inplay';
            statusText = '진행중';
        } else if (match.time_status === '3') {
            statusClass = 'status-ended';
            statusText = '종료';
        }

        const score = match.ss ? match.ss.split('-') : ['', ''];
        const homeScore = score[0] || '';
        const awayScore = score[1] || '';

        // 수정된 경기 표시
        const modifiedBadge = isModified ? 
            `<span class="modified-badge" title="관리자가 수정한 경기">✏️ 수정됨</span>` : '';
        
        const localOnlyBadge = isLocalOnly ? 
            `<span class="local-only-badge" title="로컬에만 있는 경기">📍 로컬</span>` : '';

        return `
            <div class="match-card enhanced-match-card">
                <div class="match-header">
                    <div class="match-league">
                        ${match.league?.name || '알 수 없는 리그'}
                        ${modifiedBadge}
                        ${localOnlyBadge}
                    </div>
                    <div class="match-time">${matchTime}</div>
                </div>
                
                <div class="match-teams">
                    <div class="team">
                        <div class="team-name">${match.home?.name || '홈팀'}</div>
                    </div>
                    
                    <div class="vs">
                        ${match.ss ? 
                            `<div class="score">${homeScore} - ${awayScore}</div>` : 
                            'VS'
                        }
                    </div>
                    
                    <div class="team">
                        <div class="team-name">${match.away?.name || '원정팀'}</div>
                    </div>
                </div>
                
                <div class="match-status">
                    <span class="match-status ${statusClass}">${statusText}</span>
                    ${match.timer?.tm ? `<span style="margin-left: 10px;">⏱️ ${match.timer.tm}'</span>` : ''}
                </div>
                
                ${match.adminNote ? `
                    <div class="admin-note">
                        <strong>관리자 노트:</strong> ${match.adminNote}
                    </div>
                ` : ''}
                
                <div class="match-actions" style="margin-top: 15px;">
                    <button class="btn btn-info btn-sm" onclick="FootballSchedule.viewMatchDetails('${match.id}')">상세 보기</button>
                    ${match._id ? `
                        <button class="btn btn-warning btn-sm" onclick="FootballSchedule.editMatch('${match._id}', '${match.id}')">✏️ 수정</button>
                        <button class="btn btn-danger btn-sm" onclick="FootballSchedule.deleteMatch('${match._id}', '${match.home?.name || '홈팀'}', '${match.away?.name || '원정팀'}')">🗑️ 삭제</button>
                    ` : `
                        <button class="btn btn-success btn-sm" onclick="FootballSchedule.saveToLocal('${match.id}')">💾 로컬 저장</button>
                    `}
                </div>
            </div>
        `;
    },

    // 통계 정보 표시
    displayMatchStats(stats) {
        const container = document.getElementById('matchesData');
        const statsHtml = `
            <div class="match-stats-banner">
                <span>📊 전체: ${stats.total_matches}개</span>
                <span>✏️ 수정됨: ${stats.modified_matches}개</span>
                <span>📍 로컬전용: ${stats.local_only_matches}개</span>
            </div>
        `;
        container.insertAdjacentHTML('afterbegin', statsHtml);
    },

    // 자동 동기화
    async autoSync() {
        console.log('🔄 자동 동기화 시작');
        
        try {
            const type = CONFIG.state.currentMatchType;
            const day = this.formatDateForAPI(this.currentDate);
            
            const response = await CONFIG.api.post(`/enhanced-football/sync/auto/${type}?day=${day}`);
            
            if (response.data.success) {
                const result = response.data.data;
                Utils.showSuccess(`동기화 완료: ${result.created}개 생성, ${result.updated}개 업데이트`);
                await this.loadMatches(); // 새로고침
            }
        } catch (error) {
            console.error('자동 동기화 실패:', error);
            Utils.showError('자동 동기화에 실패했습니다.');
        }
    },

    // 경기 추가 모달 표시
    showAddMatchModal() {
        document.getElementById('modalTitle').textContent = '새 경기 추가';
        document.getElementById('matchForm').reset();
        this.editingMatchId = null;
        
        // 기본값 설정
        document.getElementById('matchTime').value = Math.floor(Date.now() / 1000);
        document.getElementById('matchStatus').value = '0';
        
        this.showModal();
    },

    // 경기 수정 모달 표시
    async editMatch(localId, betsApiId) {
        console.log('✏️ 경기 수정:', localId, betsApiId);
        
        try {
            // 로컬 DB에서 경기 정보 가져오기
            const response = await CONFIG.api.get(`/football-matches/${localId}`);
            const match = response.data.data;
            
            document.getElementById('modalTitle').textContent = '경기 수정';
            this.editingMatchId = localId;
            
            // 폼에 기존 데이터 채우기
            document.getElementById('homeTeamName').value = match.home?.name || '';
            document.getElementById('awayTeamName').value = match.away?.name || '';
            document.getElementById('leagueName').value = match.league?.name || '';
            document.getElementById('matchTime').value = match.time || '';
            document.getElementById('matchStatus').value = match.time_status || '0';
            document.getElementById('matchScore').value = match.ss || '';
            document.getElementById('adminNote').value = match.adminNote || '';
            
            this.showModal();
        } catch (error) {
            console.error('경기 정보 로드 실패:', error);
            Utils.showError('경기 정보를 불러올 수 없습니다.');
        }
    },

    // 경기 삭제
    async deleteMatch(localId, homeTeam, awayTeam) {
        if (!confirm(`정말로 "${homeTeam} vs ${awayTeam}" 경기를 삭제하시겠습니까?`)) {
            return;
        }
        
        try {
            const response = await CONFIG.api.delete(`/football-matches/${localId}`);
            
            if (response.data.success) {
                Utils.showSuccess('경기가 삭제되었습니다.');
                await this.loadMatches(); // 새로고침
            }
        } catch (error) {
            console.error('경기 삭제 실패:', error);
            Utils.showError('경기 삭제에 실패했습니다.');
        }
    },

    // BetsAPI 경기를 로컬에 저장
    async saveToLocal(betsApiId) {
        try {
            // Enhanced API에서 경기 상세 정보 가져오기
            const response = await CONFIG.api.get(`/enhanced-football/match/${betsApiId}`);
            const match = response.data.data;
            
            // 로컬 DB에 저장할 데이터 구성
            const saveData = {
                betsApiId: match.id,
                sport_id: match.sport_id,
                time: match.time,
                time_status: match.time_status,
                league: match.league,
                home: match.home,
                away: match.away,
                ss: match.ss,
                scores: match.scores,
                timer: match.timer,
                bet365_id: match.bet365_id,
                round: match.round,
                status: 'active',
            };
            
            const saveResponse = await CONFIG.api.post('/football-matches', saveData);
            
            if (saveResponse.data.success) {
                Utils.showSuccess('경기가 로컬에 저장되었습니다.');
                await this.loadMatches(); // 새로고침
            }
        } catch (error) {
            console.error('로컬 저장 실패:', error);
            Utils.showError('로컬 저장에 실패했습니다.');
        }
    },

    // 경기 저장 (추가/수정)
    async saveMatch(event) {
        event.preventDefault();
        
        const formData = {
            time: document.getElementById('matchTime').value,
            time_status: document.getElementById('matchStatus').value,
            league: {
                id: 'custom',
                name: document.getElementById('leagueName').value,
            },
            home: {
                id: 'home_custom',
                name: document.getElementById('homeTeamName').value,
            },
            away: {
                id: 'away_custom',
                name: document.getElementById('awayTeamName').value,
            },
            ss: document.getElementById('matchScore').value || null,
            adminNote: document.getElementById('adminNote').value || null,
            status: 'active',
        };
        
        // 새 경기 추가인 경우 추가 필드
        if (!this.editingMatchId) {
            formData.betsApiId = `custom_${Date.now()}`;
            formData.sport_id = '1';
        }
        
        try {
            let response;
            
            if (this.editingMatchId) {
                // 수정
                response = await CONFIG.api.put(`/football-matches/${this.editingMatchId}`, formData);
            } else {
                // 추가
                response = await CONFIG.api.post('/football-matches', formData);
            }
            
            if (response.data.success) {
                Utils.showSuccess(this.editingMatchId ? '경기가 수정되었습니다.' : '경기가 추가되었습니다.');
                this.hideModal();
                await this.loadMatches(); // 새로고침
            }
        } catch (error) {
            console.error('경기 저장 실패:', error);
            Utils.showError('경기 저장에 실패했습니다.');
        }
    },

    // 모달 표시
    showModal() {
        document.getElementById('matchModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },

    // 모달 숨김
    hideModal() {
        document.getElementById('matchModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.editingMatchId = null;
    },

    // 날짜 변경 (+1일 또는 -1일)
    changeDate(days) {
        this.currentDate.setDate(this.currentDate.getDate() + days);
        this.updateDateDisplay();
        this.loadMatches();
    },

    // 오늘 날짜로 설정
    setToday() {
        this.currentDate = new Date();
        this.updateDateDisplay();
        this.loadMatches();
    },

    // 날짜 선택기에서 날짜 설정
    setDateFromPicker(dateString) {
        if (dateString) {
            this.currentDate = new Date(dateString + 'T00:00:00');
            this.updateDateDisplay();
            this.loadMatches();
        }
    },

    // 날짜 표시 업데이트
    updateDateDisplay() {
        const datePicker = document.getElementById('datePicker');
        const selectedDateText = document.getElementById('selectedDateText');
        
        if (datePicker && selectedDateText) {
            const dateString = this.currentDate.toISOString().split('T')[0];
            datePicker.value = dateString;
            
            const today = new Date();
            const isToday = this.isSameDate(this.currentDate, today);
            
            if (isToday) {
                selectedDateText.textContent = `오늘 (${this.formatDateKorean(this.currentDate)})`;
            } else {
                const dayDiff = Math.floor((this.currentDate - today) / (1000 * 60 * 60 * 24));
                if (dayDiff === -1) {
                    selectedDateText.textContent = `어제 (${this.formatDateKorean(this.currentDate)})`;
                } else if (dayDiff === 1) {
                    selectedDateText.textContent = `내일 (${this.formatDateKorean(this.currentDate)})`;
                } else {
                    selectedDateText.textContent = this.formatDateKorean(this.currentDate);
                }
            }
        }
    },

    // 두 날짜가 같은 날인지 확인
    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    },

    // 한국어 날짜 포맷
    formatDateKorean(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const dayName = dayNames[date.getDay()];
        
        return `${year}년 ${month}월 ${day}일 (${dayName})`;
    },

    // YYYYMMDD 형식으로 날짜 변환
    formatDateForAPI(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    },

    // 경기 타입 전환
    switchMatchType(type) {
        CONFIG.state.currentMatchType = type;
        CONFIG.state.currentPage = 1;
        
        // 탭 스타일 업데이트
        document.querySelectorAll('.match-tab').forEach(tab => tab.classList.remove('active'));
        document.getElementById(type + '-tab').classList.add('active');
        
        this.loadMatches();
    },

    // 경기 타입 텍스트 반환
    getMatchTypeText(type) {
        switch (type) {
            case 'upcoming': return '예정된';
            case 'inplay': return '진행 중인';
            case 'ended': return '종료된';
            default: return '';
        }
    },

    // 페이지네이션 업데이트
    updatePagination(pager) {
        const container = document.getElementById('matchesPagination');
        const totalPages = Math.ceil(pager.total / pager.per_page);
        
        if (totalPages <= 1) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'flex';
        
        let paginationHTML = '';
        
        if (CONFIG.state.currentPage > 1) {
            paginationHTML += `<button onclick="FootballSchedule.changePage(${CONFIG.state.currentPage - 1})">이전</button>`;
        }
        
        const startPage = Math.max(1, CONFIG.state.currentPage - 2);
        const endPage = Math.min(totalPages, CONFIG.state.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === CONFIG.state.currentPage ? 'active' : '';
            paginationHTML += `<button class="${activeClass}" onclick="FootballSchedule.changePage(${i})">${i}</button>`;
        }
        
        if (CONFIG.state.currentPage < totalPages) {
            paginationHTML += `<button onclick="FootballSchedule.changePage(${CONFIG.state.currentPage + 1})">다음</button>`;
        }
        
        container.innerHTML = paginationHTML;
    },

    // 페이지 변경
    changePage(page) {
        CONFIG.state.currentPage = page;
        this.loadMatches();
    },

    // 경기 상세 정보 보기 (Enhanced)
    async viewMatchDetails(eventId) {
        try {
            const response = await CONFIG.api.get(`/enhanced-football/match/${eventId}`);
            const match = response.data.data;
            
            // 상세 정보를 모달이나 알림으로 표시
            const detailsText = `
경기 상세 정보:

홈팀: ${match.home?.name || 'N/A'}
원정팀: ${match.away?.name || 'N/A'}
리그: ${match.league?.name || 'N/A'}
시간: ${Utils.formatMatchTime(match.time)}
상태: ${match.time_status === '0' ? '예정' : match.time_status === '1' ? '진행중' : '종료'}
스코어: ${match.ss || 'N/A'}

${match.isModified ? '✏️ 관리자가 수정한 경기' : ''}
${match.adminNote ? `\n관리자 노트: ${match.adminNote}` : ''}
            `;
            
            alert(detailsText);
        } catch (error) {
            Utils.showError('경기 상세 정보를 불러올 수 없습니다.');
        }
    },

    // 리그 목록 로드
    async loadLeagues() {
        try {
            const response = await CONFIG.api.get('/football/leagues');
            const leagues = response.data.data.results || [];
            
            const container = document.getElementById('matchesData');
            container.innerHTML = leagues.map(league => `
                <div class="data-card">
                    <h3>🏆 ${league.name}</h3>
                    <p><strong>ID:</strong> ${league.id}</p>
                    <p><strong>국가:</strong> ${league.cc || 'N/A'}</p>
                </div>
            `).join('');
            
            Utils.showSuccess(`${leagues.length}개의 리그를 불러왔습니다.`);
        } catch (error) {
            Utils.showError('리그 목록을 불러올 수 없습니다.');
        }
    }
};