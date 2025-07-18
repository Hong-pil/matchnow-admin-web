// public/js/common/utils.js

const Utils = {
    // 메시지 표시 함수
    showError(message) {
        console.error('❌ 에러:', message);
        const div = document.createElement('div');
        div.className = 'error';
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    },

    showSuccess(message) {
        console.log('✅ 성공:', message);
        const div = document.createElement('div');
        div.className = 'success';
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    },

    // 로딩 HTML 생성
    createLoadingHTML(message = '로딩 중...') {
        return `<div class="loading">${message}</div>`;
    },

    // 빈 상태 HTML 생성
    createEmptyStateHTML(message) {
        return `<p style="text-align: center;">${message}</p>`;
    },

    // 날짜 포맷팅
    formatDate(date) {
        return new Date(date).toLocaleDateString('ko-KR');
    },

    // 시간 포맷팅 (축구 경기용)
    formatMatchTime(timestamp) {
        const matchTime = new Date(parseInt(timestamp) * 1000);
        return matchTime.toLocaleString('ko-KR', { 
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // HTML 템플릿 로드
    async loadTemplate(templatePath) {
        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${templatePath}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Template load error:', error);
            return '<div class="error">템플릿을 불러올 수 없습니다.</div>';
        }
    },

    // 컨텐츠 영역에 HTML 렌더링
    renderContent(html) {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = html;
        }
    },

    // 탭 전환
    switchTab(activeTabId) {
        // 모든 탭 비활성화
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 선택된 탭 활성화
        const activeTab = document.getElementById(activeTabId);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
};