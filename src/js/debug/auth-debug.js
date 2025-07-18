// public/js/debug/auth-debug.js
// 디버깅용 스크립트 - 개발 환경에서만 사용

// 페이지 로드 시 인증 상태 디버깅
window.addEventListener('load', () => {
    console.log('🔧 Auth Debug Script 시작');
    
    // 현재 URL 확인
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Current Path:', window.location.pathname);
    
    // localStorage 확인
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    console.log('🔑 Admin Token:', token ? 'EXISTS' : 'NOT_FOUND');
    console.log('👤 Admin User:', user ? JSON.parse(user) : 'NOT_FOUND');
    
    // Auth 객체 확인
    if (typeof Auth !== 'undefined') {
        console.log('🔐 Auth.isLoggedIn():', Auth.isLoggedIn());
        console.log('🔐 Auth.getToken():', Auth.getToken() ? 'EXISTS' : 'NOT_FOUND');
        console.log('🔐 Auth.getUser():', Auth.getUser());
    } else {
        console.log('❌ Auth 객체를 찾을 수 없습니다.');
    }
    
    // API 설정 확인
    if (typeof CONFIG !== 'undefined') {
        console.log('🌐 API Base URL:', CONFIG.API_BASE);
        console.log('🌐 API Headers:', CONFIG.api.defaults.headers);
    } else {
        console.log('❌ CONFIG 객체를 찾을 수 없습니다.');
    }
});

// 전역 디버깅 함수들
window.debugAuth = {
    // 강제 로그아웃
    forceLogout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.reload();
    },
    
    // 토큰 확인
    checkToken() {
        const token = localStorage.getItem('adminToken');
        if (token) {
            console.log('Token:', token);
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('Token Payload:', payload);
                console.log('Token Expires:', new Date(payload.exp * 1000));
            } catch (e) {
                console.error('Invalid token format');
            }
        } else {
            console.log('No token found');
        }
    },
    
    // API 테스트
    async testApi() {
        try {
            const response = await CONFIG.api.get('/admin/auth/profile');
            console.log('API Test Success:', response.data);
        } catch (error) {
            console.error('API Test Failed:', error);
        }
    },
    
    // 강제 로그인 페이지로 이동
    goToLogin() {
        window.location.href = '/admin/login.html';
    }
};

console.log('🔧 디버깅 함수들이 window.debugAuth에 등록되었습니다.');
console.log('   - debugAuth.forceLogout() : 강제 로그아웃');
console.log('   - debugAuth.checkToken() : 토큰 확인');
console.log('   - debugAuth.testApi() : API 테스트');
console.log('   - debugAuth.goToLogin() : 로그인 페이지로 이동');