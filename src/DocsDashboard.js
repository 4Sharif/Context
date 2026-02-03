/*
Displays the user's saved documents. Allows them 
to create new documents or delete existing ones.
*/

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useDocuments } from "./hooks/useDocuments";
import { documentService } from "./services/documentService";
import LoadingSpinner from "./components/LoadingSpinner";
import toast from "react-hot-toast";
import "./index.css";

function DocsDashboard() {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const { user, signOut: authSignOut } = useAuth();
  const { documents, loading, error, refetch } = useDocuments(user?.uid);

  useEffect(() => {
    document.title = "Dashboard";
    if (!user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);  

  const handleNewDoc = async () => {
    if (!user) return;
    
    try {
      const docId = await documentService.createDocument(user.uid);
      toast.success("Document created");
      navigate(`/editor/${docId}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document? This cannot be undone.")) {
      return;
    }
    
    try {
      await documentService.deleteDocument(id);
      toast.success("Document deleted");
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "N/A";
    const d = timestamp.toDate();
    return d.toLocaleDateString("en-US") + ", " + d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const toggleSettings = () => setShowSettings(!showSettings);

  const handleLogout = async () => {
    try {
      await authSignOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading your documents..." />;
  }
 
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
          <h1 className="logo">Dashboard</h1>
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
          {documents.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>
              No documents yet. Click the + button to create one!
            </p>
          ) : (
            <ul>
              <div className="doc-scroll-container">
                {documents.map((document) => (
                  <li key={document.id}>
                    <button
                      className="doc-link"
                      onClick={() => navigate(`/editor/${document.id}`)}
                    >
                      <span>Title: "{document.title}"</span> ––{" "}
                      <span>Last Edited: {formatDate(document.lastEdited)}</span> ––{" "} 
                      <span>Date Created: {formatDate(document.createdAt)}</span>
                    </button>
                    {document.owner === user?.uid ? (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default DocsDashboard;