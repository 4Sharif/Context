/*
Handles google sign-in using firebase authentication. 
On successful logins, stores user info in firestore and 
navigates to the dashboard.
*/

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import toast from "react-hot-toast";
import codeImage from "./code_image.jpg";
import "./App.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Context";
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
 
  const handleGoogleLogin = async () => { 
    setIsLoading(true);
    try {
      await signIn();
      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className="login-container">
      <div className="login-left">
        <h2>Welcome to Context!</h2>
        <button 
          className="google-btn" 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          aria-label="Sign in with Google"
        >
          {isLoading ? "Signing in..." : "Please login with Google"}
        </button>
      </div>
      <div className="login-right">
        <img src={codeImage} alt="Coding background" />
      </div>
    </div>
  );
};

export default LoginPage;