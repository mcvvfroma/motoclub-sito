'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      
      const userDoc = await getDoc(doc(db, 'users', cleanEmail));
      if (userDoc.exists()) {
        router.push('/');
        setTimeout(() => window.location.reload(), 500);
      } else {
        setError("Accesso negato: utente non trovato nel database soci.");
      }
    } catch (err: any) {
      setError("Email o password errati.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      setError("Inserisci la tua email per procedere.");
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('Verifica in corso...');

    try {
      // 1. Controlla se il socio esiste nel Database Firestore
      const userDoc = await getDoc(doc(db, 'users', cleanEmail));
      
      if (!userDoc.exists()) {
        setError("Questa email non risulta tra i soci autorizzati.");
        setMessage('');
        setLoading(false);
        return;
      }

      // 2. Prova a mandare la mail di reset
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        setMessage("Email di configurazione inviata! Controlla la tua posta.");
      } catch (resetErr: any) {
        // 3. Se l'utente non esiste ancora in Authentication, lo creiamo al volo
        if (resetErr.code === 'auth/user-not-found') {
          const tempPassword = Math.random().toString(36).slice(-12); // Password casuale sicura
          await createUserWithEmailAndPassword(auth, cleanEmail, tempPassword);
          await sendPasswordResetEmail(auth, cleanEmail);
          setMessage("Primo accesso rilevato! Ti abbiamo inviato una mail per impostare la tua password.");
        } else {
          throw resetErr;
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Errore durante l'operazione. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm border rounded-xl shadow-lg bg-card p-6">
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo_motoclub.gif" alt="Logo" width={70} height={70} className="mb-2" />
          <h1 className="text-xl font-bold italic">Moto Club VVF Roma</h1>
          <p className="text-xs text-muted-foreground">Area Riservata Soci</p>
        </div>
        
        <form onSubmit={handleLogin} className="grid gap-4">
          {error && <div className="p-2 bg-red-100 text-red-700 text-[10px] rounded border border-red-200 text-center">{error}</div>}
          {message && <div className="p-2 bg-blue-50 text-blue-700 text-[10px] rounded border border-blue-200 text-center">{message}</div>}
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email Socio</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tua@email.it" required />
          </div>
          
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <button 
                type="button" 
                onClick={handleResetPassword}
                className="text-[10px] text-blue-600 hover:underline font-medium"
              >
                Primo accesso / Password dimenticata?
              </button>
            </div>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
            {loading ? "Attendi..." : "ACCEDI ALL'AREA SOCI"}
          </Button>
        </form>
      </div>
    </div>
  );
}