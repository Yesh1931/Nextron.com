/**
 * Nextron - Fullscreen Login & Signup View
 */

import { AppState } from '../app.js';

const COLLEGES_INDIAN = [
    "Indian Institute of Technology, Bombay (IIT Bombay)",
    "Indian Institute of Technology, Delhi (IIT Delhi)",
    "Indian Institute of Technology, Madras (IIT Madras)",
    "Indian Institute of Technology, Kanpur (IIT Kanpur)",
    "Indian Institute of Technology, Kharagpur (IIT Kharagpur)",
    "Indian Institute of Technology, Roorkee (IIT Roorkee)",
    "Indian Institute of Technology, Guwahati (IIT Guwahati)",
    "Indian Institute of Technology, Hyderabad (IIT Hyderabad)",
    "Indian Institute of Technology, BHU Varanasi (IIT BHU)",
    "Indian Institute of Technology, Indore (IIT Indore)",
    "Indian Institute of Technology, Gandhinagar (IIT Gandhinagar)",
    "Indian Institute of Technology, Ropar (IIT Ropar)",
    "Indian Institute of Technology, Patna (IIT Patna)",
    "Indian Institute of Technology, Bhubaneswar (IIT Bhubaneswar)",
    "Indian Institute of Technology, Mandi (IIT Mandi)",
    "Indian Institute of Technology, Jodhpur (IIT Jodhpur)",
    "Indian Institute of Technology, Tirupati (IIT Tirupati)",
    "Indian Institute of Technology, Palakkad (IIT Palakkad)",
    "Indian Institute of Technology, Bhilai (IIT Bhilai)",
    "Indian Institute of Technology, Goa (IIT Goa)",
    "Indian Institute of Technology, Jammu (IIT Jammu)",
    "Indian Institute of Technology, Dharwad (IIT Dharwad)",
    "National Institute of Technology, Trichy (NIT Trichy)",
    "National Institute of Technology, Karnataka (NIT Surathkal)",
    "National Institute of Technology, Rourkela (NIT Rourkela)",
    "National Institute of Technology, Warangal (NIT Warangal)",
    "Motilal Nehru National Institute of Technology (MNNIT Allahabad)",
    "Visvesvaraya National Institute of Technology (VNIT Nagpur)",
    "National Institute of Technology, Calicut (NIT Calicut)",
    "Malaviya National Institute of Technology (MNIT Jaipur)",
    "National Institute of Technology, Silchar (NIT Silchar)",
    "National Institute of Technology, Kurukshetra (NIT Kurukshetra)",
    "National Institute of Technology, Durgapur (NIT Durgapur)",
    "National Institute of Technology, Jamshedpur (NIT Jamshedpur)",
    "National Institute of Technology, Jalandhar (NIT Jalandhar)",
    "National Institute of Technology, Hamirpur (NIT Hamirpur)",
    "National Institute of Technology, Patna (NIT Patna)",
    "National Institute of Technology, Raipur (NIT Raipur)",
    "National Institute of Technology, Srinagar (NIT Srinagar)",
    "National Institute of Technology, Goa (NIT Goa)",
    "National Institute of Technology, Delhi (NIT Delhi)",
    "National Institute of Technology, Puducherry (NIT Puducherry)",
    "National Institute of Technology, Andhra Pradesh (NIT AP)",
    "Indian Institute of Information Technology, Allahabad (IIIT Allahabad)",
    "Indian Institute of Information Technology, Gwalior (ABV-IIITM Gwalior)",
    "Indian Institute of Information Technology, Design and Manufacturing, Jabalpur (IIITDM Jabalpur)",
    "Indian Institute of Information Technology, Design and Manufacturing, Kancheepuram (IIITDM Kancheepuram)",
    "Indian Institute of Information Technology, Hyderabad (IIIT Hyderabad)",
    "Indian Institute of Information Technology, Bangalore (IIIT Bangalore)",
    "Indian Institute of Information Technology, Pune (IIIT Pune)",
    "Indian Institute of Information Technology, Lucknow (IIIT Lucknow)",
    "Indian Institute of Information Technology, Sri City (IIIT Sri City)",
    "Indian Institute of Information Technology, Guwahati (IIIT Guwahati)",
    "Indian Institute of Information Technology, Vadodara (IIIT Vadodara)",
    "Birla Institute of Technology and Science, Pilani (BITS Pilani)",
    "Birla Institute of Technology and Science, Goa (BITS Goa)",
    "Birla Institute of Technology and Science, Hyderabad (BITS Hyderabad)",
    "Delhi Technological University (DTU, Delhi)",
    "Netaji Subhas University of Technology (NSUT, Delhi)",
    "Jadavpur University, Kolkata",
    "Vellore Institute of Technology, Vellore (VIT Vellore)",
    "Vellore Institute of Technology, Chennai (VIT Chennai)",
    "SRM Institute of Science and Technology, Kattankulathur",
    "Manipal Institute of Technology, Manipal (MIT Manipal)",
    "Thapar Institute of Engineering and Technology, Patiala",
    "PSG College of Technology, Coimbatore (PSG Tech)",
    "College of Engineering, Guindy (CEG Anna University)",
    "Madras Institute of Technology, Chromepet (MIT Chennai)",
    "Amrita School of Engineering, Coimbatore",
    "SASTRA Deemed University, Tanjore",
    "SSN College of Engineering, Chennai",
    "R.V. College of Engineering, Bangalore (RVCE)",
    "BMS College of Engineering, Bangalore (BMSCE)",
    "MS Ramaiah Institute of Technology, Bangalore (MSRIT)",
    "PES University, Bangalore",
    "College of Engineering, Pune (COEP)",
    "Veermata Jijabai Technological Institute, Mumbai (VJTI)",
    "Sardar Patel College of Engineering, Mumbai (SPCE)",
    "Kalinga Institute of Industrial Technology, Bhubaneswar (KIIT)",
    "Chaitanya Bharathi Institute of Technology, Hyderabad (CBIT)",
    "Vasavi College of Engineering, Hyderabad (VCE)",
    "JNTU College of Engineering, Hyderabad (JNTUH)",
    "JNTU College of Engineering, Kakinada (JNTUK)",
    "Andhra University College of Engineering, Visakhapatnam (AUCE)",
    "Osmania University College of Engineering, Hyderabad (UCEOU)",
    "LD College of Engineering, Ahmedabad",
    "Nirma University, Ahmedabad",
    "Vishwakarma Institute of Technology, Pune (VIT Pune)",
    "Walchand College of Engineering, Sangli",
    "PEC University of Technology, Chandigarh",
    "Birla Institute of Technology, Mesra (BIT Mesra)",
    "Lovely Professional University, Phagwara (LPU)",
    "Chandigarh University, Punjab",
    "College of Engineering, Trivandrum (CET)",
    "Government Engineering College, Thrissur (GEC Thrissur)",
    "Indian Institute of Science, Bangalore (IISc Bangalore)"
];

