'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/events');
    } catch (err: any) {
      setLoading(false);
      console.error("DEBUG FIREBASE:", err);
      // Mostriamo l'errore tecnico reale per capire cosa blocca Google
      setError(`Errore: ${err.message || err.code}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
      <div className="w-full max-w-md bg-gray-900/90 p-10 rounded-3xl border border-red-600/40 shadow-2xl backdrop-blur-md text-center">
        
        <div className="flex justify-center mb-6">
          <Image src="/logo_motoclub.gif" alt="Logo" width={100} height={100} />
        </div>

        <h1 className="text-white text-2xl font-black mb-2 uppercase italic tracking-tighter">Accesso Area Soci</h1>
        <p className="text-red-600 text-xs font-bold uppercase tracking-widest mb-8 text-center">Moto Club VV.F. Roma</p>
        
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <input 
            type="email" placeholder="Email" 
            className="w-full bg-black border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-red-600 transition-all"
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full bg-black border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-red-600 transition-all"
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
          
          {error && (
            <div className="bg-red-900/50 border border-red-600 text-red-200 p-4 rounded-xl text-[10px] font-mono break-all leading-tight">
              {error}
            </div>
          )}
          
          <button 
            type="submit" disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest"
          >
            {loading ? 'Verifica...' : 'Entra nel Portale'}
          </button>
        </form>

        <p className="mt-8 text-[10px] text-gray-600 uppercase tracking-widest opacity-50">
          Riservato ai soci RideRoute Roma
        </p>
      </div>
    </div>
  );
}