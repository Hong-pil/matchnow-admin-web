# 🌐 MatchNow Admin Web

MatchNow 백엔드 API를 관리하기 위한 웹 기반 관리자 인터페이스입니다.

## 🏗️ 기술 스택

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 (Gradient & Flexbox)
- **HTTP Client**: Axios
- **Architecture**: SPA (Single Page Application)
- **Authentication**: JWT Token 기반

## 🎯 서버 접속

```bash
$ ssh -p 22 matchnow@175.126.95.157 (PW:250618)
$ cd /var/www/html/matchnow-admin-web/
$ sudo git pull
```

## 📁 프로젝트 구조

```
matchnow-admin-web/
├── README.md
├── .env.development        # 개발환경 설정
├── .env.local             # 로컬환경 설정
├── .env.production        # 프로덕션 설정
└── src/
    ├── pages/             # HTML 페이지들
    │   ├── index.html     # 메인 관리자 페이지
    │   ├── login.html     # 로그인 페이지
    │   └── register.html  # 회원가입 페이지
    ├── js/                # JavaScript 모듈들
    │   ├── common/        # 공통 유틸리티
    │   │   ├── config.js  # API 설정 및 환경변수
    │   │   ├── utils.js   # 유틸리티 함수들
    │   │   ├── api.js     # API 호출 함수들
    │   │   └── auth.js    # 인증 관련 함수들
    │   ├── tabs/          # 각 탭별 기능 모듈
    │   │   ├── dashboard.js           # 대시보드
    │   │   ├── football-schedule.js   # 축구 경기 일정 관리
    │   │   ├── countries.js           # 국가 관리
    │   │   ├── sports-categories.js   # 스포츠 카테고리 관리
    │   │   ├── leagues.js             # 리그 관리
    │   │   ├── teams.js               # 팀 관리
    │   │   └── players.js             # 선수 관리
    │   ├── debug/         # 디버깅 도구
    │   │   └── auth-debug.js  # 인증 디버깅
    │   └── main.js        # 앱 초기화 및 라우팅
    └── styles/
        └── css/
            └── styles.css # 메인 스타일시트
```

## 📄 주요 파일 설명

### 📑 HTML 페이지

| 파일 | 역할 | 접근 URL |
|------|------|----------|
| `pages/index.html` | 메인 관리자 대시보드 | `/admin/` |
| `pages/login.html` | 관리자 로그인 페이지 | `/admin/pages/login.html` |
| `pages/register.html` | 관리자 회원가입 페이지 | `/admin/pages/register.html` |

### 🔧 JavaScript 모듈

#### 공통 모듈 (`js/common/`)

| 파일 | 역할 | 주요 기능 |
|------|------|-----------|
| `config.js` | 환경 설정 관리 | API URL 설정, Axios 인스턴스 생성 |
| `utils.js` | 유틸리티 함수 | 메시지 표시, 날짜 포맷팅, 템플릿 로드 |
| `api.js` | API 호출 관리 | 셀렉트박스 데이터 로드, 대시보드 데이터 |
| `auth.js` | 인증 관리 | 토큰 관리, 권한 체크, 로그인/로그아웃 |

#### 탭 모듈 (`js/tabs/`)

| 파일 | 역할 | 주요 기능 |
|------|------|-----------|
| `dashboard.js` | 대시보드 | 전체 통계 표시, 각 모듈별 데이터 카운트 |
| `football-schedule.js` | **축구 경기 관리** | BetsAPI 연동, 경기 CRUD, 동기화 관리 |
| `countries.js` | 국가 관리 | 국가 추가/삭제/조회 |
| `sports-categories.js` | 스포츠 카테고리 | 축구, 야구 등 스포츠 종목 관리 |
| `leagues.js` | 리그 관리 | 프리미어리그, K리그 등 리그 관리 |
| `teams.js` | 팀 관리 | 축구팀, 야구팀 등 팀 정보 관리 |
| `players.js` | 선수 관리 | 선수 프로필 및 정보 관리 |

#### 메인 애플리케이션

| 파일 | 역할 | 주요 기능 |
|------|------|-----------|
| `main.js` | 앱 초기화 | 탭 전환, 모듈 로딩, 전역 상태 관리 |
| `debug/auth-debug.js` | 디버깅 도구 | 개발환경 인증 상태 디버깅 |

