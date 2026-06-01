/**
 * Nextron - 404 Error View (Circuit/Signal Not Found)
 * Route: Any unmatched hash URL
 */

import { AppState } from './app.js';

// --- Static Data for Smart Search Indexing ---
const SEARCH_DATABASE = [
    // Concepts
    { type: 'concept', title: 'PN Junction Diode', desc: 'Semiconductor barrier physics, drift, and diffusion.', link: '#/concept/diode' },
    { type: 'concept', title: 'BJT Transistor (NPN)', desc: 'Active switches, collector curves, and beta gains.', link: '#/concept/transistor' },
    { type: 'concept', title: 'Digital Logic Gates', desc: 'Boolean algebra gates, NAND/NOR universality, K-maps.', link: '#/concept/gates' },
    { type: 'concept', title: 'Sequential Flip-Flops', desc: 'Bistable memory, SR/JK latches, counters, shift registers.', link: '#/concept/flipflops' },
    { type: 'concept', title: 'AC Signals & Waveforms', desc: 'Sine wave attributes, FFT transforms, oscilloscope stabilization.', link: '#/concept/signals' },
    { type: 'concept', title: 'Network Theory', desc: 'Thevenin equivalents, Norton theorem, KVL/KCL loops.', link: '#/concept/networks' },
    { type: 'concept', title: 'Microprocessors & Microcontrollers', desc: 'ALUs, address buses, register files, and assembly.', link: '#/concept/microcontrollers' },
    { type: 'concept', title: 'Digital Signal Processing (DSP)', desc: 'Z-transforms, FIR/IIR filtering, unit circle poles.', link: '#/concept/dsp' },
    { type: 'concept', title: 'Analog & Digital Communication', desc: 'QAM constellations, SNR metrics, Nyquist rates.', link: '#/concept/comms' },
    { type: 'concept', title: 'VLSI Design', desc: 'CMOS switches, noise margins, propagation delays.', link: '#/concept/vlsi' },
    { type: 'concept', title: 'Embedded Systems & IoT', desc: 'RTOS kernels, LoRa telemetry, edge computing guides.', link: '#/concept/embedded' },
    { type: 'concept', title: 'Optical & Microwave Engineering', desc: 'Waveguides, radar cross sections, optical fiber cables.', link: '#/concept/optical' },

    // Notes
    { type: 'note', title: 'Fourier Series & Transform Guide', desc: 'Decomposing signals into continuous frequency harmonics.', link: '#/notes' },
    { type: 'note', title: 'Transient Circuit Analysis (RLC)', desc: 'Underdamped, overdamped oscillations, and time constants.', link: '#/notes' },
    { type: 'note', title: 'Early Effect & BJT Biasing Curves', desc: 'Base-width modulation and voltage-divider stability.', link: '#/notes' },
    { type: 'note', title: 'Flip-Flop Metastability & Setup Violations', desc: 'Avoiding timing violations in sequential digital blocks.', link: '#/notes' },
    { type: 'note', title: 'Shannon Channel Capacity Notes', desc: 'Calculating theoretical bandwidth limits on noisy channels.', link: '#/notes' },
    { type: 'note', title: 'Norton & Thevenin Circuit Simplification', desc: 'Techniques to resolve complex linear resistor meshes.', link: '#/notes' },

    // Formulas (Math Center)
    { type: 'formula', title: 'Shockley Diode Current Equation', desc: 'Governs current flow under bias: I = Is(e^(qV/nKT)-1).', link: '#/math-center' },
    { type: 'formula', title: 'Nyquist-Shannon Sampling Theorem', desc: 'Signal reconstruction limit: Fs >= 2 * Fmax.', link: '#/math-center' },
    { type: 'formula', title: 'RLC Series Resonant Frequency', desc: 'Frequency where impedance is purely resistive: Fr = 1/(2π√LC).', link: '#/math-center' },
    { type: 'formula', title: 'De Morgan Boolean Laws', desc: 'Universal logical complements: (A.B)\' = A\' + B\'.', link: '#/math-center' },
    { type: 'formula', title: 'BJT transconductance gm calculation', desc: 'Defines small-signal active gain ratio: gm = Ic / Vt.', link: '#/math-center' },
    { type: 'formula', title: 'Capacitor Time Constant (τ)', desc: 'Transient growth rate definition: τ = R * C.', link: '#/math-center' },

    // Quizzes
    { type: 'quiz', title: 'PN Junction Diode Quiz Arena', desc: 'Test semiconductor majority carrier concepts.', link: '#/quiz' },
    { type: 'quiz', title: 'BJT Transistor Active Curves Quiz', desc: 'Challenge your understanding of active bias modes.', link: '#/quiz' },
    { type: 'quiz', title: 'Digital logic simplification practice exam', desc: 'Solve truth-tables, XOR properties, and logic gates.', link: '#/quiz' },
    { type: 'quiz', title: 'AC signals vertical division practice', desc: 'Calibrate Volts/Div and horizontal sweep lines.', link: '#/quiz' },
    { type: 'quiz', title: 'Network Loop mesh analysis challenge', desc: 'Test KVL/KCL, Thevenin equivalent resistance.', link: '#/quiz' }
];

