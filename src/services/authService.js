/*
Service layer for authentication operations.
Handles Google sign-in, sign-out, and user creation in Firestore.
*/

import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, provider, db } from "../firebaseConfig";
import logger from "../utils/logger";

export const authService = {
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: serverTimestamp(),
        });
        logger.debug("New user created:", user.uid);
      }
      
      return user;
    } catch (error) {
      logger.error("Sign in error:", error);
      
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Sign-in cancelled");
      } else if (error.code === "auth/network-request-failed") {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error("Failed to sign in. Please try again.");
      }
    }
  },

  async signOut() {
    try {
      await firebaseSignOut(auth);
      logger.debug("User signed out");
    } catch (error) {
      logger.error("Sign out error:", error);
      throw new Error("Failed to sign out");
    }
  },

  onAuthStateChanged(callback) {
    return firebaseOnAuthStateChanged(auth, callback);
  },

  getCurrentUser() {
    return auth.currentUser;
  },
};
