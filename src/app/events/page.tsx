'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CloudSun, Calendar, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-white text-center font-black">CARICAMENTO MOTORI...</div>;

  return (
    <div className="w-full py-8 px-4 bg-black min-h-screen">
      <div className="flex items-center gap-3 mb-10">
        <Calendar className="h-8 w-8 text-red-600" />
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Eventi</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {events.map((event) => (
          <Card key={event.id} className="border border-zinc-800 bg-zinc-950 overflow-hidden">
            <CardHeader className="p-0">
              <div className="h-48 bg-zinc-900">
                {event.image && (
                  <img src={event.image} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <CardTitle className="text-xl font-black text-white uppercase italic">{event.title}</CardTitle>
                <p className="text-zinc-500 text-[10px] font-bold uppercase">{event.date}</p>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <p className="text-xs text-zinc-400 italic">"{event.description}"</p>
              
              <div className="space-y-2">
                {/* TASTO PERCORSO ROSSO SOPRA */}
                {event.percorso && (
                  <a 
                    href={event.percorso} 
                    target="_blank" 
                    className="flex items-center justify-center w-full py-3 bg-red-600 text-white rounded font-black text-xs uppercase"
                  >
                    <MapPin className="h-4 w-4 mr-2" /> Percorso
                  </a>
                )}

                {/* RIGA TASTINI SOTTO */}
                <div className="flex gap-2">
                  <Button className="bg-zinc-900 border border-zinc-800 h-8 text-[10px] font-black uppercase">
                    <ImagePlus className="h-3 w-3 mr-1 text-red-600" /> Foto
                  </Button>
                  
                  {event.metaMeteo && (
                    <a 
                      href={`https://www.ilmeteo.it/meteo/${event.metaMeteo}`}
                      target="_blank"
                      className="flex items-center px-3 bg-yellow-600 text-black rounded font-black text-[10px] uppercase h-8"
                    >
                      <CloudSun className="h-3.5 w-3.5 mr-1" /> Meteo
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}