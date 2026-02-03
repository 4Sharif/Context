/*
Initializes and exports firebase services 
for authentication and firestore database. 
Uses the project-specific configuration.
*/

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const requiredEnvVars = [
  "REACT_APP_FIREBASE_APIKEY",
  "REACT_APP_FIREBASE_MESSAGINGSENDERID",
  "REACT_APP_FIREBASE_APPID",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `Missing required environment variable: ${varName}\n` +
      `Please check your .env file and ensure all variables are set.`
    );
  }
});

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: 'collaborative-code-edito-a4953.firebaseapp.com',
  projectId: "collaborative-code-edito-a4953",
  storageBucket: "collaborative-code-edito-a4953.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_FIREBASE_APPID
};
 
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

export { db, auth, provider };