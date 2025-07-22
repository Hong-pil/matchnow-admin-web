// src/js/tabs/football-schedule.js (수정된 버전 - 동기화 허용 및 저장 기능 개선)
const FootballSchedule = {
    // 현재 선택된 날짜 상태
    currentDate: new Date(),
    
    // 수정 중인 경기 ID
    editingMatchId: null,

    // 축구 경기 일정 HTML 템플릿 (기존과 동일)
    template: `
        <div class="content-panel">
            <h2>⚽ 축구 경기 일정 (통합 동기화)</h2>
            
            <!-- 데이터 상태 표시 -->
            <div id="dataStatusBanner" class="data-status-banner"></div>
            
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
                <button class="btn btn-success" id="syncBtn">🔄 동기화</button>
                <button class="btn btn-info" id="dbStatsBtn">📊 DB 통계</button>
                <button class="btn btn-secondary" id="completenessBtn">📈 데이터 완성도</button>
                <button class="btn btn-purple" id="highQualityBtn">🌟 고품질 경기</button>
                <div class="sync-controls">
                    <button class="btn btn-sm btn-outline" id="selectAllSyncBtn">모두 허용</button>
                    <button class="btn btn-sm btn-outline" id="deselectAllSyncBtn">모두 차단</button>
                    <span id="selectedCount" class="selected-count">동기화 허용: 0개</span>
                </div>
            </div>

            <div id="matchesData" class="data-list"></div>
            
            <div id="matchesPagination" class="pagination" style="display: none;"></div>
        </div>

        <!-- 경기 상세 통계 모달 -->
        <div id="statsModal" class="modal" style="display: none;">
            <div class="modal-content stats-modal-content">
                <div class="modal-header">
                    <h3 id="statsModalTitle">📊 경기 상세 통계</h3>
                    <button class="btn btn-sm btn-danger" id="closeStatsModalBtn">✕</button>
                </div>
                <div class="modal-body" id="statsModalBody">
                    <!-- 통계 내용이 동적으로 로드됨 -->
                </div>
            </div>
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
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="allowSync" class="form-control-checkbox">
                                동기화 허용
                            </label>
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
        console.log('⚽ 축구 경기 일정 로드 (수정된 동기화 버전)');
        
        Utils.renderContent(this.template);
        
        this.currentDate = new Date();
        this.updateDateDisplay();
        
        this.attachEventListeners();
        
        // 데이터 상태 체크
        await this.checkDataStatus();
        
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
        
        // 동기화 버튼 이벤트 리스너
        document.getElementById('syncBtn').addEventListener('click', () => this.performSync());
        
        // 기존 버튼들
        document.getElementById('dbStatsBtn').addEventListener('click', () => this.showDbStats());
        document.getElementById('completenessBtn').addEventListener('click', () => this.showDataCompleteness());
        document.getElementById('highQualityBtn').addEventListener('click', () => this.showHighQualityMatches());
        
        // 선택 관련 버튼들
        document.getElementById('selectAllSyncBtn').addEventListener('click', () => this.selectAllMatches());
        document.getElementById('deselectAllSyncBtn').addEventListener('click', () => this.deselectAllMatches());
        
        // 날짜 선택 이벤트
        document.getElementById('prevDayBtn').addEventListener('click', () => this.changeDate(-1));
        document.getElementById('nextDayBtn').addEventListener('click', () => this.changeDate(1));
        document.getElementById('todayBtn').addEventListener('click', () => this.setToday());
        document.getElementById('datePicker').addEventListener('change', (e) => this.setDateFromPicker(e.target.value));
        
        // 모달 이벤트들
        document.getElementById('closeModalBtn').addEventListener('click', () => this.hideModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.hideModal());
        document.getElementById('matchForm').addEventListener('submit', (e) => this.saveMatch(e));
        document.getElementById('closeStatsModalBtn').addEventListener('click', () => this.hideStatsModal());
        
        // 모달 외부 클릭 시 닫기
        document.getElementById('matchModal').addEventListener('click', (e) => {
            if (e.target.id === 'matchModal') this.hideModal();
        });
        document.getElementById('statsModal').addEventListener('click', (e) => {
            if (e.target.id === 'statsModal') this.hideStatsModal();
        });
    },

    // 🔧 수정: 데이터 상태 체크 (null 처리)
    async checkDataStatus() {
        try {
            const response = await CONFIG.api.get('/enhanced-football/check/sync-needed');
            const data = response.data.data;
            
            const banner = document.getElementById('dataStatusBanner');
            let statusClass = 'success';
            let statusIcon = '✅';
            
            if (data.syncNeeded) {
                statusClass = 'error';
                statusIcon = '❌';
            } else if (data.incompleteData) {
                statusClass = 'warning';
                statusIcon = '⚠️';
            }
            
            const completeness = data.completeness || 0;
            const totalMatches = data.dbStats?.total || 0;
            
            banner.className = `data-status-banner ${statusClass}`;
            banner.innerHTML = `
                <div class="status-info">
                    <span class="status-icon">${statusIcon}</span>
                    <div class="status-details">
                        <strong>데이터 상태:</strong> ${data.recommendation}
                        <br>
                        <small>완성도: ${completeness}% | 총 경기: ${totalMatches}개</small>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('경기 정보 로드 실패:', error);
            
            const banner = document.getElementById('dataStatusBanner');
            banner.className = 'data-status-banner warning';
            banner.innerHTML = `
                <div class="status-info">
                    <span class="status-icon">⚠️</span>
                    <div class="status-details">
                        <strong>데이터 상태:</strong> 상태 확인 중 오류 발생
                        <br>
                        <small>동기화 버튼을 눌러 데이터를 가져오세요</small>
                    </div>
                </div>
            `;
        }
    },

    // 동기화 메서드
    async performSync() {
        console.log('🔄 동기화 시작');
        
        const syncBtn = document.getElementById('syncBtn');
        const originalText = syncBtn.textContent;
        
        try {
            // 버튼 비활성화 및 로딩 표시
            syncBtn.disabled = true;
            syncBtn.textContent = '🔄 동기화 중...';
            
            // 현재 탭과 날짜에 따른 동기화 실행
            const currentType = CONFIG.state.currentMatchType || 'upcoming';
            const currentDay = this.formatDateForAPI(this.currentDate);
            
            console.log(`📅 동기화 대상: ${currentType}, 날짜: ${currentDay}`);
            
            // Enhanced API를 통해 자동 동기화 실행
            const response = await CONFIG.api.post(`/enhanced-football/sync/auto/${currentType}`, {}, {
                params: { day: currentDay },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                const result = response.data.data;
                Utils.showSuccess(`동기화 완료! 생성: ${result.created}개, 업데이트: ${result.updated}개, 건너뜀: ${result.skipped || 0}개`);
                
                // 상태 및 데이터 새로고침
                await this.checkDataStatus();
                await this.loadMatches();
            }
            
        } catch (error) {
            console.error('동기화 실패:', error);
            
            let errorMessage = '동기화에 실패했습니다.';
            
            if (error.response) {
                if (error.response.data) {
                    if (typeof error.response.data === 'string') {
                        errorMessage = error.response.data;
                    } else if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else {
                        errorMessage = `서버 오류 (${error.response.status}): ${error.response.statusText}`;
                    }
                } else {
                    errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
                }
            } else if (error.request) {
                errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Utils.showError(`동기화 실패: ${errorMessage}`);
        } finally {
            // 버튼 원상복구
            syncBtn.disabled = false;
            syncBtn.textContent = originalText;
        }
    },

    // 🔧 수정: 동기화 허용 상태 업데이트 (올바른 ID 사용)
    async updateSyncAllowed(matchId, allowed) {
        try {
            console.log(`🔄 동기화 허용 상태 업데이트 요청: ID=${matchId}, 허용=${allowed}`);
            
            // MongoDB ObjectId 형식인지 확인 (24자리 16진수)
            const isMongoId = /^[0-9a-fA-F]{24}$/.test(matchId);
            
            if (!isMongoId) {
                console.log(`BetsAPI 경기 ${matchId}의 동기화 허용 상태: ${allowed} (메모리에서만 관리)`);
                this.updateSelectedCount();
                return;
            }

            // MongoDB에 저장된 경기인 경우만 PATCH 요청
            const response = await CONFIG.api.patch(`/football-matches/${matchId}`, {
                allowSync: allowed
            });
            
            if (response.data.success) {
                console.log(`✅ 경기 ${matchId}의 동기화 허용 상태 업데이트 완료: ${allowed}`);
                this.updateSelectedCount();
            }
        } catch (error) {
            console.error('❌ 동기화 허용 상태 업데이트 실패:', error);
            
            // 체크박스 상태를 원래대로 되돌리기
            const checkbox = document.querySelector(`input[data-match-id="${matchId}"]`);
            if (checkbox) {
                checkbox.checked = !allowed;
            }
            
            Utils.showError('동기화 허용 상태 업데이트에 실패했습니다.');
        }
    },

    // 모든 경기 선택
    selectAllMatches() {
        const checkboxes = document.querySelectorAll('.sync-toggle-checkbox');
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                checkbox.checked = true;
                this.updateSyncAllowed(checkbox.dataset.matchId, true);
            }
        });
        this.updateSelectedCount();
    },

    // 모든 경기 선택 해제
    deselectAllMatches() {
        const checkboxes = document.querySelectorAll('.sync-toggle-checkbox');
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                checkbox.checked = false;
                this.updateSyncAllowed(checkbox.dataset.matchId, false);
            }
        });
        this.updateSelectedCount();
    },

    // 선택된 경기 수 업데이트
    updateSelectedCount() {
        const selectedCheckboxes = document.querySelectorAll('.sync-toggle-checkbox:checked');
        const count = selectedCheckboxes.length;
        const selectedCountEl = document.getElementById('selectedCount');
        if (selectedCountEl) {
            selectedCountEl.textContent = `동기화 허용: ${count}개`;
        }
    },

    // 🔧 수정: 경기 저장 (수정/추가) - 성공 시 모달 닫기 및 메시지 표시
    async saveMatch(event) {
        event.preventDefault();
        
        const saveBtn = event.target.querySelector('button[type="submit"]');
        const originalText = saveBtn.textContent;
        
        try {
            // 저장 버튼 비활성화
            saveBtn.disabled = true;
            saveBtn.textContent = '저장 중...';
            
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
                allowSync: document.getElementById('allowSync').checked,
                status: 'active',
            };
            
            // 새 경기 추가인 경우 추가 필드
            if (!this.editingMatchId) {
                formData.betsApiId = `custom_${Date.now()}`;
                formData.sport_id = '1';
            }
            
            let response;
            
            if (this.editingMatchId) {
                // 수정 - PUT 요청 사용
                response = await CONFIG.api.put(`/football-matches/${this.editingMatchId}`, formData);
            } else {
                // 추가 - POST 요청 사용
                response = await CONFIG.api.post('/football-matches', formData);
            }
            
            if (response.data.success) {
                // 🔧 수정: 성공 메시지 표시 후 모달 닫기
                const successMessage = this.editingMatchId ? 
                    '경기가 성공적으로 수정되었습니다.' : 
                    '경기가 성공적으로 추가되었습니다.';
                
                Utils.showSuccess(successMessage);
                
                // 모달 닫기
                this.hideModal();
                
                // 데이터 새로고침
                await this.loadMatches();
                
                console.log('✅ 경기 저장 완료:', response.data);
            }
        } catch (error) {
            console.error('❌ 경기 저장 실패:', error);
            
            let errorMessage = '경기 저장에 실패했습니다.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Utils.showError(errorMessage);
        } finally {
            // 저장 버튼 원상복구
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    },

    // 🔧 수정: 경기 수정 모달 표시 - MongoDB ID로 조회
    async editMatch(localId, betsApiId) {
        console.log('✏️ 경기 수정:', localId, betsApiId);
        
        try {
            // MongoDB ObjectId인지 확인
            const isMongoId = /^[0-9a-fA-F]{24}$/.test(localId);
            
            if (!isMongoId) {
                Utils.showError('BetsAPI 경기는 직접 수정할 수 없습니다. 먼저 저장한 후 수정해주세요.');
                return;
            }
            
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
            document.getElementById('allowSync').checked = match.allowSync !== false;
            
            this.showModal();
        } catch (error) {
            console.error('❌ 경기 정보 로드 실패:', error);
            
            let errorMessage = '경기 정보를 불러올 수 없습니다.';
            if (error.response?.status === 404) {
                errorMessage = '경기를 찾을 수 없습니다.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            Utils.showError(errorMessage);
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
        
        // 폼 초기화
        document.getElementById('matchForm').reset();
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
                await this.loadMatches();
            }
        } catch (error) {
            console.error('경기 삭제 실패:', error);
            Utils.showError('경기 삭제에 실패했습니다.');
        }
    },

    // BetsAPI 경기를 로컬에 저장
    async saveToLocal(betsApiId) {
        try {
            const response = await CONFIG.api.get(`/enhanced-football/match/${betsApiId}`);
            const match = response.data.data;
            
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
                allowSync: true,
            };
            
            const saveResponse = await CONFIG.api.post('/football-matches', saveData);
            
            if (saveResponse.data.success) {
                Utils.showSuccess('경기가 저장되었습니다.');
                await this.loadMatches();
            }
        } catch (error) {
            console.error('로컬 저장 실패:', error);
            Utils.showError('경기 저장에 실패했습니다.');
        }
    },

    // Enhanced 경기 카드 생성 (동기화 허용 토글 포함)
    createEnhancedMatchCard(match) {
        const matchTime = Utils.formatMatchTime(match.time);
        const isModified = match.isModified || false;
        const isLocalOnly = match.isLocalOnly || false;
        const allowSync = match.allowSync !== false;

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

        // 통계 정보 표시
        const statsInfo = this.generateStatsPreview(match.stats || match.fullStats);
        
        // 품질 배지
        const qualityBadge = this.generateQualityBadge(match);

        // 수정된 경기 표시
        const modifiedBadge = isModified ? 
            `<span class="modified-badge" title="관리자가 수정한 경기">✏️ 수정됨</span>` : '';
        
        const localOnlyBadge = isLocalOnly ? 
            `<span class="local-only-badge" title="로컬에만 있는 경기">📍 로컬</span>` : '';

        // 🔧 수정: 올바른 ID 사용 (MongoDB ID 우선, 없으면 BetsAPI ID)
        const matchId = match._id || match.id;

        return `
            <div class="match-card enhanced-match-card ${match.fullStats ? 'complete-data' : ''}" data-match-id="${matchId}">
                <div class="match-header">
                    <div class="match-league">
                        ${match.league?.name || '알 수 없는 리그'}
                        ${modifiedBadge}
                        ${localOnlyBadge}
                        ${qualityBadge}
                    </div>
                    <div class="match-controls">
                        <div class="sync-toggle-container">
                            <label class="sync-toggle-label">
                                <input type="checkbox" 
                                       class="sync-toggle-checkbox" 
                                       data-match-id="${matchId}"
                                       ${allowSync ? 'checked' : ''}
                                       onchange="FootballSchedule.updateSyncAllowed('${matchId}', this.checked)">
                                <span class="sync-toggle-text">동기화 허용</span>
                            </label>
                        </div>
                        <div class="match-time">${matchTime}</div>
                    </div>
                </div>
                
                <div class="match-teams">
                    <div class="team">
                        <div class="team-name">${match.home?.name || '홈팀'}</div>
                        ${match.o_home ? `<small class="alt-name">(${match.o_home.name})</small>` : ''}
                    </div>
                    
                    <div class="vs">
                        ${match.ss ? 
                            `<div class="score">${homeScore} - ${awayScore}</div>` : 
                            'VS'
                        }
                    </div>
                    
                    <div class="team">
                        <div class="team-name">${match.away?.name || '원정팀'}</div>
                        ${match.o_away ? `<small class="alt-name">(${match.o_away.name})</small>` : ''}
                    </div>
                </div>
                
                <div class="match-status">
                    <span class="match-status ${statusClass}">${statusText}</span>
                    ${match.timer?.tm ? `<span style="margin-left: 10px;">⏱️ ${match.timer.tm}'</span>` : ''}
                </div>
                
                ${statsInfo}
                
                ${match.adminNote ? `
                    <div class="admin-note">
                        <strong>관리자 노트:</strong> ${match.adminNote}
                    </div>
                ` : ''}
                
                <div class="match-actions" style="margin-top: 15px;">
                    <button class="btn btn-info btn-sm" onclick="FootballSchedule.viewMatchDetails('${match.id || match._id}')">상세 보기</button>
                    ${(match.stats || match.fullStats) ? `
                        <button class="btn btn-purple btn-sm" onclick="FootballSchedule.showDetailedStats('${match._id || match.id}')">📊 통계</button>
                    ` : ''}
                    ${match._id ? `
                        <button class="btn btn-warning btn-sm" onclick="FootballSchedule.editMatch('${match._id}', '${match.id}')">✏️ 수정</button>
                        <button class="btn btn-danger btn-sm" onclick="FootballSchedule.deleteMatch('${match._id}', '${match.home?.name || '홈팀'}', '${match.away?.name || '원정팀'}')">🗑️ 삭제</button>
                    ` : `
                        <button class="btn btn-success btn-sm" onclick="FootballSchedule.saveToLocal('${match.id}')">💾 저장</button>
                    `}
                </div>
            </div>
        `;
    },

    // 통계 미리보기 생성
    generateStatsPreview(stats) {
        if (!stats) return '<div class="no-stats">📊 통계 데이터 없음</div>';
        
        const possession = stats.possession_rt ? `${stats.possession_rt[0]}% - ${stats.possession_rt[1]}%` : 'N/A';
        const shots = stats.goalattempts ? `${stats.goalattempts[0]} - ${stats.goalattempts[1]}` : 'N/A';
        const xg = stats.xg ? `${stats.xg[0]} - ${stats.xg[1]}` : 'N/A';
        
        return `
            <div class="stats-preview">
                <div class="stat-item">
                    <span class="stat-label">점유율:</span>
                    <span class="stat-value">${possession}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">슛:</span>
                    <span class="stat-value">${shots}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">xG:</span>
                    <span class="stat-value">${xg}</span>
                </div>
            </div>
        `;
    },

    // 품질 배지 생성
    generateQualityBadge(match) {
        if (!match.stats && !match.fullStats) return '';
        
        const stats = match.stats || match.fullStats;
        const totalGoals = parseInt(stats.goals?.[0] || '0') + parseInt(stats.goals?.[1] || '0');
        const totalShots = parseInt(stats.goalattempts?.[0] || '0') + parseInt(stats.goalattempts?.[1] || '0');
        
        if (totalGoals >= 4) {
            return '<span class="quality-badge excellent">🔥 명경기</span>';
        } else if (totalGoals >= 3 || totalShots >= 20) {
            return '<span class="quality-badge good">⭐ 좋은경기</span>';
        }
        return '';
    },

    // 경기 데이터 로드
    async loadMatches() {
        console.log(`⚽ ${CONFIG.state.currentMatchType} 경기 로드`);
        
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
                this.updateSelectedCount();
                return;
            }

            console.log(`✅ ${data.results.length}개의 경기를 찾았습니다`);

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

            // 선택된 경기 수 업데이트
            setTimeout(() => this.updateSelectedCount(), 100);

        } catch (error) {
            console.error('❌ Enhanced 축구 경기 로드 실패:', error);
            
            let errorMessage = 'Enhanced 축구 경기 데이터 로드에 실패했습니다.';
            if (error.response?.status === 404) {
                errorMessage = 'Enhanced API 서비스를 찾을 수 없습니다.';
            }
            
            container.innerHTML = `<div class="error">${errorMessage}</div>`;
        }
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

    // 경기 상세 정보 보기
    async viewMatchDetails(eventId) {
        try {
            const response = await CONFIG.api.get(`/enhanced-football/match/${eventId}`);
            const match = response.data.data;
            
            const detailsText = `
📊 축구 경기 상세 정보

🏠 홈팀: ${match.home?.name || 'N/A'}
✈️ 원정팀: ${match.away?.name || 'N/A'}
🏆 리그: ${match.league?.name || 'N/A'}
⏰ 시간: ${Utils.formatMatchTime(match.time)}
📈 상태: ${match.time_status === '0' ? '예정' : match.time_status === '1' ? '진행중' : '종료'}
⚽ 스코어: ${match.ss || 'N/A'}
🔄 동기화 허용: ${match.allowSync !== false ? '예' : '아니오'}

${match.isModified ? '✏️ 관리자가 수정한 경기입니다' : ''}
${match.adminNote ? `\n📝 관리자 노트: ${match.adminNote}` : ''}

💾 저장 위치: MongoDB > football-matches 컬렉션
🆔 BetsAPI ID: ${match.id}
            `;
            
            alert(detailsText);
        } catch (error) {
            Utils.showError('경기 상세 정보를 불러올 수 없습니다.');
        }
    },

    // 상세 통계 모달 표시
    async showDetailedStats(matchId) {
        try {
            const response = await CONFIG.api.get(`/enhanced-football/match/${matchId}/stats/detailed`);
            const stats = response.data.data;
            
            const qualityResponse = await CONFIG.api.get(`/enhanced-football/match/${matchId}/quality`);
            const quality = qualityResponse.data.data;
            
            document.getElementById('statsModalTitle').textContent = '📊 경기 상세 통계 분석';
            document.getElementById('statsModalBody').innerHTML = this.generateDetailedStatsHTML(stats, quality);
            
            this.showStatsModal();
        } catch (error) {
            console.error('상세 통계 로드 실패:', error);
            Utils.showError('상세 통계를 불러올 수 없습니다.');
        }
    },

    // 상세 통계 HTML 생성
    generateDetailedStatsHTML(stats, quality) {
        return `
            <div class="detailed-stats">
                <!-- 경기 품질 -->
                <div class="quality-section">
                    <h4>🎯 경기 품질 평가</h4>
                    <div class="quality-card ${quality.quality}">
                        <div class="quality-score">${quality.score}/100</div>
                        <div class="quality-description">${quality.description}</div>
                        <div class="quality-metrics">
                            <span>⚽ ${quality.metrics.totalGoals}골</span>
                            <span>🎯 ${quality.metrics.totalShots}슛</span>
                            <span>🔥 ${quality.metrics.totalOnTarget}유효슛</span>
                        </div>
                    </div>
                </div>

                <!-- 점유율 & 지배력 -->
                <div class="possession-section">
                    <h4>📊 점유율 & 지배력</h4>
                    <div class="possession-bars">
                        <div class="possession-bar">
                            <span class="team-label">홈팀</span>
                            <div class="bar">
                                <div class="fill home" style="width: ${stats.possession.home}%"></div>
                            </div>
                            <span class="percentage">${stats.possession.home}%</span>
                        </div>
                        <div class="possession-bar">
                            <span class="team-label">원정팀</span>
                            <div class="bar">
                                <div class="fill away" style="width: ${stats.possession.away}%"></div>
                            </div>
                            <span class="percentage">${stats.possession.away}%</span>
                        </div>
                    </div>
                </div>

                <!-- 슛 통계 -->
                <div class="shots-section">
                    <h4>🎯 슛 통계</h4>
                    <div class="shots-comparison">
                        <div class="team-shots">
                            <h5>홈팀</h5>
                            <div>총 슛: <strong>${stats.shots.home.total}</strong></div>
                            <div>유효슛: <strong>${stats.shots.home.on_target}</strong></div>
                            <div>정확도: <strong>${stats.shots.home.accuracy}</strong></div>
                        </div>
                        <div class="team-shots">
                            <h5>원정팀</h5>
                            <div>총 슛: <strong>${stats.shots.away.total}</strong></div>
                            <div>유효슛: <strong>${stats.shots.away.on_target}</strong></div>
                            <div>정확도: <strong>${stats.shots.away.accuracy}</strong></div>
                        </div>
                    </div>
                </div>

                <!-- xG (Expected Goals) -->
                <div class="xg-section">
                    <h4>📈 Expected Goals (xG)</h4>
                    <div class="xg-comparison">
                        <div class="xg-bar">
                            <span>홈팀: <strong>${stats.xg.home}</strong></span>
                            <div class="xg-visual" style="width: ${(parseFloat(stats.xg.home) / (parseFloat(stats.xg.home) + parseFloat(stats.xg.away))) * 100}%"></div>
                        </div>
                        <div class="xg-bar">
                            <span>원정팀: <strong>${stats.xg.away}</strong></span>
                            <div class="xg-visual away" style="width: ${(parseFloat(stats.xg.away) / (parseFloat(stats.xg.home) + parseFloat(stats.xg.away))) * 100}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 고품질 경기 보기
    async showHighQualityMatches() {
        console.log('🌟 고품질 경기 조회');
        
        const container = document.getElementById('matchesData');
        container.innerHTML = Utils.createLoadingHTML('고품질 경기를 찾는 중...');

        try {
            const response = await CONFIG.api.get('/enhanced-football/matches/high-quality?limit=20');
            const data = response.data.data;
            
            if (!data.results || data.results.length === 0) {
                container.innerHTML = Utils.createEmptyStateHTML('고품질 경기가 없습니다.');
                return;
            }

            console.log(`✅ ${data.results.length}개의 고품질 경기를 찾았습니다`);

            const header = `
                <div class="high-quality-header">
                    <h3>🌟 고품질 경기 (${data.criteria})</h3>
                    <p>총 ${data.count}개의 재미있는 경기가 발견되었습니다!</p>
                    <button class="btn btn-primary btn-sm" onclick="FootballSchedule.loadMatches()">← 일반 목록으로 돌아가기</button>
                </div>
            `;
            
            container.innerHTML = header + data.results.map(match => this.createEnhancedMatchCard(match)).join('');
            setTimeout(() => this.updateSelectedCount(), 100);

        } catch (error) {
            console.error('❌ 고품질 경기 조회 실패:', error);
            container.innerHTML = '<div class="error">고품질 경기를 불러올 수 없습니다.</div>';
        }
    },

    // 데이터 완성도 보기
    async showDataCompleteness() {
        try {
            const response = await CONFIG.api.get('/enhanced-football/stats/completeness');
            const completeness = response.data.data;
            
            const completenessText = `📊 MongoDB 데이터 완성도 분석
            
🔸 총 경기 수: ${completeness.total_matches}개
🔸 완성도: ${completeness.completeness_percentage}%

📈 완전한 데이터가 있는 경기:
• 통계 데이터: ${completeness.with_stats}개
• xG 데이터: ${completeness.with_xg}개  
• 점유율 데이터: ${completeness.with_possession}개
• 타이머 정보: ${completeness.with_timer}개

⚠️ 누락 데이터:
• 통계 없음: ${completeness.missing_fields.stats}개
• xG 없음: ${completeness.missing_fields.xg}개
• 점유율 없음: ${completeness.missing_fields.possession_rt}개

💡 권장사항: ${completeness.completeness_percentage < 80 ? '동기화를 실행하여 필요한 데이터를 업데이트하세요.' : '데이터가 충분히 완전합니다!'}`;

            alert(completenessText);
        } catch (error) {
            Utils.showError('데이터 완성도를 불러올 수 없습니다.');
        }
    },

    // DB 통계 보기
    async showDbStats() {
        try {
            const response = await CONFIG.api.get('/enhanced-football/stats/db');
            const stats = response.data.data;
            
            alert(`📊 MongoDB 축구 경기 데이터 통계
            
🔸 컬렉션: football-matches
🔸 예정 경기: ${stats.upcoming}개
🔸 진행중 경기: ${stats.inplay}개  
🔸 종료 경기: ${stats.ended}개
🔸 총 경기 수: ${stats.total}개

💡 동기화: 각 경기의 '동기화 허용' 토글로 선택적 업데이트 가능`);
        } catch (error) {
            Utils.showError('DB 통계를 불러올 수 없습니다.');
        }
    },

    // 통계 모달 표시/숨김
    showStatsModal() {
        document.getElementById('statsModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },

    hideStatsModal() {
        document.getElementById('statsModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    },

    // 날짜 관련 메서드들
    changeDate(days) {
        this.currentDate.setDate(this.currentDate.getDate() + days);
        this.updateDateDisplay();
        this.loadMatches();
    },

    setToday() {
        this.currentDate = new Date();
        this.updateDateDisplay();
        this.loadMatches();
    },

    setDateFromPicker(dateString) {
        if (dateString) {
            this.currentDate = new Date(dateString + 'T00:00:00');
            this.updateDateDisplay();
            this.loadMatches();
        }
    },

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

    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    },

    formatDateKorean(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const dayName = dayNames[date.getDay()];
        
        return `${year}년 ${month}월 ${day}일 (${dayName})`;
    },

    formatDateForAPI(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    },

    // 경기 타입 관련 메서드들
    switchMatchType(type) {
        CONFIG.state.currentMatchType = type;
        CONFIG.state.currentPage = 1;
        
        // 탭 스타일 업데이트
        document.querySelectorAll('.match-tab').forEach(tab => tab.classList.remove('active'));
        document.getElementById(type + '-tab').classList.add('active');
        
        this.loadMatches();
    },

    getMatchTypeText(type) {
        switch (type) {
            case 'upcoming': return '예정된';
            case 'inplay': return '진행 중인';
            case 'ended': return '종료된';
            default: return '';
        }
    },

    // 페이지네이션
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

    changePage(page) {
        CONFIG.state.currentPage = page;
        this.loadMatches();
    }
};