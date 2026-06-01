/**
 * Nextron - Standalone Administrative Portal Controller
 * Shared Origin: localhost:8080
 */

import { GLOSSARY, QUIZ_BANK } from './database.js';
import { db, config } from './Firebase.js';

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
    const activeUser = JSON.parse(localStorage.getItem('ece-current-user'));
    const activeAdmin = activeUser ? activeUser.username : 'System';
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

// Is Firebase fully configured?
const isFirebaseActive = () => {
    return !!(config && config.apiKey && db);
};

// Bootstrap application
document.addEventListener('DOMContentLoaded', () => {
    initAdminDatabases();
    
    // Set up active user details in navbar
    const activeUser = JSON.parse(localStorage.getItem('ece-current-user'));
    if (activeUser) {
        document.getElementById('admin-user-avatar').textContent = activeUser.username[0].toUpperCase();
        document.getElementById('admin-user-label').textContent = activeUser.username + ' (Admin)';
    }

    // Set up Theme System
    const storedTheme = localStorage.getItem('ece-explorer-theme') || 'dark';
    setTheme(storedTheme);

    const themeToggleBtn = document.getElementById('theme-toggle');
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ece-explorer-theme', theme);
        
        const sun = document.getElementById('theme-icon-sun');
        const moon = document.getElementById('theme-icon-moon');
        if (theme === 'dark') {
            sun.style.display = 'none';
            moon.style.display = 'block';
        } else {
            sun.style.display = 'block';
            moon.style.display = 'none';
        }
    }

    // Setup tabs listeners
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Start with Overview Dashboard
    switchTab('tab-dashboard');
    
    // --- Ambient Particle Backdrop (Static Canvas loop) ---
    setupParticleBackdrop();
});

