// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Paste your Firebase config below 👇
const firebaseConfig = {
  apiKey: "AIzaSyD9MshZvg-kywPUUH4aCU-7Q3N1OFgRAuw",
  authDomain: "whos-the-weirdo.firebaseapp.com",
  projectId: "whos-the-weirdo",
  storageBucket: "whos-the-weirdo.firebasestorage.app",
  messagingSenderId: "175271475524",
  appId: "1:175271475524:web:74c930572a80a52b857f11"
//  measurementId: "G-S3DLMDNEMS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Sign in anonymously
signInAnonymously(auth);
