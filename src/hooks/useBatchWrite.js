import { db } from "../firebase/config";

import { writeBatch, doc, Timestamp } from "firebase/firestore";



export const useBatchWrite = (activeCId=null) => {
  let batch = writeBatch(db);

  const queueSet = (c, id, data, deleteSet=false, restore=null) => {
    if (!deleteSet){
      var createdAt = Timestamp.fromDate(new Date());
      var deletedAt = null
    }
    if (deleteSet && !restore) {
      createdAt = data.createdAt
      deletedAt = Timestamp.fromDate(new Date());
    }
    if (restore) {
      createdAt = data.createdAt
      deletedAt = null
    }
    let ref = doc(db, c, id);
    if (activeCId) {
      ref = doc(db, "company", activeCId, c, id)
    }
    batch.set(ref, { ...data, createdAt, deletedAt });
  };

  const queueUpdate = (c, id, data) => {
    let ref = doc(db, c, id);
    if (activeCId) {
      ref = doc(db, "company", activeCId, c, id);
    }
    batch.update(ref, data);
  };

  const queueDelete = (c, id) => {
    let ref = doc(db, c, id);
    if (activeCId) {
      ref = doc(db, "company", activeCId, c, id);
    }
    batch.delete(ref);
  };

  const queueCommit = async () => {
    try {
      await batch.commit();
      batch = writeBatch(db);
      return {
        success: true,
        error: null,
      };
    } catch (err) {
      batch = writeBatch(db);
      return {
        error: err.message,
        success: false,
      };
    }
  };
  return { queueSet, queueUpdate, queueDelete, queueCommit };
};
