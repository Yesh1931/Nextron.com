/**
 * Nextron - Platform Administration Dashboard
 * Route: #/admin
 */

import { AppState } from './app.js';
import { GLOSSARY, QUIZ_BANK } from './database.js';

// --- Static Default System State Init ---
const DEFAULT_ACHIEVEMENTS = [
    { id: 'first-charge', name: 'First Charge', desc: 'Complete your first PN Junction simulation.', xp: 100, icon: 'zap', active: true },
    { id: 'fourier-master', name: 'Fourier Master', desc: 'Score 100% on the Signals and Systems Quiz.', xp: 250, icon: 'award', active: true },
    { id: 'mesh-solver', name: 'Mesh Solver', desc: 'Successfully build a parallel RLC circuit.', xp: 150, icon: 'activity', active: true },
    { id: 'gate-keeper', name: 'Gate Keeper', desc: 'Design a Universal NAND-only XOR gate.', xp: 200, icon: 'cpu', active: true }
];

const DEFAULT_FEEDBACK = [
    { id: 1, name: 'Aditya Sen', email: 'aditya.sen@iitb.ac.in', module: 'Circuit Lab', msg: 'The transient RLC simulation waves are incredibly stable! Could we add an active Op-Amp module soon?', status: 'Active', reply: '' },
    { id: 2, name: 'Ananya Rao', email: 'ananya@bits-pilani.ac.in', module: 'Math Center', msg: 'The Fourier FFT charts are extremely visual. A small zoom feature on the pole-zero unit circle would be amazing.', status: 'Resolved', reply: 'Glad you like it! Unit circle zoom is planned in v1.2.' }
];

// Helper to seed initial admin data to local storage if empty
const initAdminDatabases = () => {
    if (!localStorage.getItem('ece-admin-users-list')) {
        const dummyUsers = [
            { username: 'scholar', email: 'scholar@college.edu', role: 'Admin', joinDate: '2026-05-15T12:00:00.000Z', lastActive: new Date().toISOString(), level: 4, xp: 950, status: 'Active' },
            { username: 'rohit_kumar', email: 'rohit.k@nitk.edu', role: 'Student', joinDate: '2026-05-20T08:30:00.000Z', lastActive: '2026-05-30T10:15:00.000Z', level: 2, xp: 450, status: 'Active' },
            { username: 'priya_sharma', email: 'priya@iiit.ac.in', role: 'Moderator', joinDate: '2026-05-18T14:45:00.000Z', lastActive: new Date().toISOString(), level: 3, xp: 620, status: 'Active' },
            { username: 'vikram_singh', email: 'vikram@iitd.ac.in', role: 'Student', joinDate: '2026-05-25T11:00:00.000Z', lastActive: '2026-05-28T16:40:00.000Z', level: 1, xp: 120, status: 'Suspended' }
        ];
        localStorage.setItem('ece-admin-users-list', JSON.stringify(dummyUsers));
    }

    if (!localStorage.getItem('ece-admin-achievements')) {
        localStorage.setItem('ece-admin-achievements', JSON.stringify(DEFAULT_ACHIEVEMENTS));
    }

    if (!localStorage.getItem('ece-admin-feedback')) {
        localStorage.setItem('ece-admin-feedback', JSON.stringify(DEFAULT_FEEDBACK));
    }

    if (!localStorage.getItem('ece-admin-activity-log')) {
        const initialLogs = [
            { time: new Date().toISOString(), user: 'admin', action: 'System telemetry initialized', details: 'Core console loaded' }
        ];
        localStorage.setItem('ece-admin-activity-log', JSON.stringify(initialLogs));
    }

    if (!localStorage.getItem('ece-admin-announcements')) {
        localStorage.setItem('ece-admin-announcements', JSON.stringify([]));
    }

    if (!localStorage.getItem('ece-admin-settings')) {
        const defaultSettings = {
            siteName: 'Nextron ECE',
            logoText: 'Nextron',
            theme: 'dark',
            footer: 'Return to interactive engineering learning.',
            contact: 'support@nextron.edu'
        };
        localStorage.setItem('ece-admin-settings', JSON.stringify(defaultSettings));
    }
};

const logActivity = (action, details) => {
    const logs = JSON.parse(localStorage.getItem('ece-admin-activity-log')) || [];
    const activeAdmin = AppState.currentUser ? AppState.currentUser.username : 'System';
    logs.unshift({
        time: new Date().toISOString(),
        user: activeAdmin,
        action,
        details
    });
    localStorage.setItem('ece-admin-activity-log', JSON.stringify(logs.slice(0, 100))); // Limit to last 100 entries
};

// Global reference for active animation loop inside charts
let adminChartLoopId = null;

export const render = async () => {
    initAdminDatabases();
    const settings = JSON.parse(localStorage.getItem('ece-admin-settings'));

    return `
        <div class="admin-layout fade-in">
            <!-- SIDEBAR CONTROL TABS -->
            <aside class="admin-sidebar" aria-label="Console Navigation Sidebar">
                <span class="admin-sidebar-title">Clearnance Level: Admin</span>
                <nav class="admin-sidebar-menu">
                    <button class="admin-tab-btn active" data-tab="tab-dashboard"><i data-lucide="layout-dashboard"></i> Overview</button>
                    <button class="admin-tab-btn" data-tab="tab-users"><i data-lucide="users"></i> User Manager</button>
                    <button class="admin-tab-btn" data-tab="tab-content"><i data-lucide="cpu"></i> Silicon Concepts</button>
                    <button class="admin-tab-btn" data-tab="tab-quizzes"><i data-lucide="award"></i> Quiz Manager</button>
                    <button class="admin-tab-btn" data-tab="tab-notes"><i data-lucide="book-open"></i> Study Guides</button>
                    <button class="admin-tab-btn" data-tab="tab-formulas"><i data-lucide="line-chart"></i> Formulas</button>
                    <button class="admin-tab-btn" data-tab="tab-alerts"><i data-lucide="bell"></i> Alerts Banner</button>
                    <button class="admin-tab-btn" data-tab="tab-charts"><i data-lucide="activity"></i> Analytics</button>
                    <button class="admin-tab-btn" data-tab="tab-achievements"><i data-lucide="zap"></i> Achievements</button>
                    <button class="admin-tab-btn" data-tab="tab-feedback"><i data-lucide="message-square"></i> Feedback</button>
                    <button class="admin-tab-btn" data-tab="tab-logs"><i data-lucide="shield-alert"></i> Security Logs</button>
                    <button class="admin-tab-btn" data-tab="tab-settings"><i data-lucide="settings"></i> Platform Settings</button>
                    <button class="admin-tab-btn" data-tab="tab-backup"><i data-lucide="download"></i> Backup & Export</button>
                </nav>
            </aside>

            <!-- WORKSPACE INTERFACE PANEL -->
            <main class="admin-workspace" id="admin-main-viewport">
                <!-- Dynamically populated workspace goes here -->
            </main>
        </div>

        <!-- SHARED EDITING FORM DIALOGS -->
        <div class="admin-modal" id="admin-form-modal" role="dialog" aria-modal="true">
            <div class="admin-modal-content" id="admin-modal-body"></div>
        </div>
    `;
};

export const mount = () => {
    initAdminDatabases();

    // 1. Initial mounting view
    switchTab('tab-dashboard');

    // 2. Click bindings for sidebar items
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
            const targetTab = btn.getAttribute('data-tab');
            btn.classList.add('active');
            switchTab(targetTab);
        });
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
};

export const unmount = () => {
    if (adminChartLoopId) {
        cancelAnimationFrame(adminChartLoopId);
        adminChartLoopId = null;
    }
};

// --- WORKSPACE DYNAMIC VIEWS SWITCHING ---
const switchTab = (tabName) => {
    const workspace = document.getElementById('admin-main-viewport');
    if (!workspace) return;

    // Clear previous charts loop if running
    if (adminChartLoopId) {
        cancelAnimationFrame(adminChartLoopId);
        adminChartLoopId = null;
    }

    switch (tabName) {
        case 'tab-dashboard':
            renderDashboard(workspace);
            break;
        case 'tab-users':
            renderUsersTab(workspace);
            break;
        case 'tab-content':
            renderContentTab(workspace);
            break;
        case 'tab-quizzes':
            renderQuizzesTab(workspace);
            break;
        case 'tab-notes':
            renderNotesTab(workspace);
            break;
        case 'tab-formulas':
            renderFormulasTab(workspace);
            break;
        case 'tab-alerts':
            renderAlertsTab(workspace);
            break;
        case 'tab-charts':
            renderChartsTab(workspace);
            break;
        case 'tab-achievements':
            renderAchievementsTab(workspace);
            break;
        case 'tab-feedback':
            renderFeedbackTab(workspace);
            break;
        case 'tab-logs':
            renderLogsTab(workspace);
            break;
        case 'tab-settings':
            renderSettingsTab(workspace);
            break;
        case 'tab-backup':
            renderBackupTab(workspace);
            break;
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }
};

