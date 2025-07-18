// src/js/common/config.js (수정된 버전)
const CONFIG = {
    // 환경별 API URL 설정
    API_BASE: (() => {
        // Vite 환경변수 우선 사용
        if (import.meta.env.VITE_API_URL) {
            return `${import.meta.env.VITE_API_URL}/api/v1`;
        }

        // 개발 환경
        if (import.meta.env.DEV) {
            return 'http://localhost:4011/api/v1';
        }

        // 프로덕션 환경
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        
        // 같은 서버에서 서빙되는 경우
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `${protocol}//${hostname}:4011/api/v1`;
        }
        
        // 실제 배포 환경 (백엔드 서버 주소)
        return `${protocol}//${hostname}:4011/api/v1`;
    })(),
    
    TIMEOUT: 10000,
    
    // 전역 상태
    state: {
        countriesData: [],
        sportsData: [],
        currentMatchType: 'upcoming',
        currentPage: 1
    },
    
    // API 인스턴스
    api: null
};

// Axios 인스턴스 생성
CONFIG.api = axios.create({
    baseURL: CONFIG.API_BASE,
    timeout: CONFIG.TIMEOUT,
    headers: { 'Content-Type': 'application/json' }
});

// 디버그용 로깅
console.log('🌐 프론트엔드 API Base URL:', CONFIG.API_BASE);
console.log('🔧 Axios 설정:', CONFIG.api.defaults);