// --- ECE Learning Facts Database ---
const LEARNING_FACTS = [
    "The first transistor was invented in 1947 by John Bardeen, Walter Brattain, and William Shockley at Bell Labs.",
    "The Nyquist Rate requires a sampling frequency at least twice the maximum frequency of the signal to avoid aliasing: Fs >= 2 * Fmax.",
    "CMOS technology uses symmetrical P-channel and N-channel MOSFET pairs, drawing power almost exclusively during binary switching transitions.",
    "Maxwell's Equations prove that electricity and magnetism are unified forces propagating as electromagnetic waves at the speed of light.",
    "Shannon's Channel Capacity theorem sets the absolute theoretical maximum rate of error-free data transfer over a noisy transmission medium.",
    "Thevenin's Theorem lets engineers simplify any active linear network of resistors and sources into one ideal voltage source and one resistor.",
    "Metastability in flip-flops occurs when input data transitions within the setup and hold time boundaries, trapping outputs in an unstable voltage float."
];

// --- ECE Humor Quotes ---
const HUMOR_QUOTES = [
    "Error 404: Electron escaped the circuit. Leakage current detected.",
    "Signal attenuation exceeded acceptable limits. Carrier wave collapsed to thermal noise floor.",
    "Routing algorithm could not locate the requested node. Circuit connection open.",
    "System impedance mismatch caused total voltage reflection back to the source.",
    "Flip-flop trapped in a metastable state. Setup time constraints severely violated.",
    "Watchdog timer expired while attempting page fetch. System reset loop triggered.",
    "Network path resistance is infinite. Potential difference dropped to absolute zero."
];

// State variables for animation loop reference
let scopeAnimationId = null;