export const render = async () => {
    // If user is already logged in, redirect them immediately to concepts
    if (AppState.currentUser) {
        setTimeout(() => {
            window.location.hash = '#/';
        }, 50);
        return '';
    }

    return `
        <div class="login-page-container fade-in" style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; min-height: 70vh; align-items: center; padding: 40px 0;">
            <!-- Left Panel: Educational / Physics Inspiration -->
            <div class="login-side-showcase glass-card" style="padding: 40px; height: 100%; display: flex; flex-direction: column; justify-content: center; text-align: left; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.05)); border-color: var(--border-glow);">
                <span class="concept-card-category" style="color: var(--accent-secondary); font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                    <i data-lucide="graduation-cap"></i> Academic Portal
                </span>
                <h2 style="font-size: 2.5rem; margin-top: 12px; margin-bottom: 16px; line-height: 1.15;">Master Electronics <br>Via Visual Physical Labs</h2>
                <p style="font-size: 1.1rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 32px;">Create a student account or log in to secure your B.Tech progress, solve graded quizzes across difficulty tiers, and earn ECE Mastery Certificates.</p>
                
                <!-- Features checklist -->
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(6, 182, 212, 0.15); color: var(--accent-secondary); display: flex; align-items: center; justify-content: center;"><i data-lucide="lock-open" style="width: 16px; height: 16px;"></i></div>
                        <span style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">Unlock 12 Graded Simulator Chapters</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(217, 70, 239, 0.15); color: var(--accent-purple); display: flex; align-items: center; justify-content: center;"><i data-lucide="sliders" style="width: 16px; height: 16px;"></i></div>
                        <span style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">Free Circuit Component Sandbox Tuning</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); color: var(--success); display: flex; align-items: center; justify-content: center;"><i data-lucide="award" style="width: 16px; height: 16px;"></i></div>
                        <span style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">Earn Graded PDF Mastery Certificates</span>
                    </div>
                </div>
            </div>
            
            <!-- Right Panel: spacious glass card containing the form elements -->
            <div class="login-card-container">
                <div class="glass-card" style="padding: 40px; border-color: var(--border-glow); background: var(--bg-glass); box-shadow: var(--glass-shadow);">
                    <!-- Tabs -->
                    <div class="auth-tabs" style="margin-bottom: 32px;">
                        <button class="auth-tab-btn active" id="tab-login-signin" style="padding-bottom: 12px;">Sign In</button>
                        <button class="auth-tab-btn" id="tab-login-signup" style="padding-bottom: 12px;">Create Account</button>
                    </div>
                    
                    <!-- Sign In Panel -->
                    <form id="form-login-signin" class="auth-form-panel">
                        <div class="auth-form-group" style="margin-bottom: 20px;">
                            <label class="auth-label" style="font-size: 0.9rem; margin-bottom: 8px;">Username</label>
                            <input type="text" id="login-signin-username" class="auth-input" style="padding: 14px;" placeholder="Enter your username" required autocomplete="username">
                        </div>
                        <div class="auth-form-group" style="margin-bottom: 24px;">
                            <label class="auth-label" style="font-size: 0.9rem; margin-bottom: 8px;">Password</label>
                            <input type="password" id="login-signin-password" class="auth-input" style="padding: 14px;" placeholder="Enter your password" required autocomplete="current-password">
                        </div>
                        <button type="submit" class="auth-submit-btn" style="padding: 14px; font-size: 1rem;">Sign In to Lab Arena</button>
                        <p class="auth-switch-prompt" style="margin-top: 24px;">Don't have an account? <span class="auth-switch-link" id="link-login-to-signup">Register here</span></p>
                    </form>
                    
                    <!-- Sign Up Panel (Hidden by default) -->
                    <form id="form-login-signup" class="auth-form-panel" style="display: none;">
                        <div class="auth-form-group" style="margin-bottom: 18px;">
                            <label class="auth-label" style="font-size: 0.9rem; margin-bottom: 8px;">Username</label>
                            <input type="text" id="login-signup-username" class="auth-input" style="padding: 14px;" placeholder="Choose username" required autocomplete="username">
                        </div>
                        <div class="auth-form-group" style="margin-bottom: 18px;">
                            <label class="auth-label" style="font-size: 0.9rem; margin-bottom: 8px;">Email Address</label>
                            <input type="email" id="login-signup-email" class="auth-input" style="padding: 14px;" placeholder="name@college.edu" required autocomplete="email">
                        </div>
                        <div class="auth-form-group" style="margin-bottom: 18px;">
                            <label class="auth-label" style="font-size: 0.9rem; margin-bottom: 8px;">College / Institute (India)</label>
                            <input type="text" id="login-signup-college" list="colleges-list" class="auth-input" style="padding: 14px;" placeholder="Search or type your college" required>
                            <datalist id="colleges-list">
                                ${COLLEGES_INDIAN.map(c => `<option value="${c}"></option>`).join('')}
                            </datalist>
                        </div>
                        <div class="auth-form-group" style="margin-bottom: 24px;">
                            <label class="auth-label" style="font-size: 0.9rem; margin-bottom: 8px;">Password</label>
                            <input type="password" id="login-signup-password" class="auth-input" style="padding: 14px;" placeholder="Minimum 6 characters" required autocomplete="new-password">
                        </div>
                        <button type="submit" class="auth-submit-btn" style="padding: 14px; font-size: 1rem;">Create Scholar Account</button>
                        <p class="auth-switch-prompt" style="margin-top: 24px;">Already a member? <span class="auth-switch-link" id="link-login-to-signin">Sign in here</span></p>
                    </form>
                </div>
            </div>
        </div>
    `;
};

