'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ImageUpload from '@/components/image-upload';
import { Bike, User, Loader2, Edit, Shield } from 'lucide-react';

export default function BikersPage() {
  const [bikers, setBikers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [isMyProfileModalOpen, setIsMyProfileModalOpen] = useState(false);
  const [isMyBikeModalOpen, setIsMyBikeModalOpen] = useState(false);
  const [viewingBike, setViewingBike] = useState<any>(null);
  const [editingBiker, setEditingBiker] = useState<any>(null);
  const [adminEditMode, setAdminEditMode] = useState<'profile' | 'bike'>('profile');
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
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const counts: { [key: string]: number } = {};
        const todayStr = new Date().toISOString().split('T')[0];

        for (const eventDoc of eventsSnapshot.docs) {
          const eventData = eventDoc.data();
          if (eventData.date && eventData.date <= todayStr) {
            const pSnap = await getDocs(collection(db, `events/${eventDoc.id}/participants`));
            pSnap.docs.forEach(pDoc => {
              const pEmail = (pDoc.data().email || "").toLowerCase().trim();
              if (pEmail) counts[pEmail] = (counts[pEmail] || 0) + 1;
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
        console.error("Errore presenze:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- LOGICA DI COMPRESSIONE STILE MERCATINO ---
  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Risolve il problema del limite di 1MB di Firestore
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  // --- FUNZIONE DI SALVATAGGIO AGGIORNATA ---
  const handlePhotoUpdate = async (newPhotoBase64: string | null, bikerId: string, field: 'photoURL' | 'motoPhotoURL') => {
    if (!bikerId) return;
    
    try {
      let finalPhoto = newPhotoBase64;
      
      // Se c'è una nuova foto (Base64), comprimila
      if (newPhotoBase64 && newPhotoBase64.startsWith('data:image')) {
        finalPhoto = await compressImage(newPhotoBase64);
      }

      const bikerRef = doc(db, "users", bikerId);
      await updateDoc(bikerRef, { [field]: finalPhoto });

      toast({ 
        title: "Database Aggiornato", 
        description: field === 'motoPhotoURL' ? "Foto moto salvata." : "Profilo aggiornato." 
      });

      setIsMyProfileModalOpen(false);
      setIsMyBikeModalOpen(false);
      setEditingBiker(null);
    } catch (error) {
      console.error("Errore Firebase:", error);
      toast({ 
        variant: "destructive", 
        title: "Errore di Scrittura", 
        description: "La foto potrebbe essere ancora troppo grande o mancano i permessi." 
      });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <Loader2 className="h-8 w-8 text-red-600 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Sincronizzazione scuderia...</p>
    </div>
  );

  return (
    <div className="w-full py-8 px-4 bg-black min-h-screen pb-24 text-white font-sans">
      
      {/* AREA PERSONALE */}
      {currentUserData && (
        <div className="mb-12 border-b border-zinc-900 pb-10">
          <div className="flex flex-col items-center">
            <div className="relative h-28 w-28 rounded-full border-2 border-red-600 p-1 mb-4 group cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.2)]" 
                 onClick={() => setIsMyProfileModalOpen(true)}>
              <div className="h-full w-full rounded-full overflow-hidden bg-zinc-900 relative">
                {currentUserData.photoURL ? (
                  <img src={currentUserData.photoURL} className="w-full h-full object-cover" alt="" />
                ) : <User className="m-auto h-12 w-12 text-zinc-800 mt-6" />}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">{currentUserData.nome} {currentUserData.cognome}</h2>
            <div className="flex gap-3 mt-5">
              <Button onClick={() => setIsMyBikeModalOpen(true)} variant="outline" className="bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-white font-black uppercase italic text-[10px] px-6 rounded-xl h-10 transition-all">
                <Bike className="mr-2 h-4 w-4 text-red-600" /> Il mio Mezzo
              </Button>
              <div className="bg-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic flex items-center shadow-lg shadow-red-600/10">
                Uscite: {currentUserData.participationCount}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LISTA BIKERS */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-[2px] w-8 bg-red-600"></div>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
          <Bike className="text-red-600 h-6 w-6" /> The Bikers
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bikers.map((biker) => (
          <Card key={biker.id} className="bg-zinc-950 border-zinc-900 group relative overflow-hidden hover:border-red-600/40 transition-colors">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setViewingBike(biker)}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                    {biker.photoURL ? <img src={biker.photoURL} className="w-full h-full object-cover" alt="" /> : <User className="m-auto h-6 w-6 text-zinc-800 mt-3" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black uppercase italic truncate tracking-tight mb-1">{biker.nome} {biker.cognome}</p>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest group-hover:text-red-600 transition-colors italic leading-none">Visualizza Mezzo</p>
                  </div>
                </div>
                <div className="text-right border-l border-zinc-900 pl-4 shrink-0">
                  <p className="text-xl font-black italic leading-none text-red-600">{biker.participationCount}</p>
                  <p className="text-[7px] text-zinc-600 font-bold uppercase mt-1">Uscite</p>
                </div>
              </div>
              {isAdmin && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setAdminEditMode('profile');
                    setEditingBiker(biker); 
                  }}
                  className="absolute top-2 right-2 p-2 bg-zinc-900/80 border border-zinc-800 hover:bg-red-600 text-zinc-500 hover:text-white rounded-lg transition-all"
                >
                  <Shield size={12} />
                </button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DIALOG: VISUALIZZA MEZZO */}
      <Dialog open={!!viewingBike} onOpenChange={() => setViewingBike(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-900 text-white p-0 overflow-hidden rounded-[2.5rem] max-w-lg mx-auto border-0 focus:outline-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Dettaglio Moto {viewingBike?.nome}</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video bg-zinc-900 flex items-center justify-center">
            {(viewingBike?.motoPhotoURL || viewingBike?.motoPhoto) ? (
              <img src={viewingBike.motoPhotoURL || viewingBike.motoPhoto} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="text-center p-8">
                <Bike size={48} className="text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-500 italic text-sm font-medium leading-relaxed">
                  "Il socio sta ancora lucidando i collettori,<br/>nessuna foto disponibile!"
                </p>
              </div>
            )}
          </div>
          <div className="p-6 bg-gradient-to-t from-zinc-950 to-zinc-900 border-t border-zinc-900">
            <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">{viewingBike?.nome} {viewingBike?.cognome}</h3>
            <p className="text-[9px] text-red-600 font-black uppercase tracking-[0.3em] mt-2 italic">Dettaglio Mezzo in Dotazione</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG: ADMIN MODERA */}
      <Dialog open={!!editingBiker} onOpenChange={() => setEditingBiker(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-900 text-white rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-black uppercase italic text-red-600">Moderazione Socio</DialogTitle>
            <DialogDescription className="text-zinc-500 uppercase text-[10px] font-bold">Gestione contenuti per {editingBiker?.nome}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mb-6 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button onClick={() => setAdminEditMode('profile')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase italic ${adminEditMode === 'profile' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>Profilo</button>
            <button onClick={() => setAdminEditMode('bike')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase italic ${adminEditMode === 'bike' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>Mezzo</button>
          </div>
          <ImageUpload 
            currentImage={adminEditMode === 'profile' ? editingBiker?.photoURL : (editingBiker?.motoPhotoURL || editingBiker?.motoPhoto)} 
            onImageUpload={(base) => handlePhotoUpdate(base, editingBiker.id, adminEditMode === 'profile' ? 'photoURL' : 'motoPhotoURL')} 
          />
        </DialogContent>
      </Dialog>

      {/* DIALOG: MIO PROFILO */}
      <Dialog open={isMyProfileModalOpen} onOpenChange={setIsMyProfileModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-black uppercase italic">La mia Foto Profilo</DialogTitle>
            <DialogDescription className="sr-only">Aggiorna la tua immagine personale</DialogDescription>
          </DialogHeader>
          <ImageUpload currentImage={currentUserData?.photoURL} onImageUpload={(base) => handlePhotoUpdate(base, currentUserData.id, 'photoURL')} />
        </DialogContent>
      </Dialog>

      {/* DIALOG: MIO MEZZO */}
      <Dialog open={isMyBikeModalOpen} onOpenChange={setIsMyBikeModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-900 text-white rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-black uppercase italic text-red-600">La mia Moto</DialogTitle>
            <DialogDescription className="text-zinc-500 text-[10px] font-bold uppercase italic">Aggiorna la foto del tuo mezzo</DialogDescription>
          </DialogHeader>
          <ImageUpload 
            currentImage={currentUserData?.motoPhotoURL || currentUserData?.motoPhoto} 
            onImageUpload={(base) => handlePhotoUpdate(base, currentUserData.id, 'motoPhotoURL')} 
          />
          {(currentUserData?.motoPhotoURL || currentUserData?.motoPhoto) && (
            <Button onClick={() => handlePhotoUpdate(null, currentUserData.id, 'motoPhotoURL')} variant="destructive" className="w-full font-black italic uppercase rounded-xl mt-4 h-12">Rimuovi Foto Mezzo</Button>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}