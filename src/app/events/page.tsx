'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, CloudSun, Calendar, Trash2, Edit, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/use-admin';
import EventDialog from '@/components/EventDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const confirmDelete = async () => {
    if (eventToDelete && isAdmin) {
      await deleteDoc(doc(db, "events", eventToDelete));
      setIsDeleteConfirmOpen(false);
    }
  };

  if (loading || adminLoading) return <div className="p-10 text-white text-center font-black uppercase italic">In sella...</div>;

  return (
    <div className="w-full py-8 px-4 bg-black min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-red-600" />
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Eventi</h1>
        </div>
        {isAdmin && (
          <Button onClick={() => { setSelectedEvent(null); setIsDialogOpen(true); }} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic">
            <PlusCircle className="h-4 w-4 mr-2" /> Aggiungi
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col">
            <CardHeader className="p-0">
              <div className="h-52 bg-black flex items-center justify-center overflow-hidden">
                <img src={event.image || '/cascovigili.jpg'} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="p-4">
                <CardTitle className="text-xl font-black text-white uppercase italic tracking-tighter">{event.title}</CardTitle>
                <CardDescription className="text-zinc-500 text-[10px] font-bold uppercase">{event.date}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow flex flex-col gap-4">
              <p className="text-xs text-zinc-400 italic">"{event.description}"</p>
              
              <div className="mt-auto space-y-3">
                {event.percorso && (
                  <a 
                    href={event.percorso} 
                    target="_blank" 
                    className="flex items-center justify-center w-full py-3.5 bg-red-600 text-white rounded font-black text-xs uppercase italic tracking-tighter"
                  >
                    <MapPin className="h-4 w-4 mr-2" /> Percorso
                  </a>
                )}

                <div className="flex gap-2">
                  {event.metaMeteo && (
                    <a 
                      href={`https://www.ilmeteo.it/meteo/${event.metaMeteo}`}
                      target="_blank"
                      className="flex items-center px-4 bg-yellow-600 text-black rounded font-black text-[10px] uppercase h-8"
                    >
                      <CloudSun className="h-3.5 w-3.5 mr-1.5" /> Meteo
                    </a>
                  )}
                  
                  {isAdmin && (
                    <div className="ml-auto flex gap-3 items-center">
                      <button onClick={() => { setSelectedEvent(event); setIsDialogOpen(true); }} className="text-zinc-500 hover:text-white">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setEventToDelete(event.id); setIsDeleteConfirmOpen(true); }} className="text-zinc-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EventDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} event={selectedEvent} onSave={() => setIsDialogOpen(false)} />
      <ConfirmDeleteDialog isOpen={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen} onConfirm={confirmDelete} title="Elimina Evento" description="Sei sicuro?" />
    </div>
  );
}