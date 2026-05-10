'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import ImageUpload from '@/components/image-upload';
import { Bike, User, Trophy, Loader2, Edit, Shield } from 'lucide-react';

export default function BikersPage() {
  const [bikers, setBikers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [isMyImageModalOpen, setIsMyImageModalOpen] = useState(false);
  const [editingBiker, setEditingBiker] = useState<any>(null); // Per la modifica da parte dell'admin
  const { toast } = useToast();

  const isAdmin = currentUserData?.status === 'admin';

  useEffect(() => {
    const qUsers = query(collection(db, "users"), orderBy("cognome", "asc"));
    
    const unsubscribe = onSnapshot(qUsers, async (userSnapshot) => {
      const bikersList = userSnapshot.docs.map(doc => ({
        id: doc.id.toLowerCase().trim(),
        ...doc.data(),
        participationCount: 0
      }));

      try {
        // ... (logica calcolo presenze, rimane invariata)
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const counts: { [key: string]: number } = {};
        const todayStr = new Date().toISOString().split('T')[0];

        for (const eventDoc of eventsSnapshot.docs) {
          const eventData = eventDoc.data();
          if (eventData.date && eventData.date <= todayStr) {
            const pSnap = await getDocs(collection(db, `events/${eventDoc.id}/participants`));
            pSnap.docs.forEach(pDoc => {
              const pEmail = (pDoc.data().email || "").toLowerCase().trim();
              if (pEmail && counts[pEmail] !== undefined) {
                counts[pEmail]++;
              } else if (pEmail) {
                counts[pEmail] = 1;
              }
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

  const handlePhotoUpdate = async (newPhotoBase64: string, bikerId: string) => {
    if (!bikerId) return;

    const userDocRef = doc(db, "users", bikerId);

    try {
      await updateDoc(userDocRef, { photoURL: newPhotoBase64 });
      toast({ title: "Successo", description: "La foto del profilo è stata aggiornata." });
      // Chiudiamo entrambi i possibili modal
      setIsMyImageModalOpen(false);
      setEditingBiker(null);
    } catch (error) {
      console.error("Errore aggiornamento foto:", error);
      toast({ variant: "destructive", title: "Errore", description: "Impossibile aggiornare la foto del profilo." });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <Loader2 className="h-8 w-8 text-red-600 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest animate-pulse">Analisi presenze...</p>
    </div>
  );

  const renderBikerCard = (biker: any) => {
    const cardContent = (
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
                <p className="text-sm font-black uppercase italic truncate tracking-tight">{biker.nome} {biker.cognome}</p>
                <p className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest leading-none">Team Member</p>
            </div>
            </div>
            <div className="flex flex-col items-end border-l border-zinc-900 pl-4 shrink-0">
            <span className="text-xl font-black italic text-red-600 leading-none">{biker.participationCount}</span>
            <span className="text-[8px] text-zinc-500 font-bold uppercase mt-1">Uscite</span>
            </div>
        </CardContent>
    );

    if (isAdmin) {
        return (
            <div onClick={() => setEditingBiker(biker)} className="cursor-pointer group relative">
                {cardContent}
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
            </div>
        )
    }
    return cardContent;
  }

  return (
    <div className="w-full py-8 px-4 bg-black min-h-screen pb-24 text-white">
      {/* Modal per modifica da parte dell'Admin */}
      {editingBiker && (
          <Dialog open={!!editingBiker} onOpenChange={() => setEditingBiker(null)}>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                    <DialogTitle>Modera Foto Profilo</DialogTitle>
                    <DialogDescription>Stai modificando la foto di {editingBiker.nome} {editingBiker.cognome}.</DialogDescription>
                </DialogHeader>
                <ImageUpload 
                    currentImage={editingBiker.photoURL} 
                    onImageUpload={(base64) => handlePhotoUpdate(base64, editingBiker.id)} 
                />
              </DialogContent>
          </Dialog>
      )}

      {currentUserData && (
        <Dialog open={isMyImageModalOpen} onOpenChange={setIsMyImageModalOpen}>
          <DialogTrigger asChild>
            <div className="mb-12 flex flex-col items-center border-b border-zinc-900 pb-10 cursor-pointer group">
              <div className="relative h-24 w-24 rounded-full border-2 border-red-600 overflow-hidden mb-4 bg-zinc-900">
                {currentUserData.photoURL ? (
                  <img src={currentUserData.photoURL} alt="Profilo" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full"><User className="h-10 w-10 text-zinc-800" /></div>
                )}
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-black uppercase italic">{currentUserData.nome} {currentUserData.cognome}</h2>
              <div className="mt-2 bg-red-600 px-3 py-0.5 rounded-full text-[9px] font-black uppercase">
                Le mie uscite: {currentUserData.participationCount}
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Gestisci la tua foto profilo</DialogTitle>
              <DialogDescription>Carica, sostituisci o rimuovi la tua immagine.</DialogDescription>
            </DialogHeader>
            <ImageUpload 
              currentImage={currentUserData.photoURL} 
              onImageUpload={(base64) => handlePhotoUpdate(base64, currentUserData.id)}
            />
          </DialogContent>
        </Dialog>
      )}

      <div className="flex items-center gap-3 mb-8">
        <Bike className="h-7 w-7 text-red-600" />
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">The Bikers</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bikers.map((biker) => (
          <Card key={biker.id} className="bg-zinc-950 border-zinc-900">
            {renderBikerCard(biker)}
          </Card>
        ))}
      </div>
    </div>
  );
}
