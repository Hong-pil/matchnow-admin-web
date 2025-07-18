// public/js/common/auth.js

const Auth = {
    // 토큰 관리
    getToken() {
        return localStorage.getItem('adminToken');
    },

    setToken(token) {
        localStorage.setItem('adminToken', token);
    },

    removeToken() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    },

    // 사용자 정보 관리
    getUser() {
        const userStr = localStorage.getItem('adminUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    setUser(user) {
        localStorage.setItem('adminUser', JSON.stringify(user));
    },

    // 로그인 상태 확인
    isLoggedIn() {
        return !!this.getToken();
    },

    // 로그인 페이지로 리다이렉트
    redirectToLogin() {
        window.location.href = '/admin/login.html';
    },

    // 로그아웃
    logout() {
        this.removeToken();
        this.redirectToLogin();
    },

    // 토큰 유효성 검사
    async validateToken() {
        const token = this.getToken();
        if (!token) {
            return false;
        }

        try {
            const response = await CONFIG.api.get('/admin/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                this.setUser(response.data.data);
                return true;
            }
        } catch (error) {
            console.error('토큰 검증 실패:', error);
            this.removeToken();
        }
        
        return false;
    },

    // 권한 확인
    hasRole(requiredRole) {
        const user = this.getUser();
        if (!user) return false;

        const roleHierarchy = {
            'moderator': 1,
            'admin': 2,
            'super_admin': 3
        };

        const userLevel = roleHierarchy[user.role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;

        return userLevel >= requiredLevel;
    },

    // API 인터셉터 설정
    setupApiInterceptors() {
        const token = this.getToken();
        if (token) {
            CONFIG.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // 응답 인터셉터 - 401 에러 시 로그아웃
        CONFIG.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    console.warn('🚨 인증 만료 - 로그아웃 처리');
                    this.removeToken();
                    this.redirectToLogin();
                }
                return Promise.reject(error);
            }
        );
    },

    // 페이지 접근 권한 체크
    async checkPageAccess(requiredRole = null) {
        console.log('🔐 페이지 접근 권한 체크 시작');

        // 로그인 확인
        if (!this.isLoggedIn()) {
            console.warn('❌ 로그인이 필요합니다.');
            this.redirectToLogin();
            return false;
        }

        try {
            // 토큰 유효성 검사
            const isValid = await this.validateToken();
            if (!isValid) {
                console.warn('❌ 토큰이 유효하지 않습니다.');
                this.redirectToLogin();
                return false;
            }

            // 권한 확인
            if (requiredRole && !this.hasRole(requiredRole)) {
                console.warn(`❌ ${requiredRole} 권한이 필요합니다.`);
                Utils.showError('접근 권한이 없습니다.');
                return false;
            }

            console.log('✅ 페이지 접근 권한 확인 완료');
            this.setupApiInterceptors();
            this.updateUserInfo();
            return true;
        } catch (error) {
            console.error('❌ 권한 체크 중 오류:', error);
            this.redirectToLogin();
            return false;
        }
    },

    // 사용자 정보 UI 업데이트
    updateUserInfo() {
        const user = this.getUser();
        if (!user) return;

        // 헤더에 사용자 정보 표시
        const userInfoEl = document.getElementById('userInfo');
        if (userInfoEl) {
            userInfoEl.innerHTML = `
                <div class="user-info">
                    <span class="user-name">${user.name}</span>
                    <span class="user-role">(${this.getRoleDisplayName(user.role)})</span>
                    <button class="btn btn-sm btn-outline" onclick="Auth.logout()">로그아웃</button>
                </div>
            `;
        }

        // 내비게이션에 사용자 정보 추가
        this.addUserNavigation();
    },

    // 권한 표시명 변환
    getRoleDisplayName(role) {
        const roleNames = {
            'moderator': '운영자',
            'admin': '관리자',
            'super_admin': '슈퍼 관리자'
        };
        return roleNames[role] || role;
    },

    // 사용자 내비게이션 추가
    addUserNavigation() {
        const user = this.getUser();
        if (!user) return;

        // 기존 사용자 탭이 없다면 추가
        if (!document.getElementById('tab-user-management')) {
            const navTabs = document.querySelector('.nav-tabs');
            if (navTabs) {
                const userTab = document.createElement('button');
                userTab.className = 'nav-tab';
                userTab.id = 'tab-user-management';
                userTab.textContent = '👤 사용자 관리';
                userTab.addEventListener('click', () => this.showUserManagement());
                navTabs.appendChild(userTab);
            }
        }

        // 로그아웃 버튼 추가
        if (!document.getElementById('logout-btn')) {
            const container = document.querySelector('.container');
            if (container) {
                const logoutBtn = document.createElement('div');
                logoutBtn.className = 'logout-container';
                logoutBtn.innerHTML = `
                    <div class="user-status">
                        <span>${user.name} (${this.getRoleDisplayName(user.role)})</span>
                        <button id="logout-btn" class="btn btn-danger btn-sm" onclick="Auth.logout()">로그아웃</button>
                    </div>
                `;
                container.insertBefore(logoutBtn, container.firstChild);
            }
        }
    },

    // 사용자 관리 페이지 표시
    showUserManagement() {
        if (!this.hasRole('admin')) {
            Utils.showError('관리자 권한이 필요합니다.');
            return;
        }

        Utils.renderContent(`
            <div class="content-panel">
                <h2>👤 관리자 계정 관리</h2>
                <div class="user-management-content">
                    <div class="current-user-info">
                        <h3>현재 로그인 정보</h3>
                        <div class="user-card">
                            <p><strong>이름:</strong> ${this.getUser().name}</p>
                            <p><strong>이메일:</strong> ${this.getUser().email}</p>
                            <p><strong>권한:</strong> ${this.getRoleDisplayName(this.getUser().role)}</p>
                            <p><strong>마지막 로그인:</strong> ${new Date(this.getUser().lastLoginAt || Date.now()).toLocaleString('ko-KR')}</p>
                        </div>
                    </div>
                    
                    <div class="password-change-section">
                        <h3>비밀번호 변경</h3>
                        <form id="passwordChangeForm">
                            <div class="form-group">
                                <label>현재 비밀번호</label>
                                <input type="password" id="currentPassword" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>새 비밀번호</label>
                                <input type="password" id="newPassword" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>새 비밀번호 확인</label>
                                <input type="password" id="confirmNewPassword" class="form-control" required>
                            </div>
                            <button type="submit" class="btn btn-primary">비밀번호 변경</button>
                        </form>
                    </div>

                    ${this.hasRole('super_admin') ? `
                    <div class="admin-management-section">
                        <h3>관리자 계정 목록</h3>
                        <div id="adminList" class="admin-list">
                            <div class="loading">관리자 목록을 불러오는 중...</div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `);

        // 비밀번호 변경 폼 이벤트 리스너
        document.getElementById('passwordChangeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });

        // 슈퍼 관리자인 경우 관리자 목록 로드
        if (this.hasRole('super_admin')) {
            this.loadAdminList();
        }
    },

    // 비밀번호 변경
    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            Utils.showError('모든 필드를 입력해주세요.');
            return;
        }

        if (newPassword.length < 8) {
            Utils.showError('새 비밀번호는 최소 8자 이상이어야 합니다.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            Utils.showError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await CONFIG.api.patch('/admin/auth/password', {
                currentPassword,
                newPassword
            });

            if (response.data.success) {
                Utils.showSuccess('비밀번호가 성공적으로 변경되었습니다.');
                document.getElementById('passwordChangeForm').reset();
            }
        } catch (error) {
            console.error('비밀번호 변경 실패:', error);
            Utils.showError(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
        }
    },

    // 관리자 목록 로드 (슈퍼 관리자용)
    async loadAdminList() {
        try {
            const response = await CONFIG.api.get('/admin/users');
            if (response.data.success) {
                this.renderAdminList(response.data.data);
            }
        } catch (error) {
            console.error('관리자 목록 로드 실패:', error);
            document.getElementById('adminList').innerHTML = 
                '<div class="error">관리자 목록을 불러오는데 실패했습니다.</div>';
        }
    },

    // 관리자 목록 렌더링
    renderAdminList(admins) {
        const adminListEl = document.getElementById('adminList');
        if (!admins || admins.length === 0) {
            adminListEl.innerHTML = '<p>등록된 관리자가 없습니다.</p>';
            return;
        }

        adminListEl.innerHTML = admins.map(admin => `
            <div class="admin-card">
                <div class="admin-info">
                    <h4>${admin.name}</h4>
                    <p><strong>이메일:</strong> ${admin.email}</p>
                    <p><strong>권한:</strong> ${this.getRoleDisplayName(admin.role)}</p>
                    <p><strong>상태:</strong> ${admin.status === 'active' ? '활성' : '비활성'}</p>
                    <p><strong>생성일:</strong> ${new Date(admin.createdAt).toLocaleString('ko-KR')}</p>
                    <p><strong>마지막 로그인:</strong> ${admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString('ko-KR') : '없음'}</p>
                </div>
                ${admin.id !== this.getUser().id ? `
                <div class="admin-actions">
                    <button class="btn btn-sm btn-warning" onclick="Auth.toggleAdminStatus(${admin.id}, '${admin.status}')">
                        ${admin.status === 'active' ? '비활성화' : '활성화'}
                    </button>
                </div>
                ` : '<div class="admin-actions"><span class="current-user">현재 사용자</span></div>'}
            </div>
        `).join('');
    },

    // 관리자 상태 토글
    async toggleAdminStatus(adminId, currentStatus) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const action = newStatus === 'active' ? '활성화' : '비활성화';
        
        if (!confirm(`정말로 이 관리자를 ${action}하시겠습니까?`)) {
            return;
        }

        try {
            const response = await CONFIG.api.patch(`/admin/users/${adminId}/status`, {
                status: newStatus
            });

            if (response.data.success) {
                Utils.showSuccess(`관리자가 ${action}되었습니다.`);
                this.loadAdminList();
            }
        } catch (error) {
            console.error('관리자 상태 변경 실패:', error);
            Utils.showError(error.response?.data?.message || '상태 변경에 실패했습니다.');
        }
    }
};