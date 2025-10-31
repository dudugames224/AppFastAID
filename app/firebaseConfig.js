import { initializeApp, } from "firebase/app";
import { getAuth } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, setDoc } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDVoF0YcV3MzP5k23aB-ZohU9R_ZBUmSVE",
  authDomain: "fastaid-d89e6.firebaseapp.com",
  projectId: "fastaid-d89e6",
  storageBucket: "fastaid-d89e6.firebasestorage.app",
  messagingSenderId: "289911242003",
  appId: "1:289911242003:web:1c92fffa5d70ef5c95eee6",
  measurementId: "G-1JS2L14LT8"
};



const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { addDoc, app, auth, collection, db, deleteDoc, doc, getDocs, setDoc };

