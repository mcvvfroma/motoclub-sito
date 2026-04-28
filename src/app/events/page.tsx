'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import EventDialog from '@/components/EventDialog';
import WeatherBadge from '@/components/WeatherBadge';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

// Importiamo il motore Firebase
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';

export type Event = {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const isAdmin = true;

  // 1. RECUPERO DATI IN TEMPO REALE
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

  // 2. SALVATAGGIO CON ID "PARLANTE" (Logica Umana)
  const handleSaveEvent = async (eventData: Event) => {
    try {
      // Trasformiamo il titolo in un ID pulito (es: "Giro del Lazio" -> "giro-del-lazio")
      const customId = eventData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const docId = eventData.id || customId;

      await setDoc(doc(db, "events", docId), {
        title: eventData.title,
        date: eventData.date,
        description: eventData.description,
        image: eventData.image || '/logo_motoclub.gif' // Immagine di default se manca
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
    }
  };

  // 3. ELIMINAZIONE REALE DAL DATABASE
  const confirmDelete = async () => {
    if (eventToDelete) {
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
    setEventToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const openDialog = (event: Event | null = null) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

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
          <Card key={event.id} className="flex flex-col">
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
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>
                      {new Date(event.date).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </CardDescription>
                  </div>
                  <WeatherBadge date={event.date} />
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p>{event.description}</p>
            </CardContent>
             {isAdmin && (
                <div className="flex justify-end p-4 border-t">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(event)}>
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
            description="Sei sicuro di voler eliminare questo evento? L'azione è irreversibile dal database."
          />
        </>
      )}
    </div>
  );
}