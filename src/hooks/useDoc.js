import { useEffect, useState } from "react";

import { db } from "../firebase/config";
import { onSnapshot, doc } from "firebase/firestore";

export const useDoc = (collection, id, activeCId = null) => {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      console.log("cancelled");
      return;
    }
    let docRef = doc(db, collection, id);
    if (activeCId) {
      docRef = doc(db, "company", activeCId, collection, id);
    } // console.log(collection, id)

    const unsub = onSnapshot(
      docRef,
      (doc) => {
        if (doc.data()) {
          setDocument({ id: doc.id, ...doc.data() });

          setError(null);
        } else {
          setDocument(null);
        }
      },
      (err) => {
        console.log(err);
        setError(err.message);
      },
    );

    return () => unsub();
  }, [id, collection, activeCId]);

  const reset = () => setDocument(null)

  return { document, error, reset };
};
