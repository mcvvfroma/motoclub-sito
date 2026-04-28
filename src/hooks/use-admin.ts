'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Questo è l'UID che dovrà essere sostituito con il tuo
const ADMIN_UID = 'zW9bY4v3Z8V7a2X6c5E9F1gH3'; // Placeholder

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // ***ECCO IL TUO UID!***
        // Apri la console del browser (F12) per vederlo dopo il login
        console.log('UID Utente Loggato:', currentUser.uid);

        setUser(currentUser);
        setIsAdmin(currentUser.uid === ADMIN_UID);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isLoading, isAdmin, user };
};
