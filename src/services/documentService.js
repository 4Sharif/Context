/*
Service layer for all Firestore document operations.
Provides clean API for components and handles errors consistently.
*/

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  serverTimestamp,
  onSnapshot 
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import logger from "../utils/logger";

export const documentService = {
  async getDocument(docId) {
    try {
      const docRef = doc(db, "documents", docId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      logger.error("Error fetching document:", error);
      throw new Error("Failed to load document");
    }
  },

  subscribeToDocument(docId, onUpdate, onError) {
    const docRef = doc(db, "documents", docId);
    
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate({ id: docSnap.id, ...docSnap.data() });
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        logger.error("Document subscription error:", error);
        onError(error);
      }
    );
  },

  async getUserDocuments(userId) {
    try {
      const ownedQuery = query(
        collection(db, "documents"),
        where("owner", "==", userId)
      );
      
      const collabQuery = query(
        collection(db, "documents"),
        where("collaborators", "array-contains", userId)
      );
      
      const [ownedSnapshot, collabSnapshot] = await Promise.all([
        getDocs(ownedQuery),
        getDocs(collabQuery)
      ]);
      
      const ownedDocs = ownedSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      const collabDocs = collabSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      const allDocs = [...ownedDocs, ...collabDocs];
      const uniqueDocs = Array.from(
        new Map(allDocs.map(doc => [doc.id, doc])).values()
      );
      
      uniqueDocs.sort((a, b) => {
        const aTime = a.lastEdited?.toDate?.() ?? new Date(0);
        const bTime = b.lastEdited?.toDate?.() ?? new Date(0);
        return bTime - aTime;
      });
      
      return uniqueDocs;
    } catch (error) {
      logger.error("Error fetching user documents:", error);
      throw new Error("Failed to load your documents");
    }
  },

  async createDocument(userId, initialData = {}) {
    try {
      const docRef = await addDoc(collection(db, "documents"), {
        owner: userId,
        collaborators: [],
        code: "",
        language: "plaintext",
        title: "Untitled",
        ...initialData,
        createdAt: serverTimestamp(),
        lastEdited: serverTimestamp(),
      });
      
      logger.debug("Document created:", docRef.id);
      return docRef.id;
    } catch (error) {
      logger.error("Error creating document:", error);
      throw new Error("Failed to create document");
    }
  },

  async updateDocument(docId, updates) {
    try {
      const docRef = doc(db, "documents", docId);
      await updateDoc(docRef, {
        ...updates,
        lastEdited: serverTimestamp(),
      });
      
      logger.debug("Document updated:", docId);
    } catch (error) {
      logger.error("Error updating document:", error);
      
      if (error.code === "permission-denied") {
        throw new Error("You don't have permission to edit this document");
      } else if (error.code === "not-found") {
        throw new Error("Document not found");
      } else {
        throw new Error("Failed to save document");
      }
    }
  },

  async deleteDocument(docId) {
    try {
      await deleteDoc(doc(db, "documents", docId));
      logger.debug("Document deleted:", docId);
    } catch (error) {
      logger.error("Error deleting document:", error);
      
      if (error.code === "permission-denied") {
        throw new Error("You don't have permission to delete this document");
      } else {
        throw new Error("Failed to delete document");
      }
    }
  },

  async addCollaborator(docId, userId) {
    try {
      const docRef = doc(db, "documents", docId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error("Document not found");
      }
      
      const collaborators = docSnap.data().collaborators || [];
      
      if (collaborators.includes(userId)) {
        logger.debug("User already a collaborator");
        return;
      }
      
      await updateDoc(docRef, {
        collaborators: [...collaborators, userId],
      });
      
      logger.debug("Collaborator added:", userId);
    } catch (error) {
      logger.error("Error adding collaborator:", error);
      throw new Error("Failed to add collaborator");
    }
  },

  async checkPermission(docId, userId) {
    try {
      const document = await this.getDocument(docId);
      
      if (!document) {
        return { canRead: false, canWrite: false, isOwner: false };
      }
      
      const isOwner = document.owner === userId;
      const isCollaborator = (document.collaborators || []).includes(userId);
      
      return {
        canRead: isOwner || isCollaborator,
        canWrite: isOwner || isCollaborator,
        isOwner,
      };
    } catch (error) {
      logger.error("Error checking permissions:", error);
      return { canRead: false, canWrite: false, isOwner: false };
    }
  },
};