// ─── TAB 1: OVERVIEW DASHBOARD ──────────────────────────────────────────────
const renderDashboard = (container) => {
    const users = JSON.parse(localStorage.getItem('ece-admin-users-list')) || [];
    const feedback = JSON.parse(localStorage.getItem('ece-admin-feedback')) || [];
    const alerts = JSON.parse(localStorage.getItem('ece-admin-announcements')) || [];
    const achievements = JSON.parse(localStorage.getItem('ece-admin-achievements')) || [];

    // Calculate aggregated statistics
    const totalUsers = users.length + 15; // dummy baseline + custom list
    const activeUsers = users.filter(u => u.status === 'Active').length + 8;
    const conceptsCount = Object.keys(GLOSSARY).length;
    
    let totalQuestions = 0;
    Object.values(QUIZ_BANK).forEach(q => {
        totalQuestions += q.questions.length;
    });

    container.innerHTML = `
        <div class="admin-overview-header fade-in">
            <div>
                <h2>Console Overview</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Real-time educational platform metrics and telemetry.</p>
            </div>
            <div style="font-family:'DM Mono', monospace; font-size:0.8rem; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px; border:1px solid var(--border-color);">
                DSO Core State: CONNECTED
            </div>
        </div>

        <div class="admin-stats-grid">
            <div class="admin-stat-card">
                <div class="admin-stat-info">
                    <span class="admin-stat-val">${totalUsers}</span>
                    <span class="admin-stat-label">Total Users</span>
                </div>
                <div class="admin-stat-icon"><i data-lucide="users"></i></div>
            </div>
            
            <div class="admin-stat-card">
                <div class="admin-stat-info">
                    <span class="admin-stat-val" style="color:var(--success);">${activeUsers}</span>
                    <span class="admin-stat-label">Active Probes</span>
                </div>
                <div class="admin-stat-icon" style="color:var(--success);background:rgba(16,185,129,0.08);"><i data-lucide="activity"></i></div>
            </div>

            <div class="admin-stat-card">
                <div class="admin-stat-info">
                    <span class="admin-stat-val">${conceptsCount}</span>
                    <span class="admin-stat-label">ECE Modules</span>
                </div>
                <div class="admin-stat-icon"><i data-lucide="cpu"></i></div>
            </div>

            <div class="admin-stat-card">
                <div class="admin-stat-info">
                    <span class="admin-stat-val">${totalQuestions}</span>
                    <span class="admin-stat-label">Quiz Items</span>
                </div>
                <div class="admin-stat-icon" style="color:var(--accent-purple);background:rgba(168,85,247,0.08);"><i data-lucide="award"></i></div>
            </div>
        </div>

        <!-- Quick Summary Box -->
        <div class="grid-2">
            <div class="admin-card">
                <h3 class="scope-title"><i data-lucide="bell"></i> Broadcast Status</h3>
                <p style="font-size:0.9rem;margin-bottom:0;color:var(--text-secondary);">
                    Active website banner alerts: <strong>${alerts.length}</strong>. Deploy maintenances, updates, or exam timetables globally.
                </p>
                <div style="margin-top:auto;">
                    <button class="btn btn-secondary btn-sm" id="btn-quick-alerts-link"><i data-lucide="arrow-right"></i> Manage Alerts</button>
                </div>
            </div>

            <div class="admin-card">
                <h3 class="scope-title" style="color:var(--accent-secondary);"><i data-lucide="message-square"></i> Student Feedback</h3>
                <p style="font-size:0.9rem;margin-bottom:0;color:var(--text-secondary);">
                    Pending unresolved feedback queries: <strong>${feedback.filter(f => f.status === 'Active').length}</strong>. Connect, reply, or mark resolved.
                </p>
                <div style="margin-top:auto;">
                    <button class="btn btn-secondary btn-sm" id="btn-quick-feedback-link"><i data-lucide="arrow-right"></i> Review Feedback</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-quick-alerts-link').addEventListener('click', () => {
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-tab="tab-alerts"]').classList.add('active');
        switchTab('tab-alerts');
    });

    document.getElementById('btn-quick-feedback-link').addEventListener('click', () => {
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-tab="tab-feedback"]').classList.add('active');
        switchTab('tab-feedback');
    });
};

// ─── TAB 2: USER MANAGEMENT ─────────────────────────────────────────────────
const renderUsersTab = (container) => {
    let users = JSON.parse(localStorage.getItem('ece-admin-users-list')) || [];
    
    const drawTable = (filteredUsers) => {
        let tableRowsHTML = filteredUsers.map(user => {
            const roleClass = `admin-badge-${user.role.toLowerCase()}`;
            const statusClass = user.status === 'Active' ? 'admin-badge-active' : 'admin-badge-suspended';
            const actionText = user.status === 'Active' ? 'Suspend' : 'Activate';
            const actionIcon = user.status === 'Active' ? 'shield-off' : 'shield';

            return `
                <tr>
                    <td>
                        <div style="font-weight:600;color:var(--text-primary);">${user.username}</div>
                    </td>
                    <td>${user.email}</td>
                    <td><span class="admin-badge ${roleClass}">${user.role}</span></td>
                    <td>${new Date(user.joinDate).toLocaleDateString()}</td>
                    <td><span class="admin-badge ${statusClass}">${user.status}</span></td>
                    <td>
                        <span style="font-size:0.8rem; font-weight:700; color:var(--accent-secondary);">LVL ${user.level}</span>
                        <div style="font-size:0.7rem; color:var(--text-muted);">${user.xp} XP</div>
                    </td>
                    <td>
                        <button class="admin-action-btn btn-view" data-name="${user.username}" title="Edit Role / Profile"><i data-lucide="edit-3"></i></button>
                        <button class="admin-action-btn btn-suspend" data-name="${user.username}" title="${actionText} user"><i data-lucide="${actionIcon}"></i></button>
                        <button class="admin-action-btn btn-reset" data-name="${user.username}" title="Reset Progress"><i data-lucide="rotate-ccw"></i></button>
                        <button class="admin-action-btn btn-delete" data-name="${user.username}" title="Delete User Account"><i data-lucide="trash-2"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

        if (filteredUsers.length === 0) {
            tableRowsHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">No student accounts found matching probe search.</td></tr>`;
        }

        container.innerHTML = `
            <div class="admin-overview-header fade-in">
                <div>
                    <h2>User Management</h2>
                    <p class="notfound-subtitle" style="font-size:0.95rem;">Probing, editing, and suspending student registry tables.</p>
                </div>
                <button class="btn btn-primary" id="btn-add-user"><i data-lucide="user-plus"></i> Register User</button>
            </div>

            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-search-bar">
                        <i data-lucide="search" style="width:16px;height:16px;color:var(--text-muted);"></i>
                        <input type="text" id="user-search-input" placeholder="Search users by name, email, or role...">
                    </div>
                    <div style="display:flex; gap:8px;">
                        <select class="admin-select" id="filter-user-role">
                            <option value="All">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Moderator">Moderator</option>
                            <option value="Student">Student</option>
                        </select>
                        <select class="admin-select" id="filter-user-status">
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                <div class="admin-table-container">
                    <table class="admin-data-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email Address</th>
                                <th>Role</th>
                                <th>Join Date</th>
                                <th>Status</th>
                                <th>Academic State</th>
                                <th>Probe Operations</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            ${tableRowsHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        bindUserActions();
    };

    const bindUserActions = () => {
        // Search & Filter listeners
        const search = document.getElementById('user-search-input');
        const roleFilter = document.getElementById('filter-user-role');
        const statusFilter = document.getElementById('filter-user-status');

        const runFilter = () => {
            const query = search.value.toLowerCase().trim();
            const role = roleFilter.value;
            const status = statusFilter.value;

            const matches = users.filter(u => {
                const qMatch = u.username.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
                const rMatch = role === 'All' || u.role === role;
                const sMatch = status === 'All' || u.status === status;
                return qMatch && rMatch && sMatch;
            });
            drawTable(matches);
        };

        search.addEventListener('input', runFilter);
        roleFilter.addEventListener('change', runFilter);
        statusFilter.addEventListener('change', runFilter);

        // Add user trigger
        document.getElementById('btn-add-user').addEventListener('click', () => {
            showUserFormModal();
        });

        // Table action triggers
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetName = btn.getAttribute('data-name');
                const targetUser = users.find(u => u.username === targetName);
                showUserFormModal(targetUser);
            });
        });

        document.querySelectorAll('.btn-suspend').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetName = btn.getAttribute('data-name');
                const targetUser = users.find(u => u.username === targetName);
                if (targetUser) {
                    targetUser.status = targetUser.status === 'Active' ? 'Suspended' : 'Active';
                    localStorage.setItem('ece-admin-users-list', JSON.stringify(users));
                    logActivity('User account status toggle', `${targetUser.username} set to ${targetUser.status}`);
                    AppState.showToast(`User ${targetUser.username} has been ${targetUser.status.toLowerCase()}!`, 'info');
                    drawTable(users);
                }
            });
        });

        document.querySelectorAll('.btn-reset').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetName = btn.getAttribute('data-name');
                const targetUser = users.find(u => u.username === targetName);
                if (targetUser) {
                    if (confirm(`Warning: Are you sure you want to reset all academic simulation progress, achievements, and XP to zero for '${targetName}'?`)) {
                        targetUser.level = 1;
                        targetUser.xp = 0;
                        localStorage.setItem('ece-admin-users-list', JSON.stringify(users));
                        logActivity('Reset user progress', `XP and levels reset to baseline for user ${targetUser.username}`);
                        AppState.showToast(`Syllabus progression records reset successfully for ${targetUser.username}!`, 'success');
                        drawTable(users);
                    }
                }
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetName = btn.getAttribute('data-name');
                if (confirm(`Caution: Are you sure you want to delete user account '${targetName}' forever? This action is irreversible.`)) {
                    users = users.filter(u => u.username !== targetName);
                    localStorage.setItem('ece-admin-users-list', JSON.stringify(users));
                    logActivity('Delete user account', `${targetName} deleted from registry`);
                    AppState.showToast(`User registry deleted successfully for ${targetName}!`, 'error');
                    drawTable(users);
                }
            });
        });
    };

    // Open Form Modal helper
    const showUserFormModal = (userObj = null) => {
        const modal = document.getElementById('admin-form-modal');
        const modalBody = document.getElementById('admin-modal-body');
        const title = userObj ? 'Edit Platform User' : 'Register Platform User';
        const isEdit = !!userObj;

        modalBody.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:12px;">
                <h3 class="scope-title">${title}</h3>
                <button id="btn-close-modal" style="font-size:1.25rem;cursor:pointer;color:var(--text-muted);">✕</button>
            </div>
            <form id="admin-user-form" style="display:flex; flex-direction:column; gap:16px;">
                <div class="admin-input-group">
                    <label for="modal-username">Username</label>
                    <input type="text" id="modal-username" class="admin-input" required placeholder="e.g. rohan_sharma" ${isEdit ? 'disabled' : ''} value="${userObj ? userObj.username : ''}">
                </div>

                <div class="admin-input-group">
                    <label for="modal-email">Email Address</label>
                    <input type="email" id="modal-email" class="admin-input" required placeholder="e.g. rohan@iitb.ac.in" value="${userObj ? userObj.email : ''}">
                </div>

                ${!isEdit ? `
                <div class="admin-input-group">
                    <label for="modal-password">Password</label>
                    <input type="password" id="modal-password" class="admin-input" required placeholder="Set secure password">
                </div>
                ` : ''}

                <div class="admin-input-group">
                    <label for="modal-role">Clearance Role</label>
                    <select class="admin-select" id="modal-role">
                        <option value="Student" ${userObj && userObj.role === 'Student' ? 'selected' : ''}>Student</option>
                        <option value="Moderator" ${userObj && userObj.role === 'Moderator' ? 'selected' : ''}>Moderator</option>
                        <option value="Admin" ${userObj && userObj.role === 'Admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>

                <div class="admin-input-group">
                    <label for="modal-level">Academic Level</label>
                    <input type="number" id="modal-level" class="admin-input" min="1" max="100" value="${userObj ? userObj.level : 1}">
                </div>

                <div class="admin-input-group">
                    <label for="modal-xp">XP points</label>
                    <input type="number" id="modal-xp" class="admin-input" min="0" value="${userObj ? userObj.xp : 0}">
                </div>

                <button type="submit" class="btn btn-primary" style="margin-top:8px;">${isEdit ? 'Save Changes' : 'Register Account'}</button>
            </form>
        `;

        modal.classList.add('open');

        // Modal closures
        const closeModal = () => modal.classList.remove('open');
        document.getElementById('btn-close-modal').addEventListener('click', closeModal);

        document.getElementById('admin-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('modal-username').value.trim();
            const email = document.getElementById('modal-email').value.trim();
            const role = document.getElementById('modal-role').value;
            const level = parseInt(document.getElementById('modal-level').value) || 1;
            const xp = parseInt(document.getElementById('modal-xp').value) || 0;

            if (isEdit) {
                const u = users.find(x => x.username === userObj.username);
                if (u) {
                    u.email = email;
                    u.role = role;
                    u.level = level;
                    u.xp = xp;
                    localStorage.setItem('ece-admin-users-list', JSON.stringify(users));
                    logActivity('User account update', `Updated profile metrics for ${username}`);
                    AppState.showToast(`User ${username} profile saved!`, 'success');
                }
            } else {
                const password = document.getElementById('modal-password').value;
                const userExists = users.some(x => x.username.toLowerCase() === username.toLowerCase());
                if (userExists) {
                    AppState.showToast('Username already registered!', 'error');
                    return;
                }

                users.push({
                    username,
                    email,
                    password,
                    role,
                    level,
                    xp,
                    joinDate: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                    status: 'Active'
                });
                localStorage.setItem('ece-admin-users-list', JSON.stringify(users));
                logActivity('User account registration', `Registered new user: ${username}`);
                AppState.showToast(`User ${username} registered successfully!`, 'success');
            }

            closeModal();
            drawTable(users);
        });
    };

    drawTable(users);
};