### 🎨 스타일링

| 파일 | 역할 | 주요 기능 |
|------|------|-----------|
| `styles/css/styles.css` | 메인 스타일시트 | 반응형 디자인, 그라데이션, 모달, 폼 스타일 |

## 🚀 시작하기

### 📋 사전 요구사항

- **백엔드 서버**: MatchNow API 서버가 실행 중이어야 함
- **웹 서버**: 정적 파일 서빙 (백엔드 Express 서버에서 처리)

### 🔧 환경별 설정

#### 개발 환경 (맥북)
```bash
# 백엔드 서버 실행 후
http://localhost:4011/admin/
```

#### 프로덕션 환경 (Ubuntu Server)
```bash
# 백엔드 서버 실행 후
http://175.126.95.157:4011/admin/
```

### 📱 접속 URL

| 환경 | 메인 페이지 | 로그인 페이지 |
|------|-------------|---------------|
| **개발환경** | `http://localhost:4011/admin/` | `http://localhost:4011/admin/pages/login.html` |
| **프로덕션** | `http://175.126.95.157:4011/admin/` | `http://175.126.95.157:4011/admin/pages/login.html` |

## 🔐 인증 시스템

### 👨‍💼 기본 관리자 계정

```bash
이메일: admin@matchnow.com
비밀번호: admin123!@#
```

### 🛡️ 권한 체계

| 권한 | 설명 | 기능 |
|------|------|------|
| `super_admin` | 슈퍼 관리자 | 모든 기능 + 관리자 계정 관리 |
| `admin` | 관리자 | 모든 데이터 관리 기능 |
| `moderator` | 운영자 | 기본적인 데이터 조회/수정 |

## 🎯 주요 기능

### 📊 대시보드
- 전체 데이터 통계 조회
- 각 모듈별 데이터 카운트
- BetsAPI 연결 상태 확인

### ⚽ 축구 경기 일정 관리 (핵심 기능)
- **BetsAPI 연동**: 실시간 축구 경기 데이터 동기화
- **경기 상태별 조회**: 예정/진행중/종료된 경기
- **날짜별 필터링**: 특정 날짜의 경기 조회
- **경기 수정/추가**: 관리자가 직접 경기 정보 편집
- **동기화 관리**: 선택적 동기화, 전체 동기화
- **상세 통계**: xG, 점유율, 슛 등 상세 경기 통계
- **품질 평가**: 경기 재미도 및 품질 자동 평가

### 🗄️ 데이터 관리
- **국가 관리**: 대한민국, 영국 등 국가 정보
- **스포츠 카테고리**: 축구, 야구 등 스포츠 종목
- **리그 관리**: 프리미어리그, K리그 등
- **팀 관리**: 축구팀, 야구팀 정보
- **선수 관리**: 선수 프로필 및 정보

## 🌐 API 연동

### 📡 백엔드 API 엔드포인트

```javascript
// 기본 API 구조
const API_BASE = 'http://localhost:4011/api/v1';

// 주요 엔드포인트
- /countries              # 국가 관리
- /sports-categories      # 스포츠 카테고리
- /leagues               # 리그 관리
- /teams                 # 팀 관리
- /players               # 선수 관리
- /football-matches      # 축구 경기 관리
- /enhanced-football/*   # Enhanced 축구 API
- /admin/auth/*          # 관리자 인증
```

### 🔄 BetsAPI 연동

```javascript
// Enhanced 축구 API 사용
- /enhanced-football/matches/upcoming  # 예정 경기
- /enhanced-football/matches/inplay    # 진행중 경기  
- /enhanced-football/matches/ended     # 종료 경기
- /enhanced-football/sync/auto/:type   # 자동 동기화
- /enhanced-football/stats/*           # 통계 분석
```

## 🎨 UI/UX 특징

### 🌈 디자인 테마
- **그라데이션 기반**: 모던한 그라데이션 컬러 스킴
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- **직관적 네비게이션**: 탭 기반 SPA 구조

### 📱 반응형 지원
- **데스크톱**: 1400px+ (전체 기능)
- **태블릿**: 768px-1399px (적응형 레이아웃)
- **모바일**: ~767px (스택형 레이아웃)

