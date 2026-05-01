'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, Edit, Trash2, MapPin, CloudSun, Calendar, 
  Users, Bike, CheckCircle2, ChevronDown, ChevronUp 
} from 'lucide-react';

import EventDialog from '@/components/EventDialog';
import WeatherBadge from '@/components/WeatherBadge';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

import { useAdmin } from '@/hooks/use-admin'; 
import { db } from '@/lib/firebase';
import { 
  collection, deleteDoc, doc, setDoc, onSnapshot, 
  serverTimestamp, getDoc 
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
        metaMeteo: eventData.metaMeteo || ''
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

  if (loading) return <div className="p-8 text-center text-zinc-400">Caricamento...</div>;

  return (
    <div className="w-full py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">Calendario Eventi</h1>
        </div>
        {isAdmin && <Button onClick={() => openDialog()}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi</Button>}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <Card key={event.id} className="flex flex-col border border-zinc-800 bg-zinc-950/50 overflow-hidden">
            <CardHeader className="p-0">
              <div onClick={() => { if (isAdmin) openDialog(event); }} className={`group ${isAdmin ? 'cursor-pointer' : ''}`}>
                <div className="bg-black/80 flex items-center justify-center h-52 w-full overflow-hidden relative">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="object-contain h-full w-full transform scale-110 transition-transform duration-500 group-hover:scale-125" 
                  />
                </div>
              </div>
              <div className="flex justify-between items-start p-4 pb-0">
                <div>
                  <CardTitle className="text-lg font-bold leading-none mb-1 uppercase tracking-tight">{event.title}</CardTitle>
                  <CardDescription className="text-[10px] uppercase tracking-wider text-zinc-500">{new Date(event.date).toLocaleDateString('it-IT')}</CardDescription>
                </div>
                <WeatherBadge date={event.date} />
              </div>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col p-4 pt-2">
              <p className="text-xs text-zinc-400 mb-4 line-clamp-3 italic">"{event.description}"</p>
              
              <ParticipationSection eventId={event.id} isAdmin={isAdmin} user={user} />

              <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-zinc-900">
                {event.percorso && (
                  <a 
                    href={event.percorso.startsWith('http') ? event.percorso : `https://${event.percorso}`} 
                    target="_blank" 
                    rel="noopener" 
                    className="inline-flex items-center px-2 py-1 bg-zinc-900 text-yellow-500 border border-yellow-700/30 rounded text-[10px] font-bold uppercase tracking-tighter hover:bg-black transition-colors no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MapPin className="h-3 w-3 mr-1" /> Mappa
                  </a>
                )}

                {event.metaMeteo && (
                  <a 
                    href={`https://www.ilmeteo.it/meteo/${encodeURIComponent(event.metaMeteo)}`} 
                    target="_blank" 
                    rel="noopener" 
                    className="inline-flex items-center px-2 py-1 bg-yellow-600 text-black rounded text-[10px] font-bold uppercase tracking-tighter hover:bg-yellow-500 transition-colors no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CloudSun className="h-3 w-3 mr-1" /> Meteo
                  </a>
                )}
              </div>
            </CardContent>

            {isAdmin && (
              <div className="flex justify-end px-3 py-2 border-t border-zinc-900 bg-black/20 gap-2">
                <button onClick={() => openDialog(event)} className="text-zinc-600 hover:text-white transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                <button onClick={() => { setEventToDelete(event.id); setIsDeleteConfirmOpen(true); }} className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {isAdmin && (
        <>
          <EventDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} event={selectedEvent} onSave={handleSaveEvent} />
          <ConfirmDeleteDialog isOpen={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen} onConfirm={confirmDelete} title="Elimina Evento" description="Sei sicuro?" />
        </>
      )}
    </div>
  );
}

function ParticipationSection({ eventId, isAdmin, user }: any) {
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
    if (!user?.email) return alert("Esegui il login per confermare");
    const eventPartRef = doc(db, "events", eventId, "partecipazioni", user.email);
    
    if (giaPartecipa) {
      await deleteDoc(eventPartRef);
    } else {
      try {
        // 1. Entriamo nel sottomenu (campi) del documento utente
        const userDocRef = doc(db, "users", user.email);
        const userSnap = await getDoc(userDocRef);
        
        let nomeCompleto = user.email; // Fallback se il database ha problemi

        if (userSnap.exists()) {
          const data = userSnap.data();
          // 2. Leggiamo esattamente i campi 'nome' e 'cognome'
          const n = data.nome || "";
          const c = data.cognome || "";
          nomeCompleto = `${n} ${c}`.trim().toUpperCase();
        }

        // 3. Salviamo con il nome reale letto dal database
        await setDoc(eventPartRef, {
          nome: nomeCompleto,
          email: user.email,
          quanti: quanti,
          moto: moto,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Errore lettura database:", error);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-2">
        <Badge variant="outline" className="bg-zinc-900/50 border-zinc-800 text-[10px] text-zinc-300">
          <Users className="h-3 w-3 mr-1 text-red-500" /> {totalePersone} Persone
        </Badge>
        <Badge variant="outline" className="bg-zinc-900/50 border-zinc-800 text-[10px] text-zinc-300">
          <Bike className="h-3 w-3 mr-1 text-red-500" /> {totaleMoto} Moto
        </Badge>
      </div>

      {!giaPartecipa ? (
        <div className="grid grid-cols-3 gap-2 bg-zinc-900/30 p-2 rounded-md border border-zinc-800/50">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase text-zinc-500 mb-1 font-bold">Persone</span>
            <Input type="number" min="1" value={quanti} onChange={e => setQuanti(parseInt(e.target.value))} className="h-7 bg-black text-xs border-zinc-800" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase text-zinc-500 mb-1 font-bold">Moto</span>
            <Input type="number" min="0" value={moto} onChange={e => setMoto(parseInt(e.target.value))} className="h-7 bg-black text-xs border-zinc-800" />
          </div>
          <Button onClick={togglePartecipazione} className="h-7 mt-auto bg-red-600 hover:bg-red-700 text-[9px] font-bold uppercase">
            Conferma
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-green-900/10 p-2 rounded-md border border-green-900/30">
          <span className="text-[9px] font-bold text-green-500 uppercase flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Partecipazione Confermata
          </span>
          <Button variant="ghost" onClick={togglePartecipazione} className="h-6 text-[8px] text-red-500 uppercase hover:bg-red-950/20">
            Annulla
          </Button>
        </div>
      )}

      {isAdmin && (
        <div className="mt-2">
          <button 
            onClick={() => setShowLista(!showLista)}
            className="text-[9px] text-zinc-500 uppercase font-bold flex items-center hover:text-white"
          >
            {showLista ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />} 
            Lista Iscritti Analitica
          </button>
          {showLista && (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto pr-1">
              {partecipanti.length > 0 ? partecipanti.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-[9px] bg-black/40 p-2 rounded border border-zinc-900">
                  <span className="text-zinc-200 font-bold truncate max-w-[140px] uppercase">
                    {p.nome}
                  </span>
                  <div className="flex gap-2">
                    <span className="text-zinc-500">P:{p.quanti}</span>
                    <span className="text-red-500 font-bold">M:{p.moto}</span>
                  </div>
                </div>
              )) : (
                <p className="text-[8px] text-zinc-600 italic px-1">Nessun iscritto</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}