// ─── TAB 3: SILICON CONCEPTS ────────────────────────────────────────────────
const renderContentTab = (container) => {
    let concepts = Object.entries(GLOSSARY);

    const drawGrid = () => {
        let cardsHTML = concepts.map(([key, item]) => {
            return `
                <div class="glass-card" style="padding:20px; display:flex; flex-direction:column; gap:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span class="admin-badge admin-badge-student">${item.tag}</span>
                        <div style="display:flex; gap:6px;">
                            <button class="admin-action-btn btn-edit-concept" data-key="${key}" title="Edit concept"><i data-lucide="edit-3"></i></button>
                            <button class="admin-action-btn btn-delete btn-delete-concept" data-key="${key}" title="Delete concept"><i data-lucide="trash-2"></i></button>
                        </div>
                    </div>
                    <h3 style="font-size:1.2rem; margin-bottom:0;">${item.title}</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0; line-height:1.45;">${item.desc.substring(0, 100)}...</p>
                    <div style="margin-top:auto; font-size:0.75rem; color:var(--text-muted);">
                        Probed terms: <strong>${Object.keys(item.terms).length}</strong> key glossary keys
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="admin-overview-header fade-in">
                <div>
                    <h2>Silicon Concepts Hub</h2>
                    <p class="notfound-subtitle" style="font-size:0.95rem;">Curriculum core chapters database and term glossaries.</p>
                </div>
                <button class="btn btn-primary" id="btn-add-concept"><i data-lucide="plus"></i> Add Concept</button>
            </div>

            <div class="concepts-grid">
                ${cardsHTML}
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        bindConceptActions();
    };

    const bindConceptActions = () => {
        document.querySelectorAll('.btn-edit-concept').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-key');
                showConceptModal(key, GLOSSARY[key]);
            });
        });

        document.getElementById('btn-add-concept').addEventListener('click', () => {
            showConceptModal();
        });

        document.querySelectorAll('.btn-delete-concept').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-key');
                if (confirm(`Caution: Are you sure you want to delete Silicon module '${GLOSSARY[key].title}' forever? This will wipe associated concepts.`)) {
                    delete GLOSSARY[key];
                    logActivity('Delete ECE concept module', `Deleted silicon module key ${key}`);
                    AppState.showToast('Concept module wiped successfully!', 'error');
                    concepts = Object.entries(GLOSSARY);
                    drawGrid();
                }
            });
        });
    };

    const showConceptModal = (key = '', conceptObj = null) => {
        const modal = document.getElementById('admin-form-modal');
        const modalBody = document.getElementById('admin-modal-body');
        const isEdit = !!conceptObj;

        // Extract terms string for edit
        let termsText = '';
        if (conceptObj && conceptObj.terms) {
            termsText = Object.entries(conceptObj.terms).map(([k, val]) => `${k}::${val}`).join('\n');
        }

        modalBody.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:12px;">
                <h3 class="scope-title">${isEdit ? 'Edit Silicon Concept' : 'Add Silicon Concept'}</h3>
                <button id="btn-close-modal" style="font-size:1.25rem;cursor:pointer;color:var(--text-muted);">✕</button>
            </div>
            <form id="admin-concept-form" style="display:flex; flex-direction:column; gap:16px;">
                <div class="admin-input-group">
                    <label for="concept-key">Concept DB Key (alphanumeric, e.g. pn-junction)</label>
                    <input type="text" id="concept-key" class="admin-input" required placeholder="e.g. op-amps" ${isEdit ? 'disabled' : ''} value="${key}">
                </div>

                <div class="admin-input-group">
                    <label for="concept-title">Concept Title</label>
                    <input type="text" id="concept-title" class="admin-input" required placeholder="e.g. Operational Amplifiers" value="${conceptObj ? conceptObj.title : ''}">
                </div>

                <div class="admin-input-group">
                    <label for="concept-tag">Category sector tag</label>
                    <input type="text" id="concept-tag" class="admin-input" required placeholder="e.g. Semiconductor" value="${conceptObj ? conceptObj.tag : ''}">
                </div>

                <div class="admin-input-group">
                    <label for="concept-desc">Syllabus Overview Description</label>
                    <textarea id="concept-desc" class="admin-input admin-textarea" required placeholder="Write curriculum summary...">${conceptObj ? conceptObj.desc : ''}</textarea>
                </div>

                <div class="admin-input-group">
                    <label for="concept-terms">Glossary Terms (Format: term_key::definition, one per line)</label>
                    <textarea id="concept-terms" class="admin-input admin-textarea" rows="6" placeholder="e.g. drift::Movement under field gradient">${termsText}</textarea>
                </div>

                <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Concept'}</button>
            </form>
        `;

        modal.classList.add('open');
        const closeModal = () => modal.classList.remove('open');
        document.getElementById('btn-close-modal').addEventListener('click', closeModal);

        document.getElementById('admin-concept-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const targetKey = document.getElementById('concept-key').value.trim().toLowerCase();
            const title = document.getElementById('concept-title').value.trim();
            const tag = document.getElementById('concept-tag').value.trim();
            const desc = document.getElementById('concept-desc').value.trim();
            const termsRaw = document.getElementById('concept-terms').value.trim();

            // Parse terms text block
            const terms = {};
            termsRaw.split('\n').forEach(line => {
                const parts = line.split('::');
                if (parts.length >= 2) {
                    terms[parts[0].trim()] = parts[1].trim();
                }
            });

            GLOSSARY[targetKey] = { title, tag, desc, terms };
            logActivity(isEdit ? 'Edit concept module' : 'Add concept module', `Saved concept key ${targetKey}`);
            AppState.showToast('Silicon module saved successfully!', 'success');
            
            closeModal();
            concepts = Object.entries(GLOSSARY);
            drawGrid();
        });
    };

    drawGrid();
};

// ─── TAB 4: QUIZ MANAGER ────────────────────────────────────────────────────
const renderQuizzesTab = (container) => {
    let categories = Object.keys(QUIZ_BANK);
    let selectedCat = categories[0];

    const drawQuizEditor = () => {
        const quizData = QUIZ_BANK[selectedCat];
        let questionsHTML = quizData.questions.map((q, idx) => {
            return `
                <div style="border-bottom:1px solid var(--border-color); padding:16px 0; display:flex; justify-content:space-between; gap:16px;">
                    <div>
                        <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px;">${idx + 1}. ${q.question}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);display:flex;gap:12px;">
                            <span>Difficulty: <strong style="text-transform:uppercase;">${q.difficulty}</strong></span>
                            <span>Options: <strong>${q.options.join(', ')}</strong></span>
                            <span>Correct: <strong style="color:var(--success);">${q.options[q.correctIndex]}</strong></span>
                        </div>
                        <div style="font-size:0.75rem;margin-top:6px;font-style:italic;color:var(--accent-secondary);">Exp: ${q.explanation}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px; align-self:center;">
                        <button class="admin-action-btn btn-edit-question" data-idx="${idx}"><i data-lucide="edit-3"></i></button>
                        <button class="admin-action-btn btn-delete btn-delete-question" data-idx="${idx}"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        if (quizData.questions.length === 0) {
            questionsHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted);">No quiz questions defined under this category yet.</div>`;
        }

        // Build category tabs selection
        const catSelectorHTML = categories.map(cat => {
            const activeClass = cat === selectedCat ? 'active' : '';
            return `<button class="admin-tab-btn ${activeClass}" data-cat="${cat}" style="padding:6px 12px; font-size:0.8rem;">${QUIZ_BANK[cat].title}</button>`;
        }).join('');

        container.innerHTML = `
            <div class="admin-overview-header fade-in">
                <div>
                    <h2>Quiz Arena Console</h2>
                    <p class="notfound-subtitle" style="font-size:0.95rem;">Manage MCQ banks, True/False validations, and difficulty grids.</p>
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-secondary" id="btn-import-quiz"><i data-lucide="upload"></i> Import CSV</button>
                    <button class="btn btn-primary" id="btn-add-question"><i data-lucide="plus"></i> Add Question</button>
                </div>
            </div>

            <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; border-bottom:1px solid var(--border-color);">
                ${catSelectorHTML}
            </div>

            <div class="admin-card" style="margin-top:16px;">
                <h3 class="scope-title" style="color:var(--accent-secondary);"><i data-lucide="award"></i> Question Bank list: ${quizData.title}</h3>
                <div style="display:flex; flex-direction:column;">
                    ${questionsHTML}
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        bindQuizActions();
    };

    const bindQuizActions = () => {
        // Tab selectors
        document.querySelectorAll('[data-cat]').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedCat = btn.getAttribute('data-cat');
                drawQuizEditor();
            });
        });

        // Add question trigger
        document.getElementById('btn-add-question').addEventListener('click', () => {
            showQuestionModal();
        });

        // Edit question trigger
        document.querySelectorAll('.btn-edit-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                showQuestionModal(idx);
            });
        });

        // Delete question trigger
        document.querySelectorAll('.btn-delete-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                if (confirm('Are you sure you want to delete this question?')) {
                    QUIZ_BANK[selectedCat].questions.splice(idx, 1);
                    logActivity('Delete quiz question', `Deleted item ${idx} under category ${selectedCat}`);
                    AppState.showToast('Question deleted successfully!', 'error');
                    drawQuizEditor();
                }
            });
        });

        // Import CSV mock
        document.getElementById('btn-import-quiz').addEventListener('click', () => {
            const rawCSV = prompt("Paste CSV items here (Format: Question, OptionA, OptionB, OptionC, OptionD, CorrectIndex(0-3), Difficulty, Explanation):");
            if (rawCSV) {
                try {
                    const lines = rawCSV.split('\n');
                    let imported = 0;
                    lines.forEach(line => {
                        const parts = line.split(',');
                        if (parts.length >= 8) {
                            const question = parts[0].trim();
                            const options = [parts[1].trim(), parts[2].trim(), parts[3].trim(), parts[4].trim()];
                            const correctIndex = parseInt(parts[5].trim()) || 0;
                            const difficulty = parts[6].trim().toLowerCase();
                            const explanation = parts[7].trim();
                            
                            QUIZ_BANK[selectedCat].questions.push({
                                question, options, correctIndex, difficulty, explanation
                            });
                            imported++;
                        }
                    });
                    logActivity('Import quiz CSV data', `Imported ${imported} questions to ${selectedCat}`);
                    AppState.showToast(`Success! Imported ${imported} questions successfully.`, 'success');
                    drawQuizEditor();
                } catch(e) {
                    AppState.showToast("Failed to parse CSV syntax.", "error");
                }
            }
        });
    };

    const showQuestionModal = (idx = null) => {
        const modal = document.getElementById('admin-form-modal');
        const modalBody = document.getElementById('admin-modal-body');
        const isEdit = idx !== null;
        const qObj = isEdit ? QUIZ_BANK[selectedCat].questions[idx] : null;

        modalBody.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:12px;">
                <h3 class="scope-title">${isEdit ? 'Edit Quiz Question' : 'Add Quiz Question'}</h3>
                <button id="btn-close-modal" style="font-size:1.25rem;cursor:pointer;color:var(--text-muted);">✕</button>
            </div>
            <form id="admin-question-form" style="display:flex; flex-direction:column; gap:16px;">
                <div class="admin-input-group">
                    <label for="modal-q-text">Question Prompt</label>
                    <input type="text" id="modal-q-text" class="admin-input" required placeholder="Write question statement..." value="${qObj ? qObj.question : ''}">
                </div>

                <div class="admin-input-group">
                    <label for="modal-q-diff">Difficulty rating</label>
                    <select class="admin-select" id="modal-q-diff">
                        <option value="easy" ${qObj && qObj.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                        <option value="medium" ${qObj && qObj.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="hard" ${qObj && qObj.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                        <option value="expert" ${qObj && qObj.difficulty === 'expert' ? 'selected' : ''}>Expert</option>
                    </select>
                </div>

                <div class="grid-2">
                    <div class="admin-input-group">
                        <label for="modal-opt-0">Option A</label>
                        <input type="text" id="modal-opt-0" class="admin-input" required placeholder="Option A" value="${qObj ? qObj.options[0] : ''}">
                    </div>
                    <div class="admin-input-group">
                        <label for="modal-opt-1">Option B</label>
                        <input type="text" id="modal-opt-1" class="admin-input" required placeholder="Option B" value="${qObj ? qObj.options[1] : ''}">
                    </div>
                    <div class="admin-input-group">
                        <label for="modal-opt-2">Option C</label>
                        <input type="text" id="modal-opt-2" class="admin-input" required placeholder="Option C" value="${qObj ? qObj.options[2] : ''}">
                    </div>
                    <div class="admin-input-group">
                        <label for="modal-opt-3">Option D</label>
                        <input type="text" id="modal-opt-3" class="admin-input" required placeholder="Option D" value="${qObj ? qObj.options[3] : ''}">
                    </div>
                </div>

                <div class="admin-input-group">
                    <label for="modal-q-correct">Correct Option index</label>
                    <select class="admin-select" id="modal-q-correct">
                        <option value="0" ${qObj && qObj.correctIndex === 0 ? 'selected' : ''}>Option A</option>
                        <option value="1" ${qObj && qObj.correctIndex === 1 ? 'selected' : ''}>Option B</option>
                        <option value="2" ${qObj && qObj.correctIndex === 2 ? 'selected' : ''}>Option C</option>
                        <option value="3" ${qObj && qObj.correctIndex === 3 ? 'selected' : ''}>Option D</option>
                    </select>
                </div>

                <div class="admin-input-group">
                    <label for="modal-q-exp">Explanatory Guidance</label>
                    <textarea id="modal-q-exp" class="admin-input admin-textarea" required placeholder="Explain why correct option satisfies formula limits...">${qObj ? qObj.explanation : ''}</textarea>
                </div>

                <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Append Question'}</button>
            </form>
        `;

        modal.classList.add('open');
        const closeModal = () => modal.classList.remove('open');
        document.getElementById('btn-close-modal').addEventListener('click', closeModal);

        document.getElementById('admin-question-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const question = document.getElementById('modal-q-text').value.trim();
            const difficulty = document.getElementById('modal-q-diff').value;
            const options = [
                document.getElementById('modal-opt-0').value.trim(),
                document.getElementById('modal-opt-1').value.trim(),
                document.getElementById('modal-opt-2').value.trim(),
                document.getElementById('modal-opt-3').value.trim()
            ];
            const correctIndex = parseInt(document.getElementById('modal-q-correct').value);
            const explanation = document.getElementById('modal-q-exp').value.trim();

            const savedQuestion = { question, difficulty, options, correctIndex, explanation };

            if (isEdit) {
                QUIZ_BANK[selectedCat].questions[idx] = savedQuestion;
                logActivity('Edit quiz question', `Modified question ${idx} in category ${selectedCat}`);
                AppState.showToast('Quiz question saved successfully!', 'success');
            } else {
                QUIZ_BANK[selectedCat].questions.push(savedQuestion);
                logActivity('Add quiz question', `Appended question in category ${selectedCat}`);
                AppState.showToast('Quiz question added successfully!', 'success');
            }

            closeModal();
            drawQuizEditor();
        });
    };

    drawQuizEditor();
};

// ─── TAB 5: STUDY GUIDES ────────────────────────────────────────────────────
const renderNotesTab = (container) => {
    container.innerHTML = `
        <div class="admin-overview-header fade-in">
            <div>
                <h2>Notes & Study Hub Guides</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Review, append formulas, and render KaTeX textbooks.</p>
            </div>
        </div>

        <div class="admin-editor-layout fade-in">
            <!-- Edit panel -->
            <div class="admin-card">
                <h3 class="scope-title"><i data-lucide="book-open"></i> Study Guide markup Editor</h3>
                <div class="admin-input-group">
                    <label for="editor-note-cat">Select Target Subject</label>
                    <select class="admin-select" id="editor-note-cat">
                        <option value="signals">Signals & Systems</option>
                        <option value="networks">Network Theory</option>
                        <option value="diodes">PN Junction Diodes</option>
                    </select>
                </div>

                <div class="admin-input-group">
                    <label for="editor-note-title">Title</label>
                    <input type="text" id="editor-note-title" class="admin-input" value="Syllabus chapter overview">
                </div>

                <div class="admin-input-group">
                    <label for="editor-note-body">Notes Content (HTML and formulas supported)</label>
                    <textarea id="editor-note-body" class="admin-input admin-textarea" style="min-height:220px;" placeholder="Write markup text here..."></textarea>
                </div>
            </div>

            <!-- Preview panel -->
            <div class="admin-editor-preview">
                <div class="admin-preview-title">Live KaTeX Text Preview</div>
                <div class="admin-preview-render-box" id="note-preview-render">
                    <!-- Preview HTML injected here -->
                </div>
            </div>
        </div>
    `;

    const noteCat = document.getElementById('editor-note-cat');
    const noteTitle = document.getElementById('editor-note-title');
    const noteBody = document.getElementById('editor-note-body');
    const previewRender = document.getElementById('note-preview-render');

    const updatePreview = () => {
        previewRender.innerHTML = `
            <h4>${noteTitle.value}</h4>
            <div style="font-size:0.9rem; line-height:1.6;">
                ${noteBody.value.replace(/\n/g, '<br>')}
            </div>
        `;

        // Render KaTeX equations in preview
        if (window.renderMathInElement) {
            window.renderMathInElement(previewRender, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                ],
                throwOnError: false
            });
        }
    };

    // Prepopulate
    const notePresets = {
        signals: 'Continuous-Time Fourier transform maps signals from time domain to frequency.\n\n$$\nX(\\omega) = \\int_{-\\infty}^{\\infty} x(t) \\cdot e^{-j \\omega t} dt\n$$\n\nEnsure sampling follows Nyquist Rate $f_s \\ge 2f_{max}$.',
        networks: 'Thevenin Theorem states that any linear mesh is simplifyable to Voc and Rth.\n\n$$\nR_{th} = \\frac{V_{oc}}{I_{sc}}\n$$\n\nResonance series frequency resonant equals $f_r = 1/(2\\pi\\sqrt{LC})$.',
        diodes: 'Governed by Shockley Diode equation exponent values:\n\n$$\nI = I_s \\left( e^{\\frac{V}{n V_T}} - 1 \\right)\n$$\n\nBuilt-in barrier voltage Silicon typically averages $0.7$ Volts.'
    };

    noteCat.addEventListener('change', () => {
        noteTitle.value = noteCat.options[noteCat.selectedIndex].text + " Notes";
        noteBody.value = notePresets[noteCat.value] || '';
        updatePreview();
    });

    noteTitle.addEventListener('input', updatePreview);
    noteBody.addEventListener('input', updatePreview);

    // Initial draw
    noteCat.dispatchEvent(new Event('change'));
};

