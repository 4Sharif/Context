/*
Displays the user's saved documents. Allows them 
to create new documents or delete existing ones.
*/

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  query, 
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./index.css";

function DocsDashboard() {
  const [user, setUser] = useState(null); // Logged-in user object
  const [docs, setDocs] = useState([]); // User's documents list
  const [showSettings, setShowSettings] = useState(false); // Toggles side tab
  const navigate = useNavigate();

  // Handles user authentication and fetches docs when user logs in
  useEffect(() => {
    document.title = "CCE Dashboard";
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/"); // Redirect to login if not logged in
      } else {
        setUser(currentUser);
        fetchDocs(currentUser.uid); // Load user's documents
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetches all documents for the given user from firestore
  const fetchDocs = async (uid) => {
    const q = query(collection(db, "documents"));
    const querySnapshot = await getDocs(q);
  
    // Only include docs where the user is owner or collaborator
    const docsData = querySnapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      .filter((doc) => {
        return doc.owner === uid || (doc.collaborators || []).includes(uid);
      });
  
    // Sort by last edited time, newest first
    docsData.sort((a, b) => {
      const aTime = a.lastEdited?.toDate?.() ?? new Date(0);
      const bTime = b.lastEdited?.toDate?.() ?? new Date(0);
      return bTime - aTime;
    });
  
    setDocs(docsData);
  };  

  // Creates a new empty document in firestore and navigates to the editor
  const handleNewDoc = async () => {
    try {
      const docRef = await addDoc(collection(db, "documents"), {
        owner: user.uid,
        collaborators: [],
        code: "",
        language: "plaintext",
        title: "Untitled",
        createdAt: serverTimestamp(),
        lastEdited: serverTimestamp(),
      });
  
      console.log(" New document created:", docRef.id); // Add this log
      navigate(`/editor/${docRef.id}`);
    } catch (error) {
      console.error("Error creating document:", error); // Catch errors creating doc
    }
  };

  // Deletes a document by its ID and refreshes the list
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "documents", id));
    fetchDocs(user.uid); // Refresh list after deletion
  };

  // Formats firestore timestamp to MM/DD/YYYY or returns "N/A"
  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "N/A";
    const d = timestamp.toDate();
    return d.toLocaleDateString("en-US") + ", " + d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Toggles visibility of the settings sidebar
  const toggleSettings = () => setShowSettings(!showSettings);

  // Signs user out and redirects to login page
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // JSX layout for dashboard page
  return (
    <div className="dashboard-container">
      <div className={`settings-tab ${showSettings ? "open" : ""}`}>
        <button onClick={toggleSettings} className="toggle-settings">☰</button>
        {showSettings && (
          <div className="settings-content">
            <p>Settings:</p>
            <button className="aboutus-button" onClick={() => navigate("/about")}>About Us</button>
            <button className="aboutus-button" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>

      <div className="main-dashboard">
        <div className="dashboard-header">
          <h1 className="logo">CCE Dashboard</h1>
          <div className="user-info">
            <p>Welcome</p>
            <strong>{user?.displayName || "User"}</strong>
          </div>
        </div>

        <div className="dashboard-controls">
          <button className="new-doc-button" onClick={handleNewDoc}>+</button>
        </div>

        <div className="saved-documents">
          <h2>Saved Versions</h2>
          <ul>
          <div className="doc-scroll-container">
            {docs.map((document) => (
              <li key={document.id}>
                <button
                  className="doc-link"
                  onClick={() => navigate(`/editor/${document.id}`)}
                >
                  <span>Title: "{document.title}"</span> ––{" "}
                  <span>Last Edited: {formatDate(document.lastEdited)}</span> ––{" "} 
                  <span>Date Created: {formatDate(document.createdAt)}</span>
                </button>
                {document.owner === user.uid ? (
                <button
                  className="delete-button"
                  onClick={() => handleDelete(document.id)}
                >
                  Delete
                </button>
              ) : (
                <button
                  className="delete-button"
                  disabled
                  title="You are a collaborator"
                >
                  Collabing
                </button>
              )}
              </li>
            ))}
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DocsDashboard;