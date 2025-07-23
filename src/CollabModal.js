/*
Modal that opens when "Collab" is clicked. 
Lets users enter an email address and send 
a collaboration invite via EmailJS.
*/

import React, { useState } from "react";
import "./CollabModal.css";
import { sendSharedCode, inviteUser } from "./sendEmail";
import {
  collection, 
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const CollabModal = ({ user, code, language, onClose, docId }) => {
  const [mode, setMode] = useState("Share"); // "Share" (send code) or "Invite" (collab link)
  const [email, setEmail] = useState(""); // Email input state

  // Handles send action for either mode
  const handleSend = async () => {
    if (!email) {
      alert("Please enter a valid email.");
      return;
    }

    // Share mode: sends code snippet via email
    if (mode === "Share") {
      const result = await sendSharedCode({
        fromEmail: user.email,
        toEmail: email,
        codeContent: code,
        language,
      });

      if (result.success) {
        alert("Code sent successfully!");
        onClose();
      } else {
        alert("Failed to send code. Please try again.");
        console.error(result.error);
      }
    } 
    
    // Invite mode: adds invited user uid to collaborators and emails link
    else if (mode === "Invite") {
      try {
        if (!user || !user.email || !docId) {
          alert("Missing user or document info.");
          return;
        }

        // Look up the uid of the invited email in firebase auth users collection
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        console.log("querySnapshot empty:", querySnapshot.empty);
        if (!querySnapshot.empty) {
          console.log("Found user:", querySnapshot.docs[0].data());
        }

        if (querySnapshot.empty) {
          alert("Sorry! That email does not have an account with us :(");
          return;
        }

        const invitedUserDoc = querySnapshot.docs[0];
        const invitedUID = invitedUserDoc.id;

        // Add the invited user's uid to this doc's collaborators field
        const docRef = doc(db, "documents", docId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          alert("Document does not exist.");
          return;
        }
        
        const data = docSnap.data();
        
        // Ensure only the owner can update collaborators
        if (data.owner !== user.uid) {
          alert("Only the owner can invite collaborators.");
          return;
        }
        
        await updateDoc(docRef, {
          collaborators: arrayUnion(invitedUID),
        });
        console.log("Collaborator added:", invitedUID);

        console.log("Added collaborator UID:", invitedUID); 

        // Email the invite link
        const collabLink = `${window.location.origin}/editor/${docId}`;
        const inviteResult = await inviteUser(email, user.email, collabLink);

        if (inviteResult.success) {
          alert("Invite sent successfully!");
          onClose();
        } else {
          console.error("Email send failed:", inviteResult.error);
          alert("Failed to send email invite. Please try again.");
        }

      } catch (error) {
        console.error("Invite error:", error);
        alert("Failed to send invite. Please try again.");
      }
    }
  };

  // Modal layout (mode toggle, input, send/cancel)
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Collaborate</h2>
        <div className="mode-buttons">
          <button
            className={mode === "Share" ? "active" : ""}
            onClick={() => setMode("Share")}
          >
            Share
          </button>
          <button
            className={mode === "Invite" ? "active" : ""}
            onClick={() => setMode("Invite")}
          >
            Invite
          </button>
        </div>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="action-buttons">
          <button onClick={handleSend}>
            {mode === "Share" ? "Send Code" : "Send Invite"}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CollabModal;