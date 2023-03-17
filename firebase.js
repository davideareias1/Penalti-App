import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD6mF9RC2eo-AYTDOsJbMmPYjfRdi7ZeKo",
  authDomain: "best-85ea0.firebaseapp.com",
  projectId: "best-85ea0",
  storageBucket: "best-85ea0.appspot.com",
  messagingSenderId: "1094750092696",
  appId: "1:1094750092696:web:c7fee1bb4ff09a4b157fed",
  measurementId: "G-Y5VJLBHT76",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const store = getStorage(app);

export { db, auth, store };
