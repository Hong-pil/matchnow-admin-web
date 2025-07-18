// src/js/common/config.js (import.meta 제거)
const CONFIG = {
    // 환경별 API URL 설정
    API_BASE: (() => {
        // 브라우저 환경에서 직접 URL 구성
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        
        // 개발 환경 감지
        const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
        
        if (isDev) {
            // 개발 환경 - 백엔드 포트 4011
            return `${protocol}//${hostname}:4011/api/v1`;
        } else {
            // 프로덕션 환경
            return `${protocol}//${hostname}:4011/api/v1`;
        }
    })(),
    
    TIMEOUT: 10000,
    
    // 전역 상태
    state: {
        countriesData: [],
        sportsData: [],
        currentMatchType: 'upcoming',
        currentPage: 1
    },
    
    // API 인스턴스 (axios가 로드된 후 생성)
    api: null
};

// Axios 인스턴스 생성
if (typeof axios !== 'undefined') {
    CONFIG.api = axios.create({
        baseURL: CONFIG.API_BASE,
        timeout: CONFIG.TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
    });
    
    // 디버그용 로깅
    console.log('🌐 프론트엔드 API Base URL:', CONFIG.API_BASE);
    console.log('🔧 Axios 설정:', CONFIG.api.defaults);
} else {
    console.warn('⚠️ Axios가 로드되지 않았습니다. config.js가 axios보다 먼저 로드되었을 수 있습니다.');
}