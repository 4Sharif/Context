/*
Custom hook for auto-saving document changes with throttling.
Automatically saves changes every 2 seconds (max) to prevent excessive writes.
*/

import { useState, useEffect, useRef, useCallback } from "react";
import throttle from "lodash.throttle";
import { documentService } from "../services/documentService";
import logger from "../utils/logger";

export const useAutoSave = (docId, data, enabled = true) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  
  const saveToFirestoreRef = useRef();
  
  saveToFirestoreRef.current = async (dataToSave) => {
    if (!enabled || !docId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      await documentService.updateDocument(docId, dataToSave);
      setLastSaved(new Date());
      logger.debug("Auto-save successful");
    } catch (error) {
      setSaveError(error.message);
      logger.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const throttledSave = useRef(
    throttle((data) => {
      saveToFirestoreRef.current(data);
    }, 2000, { leading: false, trailing: true })
  ).current;
  
  const prevDataRef = useRef();
  
  useEffect(() => {
    const dataString = JSON.stringify(data);
    const prevDataString = JSON.stringify(prevDataRef.current);
    
    if (data && enabled && docId && dataString !== prevDataString) {
      logger.debug("Auto-save triggered", { docId, enabled, data });
      throttledSave(data);
      prevDataRef.current = data;
    }
  }, [data, enabled, docId, throttledSave]);
  
  useEffect(() => {
    return () => {
      throttledSave.cancel();
    };
  }, [throttledSave]);
  
  return { isSaving, lastSaved, saveError };
};