### 🎭 주요 UI 컴포넌트
- **모달**: 경기 수정/추가 폼
- **탭 네비게이션**: 각 기능별 탭 전환
- **데이터 카드**: 경기/팀/선수 정보 카드
- **페이지네이션**: 대용량 데이터 페이징
- **토스트 알림**: 성공/에러 메시지

## 🔧 개발 가이드

### 📝 새로운 탭 추가하기

1. **HTML 탭 버튼 추가** (`pages/index.html`)
```html
<button class="nav-tab" id="tab-new-feature">새 기능</button>
```

2. **JavaScript 모듈 생성** (`js/tabs/new-feature.js`)
```javascript
const NewFeature = {
    template: `<div class="content-panel">...</div>`,
    async render() { /* 렌더링 로직 */ },
    // ... 기타 메서드
};
```

3. **메인 앱에 등록** (`js/main.js`)
```javascript
const App = {
    tabs: {
        'tab-new-feature': NewFeature,
        // ... 기존 탭들
    }
};
```

### 🌐 API 호출 패턴

```javascript
// 표준 API 호출 패턴
try {
    const response = await CONFIG.api.get('/endpoint');
    if (response.data.success) {
        // 성공 처리
        Utils.showSuccess('성공 메시지');
    }
} catch (error) {
    console.error('API 호출 실패:', error);
    Utils.showError('에러 메시지');
}
```

### 🎨 스타일링 가이드

```css
/* 표준 컴포넌트 스타일 */
.btn {
    padding: 12px 24px;
    border-radius: 10px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    transition: all 0.3s ease;
}

.data-card {
    background: white;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
```

## 🚨 문제 해결

### 🔐 인증 문제
```javascript
// 브라우저 콘솔에서 디버깅
debugAuth.checkToken();     // 토큰 상태 확인
debugAuth.forceLogout();    // 강제 로그아웃
debugAuth.testApi();        // API 연결 테스트
```

### 🌐 API 연결 문제
```javascript
// 환경별 API URL 확인
console.log('API Base URL:', CONFIG.API_BASE);

// 백엔드 서버 상태 확인
curl http://localhost:4011/health
curl http://175.126.95.157:4011/health
```

### 📱 CORS 문제
백엔드 서버에서 CORS 설정 확인:
```javascript
// backend/src/main.ts
app.enableCors({
    origin: [
        'http://localhost:3000',
        'http://localhost:4011',
        'http://175.126.95.157:4011'
    ],
    credentials: true,
});
```

## 📊 성능 최적화

### ⚡ 로딩 최적화
- **지연 로딩**: 탭별 모듈 지연 로딩
- **캐싱**: API 응답 메모리 캐싱
- **압축**: CSS/JS 코드 최적화

### 🔄 동기화 최적화
- **선택적 동기화**: 필요한 경기만 동기화
- **배치 처리**: 여러 경기 일괄 처리
- **에러 복구**: 실패한 동기화 재시도

## 🔮 향후 개발 계획

### 🆕 예정 기능
- [ ] **실시간 알림**: WebSocket 기반 실시간 업데이트
- [ ] **고급 필터링**: 복합 조건 경기 검색
- [ ] **데이터 내보내기**: Excel/CSV 내보내기
- [ ] **사용자 활동 로그**: 관리자 활동 기록
- [ ] **테마 설정**: 다크모드, 커스텀 테마

### 🔧 기술 개선
- [ ] **TypeScript 적용**: 타입 안정성 향상
- [ ] **모듈 번들링**: Webpack/Vite 도입
- [ ] **테스트 코드**: Jest 단위 테스트
- [ ] **CI/CD**: 자동 배포 파이프라인

## 📚 참고 자료

### 🔗 관련 링크
- **백엔드 API**: http://localhost:4011/api
- **Swagger 문서**: http://localhost:4011/api
- **BetsAPI 문서**: https://betsapi.com/docs/

### 🛠️ 개발 도구
- **Axios 문서**: https://axios-http.com/
- **CSS Grid/Flexbox**: https://css-tricks.com/
- **JavaScript ES6+**: https://developer.mozilla.org/

---

**🎯 Happy Coding! 즐거운 개발 되세요!**