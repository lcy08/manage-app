import { useState } from "react";

import { auth } from "../firebase/config"

import { signOut } from "firebase/auth";

import { useAuthContext } from "./useAuthContext";

export const useLogout = () => {
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const { dispatch } = useAuthContext()

  const logout = () => {
    setError(null)
    setIsPending(true)

    signOut(auth).then(() => {
      dispatch({ type: "LOGOUT" });

      setIsPending(false);
      setError(null);
    }).catch(err => {
      setIsPending(false);
      setError(err.message);
      console.log(err)
    })
  }
  return { logout, error, isPending };
}