export const render = async () => {
    // Pick random fact and humor message
    const randomFact = LEARNING_FACTS[Math.floor(Math.random() * LEARNING_FACTS.length)];
    const randomHumor = HUMOR_QUOTES[Math.floor(Math.random() * HUMOR_QUOTES.length)];

    return `
        <div class="notfound-container fade-in">
            <!-- LEFT COLUMN: Interactive Canvas Oscilloscope Hardware -->
            <div class="scope-chassis">
                <div class="scope-header-bar">
                    <span class="scope-title">
                        <i data-lucide="activity" style="width: 18px; height: 18px; color: var(--accent-secondary);"></i>
                        NEXTRON VECTOR DSO - PORTABLE
                    </span>
                    <span class="scope-status-led" id="scope-led-indicator">
                        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--error); box-shadow: 0 0 8px var(--error); margin-right:4px;"></span>
                        NO CARRIER
                    </span>
                </div>

                <!-- CRT Screen Container -->
                <div class="crt-screen-wrapper" aria-label="CRT Oscilloscope Display showing an attenuated, noisy sine wave.">
                    <div class="crt-overlay-text">
                        CH1 (LOST)<br>
                        ATTN: -80dB<br>
                        IMP: 10MΩ
                    </div>
                    <div class="crt-overlay-right" id="crt-overlay-metrics">
                        Vp-p: 0.12V<br>
                        Freq: ---Hz<br>
                        SWP: 2.5ms
                    </div>
                    <canvas id="notfound-scope-canvas" class="scope-canvas"></canvas>
                </div>

                <!-- Control Dials -->
                <div class="scope-controls-deck">
                    <div class="scope-knob-group">
                        <span class="scope-knob-label">Volts/Div</span>
                        <div class="scope-rotary-knob" id="knob-amplitude" tabindex="0" role="slider" aria-valuemin="10" aria-valuemax="100" aria-valuenow="50" aria-label="Adjust signal amplitude amplitude knob">
                            <div class="scope-knob-indicator" id="ind-amplitude" style="transform: rotate(0deg);"></div>
                        </div>
                        <span class="scope-knob-label" style="font-size:0.65rem;color:var(--text-muted);" id="val-amplitude">5.0V</span>
                    </div>

                    <div class="scope-knob-group">
                        <span class="scope-knob-label">Time/Div</span>
                        <div class="scope-rotary-knob" id="knob-frequency" tabindex="0" role="slider" aria-valuemin="10" aria-valuemax="100" aria-valuenow="40" aria-label="Adjust signal frequency knob">
                            <div class="scope-knob-indicator" id="ind-frequency" style="transform: rotate(0deg);"></div>
                        </div>
                        <span class="scope-knob-label" style="font-size:0.65rem;color:var(--text-muted);" id="val-frequency">2.5ms</span>
                    </div>

                    <div class="scope-knob-group">
                        <span class="scope-knob-label">Noise Floor</span>
                        <div class="scope-rotary-knob" id="knob-noise" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="35" aria-label="Adjust background thermal noise floor knob">
                            <div class="scope-knob-indicator" id="ind-noise" style="transform: rotate(0deg);"></div>
                        </div>
                        <span class="scope-knob-label" style="font-size:0.65rem;color:var(--text-muted);" id="val-noise">35mV</span>
                    </div>

                    <div class="scope-knob-group" style="justify-content: space-between; padding-bottom: 8px;">
                        <span class="scope-knob-label">Calibration</span>
                        <button class="btn btn-primary flex-center" id="btn-scope-sync" aria-label="Calibrate Waveform and Synchonize signal carrier" style="width:48px; height:48px; border-radius:50%; padding:0; box-shadow:0 0 10px rgba(6,182,212,0.3); border: 2px solid var(--accent-secondary);">
                            <i data-lucide="refresh-cw" style="width: 18px; height: 18px;"></i>
                        </button>
                        <span class="scope-knob-label" style="font-size:0.65rem;color:var(--accent-secondary);font-weight:700;">SYNC</span>
                    </div>

                    <div class="scope-action-buttons">
                        <button class="btn btn-secondary" id="btn-scope-spark" style="padding: 6px 14px; font-size: 0.8rem; border-radius: var(--border-radius-sm);">
                            <i data-lucide="zap" style="width: 14px; height: 14px; color:var(--warning);"></i> Inject Spark
                        </button>
                    </div>
                </div>
            </div>

            <!-- RIGHT COLUMN: Error Info & Smart Search -->
            <div class="notfound-info">
                <div>
                    <h1 class="notfound-404-glitch" aria-label="Error 404">404</h1>
                    <h2 class="notfound-title">
                        <i data-lucide="alert-octagon" style="width: 28px; height: 28px; color: var(--error);"></i>
                        Circuit Not Found
                    </h2>
                    <p class="notfound-subtitle">
                        The transmission path you're trying to probe does not exist or may have been unrouted from the platform directory.
                    </p>
                </div>

                <!-- ECE Humorous Callout -->
                <div class="notfound-humor-box" role="alert">
                    <i data-lucide="terminal" style="width: 20px; height: 20px;"></i>
                    <div>
                        <div class="notfound-humor-title">Telemetry Alarm</div>
                        <p class="notfound-humor-text">${randomHumor}</p>
                    </div>
                </div>

                <!-- SMART SEARCH -->
                <div class="notfound-search-container">
                    <div class="notfound-search-bar">
                        <i data-lucide="search" style="width: 18px; height: 18px; color: var(--text-muted);"></i>
                        <input type="text" id="notfound-search-input" placeholder="Search concepts, formulas, notes..." aria-label="Smart Search ECE Content" autocomplete="off">
                        <button id="btn-search-clear" style="display:none; color:var(--text-muted);" aria-label="Clear search input">
                            <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                    <!-- Dropdown matching panel -->
                    <div class="notfound-search-results" id="notfound-search-results-panel"></div>
                </div>

                <!-- QUICK LINKS -->
                <div class="notfound-links-deck">
                    <span class="notfound-links-title">Probe Popular Terminals</span>
                    <div class="notfound-links-grid">
                        <a href="#/concept/signals" class="notfound-link-pill"><i data-lucide="radio" style="width:12px;height:12px;"></i> Signals</a>
                        <a href="#/concept/diode" class="notfound-link-pill"><i data-lucide="activity" style="width:12px;height:12px;"></i> Diodes</a>
                        <a href="#/concept/transistor" class="notfound-link-pill"><i data-lucide="zap" style="width:12px;height:12px;"></i> Transistors</a>
                        <a href="#/concept/gates" class="notfound-link-pill"><i data-lucide="binary" style="width:12px;height:12px;"></i> Digital Gates</a>
                        <a href="#/concept/dsp" class="notfound-link-pill"><i data-lucide="bar-chart-2" style="width:12px;height:12px;"></i> DSP Module</a>
                        <a href="#/circuit-lab" class="notfound-link-pill"><i data-lucide="wrench" style="width:12px;height:12px;"></i> Circuit Lab</a>
                        <a href="#/math-center" class="notfound-link-pill"><i data-lucide="line-chart" style="width:12px;height:12px;"></i> Math Center</a>
                        <a href="#/notes" class="notfound-link-pill"><i data-lucide="book-open" style="width:12px;height:12px;"></i> Notes Hub</a>
                        <a href="#/quiz" class="notfound-link-pill"><i data-lucide="award" style="width:12px;height:12px;"></i> Quiz Arena</a>
                    </div>
                </div>

                <!-- RANDOM LEARNING FACT -->
                <div class="notfound-fact-box">
                    <div class="notfound-fact-header">
                        <span class="notfound-fact-title">
                            <i data-lucide="lightbulb" style="width: 14px; height: 14px; color: var(--warning);"></i>
                            Did You Know?
                        </span>
                        <button id="btn-fact-refresh" style="color:var(--text-muted); cursor:pointer;" aria-label="Rotate educational fact" title="Refresh Fact">
                            <i data-lucide="rotate-cw" style="width: 12px; height: 12px;"></i>
                        </button>
                    </div>
                    <p class="notfound-fact-content" id="notfound-fact-text">${randomFact}</p>
                </div>

                <!-- ACCESSIBILITY/PRIMARY ACTIONS -->
                <div style="display:flex; flex-wrap:wrap; gap:12px;">
                    <a href="#/" class="btn btn-primary">
                        <i data-lucide="home"></i> Return Home
                    </a>
                    <a href="#/dashboard" class="btn btn-secondary">
                        <i data-lucide="layout-dashboard"></i> Go To Dashboard
                    </a>
                </div>

                <!-- BRANDING -->
                <div class="notfound-footer">
                    <div class="notfound-footer-brand">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-secondary);">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Next<span>ron</span> ECE
                    </div>
                    <div>Return to learning.</div>
                </div>
            </div>
        </div>
    `;
};

