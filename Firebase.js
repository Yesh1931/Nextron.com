/**
 * Firebase Configuration
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4Xd4LMrMAOAMk-euuDY6zd4jfcmtzQ5U",
  authDomain: "nextron-48514.firebaseapp.com",
  projectId: "nextron-48514",
  storageBucket: "nextron-48514.appspot.com",
  messagingSenderId: "93642127644",
  appId: "1:93642127644:web:38a9ceb2aa1252f8dc62d9",
  measurementId: "G-EL09LP2BNN"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
