'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, Edit, Trash2, MapPin, CloudSun, Calendar, 
  Users, Bike, CheckCircle2, ChevronDown, ChevronUp, X 
} from 'lucide-react';

import EventDialog from '@/components/EventDialog';
import WeatherBadge from '@/components/WeatherBadge';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import CldImageUpload from '@/components/CldImageUpload';

import { useAdmin } from '@/hooks/use-admin'; 
import { db } from '@/lib/firebase';
import { 
  collection, deleteDoc, doc, setDoc, onSnapshot, 
  serverTimestamp, getDoc, addDoc, query, orderBy 
} from 'firebase/firestore';

export type Event = {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  percorso?: string;
  metaMeteo?: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  
  const { isAdmin, user, loading } = useAdmin();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const firebaseEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(firebaseEvents);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveEvent = async (eventData: Event) => {
    if (!isAdmin) return;
    try {
      const customId = eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const docId = eventData.id || customId;

      await setDoc(doc(db, "events", docId), {
        title: eventData.title,
        date: eventData.date,
        description: eventData.description,
        image: eventData.image || '/cascovigili.jpg',
        percorso: eventData.percorso || '',
        metaMeteo: eventData.metaMeteo || '',
        publishedAt: serverTimestamp()
      }, { merge: true });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Errore salvataggio:", error);
    }
  };

  const confirmDelete = async () => {
    if (eventToDelete && isAdmin) {
      try {
        await deleteDoc(doc(db, "events", eventToDelete));
        setIsDeleteConfirmOpen(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const openDialog = (event: Event | null = null) => {
    if (!isAdmin) return;
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  if (loading) return <div className="p-8 text-center text-zinc-400 font-black uppercase italic tracking-widest">In sella...</div>;

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-10">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-red-600 shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase italic">
            Calendario Eventi
          </h1>
        </div>
        
        {isAdmin && (
          <Button 
            onClick={() => openDialog()} 
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-tighter py-6 sm:py-2"
          >
            <PlusCircle className="h-5 w-5 mr-2" /> 
            Aggiungi Evento
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <Card key={event.id} className="flex flex-col border border-zinc-800 bg-zinc-950/50 overflow-hidden shadow-2xl">
            <CardHeader className="p-0 relative">
              <div onClick={() => { if (isAdmin) openDialog(event); }} className={`group ${isAdmin ? 'cursor-pointer' : ''}`}>
                <div className="bg-black/80 flex items-center justify-center h-52 w-full overflow-hidden relative">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="object-contain h-full w-full transform scale-110 transition-transform duration-700 group-hover:scale-125" 
                  />
                </div>
              </div>
              <div className="flex justify-between items-start p-4 pb-0">
                <div>
                  <CardTitle className="text-xl font-black leading-none mb-1 uppercase italic tracking-tighter">{event.title}</CardTitle>
                  <CardDescription className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                    {new Date(event.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </CardDescription>
                </div>
                <WeatherBadge date={event.date} />
              </div>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col p-4 pt-2 gap-4">
              <p className="text-xs text-zinc-400 italic leading-relaxed">"{event.description}"</p>
              
              <ParticipationSection eventId={event.id} isAdmin={isAdmin} user={user} />

              <PhotoGallerySection eventId={event.id} isAdmin={isAdmin} user={user} />

              {/* AREA AZIONI FINALI: TASTONE SOPRA, PICCOLI SOTTO */}
              <div className="mt-auto pt-4 border-t border-zinc-900/50 space-y-3">
                
                {/* 1. TASTO PERCORSO (LARGHEZZA PIENA) */}
                {event.percorso && (
                  <a 
                    href={event.percorso.startsWith('http') ? event.percorso : `https://${event.percorso}`} 
                    target="_blank" 
                    rel="noopener" 
                    className="flex items-center justify-center w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded font-black text-xs uppercase italic tracking-tighter transition-all shadow-xl border-b-4 border-red-900 active:border-b-0"
                  >
                    <MapPin className="h-4 w-4 mr-2" /> Visualizza Percorso
                  </a>
                )}

                {/* 2. RIGA TASTI PICCOLI (SOTTO IL TASTONE) */}
                <div className="flex flex-wrap gap-2">
                  {user && (
                    <CldImageUploadWrapper 
                      eventId={event.id} 
                      isAdmin={isAdmin} 
                      user={user} 
                    />
                  )}

                  {event.metaMeteo && (
                    <a 
                      href={`https://www.ilmeteo.it/meteo/${encodeURIComponent(event.metaMeteo)}`} 
                      target="_blank" 
                      rel="noopener" 
                      className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-black rounded font-black text-[10px] uppercase tracking-tighter hover:bg-yellow-500 transition-all h-8"
                    >
                      <CloudSun className="h-3.5 w-3.5 mr-1.5" /> Meteo
                    </a>
                  )}
                </div>
              </div>
            </CardContent>

            {isAdmin && (
              <div className="flex justify-end px-4 py-2 border-t border-zinc-900 bg-black/40 gap-4">
                <button onClick={() => openDialog(event)} className="text-zinc-500 hover:text-white transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => { setEventToDelete(event.id); setIsDeleteConfirmOpen(true); }} className="text-zinc-500 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {isAdmin && (
        <>
          <EventDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} event={selectedEvent} onSave={handleSaveEvent} />
          <ConfirmDeleteDialog 
            isOpen={isDeleteConfirmOpen} 
            onOpenChange={setIsDeleteConfirmOpen} 
            onConfirm={confirmDelete} 
            title="Elimina Evento" 
            description="Questa azione è irreversibile. Sei sicuro?" 
          />
        </>
      )}
    </div>
  );
}

function CldImageUploadWrapper({ eventId, isAdmin, user }: { eventId: string, isAdmin: boolean, user: any }) {
  const [photosCount, setPhotosCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "events", eventId, "photos"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const userPhotos = snap.docs.filter(d => d.data().userId === user?.email);
      setPhotosCount(userPhotos.length);
    });
    return () => unsubscribe();
  }, [eventId, user?.email]);

  const maxAllowed = isAdmin ? 10 : 4;

  const handleUploadSuccess = async (result: any) => {
    if (!user || !result?.info?.secure_url) return;
    try {
      await addDoc(collection(db, "events", eventId, "photos"), {
        url: result.info.secure_url,
        publicId: result.info.public_id,
        userId: user.email,
        userName: user.displayName || user.email,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (photosCount >= maxAllowed) return null;

  return (
    <CldImageUpload 
      maxFiles={maxAllowed - photosCount} 
      onUploadSuccess={(_, result) => handleUploadSuccess(result)} 
      buttonText="Carica Foto"
    />
  );
}

function PhotoGallerySection({ eventId, isAdmin, user }: { eventId: string; isAdmin: boolean; user: any }) {
  const [photos, setPhotos] = useState<any[]>([]);
  
  useEffect(() => {
    const q = query(collection(db, "events", eventId, "photos"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [eventId]);

  const handleDeletePhoto = async (e: React.MouseEvent, photoId: string, publicId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "events", eventId, "photos", photoId));
      if (publicId) {
        await fetch('/api/delete-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId }),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-zinc-900">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500 italic">Galleria Foto</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square rounded overflow-hidden bg-zinc-900 group">
            <img src={photo.url} alt="Foto Evento" className="object-cover w-full h-full" />
            {(isAdmin || photo.userId === user?.email) && (
              <button 
                type="button"
                onClick={(e) => handleDeletePhoto(e, photo.id, photo.publicId)}
                className="absolute top-1 right-1 bg-red-600/80 p-1 rounded-full z-10 hover:bg-red-600 transition-all"
              >
                <X className="h-2.5 w-2.5 text-white" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ParticipationSection({ eventId, isAdmin, user }: { eventId: string; isAdmin: boolean; user: any }) {
  const [partecipanti, setPartecipanti] = useState<any[]>([]);
  const [quanti, setQuanti] = useState(1);
  const [moto, setMoto] = useState(1);
  const [showLista, setShowLista] = useState(false);

  useEffect(() => {
    const q = collection(db, "events", eventId, "partecipazioni");
    const unsubscribe = onSnapshot(q, (snap) => {
      setPartecipanti(snap.docs.map(d => d.data()));
    });
    return () => unsubscribe();
  }, [eventId]);

  const totalePersone = partecipanti.reduce((acc, p) => acc + (p.quanti || 0), 0);
  const totaleMoto = partecipanti.reduce((acc, p) => acc + (p.moto || 0), 0);
  const giaPartecipa = partecipanti.some(p => p.email === user?.email);

  const togglePartecipazione = async () => {
    if (!user?.email) return;
    const eventPartRef = doc(db, "events", eventId, "partecipazioni", user.email);
    
    if (giaPartecipa) {
      await deleteDoc(eventPartRef);
    } else {
      try {
        const userDocRef = doc(db, "users", user.email);
        const userSnap = await getDoc(userDocRef);
        let nomeCompleto = user.email;
        if (userSnap.exists()) {
          const data = userSnap.data();
          nomeCompleto = `${data.nome || ""} ${data.cognome || ""}`.trim().toUpperCase();
        }
        await setDoc(eventPartRef, {
          nome: nomeCompleto,
          email: user.email,
          quanti: quanti,
          moto: moto,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-[10px] font-bold text-zinc-300 py-1">
          <Users className="h-3 w-3 mr-1.5 text-red-600" /> {totalePersone} SOCI
        </Badge>
        <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-[10px] font-bold text-zinc-300 py-1">
          <Bike className="h-3 w-3 mr-1.5 text-red-600" /> {totaleMoto} MOTO
        </Badge>
      </div>

      {!giaPartecipa ? (
        <div className="grid grid-cols-3 gap-2 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800">
          <Input type="number" min="1" value={quanti} onChange={e => setQuanti(parseInt(e.target.value))} className="h-8 bg-black text-xs border-zinc-800 text-white" />
          <Input type="number" min="0" value={moto} onChange={e => setMoto(parseInt(e.target.value))} className="h-8 bg-black text-xs border-zinc-800 text-white" />
          <Button onClick={togglePartecipazione} className="h-8 bg-red-600 hover:bg-red-700 text-[9px] font-black uppercase tracking-tighter">CONFERMA</Button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-green-950/20 p-3 rounded-lg border border-green-900/30">
          <span className="text-[9px] font-black text-green-500 uppercase flex items-center tracking-tighter">
            <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Presente
          </span>
          <Button variant="ghost" onClick={togglePartecipazione} className="h-6 px-2 text-[8px] text-red-500 font-bold uppercase hover:bg-transparent tracking-tighter">Annulla</Button>
        </div>
      )}

      {isAdmin && (
        <div className="pt-2">
          <button 
            onClick={() => { setShowLista(!showLista); }}
            className="text-[10px] text-zinc-500 uppercase font-black flex items-center hover:text-white transition-all tracking-tighter"
          >
            {showLista ? <ChevronUp className="h-3 w-3 mr-1.5" /> : <ChevronDown className="h-3 w-3 mr-1.5" />} Soci Prenotati
          </button>
          {showLista && (
            <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {partecipanti.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] bg-zinc-900/60 p-2.5 rounded border border-zinc-800/50 uppercase font-black italic text-zinc-200 tracking-tighter">
                  {p.nome} <span className="font-mono text-zinc-500">P:{p.quanti} M:{p.moto}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}