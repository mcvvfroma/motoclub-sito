'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, CloudSun, Calendar, ImagePlus, Users, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CldImageUpload from '@/components/CldImageUpload';
import { useAdmin } from '@/hooks/use-admin';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import EventDialog from '@/components/EventDialog';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const { isAdmin, user } = useAdmin();

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
      try {
        await deleteDoc(doc(db, "events", eventToDelete));
        setIsDeleteConfirmOpen(false);
      } catch (error) { console.error(error); }
    }
  };

  const handleUploadSuccess = async (eventId: string, result: any) => {
    if (!user?.email || !result?.info?.secure_url) return;
    try {
      await addDoc(collection(db, "events", eventId, "photos"), {
        url: result.info.secure_url,
        userId: user.email,
        timestamp: serverTimestamp()
      });
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-10 text-white text-center font-black uppercase italic">In sella...</div>;

  return (
    <div className="w-full py-8 px-4 bg-black min-h-screen">
      <div className="flex items-center gap-3 mb-10">
        <Calendar className="h-8 w-8 text-red-600" />
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Eventi</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="border border-zinc-800 bg-zinc-950/50 overflow-hidden flex flex-col">
            <CardHeader className="p-0">
              <div className="h-48 bg-black flex items-center justify-center overflow-hidden">
                <img src={event.image || '/cascovigili.jpg'} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="p-4">
                <CardTitle className="text-xl font-black text-white uppercase italic tracking-tighter">
                  {event.title}
                </CardTitle>
                <CardDescription className="text-[10px] font-bold text-zinc-500 uppercase">
                  {event.date || 'Data da definire'}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-0 flex-grow flex flex-col gap-4">
              <p className="text-xs text-zinc-400 italic leading-relaxed">"{event.description}"</p>
              
              <div className="mt-auto pt-4 border-t border-zinc-900/50 space-y-3">
                {/* 1. TASTONE PERCORSO ROSSO SOPRA - IDENTICO A FOTO */}
                {event.percorso && (
                  <a 
                    href={event.percorso.startsWith('http') ? event.percorso : `https://${event.percorso}`} 
                    target="_blank" 
                    rel="noopener"
                    className="flex items-center justify-center w-full py-3 bg-red-600 text-white rounded font-black text-xs uppercase italic tracking-tighter"
                  >
                    <MapPin className="h-4 w-4 mr-2" /> Percorso
                  </a>
                )}

                {/* 2. RIGA TASTINI SOTTO - IDENTICO A FOTO */}
                <div className="flex gap-2">
                  {user && (
                    <CldImageUpload 
                      onUploadSuccess={(_, result) => handleUploadSuccess(event.id, result)}
                      buttonText="Foto"
                    />
                  )}
                  
                  {event.metaMeteo && (
                    <a 
                      href={`https://www.ilmeteo.it/meteo/${encodeURIComponent(event.metaMeteo)}`}
                      target="_blank"
                      className="flex items-center px-3 bg-yellow-600 text-black rounded font-black text-[10px] uppercase h-8"
                    >
                      <CloudSun className="h-3.5 w-3.5 mr-1.5" /> Meteo
                    </a>
                  )}
                </div>
              </div>

              {/* Tasti Admin per cancellare/editare */}
              {isAdmin && (
                <div className="flex justify-end gap-4 pt-2">
                   <button onClick={() => { setEventToDelete(event.id); setIsDeleteConfirmOpen(true); }} className="text-zinc-500 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDeleteDialog 
        isOpen={isDeleteConfirmOpen} 
        onOpenChange={setIsDeleteConfirmOpen} 
        onConfirm={confirmDelete} 
        title="Elimina Evento" 
        description="Sei sicuro di voler eliminare questo giro?" 
      />
    </div>
  );
}