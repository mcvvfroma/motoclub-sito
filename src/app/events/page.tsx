'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, MapPin, CloudSun, Calendar } from 'lucide-react'; // Aggiunto Calendar
import EventDialog from '@/components/EventDialog';
import WeatherBadge from '@/components/WeatherBadge';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { useAdmin } from '@/hooks/use-admin'; 
import { db } from '@/lib/firebase';
import { collection, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';

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
  
  const { isAdmin, loading } = useAdmin();

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
      });
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
      } catch (error) {}
    }
  };

  const openDialog = (event: Event | null = null) => {
    if (!isAdmin) return;
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  if (loading) return <div className="p-8 text-center text-zinc-400">Caricamento...</div>;

  return (
    <div className="w-full py-8">
      <div className="flex justify-between items-center mb-6">
        {/* STILE IDENTICO ALLA BACHECA: Megafono -> Calendario */}
        <div className="flex items-center gap-2">
          <Calendar className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendario Eventi</h1>
        </div>

        {isAdmin && <Button onClick={() => openDialog()}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi</Button>}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <Card key={event.id} className="flex flex-col border border-zinc-800 bg-zinc-950/50 overflow-hidden">
            <CardHeader className="p-0">
              <div onClick={() => { if (isAdmin) openDialog(event); }} className={`group ${isAdmin ? 'cursor-pointer' : ''}`}>
                
                <div className="bg-black/80 flex items-center justify-center h-52 w-full overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="object-contain h-full w-full transform scale-110 transition-transform duration-500 group-hover:scale-125" 
                  />
                </div>

              </div>
              <div className="flex justify-between items-start p-4 pb-0">
                <div>
                  <CardTitle className="text-lg font-bold leading-none mb-1">{event.title}</CardTitle>
                  <CardDescription className="text-[10px] uppercase tracking-wider text-zinc-500">{new Date(event.date).toLocaleDateString('it-IT')}</CardDescription>
                </div>
                <WeatherBadge date={event.date} />
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-4 pt-2">
              <p className="text-xs text-zinc-400 mb-4 line-clamp-3">{event.description}</p>
              
              <div className="mt-auto flex flex-wrap gap-2">
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