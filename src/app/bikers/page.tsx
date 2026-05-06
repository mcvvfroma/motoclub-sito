'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Bike, Users, Camera, Loader2, User } from 'lucide-react';

export default function BikersPage() {
  const [bikers, setBikers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null);

  // 1. Recupero dati soci e dati utente corrente
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("cognome", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bikersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBikers(bikersList);
      
      // Trova l'utente corrente nella lista
      const me = bikersList.find(b => b.id === auth.currentUser?.email);
      if (me) setCurrentUserData(me);
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Logica di compressione immagine (Base64)
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 150; // Dimensione piccola per non appesantire il DB
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Qualità 70%
        };
      };
    });
  };

  // 3. Funzione di caricamento
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser?.email) return;

    setUploading(true);
    try {
      const optimizedImage = await resizeImage(file);
      const userRef = doc(db, "users", auth.currentUser.email);
      await updateDoc(userRef, { photoURL: optimizedImage });
    } catch (error) {
      console.error("Errore caricamento:", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-zinc-400 font-black uppercase tracking-widest animate-pulse italic">
      In sella...
    </div>
  );

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 bg-black min-h-screen">
      
      {/* SEZIONE PROFILO PERSONALE (Solo per l'utente loggato) */}
      {currentUserData && (
        <div className="mb-12 flex flex-col items-center justify-center border-b border-zinc-900 pb-10">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full border-4 border-red-600 overflow-hidden bg-zinc-900 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              {currentUserData.photoURL ? (
                <img src={currentUserData.photoURL} alt="Tu" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full bg-zinc-950">
                   <User className="h-12 w-12 text-zinc-800" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-red-600 p-2.5 rounded-full cursor-pointer hover:bg-red-700 transition-all border-4 border-black group-hover:scale-110">
              {uploading ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>
          <h2 className="mt-4 text-2xl font-black text-white uppercase italic tracking-tighter">
            {currentUserData.nome} {currentUserData.cognome}
          </h2>
          <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] italic">Il Tuo Profilo Biker</span>
        </div>
      )}

      {/* TESTATA LISTA SOCI */}
      <div className="flex items-center gap-3 mb-10">
        <Bike className="h-8 w-8 text-red-600 shrink-0" />
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            The Bikers
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mt-1">
            Motoclub VVF Roma
          </p>
        </div>
      </div>

      {/* GRIGLIA SOCI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {bikers.map((biker) => (
          <Card 
            key={biker.id} 
            className="border border-zinc-900 bg-zinc-950/40 hover:border-red-600/50 transition-all duration-300 group overflow-hidden"
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center group-hover:border-red-600/50 transition-colors">
                {biker.photoURL ? (
                  <img src={biker.photoURL} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                ) : (
                  <Users className="h-5 w-5 text-zinc-700 group-hover:text-red-600" />
                )}
              </div>
              
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter">Socio</span>
                <p className="text-sm font-black uppercase italic tracking-tight text-white group-hover:text-red-500 transition-colors truncate">
                  {biker.nome} {biker.cognome}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CONTATORE IN BASSO */}
      <div className="mt-12 flex justify-center">
        <div className="bg-zinc-900/50 border border-zinc-800 px-6 py-2 rounded-full">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
            Squadra: <span className="text-red-600">{bikers.length}</span> Membri
          </p>
        </div>
      </div>
    </div>
  );
}