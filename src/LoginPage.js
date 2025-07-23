/*
Handles google sign-in using firebase authentication. 
On successful logins, stores user info in firestore and 
navigates to the dashboard.
*/

import React from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "./firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";
import codeImage from "./code_image.jpg";
import "./App.css";

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "CCE";
  }, []);

  // Function to handle Google sign-in
  const handleGoogleLogin = async () => {

    // Open Google popup and get user result
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user; 

      // Reference to user's firestore document
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      // If user does not exist in firestore, create a new record
      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: serverTimestamp(),
        });
      }

      // Redirect user to the dashboard after successful login
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  // JSX layout for login page
  return (
    <div className="login-container">
      <div className="login-left">
        <h2>Welcome to CCE!</h2>
        <button className="google-btn" onClick={handleGoogleLogin}>
          Please login with Google
        </button>
      </div>
      <div className="login-right">
        <img src={codeImage} alt="Coding background" />
      </div>
    </div>
  );
};

export default LoginPage;