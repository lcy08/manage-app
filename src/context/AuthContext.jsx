import { createContext, useReducer, useEffect } from "react";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        activeCId: action.payload.cId,
        displayName: action.payload.displayName,
        status: action.payload.status,
        compList: action.payload.compList,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        activeCId: null,
        displayName: null,
        status: null,
        compList: null,
      };
    case "AUTH_IS_READY":
      return {
        ...state,
        authIsReady: true,
        user: action.payload.user,
        activeCId: action.payload.cId,
        displayName: action.payload.displayName,
        status: action.payload.status,
        compList: action.payload.compList,
      };
  }
};
/**
 *
 *
 * @param {*} { children }
 * @return {*} AuthContext with authentication value provided
 */
const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    activeCId: null,
    authIsReady: false,
    displayName: null,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);

        const userData = await getDoc(userRef);
        const cId = userData.data().activeCId;
        const displayName = userData.data().displayName;
        const status = userData.data().status;
        const compList = userData.data().companyId;

        dispatch({
          type: "AUTH_IS_READY",
          payload: { user, cId, displayName, status, compList },
        });
      } else {
        dispatch({
          type: "AUTH_IS_READY",
          payload: {
            user,
            cId: null,
            displayName: null,
            status: null,
            compList: null,
          },
        });
      }
      unsub();
    });
  }, []);

  // ANCHOR[epic=AuthContext Logging]: when login logout error, check with this
  // console.log("AuthContext state:", state);

  return <AuthContext value={{ ...state, dispatch }}>{children}</AuthContext>;
};

export { AuthContext, AuthContextProvider }
