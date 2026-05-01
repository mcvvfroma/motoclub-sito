'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Bike, Users } from 'lucide-react';

export default function BikersPage() {
  const [bikers, setBikers] = useState<{ id: string; nome?: string; cognome?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recupera i soci dalla collezione 'users' ordinati per cognome
    const q = query(collection(db, "users"), orderBy("cognome", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bikersList = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome || '',
        cognome: doc.data().cognome || '',
      }));
      setBikers(bikersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="p-8 text-center text-zinc-400 font-bold uppercase tracking-widest animate-pulse">
      Caricamento Soci...
    </div>
  );

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      {/* TESTATA AGGRESSIVA */}
      <div className="flex items-center gap-3 mb-10 border-b border-zinc-800 pb-6">
        <Bike className="h-10 w-10 text-red-600 shrink-0" />
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white uppercase italic">
            The Bikers
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mt-1">
            La Famiglia del Motoclub VVF Roma
          </p>
        </div>
      </div>

      {/* GRIGLIA SOCI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {bikers.map((biker) => (
          <Card 
            key={biker.id} 
            className="border border-zinc-800 bg-zinc-950/40 hover:border-red-600/50 transition-all duration-300 group overflow-hidden"
          >
            <CardContent className="p-5 flex items-center gap-4">
              {/* Icona piccola per ogni socio */}
              <div className="h-8 w-8 rounded bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:bg-red-600/10 group-hover:border-red-600/30 transition-colors">
                <Users className="h-4 w-4 text-zinc-500 group-hover:text-red-600" />
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-black uppercase tracking-tighter mb-0.5">Socio</span>
                <p className="text-sm font-black uppercase italic tracking-tight text-white group-hover:text-red-500 transition-colors">
                  {biker.nome} {biker.cognome}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MESSAGGIO SE VUOTA */}
      {bikers.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-xl">
          <p className="text-zinc-600 italic font-bold uppercase tracking-widest text-sm">
            Nessun socio registrato al momento.
          </p>
        </div>
      )}

      {/* CONTATORE IN BASSO */}
      <div className="mt-12 flex justify-center">
        <div className="bg-red-600/10 border border-red-600/20 px-6 py-2 rounded-full">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">
            Totale Soci: {bikers.length}
          </p>
        </div>
      </div>
    </div>
  );
}