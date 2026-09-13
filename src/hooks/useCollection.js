import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";

export const useCollection = (
  c,
  activeCId = null,
  order = null,
  w = null,
  secondOrder = null,
  secondWhere = null,
  thirdWhere = null,
) => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let dataRef = collection(db, c);
    if (activeCId) {
      dataRef = collection(db, "company", activeCId, c);
    }
    let q;

    if (order && !w && !secondOrder) {
      q = query(dataRef, orderBy(...order));
    } else if ((order && secondOrder && w, secondWhere, thirdWhere)) {
      q = query(
        dataRef,
        where(...w),
        where(...secondWhere),
        where(...thirdWhere),
        orderBy(...secondOrder),
        orderBy(...order),
      );
    } else if (order && secondOrder && w && secondWhere) {
      q = query(
        dataRef,
        where(...w),
        where(...secondWhere),
        orderBy(...secondOrder),
        orderBy(...order),
      );
    } else if (order && !secondOrder && w && secondWhere) {
      q = query(dataRef, where(...w), where(...secondWhere), orderBy(...order));
    } else if (!order && !secondOrder && w) {
      q = query(dataRef, where(...w));
    } else if (order && !secondOrder && w) {
      q = query(dataRef, where(...w), orderBy(...order));
    } else if (order && secondOrder && !w) {
      q = query(dataRef, orderBy(...order), orderBy(secondOrder));
    } else if (order && secondOrder && w) {
      q = query(
        dataRef,
        where(...w),
        orderBy(...order),
        orderBy(...secondOrder),
      );
    } else if ((!order, !w, !secondOrder)) {
      q = dataRef;
    }

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        let results = [];
        snapshot.docs.forEach((doc) => {
          results.push({ ...doc.data(), id: doc.id });
        });

        setDocuments(results);
        setError(null);
      },
      (err) => {
        console.log(err);
        setError("could not fetch the data");
      },
    );

    return () => unsub();
  }, [c, order, secondOrder, w, secondWhere, thirdWhere, activeCId]);

  return { documents, error };
};
