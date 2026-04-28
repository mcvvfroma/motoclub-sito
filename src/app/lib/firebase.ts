import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "IL_TUO_API_KEY",
  authDomain: "IL_TUO_PROGETTO.firebaseapp.com",
  projectId: "IL_TUO_PROGETTO_ID",
  storageBucket: "IL_TUO_PROGETTO.appspot.com",
  messagingSenderId: "IL_TUO_ID",
  appId: "IL_TUO_APP_ID"
};

// Inizializza Firebase (evita doppie inizializzazioni)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };