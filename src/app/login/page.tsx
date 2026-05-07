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
      const userDoc = await getDoc(doc(db, 'users', cleanEmail));
      
      if (!userDoc.exists()) {
        setError("Questa email non risulta tra i soci autorizzati.");
        setMessage('');
        setLoading(false);
        return;
      }

      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        setMessage("Email di configurazione inviata! Controlla la tua posta.");
      } catch (resetErr: any) {
        if (resetErr.code === 'auth/user-not-found') {
          const tempPassword = Math.random().toString(36).slice(-12);
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
          <h1 className="text-xl font-bold italic text-white uppercase">Moto Club VVF Roma</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Area Riservata Soci</p>
        </div>
        
        <form onSubmit={handleLogin} className="grid gap-4">
          {error && <div className="p-3 bg-red-900/30 text-red-500 text-[10px] rounded border border-red-900/50 text-center font-bold uppercase italic">{error}</div>}
          {message && <div className="p-3 bg-blue-900/30 text-blue-400 text-[10px] rounded border border-blue-900/50 text-center font-bold uppercase italic">{message}</div>}
          
          <div className="grid gap-2">
            <Label htmlFor="email" className="uppercase text-[10px] tracking-widest text-zinc-500">Email Socio</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tua@email.it" required className="bg-zinc-950 border-zinc-800" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="password" dclassName="uppercase text-[10px] tracking-widest text-zinc-500">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-zinc-950 border-zinc-800" />
          </div>
          
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase italic h-12 shadow-lg" disabled={loading}>
            {loading ? "Attendi..." : "ACCEDI ALL'AREA SOCI"}
          </Button>

          {/* PULSANTE MODIFICATO: PIÙ GRANDE, CENTRATO E EVIDENTE */}
          <div className="flex justify-center pt-4 border-t border-zinc-900 mt-2">
            <button 
              type="button" 
              onClick={handleResetPassword}
              className="text-xs text-zinc-400 hover:text-white font-black uppercase italic tracking-tight py-2 px-4 border border-zinc-800 rounded-lg bg-zinc-900/50 active:scale-95 transition-all"
            >
              Primo accesso / Password dimenticata?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}