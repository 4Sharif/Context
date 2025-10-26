/*
Main code editor interface. Loads the selected 
(or new) document, allows manual saving of 
changes (title, code, language), and supports 
collaboration invites.
*/

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import CollabModal from "./CollabModal";
import axios from "axios";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const { id } = useParams(); // DocumentID from URL

  // State for document properties
  const [code, setCode] = useState("// New document");
  const [language, setLanguage] = useState("plaintext");
  const [title, setTitle] = useState("Untitled Document");
  const [fontSize, setFontSize] = useState(16);
  const [user, setUser] = useState(null);
  const [showCollab, setShowCollab] = useState(false);

  // State for compiler pane output
  const [output, setOutput] = useState(""); // For storing execution output
  const [isExecuting, setIsExecuting] = useState(false); // To prevent multiple submissions

  // Fetches document and user on load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/");
      } else {
        setUser(currentUser);

        // Reference document from /documents/{docId}
        const docRef = doc(db, "documents", id);

        // Real-time listener for shared document
        const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();

            if (!data.owner || !Array.isArray(data.collaborators)) {
              console.warn("Waiting for document to initialize...");
              return;
            }

            const isOwner = data.owner === currentUser.uid;
            const isCollaborator = data.collaborators.includes(currentUser.uid);

            if (!isOwner && !isCollaborator) {
              alert("You do not have permission to view this document.");
              navigate("/dashboard");
              return;
            }

            setCode(data.code || "");
            setLanguage(data.language || "plaintext");
            setTitle(data.title || "Untitled Document");
            document.title = data.title || "Collaborative Code Editor";
          } else {
            navigate("/dashboard");
          }
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribe();
  }, [id, navigate]);

  // Save current document state to firestore
  const handleSave = async () => {
    if (!user) return;

    const docRef = doc(db, "documents", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const isOwner = data.owner === user.uid;
      const isCollaborator = data.collaborators?.includes(user.uid);

      if (!isOwner && !isCollaborator) {
        alert("You do not have permission to edit this document.");
        return;
      }

      await updateDoc(docRef, {
        code,
        language,
        title,
        lastEdited: serverTimestamp(),
      });

      alert("Document saved!");
    } else {
      alert("This document no longer exists.");
    }
  };

  // Download the code as a file based on selected language
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
    URL.revokeObjectURL(url); // Clean up blob
  };

  // Send code to Judge0 API for remote execution
  const runCode = async () => {
    if (isExecuting || language === "plaintext") return;

    setIsExecuting(true);
    setOutput("Running...");

    const languageIdMap = {
      python: 71,  
      java: 62,    
      c: 50,   
    };

    const languageId = languageIdMap[language];
    const submissionData = {
      source_code: code,
      language_id: languageId,
      stdin: "",
    };

    try {
      const response = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions",
        submissionData,
        {
          params: { base64_encoded: "false", wait: "true" },
          headers: {
            "content-type": "application/json",
            "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      const result = response.data;

      if (result.stdout) {
        setOutput(result.stdout);
      } else if (result.stderr) {
        setOutput(`Runtime Error:\n${result.stderr}`);
      } else if (result.compile_output) {
        setOutput(`Compilation Error:\n${result.compile_output}`);
      } else {
        setOutput("No output received.");
      }
    } catch (error) {
      console.error("Error executing the code:", error.response || error.message);
      setOutput("Error executing the code.");
    } finally {
      setIsExecuting(false);
    }
  };
 
  return (
    <>
      <div className="settings-bar">
        <button className="standard-button" onClick={() => navigate("/dashboard")}>Back</button>
        <input className="standard-button" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="standard-button" onClick={handleSave}>Save</button>
        <button className="standard-button" onClick={handleDownload}>Download</button>
        <button className="standard-button" onClick={() => setShowCollab(true)}>Collab</button>
        <button className="standard-button" onClick={() => setFontSize((prev) => prev + 2)}>+</button>
        <button className="standard-button" onClick={() => setFontSize((prev) => Math.max(prev - 2, 10))}>-</button>
        <select className="standard-button" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c">C</option>
          <option value="plaintext">Plain Text</option>
        </select>
        <button className="standard-button" onClick={runCode}>Run</button>
      </div>

      <div className="editor-container">
        <div className="editor-wrapper">
          <Editor
            height="100%"
            width="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              fontSize,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
            }}
          />
        </div>
        <div className="compiler-pane">
          <div className="compiler-box">
            <p>Compiler</p>
            <hr />
            <div className="output-container"> 
              <pre className="output-pre">{output}</pre>
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