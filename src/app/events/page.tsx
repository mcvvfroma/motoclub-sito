'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, MapPin } from 'lucide-react';
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
      const customId = eventData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const docId = eventData.id || customId;

      await setDoc(doc(db, "events", docId), {
        title: eventData.title,
        date: eventData.date,
        description: eventData.description,
        image: eventData.image || '/logo_motoclub.gif',
        percorso: eventData.percorso || ''
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
    }
  };

  const confirmDelete = async () => {
    if (eventToDelete && isAdmin) {
      try {
        await deleteDoc(doc(db, "events", eventToDelete));
        setIsDeleteConfirmOpen(false);
        setEventToDelete(null);
      } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
      }
    }
  };

  const handleDeleteClick = (id: string) => {
    if (!isAdmin) return;
    setEventToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const openDialog = (event: Event | null = null) => {
    if (!isAdmin) return;
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  if (loading) return <div className="p-8 text-center">Caricamento autorizzazioni...</div>;

  return (
    <div className="w-full py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendario Eventi</h1>
        {isAdmin && (
          <Button onClick={() => openDialog()}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Aggiungi Evento
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <Card key={event.id} className="flex flex-col border-2 border-zinc-800 hover:border-yellow-600/50 transition-colors bg-card">
            <CardHeader>
              <div
                onClick={() => { if (isAdmin) openDialog(event); }}
                className={`rounded-t-lg overflow-hidden ${isAdmin ? 'cursor-pointer' : ''}`}>
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className={`object-cover h-48 w-full transition-transform duration-300 ${isAdmin ? 'hover:scale-105' : ''}`}
                />
              </div>
              <div className="flex justify-between items-start pt-4">
                  <div className='flex-grow pr-2'>
                    <CardTitle className="text-xl font-bold">{event.title}</CardTitle>
                    <CardDescription>
                      {new Date(event.date).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </CardDescription>
                  </div>
                  <WeatherBadge date={event.date} />
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="mb-6 text-muted-foreground">{event.description}</p>
              
              <div className="mt-auto">
                {/* PULSANTE PERCORSO: TRASFORMATO IN LINK DIRETTO PER EVITARE BLOCCHI */}
                {event.percorso && (
                  <a 
                    href={event.percorso.startsWith('http') ? event.percorso : `https://${event.percorso}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full h-10 px-4 py-2 bg-black hover:bg-zinc-800 text-yellow-500 border border-yellow-600 rounded-md font-bold uppercase tracking-wider shadow-md transition-all no-underline"
                    onClick={(e) => e.stopPropagation()} // Impedisce di aprire il dialog admin cliccando il link
                  >
                    <MapPin className="h-4 w-4 mr-2 text-yellow-500" />
                    Vedi Percorso
                  </a>
                )}
              </div>
            </CardContent>
              
             {isAdmin && (
                <div className="flex justify-end p-4 border-t gap-2 bg-muted/30">
                    <Button variant="outline" size="icon" onClick={() => openDialog(event)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(event.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
          </Card>
        ))}
      </div>

      {isAdmin && (
        <>
          <EventDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            event={selectedEvent}
            onSave={handleSaveEvent}
          />
          <ConfirmDeleteDialog
            isOpen={isDeleteConfirmOpen}
            onOpenChange={setIsDeleteConfirmOpen}
            onConfirm={confirmDelete}
            title="Conferma Eliminazione Evento"
            description="Sei sicuro di voler eliminare questo evento? L'azione è irreversibile."
          />
        </>
      )}
    </div>
  );
}