// ─── TAB 6: FORMULA HANDBOOK ────────────────────────────────────────────────
const renderFormulasTab = (container) => {
    container.innerHTML = `
        <div class="admin-overview-header fade-in">
            <div>
                <h2>Engineering Formula Handbook</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Edit latex equations, explanations, and dynamic previews.</p>
            </div>
        </div>

        <div class="admin-editor-layout fade-in">
            <!-- Edit panel -->
            <div class="admin-card">
                <h3 class="scope-title"><i data-lucide="line-chart"></i> Handbook formula editor</h3>
                <div class="admin-input-group">
                    <label for="form-f-name">Formula Name</label>
                    <input type="text" id="form-f-name" class="admin-input" value="Shockley Diode Equation">
                </div>

                <div class="admin-input-group">
                    <label for="form-f-expr">LaTeX Equation</label>
                    <input type="text" id="form-f-expr" class="admin-input" value="I = I_s \\cdot \\left( e^{\\frac{V}{\\eta \\cdot V_T}} - 1 \\right)">
                </div>

                <div class="admin-input-group">
                    <label for="form-f-vars">Variables list (One per line)</label>
                    <textarea id="form-f-vars" class="admin-input admin-textarea" style="min-height:90px;">I = Instantaneous diode current\nIs = Leakage saturation current\nVT = Thermal voltage</textarea>
                </div>

                <div class="admin-input-group">
                    <label for="form-f-desc">Scientific Explanation</label>
                    <textarea id="form-f-desc" class="admin-input admin-textarea" style="min-height:90px;">Governs exponential current flow profiles under forward biased terminals.</textarea>
                </div>
            </div>

            <!-- Preview panel -->
            <div class="admin-editor-preview">
                <div class="admin-preview-title">Interactive LaTeX Rendering</div>
                <div class="admin-preview-render-box" id="formula-preview-render">
                    <!-- KaTeX rendered equation here -->
                </div>
            </div>
        </div>
    `;

    const fName = document.getElementById('form-f-name');
    const fExpr = document.getElementById('form-f-expr');
    const fVars = document.getElementById('form-f-vars');
    const fDesc = document.getElementById('form-f-desc');
    const fPreview = document.getElementById('formula-preview-render');

    const updateFormulaPreview = () => {
        const variableListHTML = fVars.value.split('\n').map(v => `<li>${v}</li>`).join('');
        fPreview.innerHTML = `
            <h4 style="margin-bottom:12px;color:var(--accent-secondary);">${fName.value}</h4>
            <div class="glass-card flex-center" style="padding:24px; margin-bottom:16px; background:rgba(0,0,0,0.3);">
                $$${fExpr.value}$$
            </div>
            <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:8px; text-transform:uppercase; font-weight:700;">Variables breakdown</div>
            <ul style="font-size:0.9rem; list-style:circle; padding-left:20px; color:var(--text-secondary); margin-bottom:16px;">
                ${variableListHTML}
            </ul>
            <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:8px; text-transform:uppercase; font-weight:700;">Description</div>
            <p style="font-size:0.95rem; line-height:1.5; color:var(--text-primary);">${fDesc.value}</p>
        `;

        if (window.renderMathInElement) {
            window.renderMathInElement(fPreview, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                ],
                throwOnError: false
            });
        }
    };

    fName.addEventListener('input', updateFormulaPreview);
    fExpr.addEventListener('input', updateFormulaPreview);
    fVars.addEventListener('input', updateFormulaPreview);
    fDesc.addEventListener('input', updateFormulaPreview);

    updateFormulaPreview();
};

