import { useState } from "react";

import { db, auth } from "../firebase/config";

import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

import { useAuthContext } from "./useAuthContext";

export const useLogin = () => {
  // const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    setError(null);
    setIsPending(true);

    signInWithEmailAndPassword(auth, email, password)
      .then(async (res) => {
        const userRef = doc(db, "users", res.user.uid);

        const userData = await getDoc(userRef);
        const cId = userData.data().activeCId;
        const displayName = userData.data().displayName;
        const status = userData.data().status
        const compList = userData.data().companyId

        dispatch({
          type: "LOGIN",
          payload: {
            user: res.user,
            cId,
            displayName,
            status,
            compList,
          },
        });

        setError(null);
        setIsPending(false);
      })
      .catch((err) => {
          setError(err.message);
          console.log(err.message);
          setIsPending(false)
      });
  };

  // useEffect(() => {
  //   return () => {
  //     setIsCancelled(true);
  //   };
  // }, []);

  return { login, isPending, error };
};
