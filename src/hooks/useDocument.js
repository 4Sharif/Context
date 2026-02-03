/*
Custom hook for real-time document syncing and permission checking.
Subscribes to Firestore document changes and manages loading/error states.
*/

import { useState, useEffect } from "react";
import { documentService } from "../services/documentService";
import logger from "../utils/logger";

export const useDocument = (docId, userId) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState({
    canRead: false,
    canWrite: false,
    isOwner: false,
  });
  
  useEffect(() => {
    if (!docId || !userId) {
      setLoading(false);
      return;
    }
    
    let unsubscribe;
    
    documentService.checkPermission(docId, userId)
      .then((perm) => {
        setPermission(perm);
        
        if (!perm.canRead) {
          setError("You don't have permission to view this document");
          setLoading(false);
          return;
        }
        
        unsubscribe = documentService.subscribeToDocument(
          docId,
          (doc) => {
            if (doc) {
              setDocument(doc);
              setError(null);
            } else {
              setError("Document not found");
            }
            setLoading(false);
          },
          (err) => {
            setError(err.message || "Failed to load document");
            setLoading(false);
          }
        );
      })
      .catch((err) => {
        logger.error("Permission check failed:", err);
        setError("Failed to load document");
        setLoading(false);
      });
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [docId, userId]);
  
  return { document, loading, error, permission };
};