// ─── TAB 7: ALERTS BANNER ───────────────────────────────────────────────────
const renderAlertsTab = (container) => {
    let alerts = JSON.parse(localStorage.getItem('ece-admin-announcements')) || [];

    const drawAlerts = () => {
        let activeBannersHTML = alerts.map((alert, idx) => {
            return `
                <div style="padding:16px; border:1px solid var(--border-color); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-weight:600;color:var(--text-primary);">${alert.title}</div>
                        <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px;">${alert.msg}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;">Category: <strong>${alert.type}</strong></div>
                    </div>
                    <button class="admin-action-btn btn-delete btn-delete-alert" data-idx="${idx}"><i data-lucide="trash-2"></i></button>
                </div>
            `;
        }).join('');

        if (alerts.length === 0) {
            activeBannersHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);">No active announcement alerts currently broadcasting.</div>`;
        }

        container.innerHTML = `
            <div class="admin-overview-header fade-in">
                <div>
                    <h2>Alerts & Announcements</h2>
                    <p class="notfound-subtitle" style="font-size:0.95rem;">Publish website notices, exam reminders, or maintenance alerts.</p>
                </div>
            </div>

            <div class="grid-2 fade-in" style="align-items:start;">
                <!-- Publisher -->
                <div class="admin-card">
                    <h3 class="scope-title"><i data-lucide="bell"></i> Broadcast alert publisher</h3>
                    <form id="alerts-publisher-form" style="display:flex; flex-direction:column; gap:16px;">
                        <div class="admin-input-group">
                            <label for="alert-title">Notice Title</label>
                            <input type="text" id="alert-title" class="admin-input" required placeholder="e.g. Schedule Update">
                        </div>

                        <div class="admin-input-group">
                            <label for="alert-msg">Banner Message text</label>
                            <input type="text" id="alert-msg" class="admin-input" required placeholder="e.g. The server is undergoing scheduled maintenance today.">
                        </div>

                        <div class="admin-input-group">
                            <label for="alert-type">Category sector</label>
                            <select class="admin-select" id="alert-type">
                                <option value="Website Update">Website Update</option>
                                <option value="Exam Alert">Exam Alert</option>
                                <option value="New Topic">New Topic</option>
                                <option value="Maintenance Notice">Maintenance Notice</option>
                            </select>
                        </div>

                        <button type="submit" class="btn btn-primary"><i data-lucide="send"></i> Publish Banner</button>
                    </form>
                </div>

                <!-- Active alerts list -->
                <div class="admin-card">
                    <h3 class="scope-title" style="color:var(--accent-secondary);"><i data-lucide="radio"></i> Active Alerts Broadcasts</h3>
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        ${activeBannersHTML}
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

        // Submit form
        document.getElementById('alerts-publisher-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('alert-title').value.trim();
            const msg = document.getElementById('alert-msg').value.trim();
            const type = document.getElementById('alert-type').value;

            alerts.push({ title, msg, type });
            localStorage.setItem('ece-admin-announcements', JSON.stringify(alerts));
            logActivity('Publish website alert banner', `Published: ${title}`);
            AppState.showToast('Notice published successfully! Displaying banner globally.', 'success');

            // Globally inject announcement banner immediately
            injectGlobalAlertBanner(title, msg);

            drawAlerts();
        });

        // Delete alerts
        document.querySelectorAll('.btn-delete-alert').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                const deleted = alerts[idx];
                alerts.splice(idx, 1);
                localStorage.setItem('ece-admin-announcements', JSON.stringify(alerts));
                logActivity('Delete ECE website alert banner', `Deleted alert notice: ${deleted ? deleted.title : idx}`);
                AppState.showToast('Announcement alert deleted successfully!', 'error');

                // Remove banner DOM immediately
                const existingBanner = document.getElementById('global-alert-banner');
                if (existingBanner) {
                    existingBanner.remove();
                    document.body.classList.remove('announcement-active');
                }

                drawAlerts();
            });
        });
    };

    drawAlerts();
};

const injectGlobalAlertBanner = (title, msg) => {
    // Clean existing
    const existing = document.getElementById('global-alert-banner');
    if (existing) {
        existing.remove();
    }

    const banner = document.createElement('div');
    banner.id = 'global-alert-banner';
    banner.className = 'announcement-banner';
    banner.innerHTML = `
        <span style="font-weight:800; text-transform:uppercase; font-size:0.75rem; background:rgba(255,255,255,0.2); padding:2px 8px; border-radius:4px;">BROADCAST</span>
        <span><strong>${title}</strong>: ${msg}</span>
        <button class="announcement-banner-close" onclick="this.parentElement.remove(); document.body.classList.remove('announcement-active');">✕</button>
    `;

    document.body.insertBefore(banner, document.body.firstChild);
    document.body.classList.add('announcement-active');
};

// ─── TAB 8-10: LIVE ANALYTICS (CANVAS) ──────────────────────────────────────
const renderChartsTab = (container) => {
    container.innerHTML = `
        <div class="admin-overview-header fade-in">
            <div>
                <h2>Live Telemetry & Charts</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Interactive charts charting platform student growth, quiz completion rates, and Circuit Lab saved boards.</p>
            </div>
        </div>

        <div class="grid-2 fade-in">
            <!-- User Growth Chart -->
            <div class="admin-chart-box">
                <h3 class="scope-title"><i data-lucide="users"></i> Student growth Telemetry</h3>
                <canvas id="chart-user-growth" class="admin-chart-canvas"></canvas>
            </div>

            <!-- Quiz Success Distributions -->
            <div class="admin-chart-box">
                <h3 class="scope-title" style="color:var(--accent-purple);"><i data-lucide="award"></i> Quiz Accuracy & Scoring bands</h3>
                <canvas id="chart-quiz-scores" class="admin-chart-canvas"></canvas>
            </div>

            <!-- Circuit Lab Build Statistics -->
            <div class="admin-chart-box">
                <h3 class="scope-title" style="color:var(--accent-secondary);"><i data-lucide="activity"></i> Circuit Lab Saved models</h3>
                <canvas id="chart-circuits-built" class="admin-chart-canvas"></canvas>
            </div>

            <!-- Platform Weak Topics Alert Panel -->
            <div class="admin-card">
                <h3 class="scope-title" style="color:var(--error);"><i data-lucide="alert-triangle"></i> Telemetry Weak Topic Detection</h3>
                <p style="font-size:0.85rem;line-height:1.45;color:var(--text-secondary);margin-bottom:0;">
                    Probing consolidated student quiz metrics detects class average constraints in these sectors:
                </p>
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(239,68,68,0.06); border-radius:6px; border:1px solid rgba(239,68,68,0.2);">
                        <span style="font-weight:600; color:var(--text-primary);">Metastability (Flip-Flops)</span>
                        <span class="admin-badge admin-badge-admin" style="font-size:0.65rem;">Average Accuracy: 48%</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(239,68,68,0.06); border-radius:6px; border:1px solid rgba(239,68,68,0.2);">
                        <span style="font-weight:600; color:var(--text-primary);">FFT Sampling Aliasing</span>
                        <span class="admin-badge admin-badge-admin" style="font-size:0.65rem;">Average Accuracy: 52%</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Render Canvas Charts
    setTimeout(() => {
        drawUserGrowthChart();
        drawQuizScoresChart();
        drawCircuitsChart();
    }, 50);
};