const switchTab = (tabName) => {
    const workspace = document.getElementById('admin-main-viewport');
    if (!workspace) return;

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

    const totalUsers = users.length + 15;
    const activeUsers = users.filter(u => u.status === 'Active').length + 8;
    const conceptsCount = Object.keys(GLOSSARY).length;
    
    let totalQuestions = 0;
    Object.values(QUIZ_BANK).forEach(q => {
        totalQuestions += q.questions.length;
    });

    const isFb = isFirebaseActive();
    const dbStatusColor = isFb ? 'var(--success)' : 'var(--warning)';
    const dbStatusText = isFb ? '📡 Firebase Firestore: ACTIVE' : '🔌 Offline persistent LocalStorage mode';

    container.innerHTML = `
        <div class="admin-overview-header fade-in">
            <div>
                <h2>Admin Overview Console</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Interactive Nextron backend telemetry control panels.</p>
            </div>
            <div style="font-family:'DM Mono', monospace; font-size:0.8rem; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px; border:1px solid var(--border-color); color:${dbStatusColor}; font-weight:bold;">
                ${dbStatusText}
            </div>
        </div>

        <div class="admin-stats-grid fade-in">
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

        <div class="grid-2 fade-in">
            <div class="admin-card">
                <h3><i data-lucide="bell"></i> Notice Alerts Board</h3>
                <p style="font-size:0.9rem;margin-bottom:0;color:var(--text-secondary);line-height:1.5;">
                    Display scrolling notice boards globally at the top of the student dashboard. Active alerts: <strong>${alerts.length}</strong>.
                </p>
                <div style="margin-top:auto;">
                    <button class="btn btn-secondary" id="btn-dashboard-alerts"><i data-lucide="arrow-right"></i> Manage Alerts</button>
                </div>
            </div>

            <div class="admin-card">
                <h3 style="color:var(--accent-secondary);"><i data-lucide="message-square"></i> Student Requests</h3>
                <p style="font-size:0.9rem;margin-bottom:0;color:var(--text-secondary);line-height:1.5;">
                    Manage student requests, feedback loops, and reply to simulation suggestions. Pending: <strong>${feedback.filter(f => f.status === 'Active').length}</strong>.
                </p>
                <div style="margin-top:auto;">
                    <button class="btn btn-secondary" id="btn-dashboard-feedback"><i data-lucide="corner-down-right"></i> Probing Logs</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-dashboard-alerts').addEventListener('click', () => {
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-tab="tab-alerts"]').classList.add('active');
        switchTab('tab-alerts');
    });

    document.getElementById('btn-dashboard-feedback').addEventListener('click', () => {
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
            tableRowsHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">No student accounts found.</td></tr>`;
        }

        container.innerHTML = `
            <div class="admin-overview-header fade-in">
                <div>
                    <h2>Student Registry</h2>
                    <p class="notfound-subtitle" style="font-size:0.95rem;">Manage active clearances, promotions, suspends, and profile telemetry.</p>
                </div>
                <button class="btn btn-primary" id="btn-add-user"><i data-lucide="user-plus"></i> Add Account</button>
            </div>

            <div class="admin-card fade-in">
                <div class="admin-card-header">
                    <div class="admin-search-bar">
                        <i data-lucide="search" style="width:16px;height:16px;color:var(--text-muted);"></i>
                        <input type="text" id="user-search-input" placeholder="Search by name, email...">
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
                                <th>Email</th>
                                <th>Role</th>
                                <th>Registration Date</th>
                                <th>Status</th>
                                <th>XP State</th>
                                <th>Telemetry Actions</th>
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

        document.getElementById('btn-add-user').addEventListener('click', () => showUserFormModal());

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
                    logActivity('User account suspend toggle', `${targetUser.username} set to ${targetUser.status}`);
                    drawTable(users);
                }
            });
        });

        document.querySelectorAll('.btn-reset').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetName = btn.getAttribute('data-name');
                const targetUser = users.find(u => u.username === targetName);
                if (targetUser) {
                    if (confirm(`Warning: Reset all simulated lab progress for '${targetName}'?`)) {
                        targetUser.level = 1;
                        targetUser.xp = 0;
                        localStorage.setItem('ece-admin-users-list', JSON.stringify(users));
                        logActivity('Reset student progress', `Progress wiped for ${targetUser.username}`);
                        drawTable(users);
                    }
                }
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetName = btn.getAttribute('data-name');
                if (confirm(`Caution: Remove account '${targetName}' forever?`)) {
                    users = users.filter(u => u.username !== targetName);
                    localStorage.setItem('ece-admin-users-list', JSON.stringify(users));
                    logActivity('Delete user account', `Removed user ${targetName}`);
                    drawTable(users);
                }
            });
        });
    };

    const showUserFormModal = (userObj = null) => {
        const modal = document.getElementById('admin-form-modal');
        const modalBody = document.getElementById('admin-modal-body');
        const isEdit = !!userObj;

        modalBody.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:12px;">
                <h3 class="scope-title">${isEdit ? 'Edit Account' : 'Register Account'}</h3>
                <button id="btn-close-modal" style="font-size:1.25rem;cursor:pointer;color:var(--text-muted);">✕</button>
            </div>
            <form id="admin-user-form" style="display:flex; flex-direction:column; gap:16px;">
                <div class="admin-input-group">
                    <label for="modal-username">Username</label>
                    <input type="text" id="modal-username" class="admin-input" required placeholder="Username" ${isEdit ? 'disabled' : ''} value="${userObj ? userObj.username : ''}">
                </div>

                <div class="admin-input-group">
                    <label for="modal-email">Email</label>
                    <input type="email" id="modal-email" class="admin-input" required placeholder="Email" value="${userObj ? userObj.email : ''}">
                </div>

                ${!isEdit ? `
                <div class="admin-input-group">
                    <label for="modal-password">Password</label>
                    <input type="password" id="modal-password" class="admin-input" required placeholder="Password">
                </div>
                ` : ''}

                <div class="admin-input-group">
                    <label for="modal-role">Role</label>
                    <select class="admin-select" id="modal-role">
                        <option value="Student" ${userObj && userObj.role === 'Student' ? 'selected' : ''}>Student</option>
                        <option value="Moderator" ${userObj && userObj.role === 'Moderator' ? 'selected' : ''}>Moderator</option>
                        <option value="Admin" ${userObj && userObj.role === 'Admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>

                <button type="submit" class="btn btn-primary" style="margin-top:8px;">Save</button>
            </form>
        `;

        modal.classList.add('open');
        const closeModal = () => modal.classList.remove('open');
        document.getElementById('btn-close-modal').addEventListener('click', closeModal);

        document.getElementById('admin-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('modal-username').value.trim();
            const email = document.getElementById('modal-email').value.trim();
            const role = document.getElementById('modal-role').value;

            if (isEdit) {
                const u = users.find(x => x.username === userObj.username);
                if (u) {
                    u.email = email;
                    u.role = role;
                    localStorage.setItem('ece-admin-users-list', JSON.stringify(users));
                    logActivity('User account update', `Updated credentials for ${username}`);
                }
            } else {
                const password = document.getElementById('modal-password').value;
                users.push({
                    username, email, password, role,
                    level: 1, xp: 150, joinDate: new Date().toISOString(), lastActive: new Date().toISOString(), status: 'Active'
                });
                localStorage.setItem('ece-admin-users-list', JSON.stringify(users));
                logActivity('User registration', `Registered new operator ${username}`);
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
                            <button class="admin-action-btn btn-edit-concept" data-key="${key}"><i data-lucide="edit-3"></i></button>
                            <button class="admin-action-btn btn-delete btn-delete-concept" data-key="${key}"><i data-lucide="trash-2"></i></button>
                        </div>
                    </div>
                    <h3 style="font-size:1.2rem; margin-bottom:0;">${item.title}</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0; line-height:1.45;">${item.desc.substring(0, 80)}...</p>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="admin-overview-header fade-in">
                <div>
                    <h2>Silicon Concepts Modules</h2>
                    <p class="notfound-subtitle" style="font-size:0.95rem;">Manage interactive silicon tutorials, glossaries and parameters.</p>
                </div>
                <button class="btn btn-primary" id="btn-add-concept"><i data-lucide="plus"></i> Add Module</button>
            </div>

            <div class="concepts-grid fade-in">
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

        document.getElementById('btn-add-concept').addEventListener('click', () => showConceptModal());

        document.querySelectorAll('.btn-delete-concept').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-key');
                if (confirm(`Wipe Silicon module key '${key}'?`)) {
                    delete GLOSSARY[key];
                    logActivity('Delete concept module', `Removed key ${key}`);
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

        modalBody.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:12px;">
                <h3 class="scope-title">${isEdit ? 'Edit Concept' : 'Add Concept'}</h3>
                <button id="btn-close-modal" style="font-size:1.25rem;cursor:pointer;color:var(--text-muted);">✕</button>
            </div>
            <form id="admin-concept-form" style="display:flex; flex-direction:column; gap:16px;">
                <div class="admin-input-group">
                    <label for="concept-key">Module DB Key</label>
                    <input type="text" id="concept-key" class="admin-input" required placeholder="e.g. pn-junction" ${isEdit ? 'disabled' : ''} value="${key}">
                </div>

                <div class="admin-input-group">
                    <label for="concept-title">Module Title</label>
                    <input type="text" id="concept-title" class="admin-input" required placeholder="e.g. PN Junction" value="${conceptObj ? conceptObj.title : ''}">
                </div>

                <div class="admin-input-group">
                    <label for="concept-tag">Sector Tag</label>
                    <input type="text" id="concept-tag" class="admin-input" required placeholder="e.g. Semiconductor" value="${conceptObj ? conceptObj.tag : ''}">
                </div>

                <div class="admin-input-group">
                    <label for="concept-desc">Syllabus Description</label>
                    <textarea id="concept-desc" class="admin-input admin-textarea" required placeholder="Write overview...">${conceptObj ? conceptObj.desc : ''}</textarea>
                </div>

                <button type="submit" class="btn btn-primary">Save Module</button>
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

            GLOSSARY[targetKey] = { title, tag, desc, terms: {} };
            logActivity('Concept module update', `Saved module: ${targetKey}`);
            
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
                            <span>Correct: <strong style="color:var(--success);">${q.options[q.correctIndex]}</strong></span>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px; align-self:center;">
                        <button class="admin-action-btn btn-edit-question" data-idx="${idx}"><i data-lucide="edit-3"></i></button>
                        <button class="admin-action-btn btn-delete btn-delete-question" data-idx="${idx}"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        const catSelectorHTML = categories.map(cat => {
            const activeClass = cat === selectedCat ? 'active' : '';
            return `<button class="admin-tab-btn ${activeClass}" data-cat="${cat}" style="padding:6px 12px; font-size:0.8rem;">${QUIZ_BANK[cat].title}</button>`;
        }).join('');

        container.innerHTML = `
            <div class="admin-overview-header fade-in">
                <div>
                    <h2>Quiz Arena Manager</h2>
                    <p class="notfound-subtitle" style="font-size:0.95rem;">Manage MCQ banks, True/False sets and custom answer keys.</p>
                </div>
                <button class="btn btn-primary" id="btn-add-question"><i data-lucide="plus"></i> Add Item</button>
            </div>

            <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; border-bottom:1px solid var(--border-color);">
                ${catSelectorHTML}
            </div>

            <div class="admin-card fade-in" style="margin-top:16px;">
                <h3>Quiz bank: ${quizData.title}</h3>
                <div style="display:flex; flex-direction:column;">
                    ${questionsHTML}
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        bindQuizActions();
    };

    const bindQuizActions = () => {
        document.querySelectorAll('[data-cat]').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedCat = btn.getAttribute('data-cat');
                drawQuizEditor();
            });
        });

        document.getElementById('btn-add-question').addEventListener('click', () => showQuestionModal());

        document.querySelectorAll('.btn-edit-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                showQuestionModal(idx);
            });
        });

        document.querySelectorAll('.btn-delete-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                if (confirm('Delete this question?')) {
                    QUIZ_BANK[selectedCat].questions.splice(idx, 1);
                    logActivity('Delete question', `Removed item index ${idx} under category ${selectedCat}`);
                    drawQuizEditor();
                }
            });
        });
    };

    const showQuestionModal = (idx = null) => {
        const modal = document.getElementById('admin-form-modal');
        const modalBody = document.getElementById('admin-modal-body');
        const isEdit = idx !== null;
        const qObj = isEdit ? QUIZ_BANK[selectedCat].questions[idx] : null;

        modalBody.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:12px;">
                <h3 class="scope-title">${isEdit ? 'Edit Question' : 'Add Question'}</h3>
                <button id="btn-close-modal" style="font-size:1.25rem;cursor:pointer;color:var(--text-muted);">✕</button>
            </div>
            <form id="admin-question-form" style="display:flex; flex-direction:column; gap:16px;">
                <div class="admin-input-group">
                    <label for="modal-q-text">Question statement</label>
                    <input type="text" id="modal-q-text" class="admin-input" required placeholder="Write question statement..." value="${qObj ? qObj.question : ''}">
                </div>

                <div class="admin-input-group">
                    <label for="modal-q-diff">Difficulty</label>
                    <select class="admin-select" id="modal-q-diff">
                        <option value="easy" ${qObj && qObj.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                        <option value="medium" ${qObj && qObj.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="hard" ${qObj && qObj.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                    </select>
                </div>

                <div class="grid-2">
                    <input type="text" id="modal-opt-0" class="admin-input" required placeholder="Option A" value="${qObj ? qObj.options[0] : ''}">
                    <input type="text" id="modal-opt-1" class="admin-input" required placeholder="Option B" value="${qObj ? qObj.options[1] : ''}">
                    <input type="text" id="modal-opt-2" class="admin-input" required placeholder="Option C" value="${qObj ? qObj.options[2] : ''}">
                    <input type="text" id="modal-opt-3" class="admin-input" required placeholder="Option D" value="${qObj ? qObj.options[3] : ''}">
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

                <button type="submit" class="btn btn-primary">Save Question</button>
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
                logActivity('Edit question', `Updated question ${idx} in ${selectedCat}`);
            } else {
                QUIZ_BANK[selectedCat].questions.push(savedQuestion);
                logActivity('Add question', `Appended question in ${selectedCat}`);
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
                <h2>Notes & Handbooks Hub</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Format textbook sections and render live KaTeX formulas.</p>
            </div>
        </div>

        <div class="admin-editor-layout fade-in" style="margin-top:16px;">
            <div class="admin-card">
                <h3>Syllabus editor</h3>
                <div class="admin-input-group">
                    <label for="editor-note-cat">Subject category</label>
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
                    <label for="editor-note-body">Content (LaTeX equations allowed)</label>
                    <textarea id="editor-note-body" class="admin-input admin-textarea" style="min-height:220px;" placeholder="Write notes content..."></textarea>
                </div>
            </div>

            <div class="admin-editor-preview">
                <div class="admin-preview-title">Scientific KaTeX Render Preview</div>
                <div class="admin-preview-render-box" id="note-preview-render">
                    <!-- Dynamic markup output -->
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
            <div style="font-size:0.9rem; line-height:1.65;">
                ${noteBody.value.replace(/\n/g, '<br>')}
            </div>
        `;

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

    const notePresets = {
        signals: 'Decomposing time waveforms into spectral domains uses CTFT:\n\n$$\nX(\\omega) = \\int_{-\\infty}^{\\infty} x(t) \\cdot e^{-j \\omega t} dt\n$$\n\nFrequency angular values follow $\\omega = 2\\pi f$.',
        networks: 'RLC series resonant frequencies follow equation:\n\n$$\nf_r = \\frac{1}{2\\pi \\cdot \\sqrt{L \\cdot C}}\n$$\n\nImpedance minimizes to purely resistive under resonance.',
        diodes: 'Governed by Shockley Diode equation values:\n\n$$\nI = I_s \\left( e^{\\frac{V}{n V_T}} - 1 \\right)\n$$\n\nBuilt-in barrier voltage Silicon typically averages $0.7$ Volts.'
    };

    noteCat.addEventListener('change', () => {
        noteTitle.value = noteCat.options[noteCat.selectedIndex].text + " Notes";
        noteBody.value = notePresets[noteCat.value] || '';
        updatePreview();
    });

    noteTitle.addEventListener('input', updatePreview);
    noteBody.addEventListener('input', updatePreview);

    noteCat.dispatchEvent(new Event('change'));
};

// ─── TAB 6: FORMULA HANDBOOK ────────────────────────────────────────────────
const renderFormulasTab = (container) => {
    container.innerHTML = `
        <div class="admin-overview-header fade-in">
            <div>
                <h2>Mathematical Formula Handbook</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Configure equations and variables list dynamically.</p>
            </div>
        </div>

        <div class="admin-editor-layout fade-in" style="margin-top:16px;">
            <div class="admin-card">
                <h3>Handbook formula builder</h3>
                <div class="admin-input-group">
                    <label for="form-f-name">Formula Name</label>
                    <input type="text" id="form-f-name" class="admin-input" value="Nyquist Sampling Rate">
                </div>

                <div class="admin-input-group">
                    <label for="form-f-expr">LaTeX Equation</label>
                    <input type="text" id="form-f-expr" class="admin-input" value="f_s \\ge 2 \\cdot f_{\\text{max}}">
                </div>

                <div class="admin-input-group">
                    <label for="form-f-vars">Variables list</label>
                    <textarea id="form-f-vars" class="admin-input admin-textarea" style="min-height:90px;">fs = Sampling Rate frequency\nfmax = Highest signal frequency component</textarea>
                </div>
            </div>

            <div class="admin-editor-preview">
                <div class="admin-preview-title">Interactive LaTeX Rendering</div>
                <div class="admin-preview-render-box" id="formula-preview-render">
                    <!-- Dynamic math rendering -->
                </div>
            </div>
        </div>
    `;

    const fName = document.getElementById('form-f-name');
    const fExpr = document.getElementById('form-f-expr');
    const fVars = document.getElementById('form-f-vars');
    const fPreview = document.getElementById('formula-preview-render');

    const updateFormulaPreview = () => {
        const variableListHTML = fVars.value.split('\n').map(v => `<li>${v}</li>`).join('');
        fPreview.innerHTML = `
            <h4 style="margin-bottom:12px;color:var(--accent-secondary);">${fName.value}</h4>
            <div class="glass-card flex-center" style="padding:24px; margin-bottom:16px; background:rgba(0,0,0,0.3);">
                $$${fExpr.value}$$
            </div>
            <ul style="font-size:0.9rem; padding-left:20px; color:var(--text-secondary);">
                ${variableListHTML}
            </ul>
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
            activeBannersHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);">No notices currently broadcasting.</div>`;
        }

        container.innerHTML = `
            <div class="admin-overview-header fade-in">
                <div>
                    <h2>Global Alert Tickers</h2>
                    <p class="notfound-subtitle" style="font-size:0.95rem;">Publish notices that appear at the top of students pages instantly.</p>
                </div>
            </div>

            <div class="grid-2 fade-in" style="align-items:start; margin-top:16px;">
                <div class="admin-card">
                    <h3>Publish announcement alert</h3>
                    <form id="alerts-publisher-form" style="display:flex; flex-direction:column; gap:16px;">
                        <div class="admin-input-group">
                            <label for="alert-title">Title</label>
                            <input type="text" id="alert-title" class="admin-input" required placeholder="e.g. Exam Alert">
                        </div>

                        <div class="admin-input-group">
                            <label for="alert-msg">Message</label>
                            <input type="text" id="alert-msg" class="admin-input" required placeholder="e.g. Midterm quiz starts today. Check arena.">
                        </div>

                        <div class="admin-input-group">
                            <label for="alert-type">Category</label>
                            <select class="admin-select" id="alert-type">
                                <option value="Website Update">Website Update</option>
                                <option value="Exam Alert">Exam Alert</option>
                                <option value="Maintenance Notice">Maintenance Notice</option>
                            </select>
                        </div>

                        <button type="submit" class="btn btn-primary">Publish Alert</button>
                    </form>
                </div>

                <div class="admin-card">
                    <h3>Active Ticker list</h3>
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        ${activeBannersHTML}
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

        document.getElementById('alerts-publisher-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('alert-title').value.trim();
            const msg = document.getElementById('alert-msg').value.trim();
            const type = document.getElementById('alert-type').value;

            alerts.push({ title, msg, type });
            localStorage.setItem('ece-admin-announcements', JSON.stringify(alerts));
            logActivity('Broadcast global announcement', `Published banner: ${title}`);
            
            drawAlerts();
        });

        document.querySelectorAll('.btn-delete-alert').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                alerts.splice(idx, 1);
                localStorage.setItem('ece-admin-announcements', JSON.stringify(alerts));
                logActivity('Delete announcement alert', `Removed ticker notice index ${idx}`);
                drawAlerts();
            });
        });
    };

    drawAlerts();
};

// ─── TAB 8-10: LIVE ANALYTICS (CANVAS) ──────────────────────────────────────
const renderChartsTab = (container) => {
    container.innerHTML = `
        <div class="admin-overview-header fade-in">
            <div>
                <h2>Interactive Analytics Telemetry</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Canvas-plotted student growth rates, score ranges, and lab saves metrics.</p>
            </div>
        </div>

        <div class="grid-2 fade-in" style="margin-top:16px;">
            <div class="admin-chart-box">
                <h3>Student growth (Monthly Probes)</h3>
                <canvas id="chart-user-growth" class="admin-chart-canvas"></canvas>
            </div>

            <div class="admin-chart-box">
                <h3>Quiz Performance accuracy frequencies</h3>
                <canvas id="chart-quiz-scores" class="admin-chart-canvas"></canvas>
            </div>

            <div class="admin-chart-box">
                <h3>Circuit Lab saved components</h3>
                <canvas id="chart-circuits-built" class="admin-chart-canvas"></canvas>
            </div>

            <div class="admin-card">
                <h3>Telemetry constraint detection</h3>
                <p style="font-size:0.9rem;line-height:1.45;color:var(--text-secondary);">
                    Aggregated analytics identify student accuracy dropoffs in:
                </p>
                <ul style="font-size:0.85rem;color:var(--error);line-height:1.6;font-weight:700;">
                    <li>Metastability (Flip-Flops) - 48% Avg Accuracy</li>
                    <li>Fourier Sampling Aliasing - 52% Avg Accuracy</li>
                </ul>
            </div>
        </div>
    `;

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
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const data = [15, 24, 45, 62, 90, 130];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const spacing = canvas.width / (data.length - 1);
    
    data.forEach((val, index) => {
        const x = index * spacing * 0.9 + 20;
        const y = canvas.height - (val / 150) * (canvas.height - 40) - 20;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.stroke();

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

    const scores = [6, 12, 28, 20, 8];
    const ranges = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
    const barWidth = 40;
    const spacing = (canvas.width - 40) / scores.length;

    scores.forEach((freq, idx) => {
        const barHeight = (freq / 30) * (canvas.height - 50);
        const x = idx * spacing + 25;
        const y = canvas.height - barHeight - 20;

        ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '8px monospace';
        ctx.fillText(ranges[idx], x + 2, canvas.height - 5);
    });
};

const drawCircuitsChart = () => {
    const canvas = document.getElementById('chart-circuits-built');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const counts = [30, 48, 72, 85];
    const categories = ['Diodes', 'BJTs', 'RLC Resonance', 'Logic gates'];
    const spacing = canvas.width / categories.length;

    counts.forEach((val, idx) => {
        const x = idx * spacing + 40;
        const y = canvas.height / 2 - 10;
        const radius = Math.min(30, (val / 100) * 30);

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '8px monospace';
        ctx.fillText(categories[idx], x - radius, canvas.height - 5);
    });
};

// ─── TAB 11: ACHIEVEMENTS EDITOR ──────────────────────────────────────────
const renderAchievementsTab = (container) => {
    let achievements = JSON.parse(localStorage.getItem('ece-admin-achievements')) || [];

    const drawGrid = () => {
        let cardsHTML = achievements.map((ach, idx) => {
            const toggleText = ach.active ? 'Disable' : 'Enable';
            const cardOpacity = ach.active ? '1.0' : '0.5';

            return `
                <div class="glass-card" style="padding:20px; opacity:${cardOpacity}; display:flex; flex-direction:column; gap:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span class="admin-badge admin-badge-student">${ach.xp} XP REWARD</span>
                        <div style="display:flex; gap:6px;">
                            <button class="admin-action-btn btn-toggle-ach" data-idx="${idx}" title="${toggleText} badge"><i data-lucide="${ach.active ? 'eye-off' : 'eye'}"></i></button>
                            <button class="admin-action-btn btn-delete btn-delete-ach" data-idx="${idx}"><i data-lucide="trash-2"></i></button>
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

        container.innerHTML = `
            <div class="admin-overview-header fade-in">
                <div>
                    <h2>Academic Achievements Hub</h2>
                    <p class="notfound-subtitle" style="font-size:0.95rem;">Configure award badges, assign progress XP rewards, and toggle locks.</p>
                </div>
            </div>

            <div class="grid-2 fade-in" style="align-items:start; margin-top:16px;">
                <div class="admin-card">
                    <h3>Add Achievement badge</h3>
                    <form id="ach-creator-form" style="display:flex; flex-direction:column; gap:16px;">
                        <div class="admin-input-group">
                            <label for="ach-name">Badge Name</label>
                            <input type="text" id="ach-name" class="admin-input" required placeholder="e.g. Nyquist Pioneer">
                        </div>

                        <div class="admin-input-group">
                            <label for="ach-desc">Description</label>
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
                            </select>
                        </div>

                        <button type="submit" class="btn btn-primary">Add Badge</button>
                    </form>
                </div>

                <div style="display:grid; grid-template-columns:1fr; gap:16px;">
                    ${cardsHTML}
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

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
            logActivity('Create achievement', `Created: ${name}`);

            drawGrid();
        });

        document.querySelectorAll('.btn-toggle-ach').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                achievements[idx].active = !achievements[idx].active;
                localStorage.setItem('ece-admin-achievements', JSON.stringify(achievements));
                logActivity('Toggle achievement state', `Set active:${achievements[idx].active} for ${achievements[idx].name}`);
                drawGrid();
            });
        });

        document.querySelectorAll('.btn-delete-ach').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                achievements.splice(idx, 1);
                localStorage.setItem('ece-admin-achievements', JSON.stringify(achievements));
                drawGrid();
            });
        });
    };

    drawGrid();
};

// ─── TAB 12: WEBSITE SETTINGS ──────────────────────────────────────────────
const renderSettingsTab = (container) => {
    const settings = JSON.parse(localStorage.getItem('ece-admin-settings'));

    container.innerHTML = `
        <div class="admin-overview-header fade-in">
            <div>
                <h2>Website Platform Customization</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Manage site headers, copyright guidelines and support parameters.</p>
            </div>
        </div>

        <div class="admin-editor-layout fade-in" style="margin-top:16px;">
            <div class="admin-card">
                <h3>Navbar & Brand Configuration</h3>
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
                        <label for="set-footer-text">Footer copyright statement</label>
                        <input type="text" id="set-footer-text" class="admin-input" required value="${settings.footer}">
                    </div>

                    <div class="admin-input-group">
                        <label for="set-contact-email">Support email</label>
                        <input type="email" id="set-contact-email" class="admin-input" required value="${settings.contact}">
                    </div>

                    <button type="submit" class="btn btn-primary">Save Settings</button>
                </form>
            </div>

            <div class="admin-editor-preview">
                <div class="admin-preview-title">Layout Previews</div>
                <div style="border:1px dashed var(--border-color); border-radius:6px; padding:16px; display:flex; flex-direction:column; gap:20px; background:rgba(0,0,0,0.15);">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:8px; border-bottom:1px solid var(--border-color);">
                        <span style="font-weight:800; font-size:1.1rem; color:var(--text-primary);" id="prev-brand-name">⌬ ${settings.logoText}</span>
                    </div>
                    <div style="border-top:1px solid var(--border-color); padding-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; color:var(--text-muted);">
                        <span id="prev-footer-text">${settings.footer}</span>
                        <span id="prev-contact">${settings.contact}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

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
        logActivity('Save custom settings', 'Modified branding assets');
    });
};

