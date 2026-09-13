// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzevHTDhW5DZHUZ85CADwFgSr4Slu6Z-E",
  authDomain: "manage-app-7f132.firebaseapp.com",
  projectId: "manage-app-7f132",
  storageBucket: "manage-app-7f132.firebasestorage.app",
  messagingSenderId: "767260553166",
  appId: "1:767260553166:web:b3f7e40bd17d432902059f",
};

// Initialize Firebase
initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();

export { db, auth };
