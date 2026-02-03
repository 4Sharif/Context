/*
Custom hook for fetching user's documents with efficient queries.
Uses Firestore where() clauses to only fetch documents user owns or collaborates on.
*/

import { useState, useEffect, useCallback } from "react";
import { documentService } from "../services/documentService";

export const useDocuments = (userId) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchDocuments = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const docs = await documentService.getUserDocuments(userId);
      setDocuments(docs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  return { documents, loading, error, refetch: fetchDocuments };
};
