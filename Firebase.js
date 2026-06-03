/**
 * Firebase Configuration
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCqPgP4tDJPkpJWRZUBiqdL2HVbzQpyXHg",
  authDomain: "nextron-ea63e.firebaseapp.com",
  projectId: "nextron-ea63e",
  storageBucket: "nextron-ea63e.firebasestorage.app",
  messagingSenderId: "816103811146",
  appId: "1:816103811146:web:12da4a44d04c3cdedd1eb3",
  measurementId: "G-8SCE05W5J4"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