const drawUserGrowthChart = () => {
    const canvas = document.getElementById('chart-user-growth');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Scale for high DPR
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const data = [12, 18, 25, 42, 60, 85, 120];
    const labels = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

    // Draw growth lines
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const spacing = canvas.width / (data.length - 1);
    
    data.forEach((val, index) => {
        const x = index * spacing * 0.9 + 20;
        const y = canvas.height - (val / 130) * (canvas.height - 40) - 20;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        // Draw node circles
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.stroke();

    // Render labels
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px monospace';
    labels.forEach((lbl, index) => {
        ctx.fillText(lbl, index * spacing * 0.9 + 15, canvas.height - 5);
    });
};

const drawQuizScoresChart = () => {
    const canvas = document.getElementById('chart-quiz-scores');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Renders custom bars representing score ranges
    const scores = [8, 14, 30, 22, 10]; // frequencies
    const ranges = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
    const barWidth = 40;
    const spacing = (canvas.width - 40) / scores.length;

    scores.forEach((freq, idx) => {
        const barHeight = (freq / 35) * (canvas.height - 50);
        const x = idx * spacing + 25;
        const y = canvas.height - barHeight - 20;

        // Draw bar
        ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Labels
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '8px monospace';
        ctx.fillText(ranges[idx], x + 2, canvas.height - 5);
        ctx.fillStyle = '#fff';
        ctx.fillText(freq, x + barWidth/2 - 4, y - 6);
    });
};

const drawCircuitsChart = () => {
    const canvas = document.getElementById('chart-circuits-built');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Renders custom concentric circle parameters representing saved circuits
    const categories = ['Diodes', 'Transistors', 'RLC Resonance', 'Logic gates'];
    const counts = [45, 30, 68, 92]; // built count
    
    const spacing = canvas.width / categories.length;

    counts.forEach((val, idx) => {
        const x = idx * spacing + 40;
        const y = canvas.height / 2 - 10;
        const radius = Math.min(30, (val / 100) * 30);

        // Circle outline
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner solid
        ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.fill();

        // Labels
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '8px monospace';
        ctx.fillText(categories[idx], x - radius, canvas.height - 5);
        ctx.fillStyle = '#fff';
        ctx.fillText(val, x - 6, y + 4);
    });
};

// ─── TAB 11: ACHIEVEMENTS EDITOR ──────────────────────────────────────────
const renderAchievementsTab = (container) => {
    let achievements = JSON.parse(localStorage.getItem('ece-admin-achievements')) || [];

    const drawGrid = () => {
        let cardsHTML = achievements.map((ach, idx) => {
            const toggleIcon = ach.active ? 'eye-off' : 'eye';
            const toggleText = ach.active ? 'Disable' : 'Enable';
            const cardOpacity = ach.active ? '1.0' : '0.5';

            return `
                <div class="glass-card" style="padding:20px; opacity:${cardOpacity}; display:flex; flex-direction:column; gap:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span class="admin-badge admin-badge-student">${ach.xp} XP REWARD</span>
                        <div style="display:flex; gap:6px;">
                            <button class="admin-action-btn btn-toggle-ach" data-idx="${idx}" title="${toggleText} badge"><i data-lucide="${toggleIcon}"></i></button>
                            <button class="admin-action-btn btn-delete btn-delete-ach" data-idx="${idx}" title="Delete badge"><i data-lucide="trash-2"></i></button>
                        </div>
                    </div>
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div style="width:36px; height:36px; border-radius:8px; background:rgba(6,182,212,0.08); color:var(--accent-secondary); display:flex; align-items:center; justify-content:center;">
                            <i data-lucide="${ach.icon}"></i>
                        </div>
                        <h3 style="font-size:1.15rem; margin-bottom:0;">${ach.name}</h3>
                    </div>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0; line-height:1.45;">${ach.desc}</p>
                </div>
            `;
        }).join('');

        if (achievements.length === 0) {
            cardsHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);">No achievements built. Add one below.</div>`;
        }

        container.innerHTML = `
            <div class="admin-overview-header fade-in">
                <div>
                    <h2>Academic Achievements Manager</h2>
                    <p class="notfound-subtitle" style="font-size:0.95rem;">Configure award badges, assign progress XP rewards, and toggle locks.</p>
                </div>
            </div>

            <div class="grid-2 fade-in" style="align-items:start;">
                <!-- Publisher -->
                <div class="admin-card">
                    <h3 class="scope-title"><i data-lucide="zap"></i> Create custom Achievement badge</h3>
                    <form id="ach-creator-form" style="display:flex; flex-direction:column; gap:16px;">
                        <div class="admin-input-group">
                            <label for="ach-name">Badge Name</label>
                            <input type="text" id="ach-name" class="admin-input" required placeholder="e.g. Nyquist Pioneer">
                        </div>

                        <div class="admin-input-group">
                            <label for="ach-desc">Description (Action to unlock)</label>
                            <input type="text" id="ach-desc" class="admin-input" required placeholder="e.g. Master the Sampling tutorial and score 90%">
                        </div>

                        <div class="admin-input-group">
                            <label for="ach-xp">XP Rewards</label>
                            <input type="number" id="ach-xp" class="admin-input" min="50" max="5000" step="50" value="100">
                        </div>

                        <div class="admin-input-group">
                            <label for="ach-icon">Select Badge icon</label>
                            <select class="admin-select" id="ach-icon">
                                <option value="zap">Zap / Speed</option>
                                <option value="award">Award / Star</option>
                                <option value="activity">Activity / Waveform</option>
                                <option value="cpu">CPU / Hardware</option>
                                <option value="book-open">Book / Notes</option>
                            </select>
                        </div>

                        <button type="submit" class="btn btn-primary"><i data-lucide="plus"></i> Add Achievement</button>
                    </form>
                </div>

                <!-- Grid -->
                <div style="display:grid; grid-template-columns:1fr; gap:16px;">
                    ${cardsHTML}
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

        // Submit form
        document.getElementById('ach-creator-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('ach-name').value.trim();
            const desc = document.getElementById('ach-desc').value.trim();
            const xp = parseInt(document.getElementById('ach-xp').value) || 100;
            const icon = document.getElementById('ach-icon').value;

            achievements.push({
                id: name.toLowerCase().replace(/\s+/g, '-'),
                name, desc, xp, icon, active: true
            });
            localStorage.setItem('ece-admin-achievements', JSON.stringify(achievements));
            logActivity('Create achievement badge', `Created: ${name}`);
            AppState.showToast('Custom achievement badge created successfully!', 'success');

            drawGrid();
        });

        // Toggle state
        document.querySelectorAll('.btn-toggle-ach').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                const ach = achievements[idx];
                if (ach) {
                    ach.active = !ach.active;
                    localStorage.setItem('ece-admin-achievements', JSON.stringify(achievements));
                    logActivity('Toggle achievement state', `Set active:${ach.active} for ${ach.name}`);
                    AppState.showToast(`Badge ${ach.name} is now ${ach.active ? 'enabled' : 'disabled'}!`, 'info');
                    drawGrid();
                }
            });
        });

        // Delete
        document.querySelectorAll('.btn-delete-ach').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                const ach = achievements[idx];
                achievements.splice(idx, 1);
                localStorage.setItem('ece-admin-achievements', JSON.stringify(achievements));
                logActivity('Delete ECE achievement badge', `Wiped achievement: ${ach ? ach.name : idx}`);
                AppState.showToast('Achievement badge deleted successfully!', 'error');
                drawGrid();
            });
        });
    };

    drawGrid();
};

// ─── TAB 12:platform SETTINGS ──────────────────────────────────────────────
const renderSettingsTab = (container) => {
    const settings = JSON.parse(localStorage.getItem('ece-admin-settings'));

    container.innerHTML = `
        <div class="admin-overview-header fade-in">
            <div>
                <h2>Website & Platform Settings</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Manage brand styling, logos, contact parameters and live layouts.</p>
            </div>
        </div>

        <div class="admin-editor-layout fade-in">
            <!-- Form Card -->
            <div class="admin-card">
                <h3 class="scope-title"><i data-lucide="settings"></i> Brand & Contact adjustments</h3>
                <form id="platform-settings-form" style="display:flex; flex-direction:column; gap:16px;">
                    <div class="admin-input-group">
                        <label for="set-site-name">Website Brand Name</label>
                        <input type="text" id="set-site-name" class="admin-input" required value="${settings.siteName}">
                    </div>

                    <div class="admin-input-group">
                        <label for="set-logo-text">Navbar Logo Text</label>
                        <input type="text" id="set-logo-text" class="admin-input" required value="${settings.logoText}">
                    </div>

                    <div class="admin-input-group">
                        <label for="set-footer-text">Footer Copyright Statement</label>
                        <input type="text" id="set-footer-text" class="admin-input" required value="${settings.footer}">
                    </div>

                    <div class="admin-input-group">
                        <label for="set-contact-email">Admin Contact Email</label>
                        <input type="email" id="set-contact-email" class="admin-input" required value="${settings.contact}">
                    </div>

                    <button type="submit" class="btn btn-primary"><i data-lucide="save"></i> Save Settings</button>
                </form>
            </div>

            <!-- Preview Card -->
            <div class="admin-editor-preview">
                <div class="admin-preview-title">Platform Layout Preview</div>
                <div style="border:1px dashed var(--border-color); border-radius:6px; padding:16px; display:flex; flex-direction:column; gap:20px; background:rgba(0,0,0,0.15);">
                    <!-- Navbar Preview -->
                    <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:8px; border-bottom:1px solid var(--border-color);">
                        <span style="font-weight:800; font-size:1.1rem; color:var(--text-primary);" id="prev-brand-name">⌬ ${settings.logoText}</span>
                        <div style="display:flex; gap:8px; font-size:0.75rem; color:var(--text-secondary);">
                            <span>Dashboard</span>
                            <span>Syllabus</span>
                            <span>Simulation</span>
                        </div>
                    </div>

                    <!-- Page Body Placeholder -->
                    <div style="padding:24px 0; text-align:center; color:var(--text-muted); font-size:0.85rem; font-style:italic;">
                        Active Simulation Workspace
                    </div>

                    <!-- Footer Preview -->
                    <div style="border-top:1px solid var(--border-color); padding-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; color:var(--text-muted);">
                        <span id="prev-footer-text">${settings.footer}</span>
                        <span id="prev-contact">${settings.contact}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Real-time previews binds
    const siteName = document.getElementById('set-site-name');
    const logoText = document.getElementById('set-logo-text');
    const footerText = document.getElementById('set-footer-text');
    const contactEmail = document.getElementById('set-contact-email');

    const prevBrand = document.getElementById('prev-brand-name');
    const prevFooter = document.getElementById('prev-footer-text');
    const prevContact = document.getElementById('prev-contact');

    logoText.addEventListener('input', () => prevBrand.textContent = '⌬ ' + logoText.value);
    footerText.addEventListener('input', () => prevFooter.textContent = footerText.value);
    contactEmail.addEventListener('input', () => prevContact.textContent = contactEmail.value);

    document.getElementById('platform-settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const saved = {
            siteName: siteName.value.trim(),
            logoText: logoText.value.trim(),
            footer: footerText.value.trim(),
            contact: contactEmail.value.trim()
        };
        localStorage.setItem('ece-admin-settings', JSON.stringify(saved));
        logActivity('Save platform settings', 'Saved new website name, logos, and footer guidelines');
        AppState.showToast('Platform customization metrics successfully saved!', 'success');

        // Dynamically update site logo on active navbar
        const headerLogo = document.querySelector('.logo-text');
        if (headerLogo) {
            headerLogo.innerHTML = `${saved.logoText.slice(0, -3)}<span>${saved.logoText.slice(-3)}</span>`;
        }
    });
};

