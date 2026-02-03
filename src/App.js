/*
Main code editor interface. Loads the selected document,
provides auto-save functionality, and supports collaboration.
*/

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import { useAuth } from "./hooks/useAuth";
import { useDocument } from "./hooks/useDocument";
import { useAutoSave } from "./hooks/useAutoSave";
import { codeExecutionService } from "./services/codeExecutionService";
import CollabModal from "./CollabModal";
import LoadingSpinner from "./components/LoadingSpinner";
import toast from "react-hot-toast";
import { DEFAULT_FONT_SIZE, MIN_FONT_SIZE, MAX_FONT_SIZE } from "./utils/constants";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [title, setTitle] = useState("Untitled Document");
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [showCollab, setShowCollab] = useState(false);
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  
  const { document: firestoreDoc, loading, error, permission } = useDocument(id, user?.uid);
  
  const { isSaving, lastSaved, saveError } = useAutoSave(
    id,
    { code, language, title },
    !!user && permission.canWrite
  );
  
  useEffect(() => {
    setIsInitialized(false);
  }, [id]);
  
  useEffect(() => {
    if (!user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);
  
  useEffect(() => {
    if (error) {
      toast.error(error);
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  }, [error, navigate]);
  
  useEffect(() => {
    if (firestoreDoc && !isInitialized) {
      setCode(firestoreDoc.code || "");
      setLanguage(firestoreDoc.language || "plaintext");
      setTitle(firestoreDoc.title || "Untitled Document");
      window.document.title = firestoreDoc.title || "Collaborative Code Editor";
      setIsInitialized(true);
    }
  }, [firestoreDoc, isInitialized]);
  
  useEffect(() => {
    if (saveError) {
      toast.error(`Auto-save failed: ${saveError}`);
    }
  }, [saveError]);

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const extMap = {
      python: "py",
      java: "java",
      c: "c",
      plaintext: "txt",
    };
    const ext = extMap[language] || "txt";
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "code"}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("File downloaded");
  };
  
  const runCode = async () => {
    if (isExecuting || language === "plaintext") {
      if (language === "plaintext") {
        toast.error("Please select a programming language");
      }
      return;
    }
    
    setIsExecuting(true);
    setOutput("Running...");
    
    try {
      const result = await codeExecutionService.executeCode(code, language);
      setOutput(result.output);
      
      if (result.success) {
        toast.success("Code executed successfully");
      } else {
        toast.error("Code execution failed");
      }
    } catch (error) {
      setOutput(`❌ ${error.message}`);
      toast.error(error.message);
    } finally {
      setIsExecuting(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading document..." />;
  }
  
  if (!permission.canRead) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "white" }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to view this document.</p>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    );
  }
 
  return (
    <>
      <div className="settings-bar">
        <button 
          className="standard-button" 
          onClick={() => navigate("/dashboard")}
          aria-label="Back to dashboard"
        >
          Back
        </button>
        
        <input 
          className="standard-button title-input" 
          value={title} 
          onChange={(e) => setTitle(e.target.value.slice(0, 100))}
          disabled={!permission.canWrite}
          placeholder="Document title"
          aria-label="Document title"
        />
        
        <button 
          className="standard-button" 
          onClick={handleDownload}
          aria-label="Download file"
        >
          Download
        </button>
        
        <button 
          className="standard-button" 
          onClick={() => setShowCollab(true)}
          disabled={!permission.isOwner}
          title={permission.isOwner ? "Invite collaborators" : "Only owner can invite"}
          aria-label="Collaboration settings"
        >
          Collab
        </button>
        
        <button 
          className="standard-button" 
          onClick={() => setFontSize((prev) => Math.min(prev + 2, MAX_FONT_SIZE))}
          aria-label="Increase font size"
        >
          +
        </button>
        
        <button 
          className="standard-button" 
          onClick={() => setFontSize((prev) => Math.max(prev - 2, MIN_FONT_SIZE))}
          aria-label="Decrease font size"
        >
          -
        </button>
        
        <select 
          className="standard-button" 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          disabled={!permission.canWrite}
          aria-label="Select programming language"
        >
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c">C</option>
          <option value="plaintext">Plain Text</option>
        </select>
        
        <button 
          className="standard-button run-button" 
          onClick={runCode}
          disabled={isExecuting || language === "plaintext"}
          aria-label="Run code"
        >
          {isExecuting ? "Running..." : "Run"}
        </button>
        
        {isSaving && (
          <span className="save-indicator" aria-live="polite">Saving...</span>
        )}
        {lastSaved && !isSaving && (
          <span className="save-indicator" aria-live="polite">
            Saved {new Date(lastSaved).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="editor-container">
        <div className="editor-wrapper">
          <Editor
            height="100%"
            width="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => permission.canWrite && setCode(value || "")}
            options={{
              fontSize,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              readOnly: !permission.canWrite,
            }}
            loading={<LoadingSpinner message="Loading editor..." />}
          />
        </div>
        
        <div className="compiler-pane" role="region" aria-label="Code output">
          <div className="compiler-box">
            <p>Compiler Output</p>
            <hr />
            <div className="output-container">
              <pre className="output-pre">{output || "Run your code to see output here"}</pre>
            </div>
          </div>
        </div>
      </div>

      {showCollab && (
        <CollabModal
          user={user}
          code={code}
          language={language}
          docId={id}
          onClose={() => setShowCollab(false)}
        />
      )}
    </>
  );
}

export default App; 