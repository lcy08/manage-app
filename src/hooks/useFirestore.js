import { db } from "../firebase/config";

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

export const useFirestore = (c, activeCId=null) => {
  let collectionRef = collection(db, c)
  if (activeCId) {
    collectionRef = collection(db, "company", activeCId, c);
  }
  // addDocument
  const addDocument = async (document) => {
    try {
      const createdAt = Timestamp.fromDate(new Date());
      await addDoc(collectionRef, { ...document, createdAt });
      return {
        error: null,
        success: true,
      };
    } catch (err) {
      return {
        error: err.message,
        success: false,
      };
    }
  };

  const setDocument = async (id, document) => {

    let docRef = doc(db, c, id);
    if (activeCId) {
      docRef = doc(db, "company", activeCId, c, id);
    }

    try {
      const createdAt = Timestamp.fromDate(new Date());
      await setDoc(docRef, { ...document, createdAt });
      return {
        error: null,
        success: true,
      };
    } catch (err) {
      return {
        error: err.message,
        success: false,
      };
    }
  };

  const updateDocument = async (id, updates) => {
    let docRef = doc(db, c, id);
    if (activeCId) {
      docRef = doc(db, "company", activeCId, c, id);
    }

    try {
      await updateDoc(docRef, updates);
      return {
        error: null,
        success: true,
      };
    } catch (err) {
      return {
        error: err.message,
        success: false,
      };
    }
  };

  const deleteDocument = async (id) => {

    let docRef = doc(db, c, id);
    if (activeCId) {
      docRef = doc(db, "company", activeCId, c, id);
    }

    try {
      await deleteDoc(docRef);
      return {
        error: null,
        success: true,
      };
    } catch (err) {
      return {
        error: err.message,
        success: false,
      };
    }
  };

  return { addDocument, setDocument, updateDocument, deleteDocument };
};