// ─── TAB 13: FEEDBACK SYSTEM ────────────────────────────────────────────────
const renderFeedbackTab = (container) => {
    let feedback = JSON.parse(localStorage.getItem('ece-admin-feedback')) || [];

    const drawFeedback = () => {
        let itemsHTML = feedback.map((fb, idx) => {
            const statusClass = fb.status === 'Resolved' ? 'admin-badge-active' : 'admin-badge-draft';
            return `
                <div style="border-bottom:1px solid var(--border-color); padding:16px 0; display:flex; flex-direction:column; gap:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <strong style="color:var(--text-primary);">${fb.name}</strong> 
                            <span style="font-size:0.75rem; color:var(--text-muted);">(${fb.email})</span>
                        </div>
                        <span class="admin-badge ${statusClass}">${fb.status}</span>
                    </div>
                    <div style="font-size:0.75rem;color:var(--accent-secondary);font-weight:700;">PROPOSED MODULE: ${fb.module}</div>
                    <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:0; line-height:1.45; font-style:italic;">"${fb.msg}"</p>
                    
                    ${fb.reply ? `
                        <div style="margin-left:20px; padding:10px; background:rgba(6,182,212,0.04); border-left:3px solid var(--accent-secondary); border-radius:4px; font-size:0.85rem;">
                            <strong style="color:var(--accent-secondary);">Admin Reply:</strong> "${fb.reply}"
                        </div>
                    ` : `
                        <div style="display:flex; gap:8px; margin-top:4px;">
                            <button class="btn btn-secondary btn-sm btn-reply-feedback" data-idx="${idx}" style="padding:4px 10px;font-size:0.75rem;"><i data-lucide="corner-down-right"></i> Reply</button>
                            <button class="btn btn-secondary btn-sm btn-resolve-feedback" data-idx="${idx}" style="padding:4px 10px;font-size:0.75rem;"><i data-lucide="check"></i> Mark Resolved</button>
                            <button class="admin-action-btn btn-delete btn-delete-feedback" data-idx="${idx}" style="align-self:center;"><i data-lucide="trash-2"></i></button>
                        </div>
                    `}
                </div>
            `;
        }).join('');

        if (feedback.length === 0) {
            itemsHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);">No student lab module requests or feedback submitted.</div>`;
        }

        container.innerHTML = `
            <div class="admin-overview-header fade-in">
                <div>
                    <h2>Student Feedback & Requests</h2>
                    <p class="notfound-subtitle" style="font-size:0.95rem;">Probing lab requests, replies, and marking queries resolved.</p>
                </div>
            </div>

            <div class="admin-card fade-in">
                <h3 class="scope-title" style="color:var(--accent-secondary);"><i data-lucide="message-square"></i> Student Submissions List</h3>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${itemsHTML}
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        bindFeedbackActions();
    };

    const bindFeedbackActions = () => {
        // Reply
        document.querySelectorAll('.btn-reply-feedback').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                const replyText = prompt("Type your reply to the student:");
                if (replyText) {
                    feedback[idx].reply = replyText;
                    feedback[idx].status = 'Resolved';
                    localStorage.setItem('ece-admin-feedback', JSON.stringify(feedback));
                    logActivity('Reply student feedback', `Replied query index ${idx}`);
                    AppState.showToast('Reply captured and resolved successfully!', 'success');
                    drawFeedback();
                }
            });
        });

        // Resolve
        document.querySelectorAll('.btn-resolve-feedback').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                feedback[idx].status = 'Resolved';
                localStorage.setItem('ece-admin-feedback', JSON.stringify(feedback));
                logActivity('Resolve student feedback', `Marked query index ${idx} resolved`);
                AppState.showToast('Telemetry request resolved successfully!', 'success');
                drawFeedback();
            });
        });

        // Delete
        document.querySelectorAll('.btn-delete-feedback').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                feedback.splice(idx, 1);
                localStorage.setItem('ece-admin-feedback', JSON.stringify(feedback));
                logActivity('Delete student feedback', `Wiped feedback index ${idx}`);
                AppState.showToast('Feedback submission wiped successfully!', 'error');
                drawFeedback();
            });
        });
    };

    drawFeedback();
};

// ─── TAB 15: SECURITY AUDIT LOGS ─────────────────────────────────────────────
const renderLogsTab = (container) => {
    const logs = JSON.parse(localStorage.getItem('ece-admin-activity-log')) || [];

    let listHTML = logs.map(log => {
        return `
            <div class="admin-audit-row">
                <div class="admin-audit-node"></div>
                <div class="admin-audit-meta">
                    <span class="admin-audit-time">${new Date(log.time).toLocaleTimeString()}</span>
                    <span>Admin Operator: <strong style="color:var(--text-primary);">${log.user}</strong></span>
                </div>
                <div class="admin-audit-content">${log.action}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${log.details}</div>
            </div>
        `;
    }).join('');

    if (logs.length === 0) {
        listHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);">Audit history empty. System active.</div>`;
    }

    container.innerHTML = `
        <div class="admin-overview-header fade-in">
            <div>
                <h2>Security & Console Logs</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Track logins, academic progress resets, deletes, and content changes.</p>
            </div>
            <button class="btn btn-secondary" id="btn-clear-logs"><i data-lucide="shield-alert"></i> Clear Logs</button>
        </div>

        <div class="admin-card fade-in">
            <h3 class="scope-title" style="color:var(--error);"><i data-lucide="terminal"></i> Activity Log Timeline</h3>
            <div class="admin-audit-timeline" style="margin-top:12px;">
                ${listHTML}
            </div>
        </div>
    `;

    document.getElementById('btn-clear-logs').addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all security logs from this platform session?")) {
            localStorage.setItem('ece-admin-activity-log', JSON.stringify([{
                time: new Date().toISOString(),
                user: 'admin',
                action: 'Log history cleared',
                details: 'Cleared audit nodes'
            }]));
            AppState.showToast('Platform security logs cleared successfully.', 'info');
            renderLogsTab(container);
        }
    });
};