export const mount = () => {
    // Initialize icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // --- Core Canvas Scope Simulator Variables & Loops ---
    const canvas = document.getElementById('notfound-scope-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Canvas sizing setup
    const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial controls state
    let amplitude = 50;  // 10 to 100
    let frequency = 40;  // 10 to 100
    let noiseFloor = 35; // 0 to 100
    let isSynced = false;
    let syncTimer = 0;

    // Spark Particles Array
    let particles = [];

    // Knobs interaction logic helper
    const setupKnob = (knobId, indicatorId, labelId, valueUnit, minVal, maxVal, initialVal, updateCallback) => {
        const knob = document.getElementById(knobId);
        const indicator = document.getElementById(indicatorId);
        const label = document.getElementById(labelId);
        if (!knob) return;

        let startY = 0;
        let startVal = initialVal;
        let currentVal = initialVal;

        // Apply visual angle
        const applyAngle = (val) => {
            const pct = (val - minVal) / (maxVal - minVal);
            const deg = -135 + pct * 270; // Rotation range -135deg to +135deg
            indicator.style.transform = `rotate(${deg}deg)`;
            label.textContent = val.toFixed(1) + valueUnit;
            knob.setAttribute('aria-valuenow', val);
        };
        applyAngle(currentVal);

        // Knob dragging logic
        const onMouseMove = (e) => {
            const dy = startY - e.clientY;
            const sensitivity = 0.5; // Drag sensitivity
            let nextVal = startVal + dy * sensitivity;
            nextVal = Math.max(minVal, Math.min(maxVal, nextVal));
            currentVal = nextVal;
            applyAngle(nextVal);
            updateCallback(nextVal);
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            knob.style.cursor = 'grab';
        };

        knob.addEventListener('mousedown', (e) => {
            startY = e.clientY;
            startVal = currentVal;
            knob.style.cursor = 'grabbing';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            createSparks(e.clientX, e.clientY);
        });

        // Keyboard accessibility control for knobs
        knob.addEventListener('keydown', (e) => {
            const step = (maxVal - minVal) / 20;
            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
                e.preventDefault();
                currentVal = Math.min(maxVal, currentVal + step);
                applyAngle(currentVal);
                updateCallback(currentVal);
                injectKeyboardSpark(knob);
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
                e.preventDefault();
                currentVal = Math.max(minVal, currentVal - step);
                applyAngle(currentVal);
                updateCallback(currentVal);
                injectKeyboardSpark(knob);
            }
        });
    };

    // Knobs bindings
    setupKnob('knob-amplitude', 'ind-amplitude', 'val-amplitude', 'V', 10, 100, 50, (val) => {
        amplitude = val;
    });

    setupKnob('knob-frequency', 'ind-frequency', 'val-frequency', 'ms', 10, 100, 40, (val) => {
        frequency = val;
    });

    setupKnob('knob-noise', 'ind-noise', 'val-noise', 'mV', 0, 100, 35, (val) => {
        noiseFloor = val;
    });

    // Particle Physics Sparks generator
    const createSparks = (x, y) => {
        const rect = canvas.getBoundingClientRect();
        // Translate client mouse values relative to canvas workspace
        const canvasX = x - rect.left;
        const canvasY = y - rect.top;

        if (canvasX < 0 || canvasX > rect.width || canvasY < 0 || canvasY > rect.height) {
            // Generate sparks at random points or center
            return;
        }

        for (let i = 0; i < 15; i++) {
            particles.push({
                x: canvasX,
                y: canvasY,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6 - 2, // slightly upwards
                radius: Math.random() * 2.5 + 1.5,
                color: Math.random() > 0.4 ? '#06b6d4' : '#e0f7fa',
                alpha: 1.0,
                decay: Math.random() * 0.04 + 0.02
            });
        }
    };

    const injectKeyboardSpark = (element) => {
        const rect = element.getBoundingClientRect();
        const screenX = rect.left + rect.width / 2;
        const screenY = rect.top + rect.height / 2;
        const canvasRect = canvas.getBoundingClientRect();
        // Spark relative to canvas center screen
        const canvasX = screenX - canvasRect.left;
        const canvasY = screenY - canvasRect.top;

        if (canvasX >= 0 && canvasX <= canvasRect.width && canvasY >= 0 && canvasY <= canvasRect.height) {
            createSparks(screenX, screenY);
        } else {
            // Spark directly on the canvas screen grid instead!
            for (let i = 0; i < 8; i++) {
                particles.push({
                    x: canvasRect.width / 2 + (Math.random() - 0.5) * 80,
                    y: canvasRect.height / 2 + (Math.random() - 0.5) * 80,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    radius: Math.random() * 2 + 1,
                    color: '#6366f1',
                    alpha: 1.0,
                    decay: 0.05
                });
            }
        }
    };

    // Spark Button Listener
    document.getElementById('btn-scope-spark').addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const centerScreenX = rect.left + rect.width / 2;
        const centerScreenY = rect.top + rect.height / 2;
        createSparks(centerScreenX, centerScreenY);
        AppState.showToast("Micro-electrical spark injected into circuit loop!", "info");
    });

    // Calibrate / Sync button behavior
    const syncButton = document.getElementById('btn-scope-sync');
    const ledIndicator = document.getElementById('scope-led-indicator');
    const crtMetrics = document.getElementById('crt-overlay-metrics');

    syncButton.addEventListener('click', () => {
        isSynced = true;
        syncTimer = 180; // Stable carrier wave for ~3 seconds (180 frames)
        
        // Spark burst on trigger
        const rect = canvas.getBoundingClientRect();
        createSparks(rect.left + rect.width / 2, rect.top + rect.height / 2);

        // Change status LED to green
        ledIndicator.innerHTML = `
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--success); box-shadow: 0 0 8px var(--success); margin-right:4px;"></span>
            SYNCED
        `;
        ledIndicator.style.animation = "none";
        ledIndicator.style.color = "var(--success)";

        AppState.showToast("DSO PLL Locked! Carrier signal successfully synchronized.", "success");
    });

    // --- Oscilloscope Drawing Loop ---
    let frameTime = 0;

    const drawScope = () => {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        ctx.clearRect(0, 0, width, height);

        // Theme parsing
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        // 1. Draw Oscilloscope Grid Lines (Grid pattern)
        ctx.strokeStyle = isDark ? 'rgba(6, 182, 212, 0.08)' : 'rgba(6, 182, 212, 0.12)';
        ctx.lineWidth = 1;
        
        const gridSpacing = 40;
        
        // Vertical grid lines
        for (let x = 0; x < width; x += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal grid lines
        for (let y = 0; y < height; y += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Mid line tick markings (Sub-divisions)
        ctx.strokeStyle = isDark ? 'rgba(6, 182, 212, 0.18)' : 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 1.5;
        
        // X-axis centerline
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Y-axis centerline
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width, height / 2); // Wait, this was y-axis centerline
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();

        // 2. Draw CRT Vector Signal Waveform
        ctx.beginPath();
        
        // Map Volts/Div and Time/Div factors
        const waveAmp = amplitude * 1.5; // Gain scaling
        const waveFreq = (frequency / 250); // Scale factor
        const noiseAmt = noiseFloor * 0.4;
        
        // PLL sync lock countdown
        if (isSynced) {
            syncTimer--;
            if (syncTimer <= 0) {
                isSynced = false;
                // LED reset
                ledIndicator.innerHTML = `
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--error); box-shadow: 0 0 8px var(--error); margin-right:4px;"></span>
                    NO CARRIER
                `;
                ledIndicator.style.animation = "flashLED 1.5s infinite ease-in-out";
                ledIndicator.style.color = "var(--error)";
                AppState.showToast("Carrier connection lost. Attenuation exceeded threshold.", "error");
            }
        }

        // Text overlay updates
        const actualFreq = isSynced ? Math.round(frequency * 2.5) : "---";
        crtMetrics.innerHTML = `
            Vp-p: ${(waveAmp * 0.05).toFixed(2)}V<br>
            Freq: ${actualFreq}Hz<br>
            SWP: ${frequency.toFixed(0)}ms
        `;

        for (let x = 0; x < width; x++) {
            // Signal equations:
            // Synced -> Clean stable sine wave
            // Unsynced/Lost -> High attenuation (decaying) and noisy wave
            let signalY = 0;
            
            if (isSynced) {
                // Stabilized lock sine wave
                signalY = Math.sin(x * waveFreq - frameTime * 0.25) * waveAmp * 0.6;
                // Tiny stable noise
                signalY += (Math.random() - 0.5) * 1.5;
            } else {
                // Attenuated exponential decaying sine wave with heavy noise
                const attenuation = Math.exp(-x / (width * 0.45)); // shrinks left to right
                const waveComponent = Math.sin(x * waveFreq - frameTime * 0.1) * waveAmp * 0.6;
                const noiseComponent = (Math.random() - 0.5) * noiseAmt;
                
                signalY = (waveComponent + noiseComponent) * attenuation;
            }

            const yPos = height / 2 + signalY;

            if (x === 0) {
                ctx.moveTo(x, yPos);
            } else {
                ctx.lineTo(x, yPos);
            }
        }

        // CRT glowing neon line properties
        ctx.strokeStyle = isSynced ? '#10b981' : '#06b6d4';
        ctx.shadowColor = isSynced ? '#10b981' : '#06b6d4';
        ctx.lineWidth = isSynced ? 2.5 : 1.8;
        ctx.shadowBlur = isSynced ? 15 : 6;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Reset shadow blurring for grid / sparks
        ctx.shadowBlur = 0;

        // 3. Draw Spark Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0; // restore

        // Increment frame timeline
        frameTime++;
        scopeAnimationId = requestAnimationFrame(drawScope);
    };

    // Fire scope loop
    drawScope();


    // --- Smart Search Core Logic ---
    const searchInput = document.getElementById('notfound-search-input');
    const clearSearchBtn = document.getElementById('btn-search-clear');
    const resultsPanel = document.getElementById('notfound-search-results-panel');

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length === 0) {
            clearSearchBtn.style.display = 'none';
            resultsPanel.classList.remove('active');
            resultsPanel.innerHTML = '';
            return;
        }

        clearSearchBtn.style.display = 'block';

        // Filter search database
        const matches = SEARCH_DATABASE.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.desc.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            resultsPanel.innerHTML = `<div class="search-no-results">No terminals match "${e.target.value}". Check logic syntax.</div>`;
            resultsPanel.classList.add('active');
            return;
        }

        // Group matches by type
        const grouped = matches.reduce((acc, item) => {
            acc[item.type] = acc[item.type] || [];
            acc[item.type].push(item);
            return acc;
        }, {});

        // Build HTML
        let resultsHTML = '';
        const groupLabels = {
            concept: 'Silicon Concepts',
            note: 'Study Handbooks',
            formula: 'Math Handbooks',
            quiz: 'Quiz Arenas'
        };

        for (const [type, items] of Object.entries(grouped)) {
            resultsHTML += `
                <div class="search-result-group">
                    <div class="search-result-group-title">${groupLabels[type] || type}</div>
            `;

            items.forEach(item => {
                const badgeText = item.type.toUpperCase();
                resultsHTML += `
                    <div class="search-result-item" onclick="window.location.hash='${item.link}'">
                        <div class="search-result-item-info">
                            <span class="search-result-item-title">${item.title}</span>
                            <span class="search-result-item-desc">${item.desc}</span>
                        </div>
                        <span class="search-result-item-badge">${badgeText}</span>
                    </div>
                `;
            });

            resultsHTML += `</div>`;
        }

        resultsPanel.innerHTML = resultsHTML;
        resultsPanel.classList.add('active');
    };

    searchInput.addEventListener('input', handleSearch);

    // Clear Search Input Click
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        resultsPanel.classList.remove('active');
        resultsPanel.innerHTML = '';
        searchInput.focus();
    });

    // Close search dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.notfound-search-container')) {
            resultsPanel.classList.remove('active');
        }
    });

    // Keyboard trigger bindings for search item selections
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            resultsPanel.classList.remove('active');
            searchInput.blur();
        }
    });


    // --- Fact Rotator Logic ---
    const factText = document.getElementById('notfound-fact-text');
    const refreshFactBtn = document.getElementById('btn-fact-refresh');

    refreshFactBtn.addEventListener('click', () => {
        // Subtle spinning animation on button click
        refreshFactBtn.style.transition = 'transform 0.5s ease';
        refreshFactBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            refreshFactBtn.style.transition = 'none';
            refreshFactBtn.style.transform = 'rotate(0deg)';
        }, 500);

        // Pick a new fact that is different from current
        const currentFact = factText.textContent;
        let nextFact = currentFact;
        while (nextFact === currentFact) {
            nextFact = LEARNING_FACTS[Math.floor(Math.random() * LEARNING_FACTS.length)];
        }

        // Apply with fade transition
        factText.style.transition = 'opacity 0.2s ease';
        factText.style.opacity = '0';
        setTimeout(() => {
            factText.innerHTML = nextFact;
            
            // Re-render KaTeX in fact window if applicable
            if (window.renderMathInElement) {
                window.renderMathInElement(factText, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false}
                    ],
                    throwOnError: false
                });
            }
            
            factText.style.opacity = '1';
        }, 200);
        
        AppState.showToast("Syllabus database fact updated!", "success");
    });
};

export const unmount = () => {
    // Kill the Oscilloscope Animation loop loop to save CPU when route shifts!
    if (scopeAnimationId) {
        cancelAnimationFrame(scopeAnimationId);
        scopeAnimationId = null;
    }
};