// ─── TAB 13: FEEDBACK SYSTEM ────────────────────────────────────────────────
const renderFeedbackTab = (container) => {
    let feedback = JSON.parse(localStorage.getItem('ece-admin-feedback')) || [];

    const drawFeedback = () => {
        let itemsHTML = feedback.map((fb, idx) => {
            return `
                <div style="border-bottom:1px solid var(--border-color); padding:16px 0; display:flex; flex-direction:column; gap:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <strong style="color:var(--text-primary);">${fb.name}</strong> 
                            <span style="font-size:0.75rem; color:var(--text-muted);">(${fb.email})</span>
                        </div>
                        <span class="admin-badge admin-badge-active">${fb.status}</span>
                    </div>
                    <div style="font-size:0.75rem;color:var(--accent-secondary);font-weight:700;">PROPOSED MODULE: ${fb.module}</div>
                    <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:0; line-height:1.45; font-style:italic;">"${fb.msg}"</p>
                    
                    ${fb.reply ? `
                        <div style="margin-left:20px; padding:10px; background:rgba(6,182,212,0.04); border-left:3px solid var(--accent-secondary); border-radius:4px; font-size:0.85rem;">
                            <strong style="color:var(--accent-secondary);">Admin Reply:</strong> "${fb.reply}"
                        </div>
                    ` : `
                        <div style="display:flex; gap:8px; margin-top:4px;">
                            <button class="btn btn-secondary btn-sm btn-reply-feedback" data-idx="${idx}"><i data-lucide="corner-down-right"></i> Reply</button>
                            <button class="admin-action-btn btn-delete btn-delete-feedback" data-idx="${idx}"><i data-lucide="trash-2"></i></button>
                        </div>
                    `}
                </div>
            `;
        }).join('');

        if (feedback.length === 0) {
            itemsHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);">No feedback records.</div>`;
        }

        container.innerHTML = `
            <div class="admin-overview-header fade-in">
                <div>
                    <h2>Student Telemetry Feedback</h2>
                    <p class="notfound-subtitle" style="font-size:0.95rem;">Review and resolve custom module requests submitted from the About page.</p>
                </div>
            </div>

            <div class="admin-card fade-in" style="margin-top:16px;">
                <h3>Active requests list</h3>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${itemsHTML}
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        bindFeedbackActions();
    };

    const bindFeedbackActions = () => {
        document.querySelectorAll('.btn-reply-feedback').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                const replyText = prompt("Type your reply to the student:");
                if (replyText) {
                    feedback[idx].reply = replyText;
                    feedback[idx].status = 'Resolved';
                    localStorage.setItem('ece-admin-feedback', JSON.stringify(feedback));
                    logActivity('Reply student feedback', `Replied feedback ${idx}`);
                    drawFeedback();
                }
            });
        });

        document.querySelectorAll('.btn-delete-feedback').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                feedback.splice(idx, 1);
                localStorage.setItem('ece-admin-feedback', JSON.stringify(feedback));
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
                    <span>Operator: <strong>${log.user}</strong></span>
                </div>
                <div class="admin-audit-content">${log.action}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${log.details}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="admin-overview-header fade-in">
            <div>
                <h2>Console Security Logs</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Track logins, database deletions, and system modifications.</p>
            </div>
        </div>

        <div class="admin-card fade-in" style="margin-top:16px;">
            <h3>Console activity log timeline</h3>
            <div class="admin-audit-timeline" style="margin-top:12px;">
                ${listHTML}
            </div>
        </div>
    `;
};