export const mount = () => {
    if (AppState.currentUser) return; // Skip if redirected

    const tabSignin = document.getElementById('tab-login-signin');
    const tabSignup = document.getElementById('tab-login-signup');
    const formSignin = document.getElementById('form-login-signin');
    const formSignup = document.getElementById('form-login-signup');
    
    if (tabSignin && tabSignup && formSignin && formSignup) {
        // Toggle active tabs
        tabSignin.addEventListener('click', () => {
            tabSignin.classList.add('active');
            tabSignup.classList.remove('active');
            formSignin.style.display = 'block';
            formSignup.style.display = 'none';
        });
        
        tabSignup.addEventListener('click', () => {
            tabSignup.classList.add('active');
            tabSignin.classList.remove('active');
            formSignup.style.display = 'block';
            formSignin.style.display = 'none';
        });
        
        // Inline switch links
        const linkToSignup = document.getElementById('link-login-to-signup');
        const linkToSignin = document.getElementById('link-login-to-signin');
        
        if (linkToSignup) linkToSignup.addEventListener('click', () => tabSignup.click());
        if (linkToSignin) linkToSignin.addEventListener('click', () => tabSignin.click());
        
        // Form submissions
        formSignin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = formSignin.querySelector('.auth-submit-btn');
            const originalText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = "Authenticating...";

            try {
                const username = document.getElementById('login-signin-username').value.trim();
                const password = document.getElementById('login-signin-password').value;
                
                const success = await AppState.loginUser(username, password);
                if (success) {
                    window.location.hash = '#/';
                }
            } catch (err) {
                console.error("Login submission error: ", err);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        });
        
        formSignup.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-signup-username').value.trim();
            const email = document.getElementById('login-signup-email').value.trim();
            const college = document.getElementById('login-signup-college').value.trim();
            const password = document.getElementById('login-signup-password').value;
            
            if (password.length < 6) {
                AppState.showToast("Password must be at least 6 characters long.", "error");
                return;
            }

            const submitBtn = formSignup.querySelector('.auth-submit-btn');
            const originalText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = "Creating Account...";
            
            try {
                const success = await AppState.registerUser(username, email, password, college);
                if (success) {
                    window.location.hash = '#/';
                }
            } catch (err) {
                console.error("Signup submission error: ", err);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        });
    }
    
    if (window.lucide) window.lucide.createIcons();
};

export const unmount = () => {
    // Standard cleanup
};
