import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD2-vK9SYV2ljQ5_Cq5KETl8_CBG95bnjU",
  authDomain: "rideroute-ufficiale.firebaseapp.com",
  projectId: "rideroute-ufficiale",
  storageBucket: "rideroute-ufficiale.appspot.com",
  messagingSenderId: "367355152864",
  appId: "1:367355152864:web:65f727c62b406e10787e9e"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 1. Recupera utenti
export const getAuthorizedUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "authorized_users"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Errore nel recupero utenti:", error);
    return [];
  }
};

// 2. Aggiunge utente
export const addAuthorizedUser = async (userData: any) => {
  try {
    const docRef = await addDoc(collection(db, "authorized_users"), userData);
    return { id: docRef.id, ...userData };
  } catch (error) {
    console.error("Errore nell'aggiunta utente:", error);
    throw error;
  }
};

// 3. Rimuove utente (L'ultimo errore che vedevi!)
export const removeAuthorizedUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, "authorized_users", userId));
  } catch (error) {
    console.error("Errore nella rimozione utente:", error);
    throw error;
  }
};

export { app, auth, db, storage };