// ==========================================
// NEXTRON ELECTRONICS PLATFORM - FIREBASE ENGINE
// ==========================================
//
// This file manages connection to your Firebase active real-time database.
// 
// HOW TO CONFIGURE:
// 1. Visit the Firebase Console (https://console.firebase.google.com/)
// 2. Click "Add Project" and name it "ece-nextron"
// 3. Under project settings, click the "</>" icon to register a Web App
// 4. Copy the generated `firebaseConfig` object and paste it below.
//
// MODULE IMPORT MODES:
// - NPM MODE (Recommended for standard Vite / Node environments):
//   Uncomment the "NPM-BASED IMPORTS" block and comment out the "CDN-BASED IMPORTS" block below.
// - CDN MODE (Zero-setup browser-native ESM mode):
//   Uses high-performance Google CDN links directly in the browser. Works instantly!

// --- OPTION A: CDN-BASED IMPORTS (Default - Works immediately without npm install) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- OPTION B: NPM-BASED IMPORTS (Uncomment if you ran 'npm install' locally) ---
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA4Xd4LMrMAOAMk-euuDY6zd4jfcmtzQ5U", // Paste your Firebase API Key here (e.g. "AIzaSy...")
    authDomain: "ece-nextron.firebaseapp.com",
    databaseURL: "https://ece-nextron-default-rtdb.firebaseio.com",
    projectId: "ece-nextron",
    storageBucket: "ece-nextron.firebasestorage.app",
    messagingSenderId: "526914848913",
    appId: "1:526914848913:web:9aa108371f766e9cd7db16"
};

// Initialize Firebase dynamically if apiKey is provided
let app = null;
let authInstance = null;
let dbInstance = null;

if (firebaseConfig.apiKey) {
    try {
        app = initializeApp(firebaseConfig);
        authInstance = getAuth(app);
        dbInstance = getFirestore(app);
        console.log("📡 Firebase initialized successfully on ECE Nextron!");
    } catch (e) {
        console.error("❌ Firebase initialization failed. Check config parameters: ", e);
    }
} else {
    console.log("🔌 Nextron running in Local Persistent Telemetry mode (No Firebase apiKey configured).");
}

export const auth = authInstance;
export const db = dbInstance;
export const config = firebaseConfig;

