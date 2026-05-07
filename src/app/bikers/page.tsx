'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Bike, Users, User, Trophy, Medal, Loader2 } from 'lucide-react';

export default function BikersPage() {
  const [bikers, setBikers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState<any>(null);

  useEffect(() => {
    // 1. Carichiamo i soci dall'anagrafica
    const qUsers = query(collection(db, "users"), orderBy("cognome", "asc"));
    
    const unsubscribe = onSnapshot(qUsers, async (userSnapshot) => {
      // Mappiamo i dati assicurandoci che ogni campo abbia un valore di fallback
      const bikersList = userSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id.toLowerCase().trim(), // Email del socio
          nome: data.nome || "",
          cognome: data.cognome || "",
          uid: data.uid || "",
          photoURL: data.photoURL || "",
          participationCount: 0 
        };
      });

      try {
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const counts: { [key: string]: number } = {};
        const todayStr = new Date().toISOString().split('T')[0];

        for (const eventDoc of eventsSnapshot.docs) {
          const eventData = eventDoc.data();
          const eventDateStr = eventData.date;

          if (eventDateStr && eventDateStr <= todayStr) {
            const pSnap = await getDocs(collection(db, `events/${eventDoc.id}/participants`));
            
            pSnap.docs.forEach(pDoc => {
              const pData = pDoc.data();
              const pId = pDoc.id.toLowerCase().trim();
              const pEmail = (pData.email || "").toLowerCase().trim();
              
              // Nome completo del partecipante unificato per il confronto
              const pFullName = (pData.name || `${pData.nome || ""} ${pData.cognome || ""}`).toLowerCase().trim();

              bikersList.forEach(biker => {
                const bEmail = biker.id;
                const bFullName = `${biker.nome} ${biker.cognome}`.toLowerCase().trim();
                const bUid = biker.uid.toLowerCase().trim();

                // MATCH: Email, UID o Nome Completo (risolve il caso Giorgio Grippo)
                if (
                  (pEmail !== "" && pEmail === bEmail) || 
                  (pId === bUid && bUid !== "") ||
                  (pFullName !== "" && pFullName === bFullName)
                ) {
                  counts[bEmail] = (counts[bEmail] || 0) + 1;
                }
              });
            });
          }
        }

        const finalRank = bikersList.map(b => ({
          ...b,
          participationCount: counts[b.id] || 0
        })).sort((a, b) => b.participationCount - a.participationCount);

        setBikers(finalRank);

        const currentEmail = auth.currentUser?.email?.toLowerCase().trim();
        const me = finalRank.find(b => b.id === currentEmail);
        if (me) setCurrentUserData(me);
        
      } catch (err) {
        console.error("Errore nel calcolo presenze:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <Loader2 className="h-8 w-8 text-red-600 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest animate-pulse">Analisi presenze...</p>
    </div>
  );

  return (
    <div className="w-full py-8 px-4 bg-black min-h-screen pb-24 text-white">
      {currentUserData && (
        <div className="mb-12 flex flex-col items-center border-b border-zinc-900 pb-10">
          <div className="h-24 w-24 rounded-full border-2 border-red-600 overflow-hidden mb-4 bg-zinc-900">
            {currentUserData.photoURL ? (
              <img src={currentUserData.photoURL} alt="Profilo" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full"><User className="h-10 w-10 text-zinc-800" /></div>
            )}
          </div>
          <h2 className="text-xl font-black uppercase italic">{currentUserData.nome} {currentUserData.cognome}</h2>
          <div className="mt-2 bg-red-600 px-3 py-0.5 rounded-full text-[9px] font-black uppercase">
            Le mie uscite: {currentUserData.participationCount}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <Bike className="h-7 w-7 text-red-600" />
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">The Bikers</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bikers.map((biker, index) => (
          <Card key={biker.id} className="bg-zinc-950 border-zinc-900">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                  {biker.photoURL ? (
                    <img src={biker.photoURL} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="flex items-center justify-center h-full"><User className="h-5 w-5 text-zinc-800" /></div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {index === 0 && biker.participationCount > 0 && <Trophy className="h-3 w-3 text-yellow-500" />}
                    <p className="text-sm font-black uppercase italic truncate tracking-tight">
                      {biker.nome} {biker.cognome}
                    </p>
                  </div>
                  <p className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest leading-none">Team Member</p>
                </div>
              </div>
              <div className="flex flex-col items-end border-l border-zinc-900 pl-4 shrink-0">
                <span className="text-xl font-black italic text-red-600 leading-none">{biker.participationCount}</span>
                <span className="text-[8px] text-zinc-500 font-bold uppercase mt-1">Uscite</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}