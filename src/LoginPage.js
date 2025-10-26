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
    document.title = "Context";
  }, []);
 
  const handleGoogleLogin = async () => { 
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;  
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef); 
      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: serverTimestamp(),
        });
      } 

      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
    }
  };
 
  return (
    <div className="login-container">
      <div className="login-left">
        <h2>Welcome to Context!</h2>
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