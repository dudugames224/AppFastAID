import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, setDoc, updateDoc } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyDVoF0YcV3MzP5k23aB-ZohU9R_ZBUmSVE",
  authDomain: "fastaid-d89e6.firebaseapp.com",
  projectId: "fastaid-d89e6",
  storageBucket: "fastaid-d89e6.firebasestorage.app",
  messagingSenderId: "289911242003",
  appId: "1:289911242003:web:1c92fffa5d70ef5c95eee6",
  measurementId: "G-1JS2L14LT8"
};



let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
function Sair(){
  auth.signOut();
}

export { addDoc, app, auth, collection, db, deleteDoc, doc, getDoc, getDocs, Sair, setDoc, updateDoc };
export { onSnapshot };
export const getUserData = async () => {
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
  }
  return null; 

};

export const getAllUsers = async () => {
  try {
    const usersCollectionRef = collection(db, "users");
    const querySnapshot = await getDocs(usersCollectionRef);
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return users;
  } catch (error) {
    console.error("Erro ao buscar todos os usuários:", error);
    return [];
  }
};

export const updateUserAvatar = async (userId, avatar) => {
  if (!userId || !avatar) return false;
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      avatar: avatar
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar o avatar do usuário:", error);
    return false;
  }
};
