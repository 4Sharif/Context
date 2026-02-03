/*
Modal that opens when "Collab" is clicked. 
Lets users enter an email address and send 
a collaboration invite via EmailJS.
*/

import React, { useState } from "react";
import "./CollabModal.css";
import { sendSharedCode, inviteUser } from "./sendEmail";
import { documentService } from "./services/documentService";
import { validateEmail } from "./utils/validation";
import toast from "react-hot-toast";
import {
  collection, 
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const CollabModal = ({ user, code, language, onClose, docId }) => {
  const [mode, setMode] = useState("Share");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!email || !validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (email.toLowerCase() === user.email.toLowerCase()) {
      toast.error("You cannot invite yourself");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "Share") {
        const result = await sendSharedCode({
          fromEmail: user.email,
          toEmail: email,
          codeContent: code,
          language,
        });

        if (result.success) {
          toast.success("Code sent successfully!");
          onClose();
        } else {
          toast.error("Failed to send code. Please try again.");
        }
      } else if (mode === "Invite") {
        if (!user || !user.email || !docId) {
          toast.error("Missing user or document info");
          return;
        }

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          toast.error("That email does not have an account with us");
          return;
        }

        const invitedUserDoc = querySnapshot.docs[0];
        const invitedUID = invitedUserDoc.id;

        await documentService.addCollaborator(docId, invitedUID);

        const collabLink = `${window.location.origin}/editor/${docId}`;
        const inviteResult = await inviteUser(email, user.email, collabLink);

        if (inviteResult.success) {
          toast.success("Invite sent successfully!");
          onClose();
        } else {
          toast.error("Failed to send email invite");
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to send invite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="collab-modal-title"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="collab-modal-title">Collaborate</h2>
        <div className="mode-buttons">
          <button
            className={mode === "Share" ? "active" : ""}
            onClick={() => setMode("Share")}
            aria-label="Share code mode"
          >
            Share
          </button>
          <button
            className={mode === "Invite" ? "active" : ""}
            onClick={() => setMode("Invite")}
            aria-label="Invite collaborator mode"
          >
            Invite
          </button>
        </div>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          aria-label="Email address"
        />
        <div className="action-buttons">
          <button 
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : mode === "Share" ? "Send Code" : "Send Invite"}
          </button>
          <button onClick={onClose} disabled={isLoading}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CollabModal;