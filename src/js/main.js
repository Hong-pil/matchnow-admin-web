// src/js/main.js (import 문 제거)

const App = {
    // 탭 매핑
    tabs: {
        'tab-dashboard': typeof Dashboard !== 'undefined' ? Dashboard : null,
        'tab-football-schedule': typeof FootballSchedule !== 'undefined' ? FootballSchedule : null,
        'tab-countries': typeof Countries !== 'undefined' ? Countries : null,
        'tab-sports': typeof SportsCategories !== 'undefined' ? SportsCategories : null,
        'tab-leagues': typeof Leagues !== 'undefined' ? Leagues : null,
        'tab-teams': typeof Teams !== 'undefined' ? Teams : null,
        'tab-players': typeof Players !== 'undefined' ? Players : null
    },

    // 현재 활성 탭
    currentTab: 'tab-dashboard',

    // 앱 초기화
    async init() {
        console.log('🚀 MatchNow 앱 초기화');
        
        // 필수 객체들 확인
        if (typeof CONFIG === 'undefined') {
            console.error('❌ CONFIG 객체가 없습니다. config.js가 로드되지 않았을 수 있습니다.');
            return;
        }
        
        if (typeof API === 'undefined') {
            console.error('❌ API 객체가 없습니다. api.js가 로드되지 않았을 수 있습니다.');
            return;
        }
        
        if (typeof Utils === 'undefined') {
            console.error('❌ Utils 객체가 없습니다. utils.js가 로드되지 않았을 수 있습니다.');
            return;
        }
        
        // 🔐 인증 체크 추가
        console.log('🔐 인증 상태 체크 시작');
        const token = localStorage.getItem('adminToken');
        if (!token) {
            console.log('❌ 토큰 없음 - 로그인 페이지로 리다이렉트');
            window.location.href = '/admin/pages/login.html';
            return;
        }
        console.log('✅ 토큰 존재 - 앱 초기화 계속');
        
        // 탭 이벤트 리스너 등록
        this.attachTabListeners();
        
        // BetsAPI 연결 테스트
        console.log('🔌 BetsAPI 연결 테스트 중...');
        try {
            const betsApiConnected = await API.testBetsApiConnection();
            if (!betsApiConnected) {
                Utils.showError('BetsAPI 연결에 실패했습니다. 백엔드 설정을 확인해주세요.');
            }
        } catch (error) {
            console.error('BetsAPI 연결 테스트 실패:', error);
            Utils.showError('BetsAPI 연결 테스트 중 오류가 발생했습니다.');
        }
        
        // 초기 탭 로드
        await this.switchTab('tab-dashboard');
        
        // 공통 데이터 로드
        try {
            await API.loadSelectOptions();
        } catch (error) {
            console.error('공통 데이터 로드 실패:', error);
            Utils.showError('공통 데이터 로드에 실패했습니다.');
        }
        
        console.log('✅ 앱 초기화 완료');
    },

    // 탭 이벤트 리스너 등록
    attachTabListeners() {
        Object.keys(this.tabs).forEach(tabId => {
            const tabElement = document.getElementById(tabId);
            if (tabElement) {
                tabElement.addEventListener('click', () => this.switchTab(tabId));
            } else {
                console.warn(`⚠️ 탭 요소를 찾을 수 없습니다: ${tabId}`);
            }
        });
    },

    // 탭 전환
    async switchTab(tabId) {
        console.log('🔄 탭 전환:', tabId);
        
        // 탭 스타일 업데이트
        if (typeof Utils !== 'undefined' && Utils.switchTab) {
            Utils.switchTab(tabId);
        }
        
        // 현재 탭 업데이트
        this.currentTab = tabId;
        
        // 해당 탭 모듈 실행
        const tabModule = this.tabs[tabId];
        if (tabModule && typeof tabModule.render === 'function') {
            try {
                await tabModule.render();
                console.log('✅ 탭 렌더링 완료:', tabId);
            } catch (error) {
                console.error('❌ 탭 렌더링 실패:', tabId, error);
                if (typeof Utils !== 'undefined' && Utils.showError) {
                    Utils.showError('페이지를 불러올 수 없습니다.');
                }
            }
        } else {
            // 모듈이 없는 경우 준비 중 메시지 표시
            if (typeof Utils !== 'undefined' && Utils.renderContent) {
                Utils.renderContent(`
                    <div class="content-panel">
                        <div class="loading">
                            <h3>🚧 준비 중인 기능입니다</h3>
                            <p>해당 기능은 현재 개발 중입니다.</p>
                            <p>모듈 상태: ${tabModule ? '로드됨' : '미로드'}</p>
                        </div>
                    </div>
                `);
            }
        }
    },

    // 페이지 새로고침
    refresh() {
        const tabModule = this.tabs[this.currentTab];
        if (tabModule && typeof tabModule.render === 'function') {
            tabModule.render();
        }
    }
};

// DOM 로드 완료 시 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM 로드 완료 - 앱 초기화 시작');
    App.init().catch(error => {
        console.error('❌ 앱 초기화 실패:', error);
    });
});

// 전역 함수로 노출 (필요한 경우)
window.App = App;