// public/js/common/api.js

const API = {
    // 국가와 스포츠 데이터 로드 (셀렉트박스용)
    async loadSelectOptions() {
        console.log('🔄 셀렉트 옵션 로드 시작');
        try {
            const [countriesRes, sportsRes] = await Promise.allSettled([
                CONFIG.api.get('/countries?limit=100'),
                CONFIG.api.get('/sports-categories?limit=100')
            ]);

            if (countriesRes.status === 'fulfilled') {
                CONFIG.state.countriesData = countriesRes.value.data.data.results || [];
                console.log('✅ 국가 데이터 로드 완료:', CONFIG.state.countriesData.length, '개');
            } else {
                console.error('❌ 국가 데이터 로드 실패:', countriesRes.reason);
            }
            
            if (sportsRes.status === 'fulfilled') {
                CONFIG.state.sportsData = sportsRes.value.data.data.results || [];
                console.log('✅ 스포츠 데이터 로드 완료:', CONFIG.state.sportsData.length, '개');
            } else {
                console.error('❌ 스포츠 데이터 로드 실패:', sportsRes.reason);
            }

            this.updateSelectOptions();
        } catch (error) {
            console.error('❌ 셀렉트 옵션 로드 실패:', error);
        }
    },

    // 셀렉트박스 업데이트
    updateSelectOptions() {
        console.log('🔄 셀렉트박스 업데이트 시작');
        
        // 리그 셀렉트박스 업데이트
        const leagueCountrySelect = document.getElementById('newLeagueCountry');
        const leagueSportsSelect = document.getElementById('newLeagueSports');
        
        if (leagueCountrySelect) {
            leagueCountrySelect.innerHTML = '<option value="">국가를 선택하세요</option>' +
                CONFIG.state.countriesData.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
            console.log('✅ 리그 국가 셀렉트박스 업데이트 완료');
        }
        
        if (leagueSportsSelect) {
            leagueSportsSelect.innerHTML = '<option value="">스포츠를 선택하세요</option>' +
                CONFIG.state.sportsData.map(s => `<option value="${s._id}">${s.name}</option>`).join('');
            console.log('✅ 리그 스포츠 셀렉트박스 업데이트 완료');
        }

        // 팀 셀렉트박스 업데이트
        const teamCountrySelect = document.getElementById('newTeamCountry');
        const teamSportsSelect = document.getElementById('newTeamSports');
        
        if (teamCountrySelect) {
            teamCountrySelect.innerHTML = '<option value="">국가를 선택하세요</option>' +
                CONFIG.state.countriesData.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
            console.log('✅ 팀 국가 셀렉트박스 업데이트 완료');
        }
        
        if (teamSportsSelect) {
            teamSportsSelect.innerHTML = '<option value="">스포츠를 선택하세요</option>' +
                CONFIG.state.sportsData.map(s => `<option value="${s._id}">${s.name}</option>`).join('');
            console.log('✅ 팀 스포츠 셀렉트박스 업데이트 완료');
        }
    },

    // 대시보드 데이터 로드
    async loadDashboardData() {
        console.log('📊 대시보드 데이터 로드 시작');
        try {
            const results = await Promise.allSettled([
                CONFIG.api.get('/countries'),
                CONFIG.api.get('/sports-categories'),
                CONFIG.api.get('/leagues'),
                CONFIG.api.get('/teams'),
                CONFIG.api.get('/players')
            ]);

            const dashboardData = {
                countries: results[0].status === 'fulfilled' ? (results[0].value.data.data.totalCount || 0) : 0,
                sports: results[1].status === 'fulfilled' ? (results[1].value.data.data.totalCount || 0) : 0,
                leagues: results[2].status === 'fulfilled' ? (results[2].value.data.data.totalCount || 0) : 0,
                teams: results[3].status === 'fulfilled' ? (results[3].value.data.data.totalCount || 0) : 0,
                players: results[4].status === 'fulfilled' ? (results[4].value.data.data.totalCount || 0) : 0
            };
            
            console.log('✅ 대시보드 데이터:', dashboardData);
            return dashboardData;
        } catch (error) {
            console.error('❌ 대시보드 데이터 로드 실패:', error);
            return { countries: 0, sports: 0, leagues: 0, teams: 0, players: 0 };
        }
    },

    // BetsAPI 연결 테스트
    async testBetsApiConnection() {
        console.log('🔌 BetsAPI 연결 테스트 시작');
        try {
            const response = await CONFIG.api.get('/football/leagues');
            console.log('✅ BetsAPI 연결 성공:', response.data);
            return true;
        } catch (error) {
            console.error('❌ BetsAPI 연결 실패:', error);
            if (error.response?.status === 404) {
                console.error('💡 힌트: BetsAPI 모듈이 백엔드에 제대로 등록되지 않았을 수 있습니다.');
            }
            return false;
        }
    }
};