// ─── TAB 16: BACKUP & EXPORT ────────────────────────────────────────────────
const renderBackupTab = (container) => {
    container.innerHTML = `
        <div class="admin-overview-header fade-in">
            <div>
                <h2>Backup & Telemetry Exporter</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Generate offline backups and telemetry tables in JSON or CSV files.</p>
            </div>
        </div>

        <div class="grid-2 fade-in">
            <!-- JSON backup trigger -->
            <div class="admin-card">
                <h3 class="scope-title"><i data-lucide="code-2"></i> Master JSON Database Backup</h3>
                <p style="font-size:0.9rem; line-height:1.45; color:var(--text-secondary); margin-bottom:8px;">
                    Exports consolidated local platform databases (Users, Feedback, Announcements, Settings, and active Achievements).
                </p>
                <div style="margin-top:auto;">
                    <button class="btn btn-primary" id="btn-export-json"><i data-lucide="download"></i> Download Master JSON</button>
                </div>
            </div>

            <!-- CSV table trigger -->
            <div class="admin-card">
                <h3 class="scope-title" style="color:var(--accent-secondary);"><i data-lucide="file-spreadsheet"></i> Export Student CSV Registry</h3>
                <p style="font-size:0.9rem; line-height:1.45; color:var(--text-secondary); margin-bottom:8px;">
                    Generates a comma-separated offline table representing all registered student accounts, levels, join dates, and XP metrics.
                </p>
                <div style="margin-top:auto;">
                    <button class="btn btn-primary" id="btn-export-csv" style="border: 1px solid var(--accent-secondary);"><i data-lucide="file-text"></i> Download Students CSV</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-export-json').addEventListener('click', () => {
        try {
            const masterBackup = {
                users: JSON.parse(localStorage.getItem('ece-admin-users-list')) || [],
                achievements: JSON.parse(localStorage.getItem('ece-admin-achievements')) || [],
                feedback: JSON.parse(localStorage.getItem('ece-admin-feedback')) || [],
                announcements: JSON.parse(localStorage.getItem('ece-admin-announcements')) || [],
                settings: JSON.parse(localStorage.getItem('ece-admin-settings')) || {}
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(masterBackup, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `nextron-backup-${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            logActivity('Export Database Backup', 'Generated full JSON system parameters export');
            AppState.showToast('Master JSON backup downloaded successfully!', 'success');
        } catch(e) {
            AppState.showToast('Failed to compile master backup JSON.', 'error');
        }
    });

    document.getElementById('btn-export-csv').addEventListener('click', () => {
        try {
            const users = JSON.parse(localStorage.getItem('ece-admin-users-list')) || [];
            let csvContent = "data:text/csv;charset=utf-8,";
            
            // Header Row
            csvContent += "Username,Email,Role,JoinDate,Level,XP,Status\n";

            users.forEach(u => {
                csvContent += `${u.username},${u.email},${u.role},${u.joinDate},${u.level},${u.xp},${u.status}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", encodedUri);
            downloadAnchor.setAttribute("download", `nextron-students-registry-${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            logActivity('Export Students CSV Registry', 'Generated student registry table CSV file');
            AppState.showToast('Student CSV list downloaded successfully!', 'success');
        } catch(e) {
            AppState.showToast('Failed to compile CSV registry.', 'error');
        }
    });
};
