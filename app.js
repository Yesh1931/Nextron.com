/**
 * Nextron - Main Application Entrypoint
 */

import { Router } from './router.js';
import { auth, db } from './Firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Global Application State
export const AppState = {
    theme: 'dark',
    completedQuizzes: {}, // e.g. { "pn-junction": score }
    sandboxCircuits: [],
    currentUser: null,
    gamificationProfile: null, // loaded from ece-quiz-gamification
    
    // Helper to register user locally inside localStorage (Offline local fallback database)
    registerUserLocally(username, email, password, college) {
        let users = [];
        try {
            users = JSON.parse(localStorage.getItem('ece-explorer-users')) || [];
        } catch (e) {
            users = [];
        }
        
        const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
        if (userExists) {
            this.showToast("Username already exists! Try another one.", "error");
            return false;
        }
        
        const newUser = { 
            username, 
            email, 
            password, 
            college, 
            role: "Student", 
            joinDate: new Date().toISOString(), 
            lastActive: new Date().toISOString(), 
            level: 1, 
            xp: 150 
        };
        users.push(newUser);
        localStorage.setItem('ece-explorer-users', JSON.stringify(users));
        
        this.currentUser = { username, email, college, role: "Student" };
        localStorage.setItem('ece-current-user', JSON.stringify(this.currentUser));
        this.updateAuthUI();
        
        this.showToast(`Welcome to Nextron, ${username}!`, "success");
        
        if (window.appRouter && window.appRouter.activeView) {
            window.appRouter.handleRouting();
        }
        return true;
    },

    // Helper to log in user locally inside localStorage (Offline local fallback database)
    loginUserLocally(username, password) {
        let users = [];
        try {
            users = JSON.parse(localStorage.getItem('ece-explorer-users')) || [];
        } catch (e) {
            users = [];
        }
        
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (!user) {
            this.showToast("Incorrect username or password. Connection failed!", "error");
            return false;
        }
        
        user.lastActive = new Date().toISOString();
        localStorage.setItem('ece-explorer-users', JSON.stringify(users));

        this.currentUser = { username: user.username, email: user.email, role: user.role || "Student" };
        localStorage.setItem('ece-current-user', JSON.stringify(this.currentUser));
        this.updateAuthUI();
        
        this.showToast(`Welcome back, ${user.username}!`, "success");
        
        if (window.appRouter && window.appRouter.activeView) {
            window.appRouter.handleRouting();
        }
        return true;
    },

    async registerUser(username, email, password, college) {
        if (auth && db) {
            try {
                // 1. Firebase Auth Registration
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const uid = userCredential.user.uid;
                
                // 2. Set Firebase Profile Display Name
                await updateProfile(userCredential.user, { displayName: username });
                
                // 3. Save profile metadata in Firestore document
                const newUser = { 
                    uid,
                    username, 
                    email, 
                    college, 
                    role: "Student", 
                    joinDate: new Date().toISOString(), 
                    lastActive: new Date().toISOString(), 
                    level: 1, 
                    xp: 150 
                };
                await setDoc(doc(db, "users", uid), newUser);
                
                // 4. Set current session state
                this.currentUser = { uid, username, email, college, role: "Student" };
                localStorage.setItem('ece-current-user', JSON.stringify(this.currentUser));
                this.updateAuthUI();
                
                this.showToast(`Welcome to Nextron, ${username}!`, "success");
                
                if (window.appRouter && window.appRouter.activeView) {
                    window.appRouter.handleRouting();
                }
                return true;
            } catch (err) {
                console.error("Firebase Registration Error:", err);
                
                // If it is a Firebase setup/configuration error (e.g. Email/Password provider not enabled),
                // automatically fallback to local database to ensure the user can register 100% of the time!
                const isFirebaseSetupError = err.code === 'auth/operation-not-allowed' || 
                                            err.code === 'auth/configuration-not-found' || 
                                            err.code === 'auth/invalid-api-key';
                if (isFirebaseSetupError) {
                    console.warn("Firebase Auth setup issue detected. Automatically falling back to local database.");
                    return this.registerUserLocally(username, email, password, college);
                }

                let readableError = "Registration failed! Connection issue.";
                if (err.code === 'auth/email-already-in-use') {
                    readableError = "Email already in use! Try another one.";
                } else if (err.code === 'auth/weak-password') {
                    readableError = "Password is too weak! Try a stronger password.";
                } else if (err.code === 'auth/invalid-email') {
                    readableError = "Invalid email format!";
                }
                this.showToast(readableError, "error");
                return false;
            }
        }
        
        return this.registerUserLocally(username, email, password, college);
    },
    
    async loginUser(username, password) {
        // Built-in Administrator credentials
        if (username.toLowerCase() === "admin" && password === "admin") {
            this.currentUser = { username: "admin", email: "admin@nextron.edu", role: "Admin" };
            localStorage.setItem('ece-current-user', JSON.stringify(this.currentUser));
            
            // Instantly unlock all syllabus chapters
            this.completedQuizzes = {
                "signals": 100, "networks": 100, "pn-junction": 100, "transistor": 100,
                "logic-gates": 100, "flip-flops": 100, "microcontrollers": 100, "dsp": 100,
                "comms": 100, "vlsi": 100, "embedded": 100, "optical": 100
            };
            localStorage.setItem('ece-student-quizzes', JSON.stringify(this.completedQuizzes));
            this.updateAuthUI();
            this.showToast("Administrator Mode Connected! Access granted to core telemetry panels.", "success");
            
            if (window.appRouter && window.appRouter.activeView) {
                window.appRouter.handleRouting();
            }
            return true;
        }

        // Built-in Developer Test User Bypass
        if (username.toLowerCase() === "scholar" && password === "password") {
            this.currentUser = { username: "scholar", email: "scholar@college.edu", role: "Admin" };
            localStorage.setItem('ece-current-user', JSON.stringify(this.currentUser));
            
            // Instantly fill completed quizzes to 100% to unlock all chapters!
            this.completedQuizzes = {
                "signals": 100,
                "networks": 100,
                "pn-junction": 100,
                "transistor": 100,
                "logic-gates": 100,
                "flip-flops": 100,
                "microcontrollers": 100,
                "dsp": 100,
                "comms": 100,
                "vlsi": 100,
                "embedded": 100,
                "optical": 100
            };
            localStorage.setItem('ece-student-quizzes', JSON.stringify(this.completedQuizzes));
            
            this.updateAuthUI();
            this.showToast("Test Account Connected! Granted Admin privileges for evaluation.", "success");
            
            if (window.appRouter && window.appRouter.activeView) {
                window.appRouter.handleRouting();
            }
            return true;
        }

        if (auth && db) {
            try {
                let email = username.trim();
                
                // 1. Resolve username to email from Firestore if not typing email format
                if (!email.includes("@")) {
                    const q = query(collection(db, "users"), where("username", "==", email));
                    const querySnapshot = await getDocs(q);
                    if (querySnapshot.empty) {
                        this.showToast("Incorrect username or password. Connection failed!", "error");
                        return false;
                    }
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();
                    email = userData.email;
                }
                
                // 2. Perform Firebase Auth Sign-in
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const uid = userCredential.user.uid;
                
                // 3. Fetch full profile records from Firestore
                const userDocRef = doc(db, "users", uid);
                const userDocSnap = await getDoc(userDocRef);
                let userData = null;
                
                if (userDocSnap.exists()) {
                    userData = userDocSnap.data();
                } else {
                    // Create default Firestore record if user exists in auth but not firestore
                    userData = {
                        uid,
                        username: userCredential.user.displayName || userCredential.user.email.split('@')[0],
                        email: userCredential.user.email,
                        college: "Nextron Institute",
                        role: "Student",
                        joinDate: new Date().toISOString(),
                        lastActive: new Date().toISOString(),
                        level: 1,
                        xp: 150
                    };
                    await setDoc(userDocRef, userData);
                }
                
                // 4. Update lastActive timestamp in background
                await setDoc(userDocRef, { lastActive: new Date().toISOString() }, { merge: true });
                
                // 5. Update state
                this.currentUser = { 
                    uid, 
                    username: userData.username, 
                    email: userData.email, 
                    role: userData.role || "Student", 
                    college: userData.college || "" 
                };
                localStorage.setItem('ece-current-user', JSON.stringify(this.currentUser));
                this.updateAuthUI();
                
                this.showToast(`Welcome back, ${userData.username}!`, "success");
                
                if (window.appRouter && window.appRouter.activeView) {
                    window.appRouter.handleRouting();
                }
                return true;
            } catch (err) {
                console.error("Firebase Login Error:", err);
                
                // Fallback to local login if Firebase is misconfigured or has setup issue
                const isFirebaseSetupError = err.code === 'auth/operation-not-allowed' || 
                                            err.code === 'auth/configuration-not-found' || 
                                            err.code === 'auth/invalid-api-key';
                if (isFirebaseSetupError) {
                    console.warn("Firebase Auth setup issue detected. Automatically falling back to local database.");
                    return this.loginUserLocally(username, password);
                }

                let readableError = "Authentication failed! Check credentials.";
                if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                    readableError = "Incorrect username or password.";
                } else if (err.code === 'auth/invalid-email') {
                    readableError = "Invalid email formatting!";
                }
                this.showToast(readableError, "error");
                return false;
            }
        }

        return this.loginUserLocally(username, password);
    },
    
    async logoutUser() {
        const username = this.currentUser ? this.currentUser.username : "Scholar";
        
        if (auth) {
            try {
                await signOut(auth);
            } catch (err) {
                console.error("Firebase Signout Error:", err);
            }
        }
        
        this.currentUser = null;
        localStorage.removeItem('ece-current-user');
        this.updateAuthUI();
        this.showToast(`Logged out. Farewell, ${username}!`, "info");
        
        // Force refresh current view to update personalized greetings
        if (window.appRouter && window.appRouter.activeView) {
            window.appRouter.handleRouting();
        }
    },
    
    updateAuthUI() {
        const pillContainer = document.getElementById('auth-header-pill');
        const navItem = document.getElementById('auth-nav-item');
        
        if (this.currentUser) {
            document.body.classList.add('user-logged-in');
            const username = this.currentUser.username;
            if (pillContainer) {
                pillContainer.innerHTML = `
                    <div class="auth-header-pill">
                        <div class="auth-avatar">${username[0].toUpperCase()}</div>
                        <span style="color: var(--text-primary); font-size: 0.85rem; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${username}</span>
                        <button class="auth-logout-btn" id="btn-header-logout" title="Sign Out">
                            <i data-lucide="log-out" style="width: 14px; height: 14px;"></i>
                        </button>
                    </div>
                `;
                
                // Logout listener
                document.getElementById('btn-header-logout').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.logoutUser();
                });
            }
            
            if (navItem) {
                const isAdmin = this.currentUser.role === 'Admin';
                navItem.innerHTML = `
                    ${isAdmin ? `
                    <a href="./admin.html" class="nav-link text-warning" style="color: var(--warning); margin-bottom: 8px;">
                        <i data-lucide="shield-alert"></i> Admin Control
                    </a>
                    ` : ''}
                    <a href="#/" class="nav-link text-error" id="btn-nav-logout" style="color: var(--error);">
                        <i data-lucide="log-out"></i> Log Out
                    </a>
                `;
                document.getElementById('btn-nav-logout').addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.logoutUser();
                });
            }
        } else {
            document.body.classList.remove('user-logged-in');
            if (pillContainer) {
                pillContainer.innerHTML = `
                    <button class="btn btn-secondary btn-signin-trigger" style="padding: 6px 14px; font-size: 0.8rem; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color); display: flex; align-items: center; gap: 4px;">
                        <i data-lucide="log-in" style="width: 12px; height: 12px;"></i> Sign In
                    </button>
                `;
                
                // Signin listeners
                pillContainer.querySelector('.btn-signin-trigger').addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.location.hash = '#/login';
                });
            }
            
            if (navItem) {
                navItem.innerHTML = `
                    <a href="#/login" class="nav-link" data-route="login">
                        <i data-lucide="log-in"></i> Sign In
                    </a>
                `;
            }
        }
        
        if (window.lucide) window.lucide.createIcons();
    },
    
    // Toast Notification System
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'error') iconName = 'alert-triangle';
        
        toast.innerHTML = `
            <i data-lucide="${iconName}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        if (window.lucide) window.lucide.createIcons();

        // Animate out and remove
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
};
window.AppState = AppState;

// --- Ambient Particle Line Background Simulation ---
class AmbientParticleBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 55;
        this.connectionDist = 120;
        
        this.mouse = { x: null, y: null, radius: 150 };
        
        this.init();
        
        // Listeners
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    init() {
        this.resizeCanvas();
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 1,
            color: Math.random() > 0.5 ? 'rgba(6, 182, 212, 0.4)' : 'rgba(99, 102, 241, 0.4)'
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const theme = document.documentElement.getAttribute('data-theme');
        const isDark = theme === 'dark';
        
        // Draw Particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // Move
            p.x += p.vx;
            p.y += p.vy;
            
            // Bounce
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            
            // Draw
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
            
            // Connect to mouse
            if (this.mouse.x && this.mouse.y) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const alpha = (1 - dist / this.mouse.radius) * 0.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.strokeStyle = isDark 
                        ? `rgba(6, 182, 212, ${alpha})` 
                        : `rgba(79, 70, 229, ${alpha})`;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.stroke();
                }
            }
            
            // Connect to other particles
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.connectionDist) {
                    const alpha = (1 - dist / this.connectionDist) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = isDark 
                        ? `rgba(255, 255, 255, ${alpha})` 
                        : `rgba(15, 23, 42, ${alpha})`;
                    this.ctx.lineWidth = 0.6;
                    this.ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// --- Bootstrap Application ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Particles Background
    new AmbientParticleBackground('particle-bg');
    
    // 2. Initialize Theme System
    const themeBtn = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('ece-explorer-theme') || 'dark';
    setTheme(storedTheme);

    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        AppState.showToast(`Theme switched to ${newTheme} mode!`, 'info');
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ece-explorer-theme', theme);
        AppState.theme = theme;
    }

    // 3. Mobile Navigation Drawer Toggle
    const mobileBtn = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const isOpen = navMenu.classList.contains('open');
            mobileBtn.innerHTML = isOpen ? `<i data-lucide="x"></i>` : `<i data-lucide="menu"></i>`;
            if (window.lucide) window.lucide.createIcons();
        });
    }

    // 4. Initialize Hash SPA Routes
    const routes = [
        { path: '#/', name: 'home', loadView: () => import('.//home.js') },
        { path: '#/login', name: 'login', loadView: () => import('./login.js') },
        { path: '#/concepts', name: 'concepts', loadView: () => import('./concepts.js') },
        { path: '#/concept/diode', name: 'concepts', loadView: () => import('./diode.js') },
        { path: '#/concept/transistor', name: 'concepts', loadView: () => import('./transistor.js') },
        { path: '#/concept/gates', name: 'concepts', loadView: () => import('./gates.js') },
        { path: '#/concept/flipflops', name: 'concepts', loadView: () => import('./flipflops.js') },
        { path: '#/concept/signals', name: 'concepts', loadView: () => import('./signals.js') },
        { path: '#/concept/networks', name: 'concepts', loadView: () => import('./networks.js') },
        { path: '#/concept/microcontrollers', name: 'concepts', loadView: () => import('./microcontrollers.js') },
        { path: '#/concept/dsp', name: 'concepts', loadView: () => import('./dsp.js') },
        { path: '#/concept/comms', name: 'concepts', loadView: () => import('./comms.js') },
        { path: '#/concept/vlsi', name: 'concepts', loadView: () => import('./vlsi.js') },
        { path: '#/concept/embedded', name: 'concepts', loadView: () => import('./embedded.js') },
        { path: '#/concept/optical', name: 'concepts', loadView: () => import('./optical.js') },
        { path: '#/sandbox', name: 'sandbox', loadView: () => import('./sandbox.js') },
        { path: '#/circuit-lab', name: 'circuit-lab', loadView: () => import('./circuitlab.js') },
        { path: '#/math-center', name: 'math-center', loadView: () => import('./mathcenter.js') },
        { path: '#/notes', name: 'notes', loadView: () => import('./notes.js') },
        { path: '#/study-hub', name: 'study-hub', loadView: () => import('./studyhub.js') },
        { path: '#/quiz', name: 'quiz', loadView: () => import('./quiz.js') },
        { path: '#/quiz-analytics', name: 'quiz-analytics', loadView: () => import('./quiz-analytics.js') },
        { path: '#/leaderboard', name: 'leaderboard', loadView: () => import('./quiz-leaderboard.js') },
        { path: '#/dashboard', name: 'dashboard', loadView: () => import('./dashboard.js') },
        { path: '#/about', name: 'about', loadView: () => import('./about.js') },
        { path: '#/404', name: 'notfound', loadView: () => import('./notfound.js') }
    ];

    // Load student records from localStorage
    const savedQuizzes = localStorage.getItem('ece-student-quizzes');
    if (savedQuizzes) {
        try {
            AppState.completedQuizzes = JSON.parse(savedQuizzes);
        } catch(e) {}
    }

    // Load gamification profile asynchronously (non-blocking)
    import('./quiz-engine.js').then(({ loadProfile }) => {
        AppState.gamificationProfile = loadProfile();
    }).catch(() => {});
    
    // Load current logged-in user
    const savedUser = localStorage.getItem('ece-current-user');
    if (savedUser) {
        try {
            AppState.currentUser = JSON.parse(savedUser);
        } catch(e) {}
    }
    
    // Initial Auth UI Draw
    AppState.updateAuthUI();

    // 5. Connect Firebase Real-Time Auth Session State Listener
    if (auth && db) {
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const docRef = doc(db, "users", firebaseUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        AppState.currentUser = {
                            uid: firebaseUser.uid,
                            username: userData.username,
                            email: userData.email,
                            role: userData.role || "Student",
                            college: userData.college || ""
                        };
                        localStorage.setItem('ece-current-user', JSON.stringify(AppState.currentUser));
                        AppState.updateAuthUI();
                        if (window.appRouter) {
                            window.appRouter.handleRouting();
                        }
                    }
                } catch (e) {
                    console.error("Error restoring Firestore auth session:", e);
                }
            } else {
                const isTestUser = AppState.currentUser && 
                    (AppState.currentUser.username === "admin" || AppState.currentUser.username === "scholar");
                if (AppState.currentUser && !isTestUser) {
                    AppState.currentUser = null;
                    localStorage.removeItem('ece-current-user');
                    AppState.updateAuthUI();
                    if (window.appRouter) {
                        window.appRouter.handleRouting();
                    }
                }
            }
        });
    }

    // Initialize Router (Must occur AFTER user and quiz data are loaded to prevent routing guard race conditions)
    window.appRouter = new Router(routes, 'app-root');
});
