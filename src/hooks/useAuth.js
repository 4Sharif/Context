/*
Custom hook and context provider for authentication state management.
Provides user state, loading state, and auth functions throughout the app.
*/

import { useState, useEffect, createContext, useContext } from "react";
import { authService } from "../services/authService";
import logger from "../utils/logger";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      logger.debug("Auth state changed:", currentUser?.uid || "signed out");
    });
    
    return unsubscribe;
  }, []);
  
  const signIn = async () => {
    try {
      setError(null);
      const user = await authService.signInWithGoogle();
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };
  
  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };
  
  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