// ─── TAB 16: BACKUP & EXPORT ────────────────────────────────────────────────
const renderBackupTab = (container) => {
    container.innerHTML = `
        <div class="admin-overview-header fade-in">
            <div>
                <h2>Database Backup & Data Exporters</h2>
                <p class="notfound-subtitle" style="font-size:0.95rem;">Generate offline backups and telemetry tables in JSON or CSV files.</p>
            </div>
        </div>

        <div class="grid-2 fade-in" style="margin-top:16px;">
            <div class="admin-card">
                <h3>Download full Database (JSON)</h3>
                <p style="font-size:0.9rem; line-height:1.45; color:var(--text-secondary); margin-bottom:8px;">
                    Compiles and generates a single unified backup script containing settings, notice boards, achievements and user profiles.
                </p>
                <div style="margin-top:auto;">
                    <button class="btn btn-primary" id="btn-export-json"><i data-lucide="download"></i> Download JSON</button>
                </div>
            </div>

            <div class="admin-card">
                <h3>Export students registry table (CSV)</h3>
                <p style="font-size:0.9rem; line-height:1.45; color:var(--text-secondary); margin-bottom:8px;">
                    Compiles registered student profiles, level accomplishments and XP rates into an offline CSV spreadsheet compatible with Excel.
                </p>
                <div style="margin-top:auto;">
                    <button class="btn btn-primary" id="btn-export-csv" style="border: 1px solid var(--accent-secondary);"><i data-lucide="file-text"></i> Download CSV</button>
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
        } catch(e) {
            console.error("Backup JSON generate failed: ", e);
        }
    });

    document.getElementById('btn-export-csv').addEventListener('click', () => {
        try {
            const users = JSON.parse(localStorage.getItem('ece-admin-users-list')) || [];
            let csvContent = "data:text/csv;charset=utf-8,";
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
        } catch(e) {
            console.error("CSV generate failed: ", e);
        }
    });
};

// --- Ambient Particle Backdrop loop ---
const setupParticleBackdrop = () => {
    const canvas = document.getElementById('particle-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const maxParticles = 40;

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < maxParticles; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 1,
            color: Math.random() > 0.5 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(99, 102, 241, 0.2)'
        });
    }

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        adminChartLoopId = requestAnimationFrame(animate);
    };
    animate();
};
