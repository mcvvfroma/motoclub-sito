
"use client";

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

// ID univoco dell'utente amministratore
const ADMIN_UID = 'zW9bY4v3Z8V7a2X6c5E9F1gH3'; // Sostituisci con il vero UID dell'admin da Firebase Authentication

/**
 * Hook per verificare se l'utente corrente è un amministratore.
 * @returns {object} Oggetto contenente lo stato di autenticazione e il ruolo di admin.
 *                  - isLoading: true se l'autenticazione è in corso.
 *                  - isAdmin: true se l'utente è loggato ed è un admin.
 *                  - user: l'oggetto User di Firebase se l'utente è loggato.
 */
export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Verifica se l'UID dell'utente corrente corrisponde a quello dell'admin
        setIsAdmin(currentUser.uid === ADMIN_UID);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    // Pulisce il listener quando il componente viene smontato
    return () => unsubscribe();
  }, [auth]);

  return { isLoading, isAdmin, user };
};
