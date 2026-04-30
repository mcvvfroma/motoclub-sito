import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD2-vK9SYV2ljQ5_Cq5KETl8_CBG95bnjU",
  authDomain: "studio-6923057624-dea08.firebaseapp.com",
  projectId: "studio-6923057624-dea08",
  storageBucket: "studio-6923057624-dea08.firebasestorage.app",
  messagingSenderId: "582138073080",
  appId: "1:582138073080:web:fe9fbda987770a89c5d00d"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Versione ultra-compatibile per evitare errori di trasporto e CORS
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}),
  experimentalForceLongPolling: true,
});

const storage = getStorage(app);

// 1. Recupera utenti
export const getAuthorizedUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
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
    const docRef = await addDoc(collection(db, "users"), userData);
    return { id: docRef.id, ...userData };
  } catch (error) {
    console.error("Errore nell'aggiunta utente:", error);
    throw error;
  }
};

// 3. Rimuove utente (L'ultimo errore che vedevi!)
export const removeAuthorizedUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, "users", userId));
  } catch (error) {
    console.error("Errore nella rimozione utente:", error);
    throw error;
  }
};

export { app, auth, storage };