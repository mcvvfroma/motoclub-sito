'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, CloudSun, Calendar, Users, Bike, CheckCircle2, X } from 'lucide-react';

import EventDialog from '@/components/EventDialog';
import WeatherBadge from '@/components/WeatherBadge';
import CldImageUpload from '@/components/CldImageUpload';

import { useAdmin } from '@/hooks/use-admin'; 
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

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
  const { isAdmin, user, loading } = useAdmin();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[]);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-8 text-center text-white font-black uppercase italic tracking-widest">In sella...</div>;

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-10">
        <Calendar className="h-8 w-8 text-red-600 shrink-0" />
        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase italic">Calendario Eventi</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <Card key={event.id} className="flex flex-col border border-zinc-800 bg-zinc-950/50 overflow-hidden shadow-2xl">
            <CardHeader className="p-0">
              <div className="bg-black/80 flex items-center justify-center h-52 w-full overflow-hidden">
                <img src={event.image || '/cascovigili.jpg'} alt="" className="object-contain h-full w-full" />
              </div>
              <div className="p-4 pb-0">
                <CardTitle className="text-xl font-black uppercase italic tracking-tighter">{event.title}</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-zinc-500">
                  {event.date || 'Da definire'}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col p-4 pt-2 gap-4">
              <p className="text-xs text-zinc-400 italic">"{event.description}"</p>
              
              {/* Sezione Partecipanti semplificata per evitare crash */}
              <div className="flex gap-2">
                <Badge className="bg-zinc-900 border-zinc-800 text-[10px] py-1 text-zinc-300">
                  <Users className="h-3 w-3 mr-1.5 text-red-600" /> EVENTO ATTIVO
                </Badge>
              </div>

              {/* Tasti Azione: Ordine Richiesto */}
              <div className="mt-auto pt-4 border-t border-zinc-900/50 space-y-3">
                
                {/* 1. TASTONE PERCORSO ROSSO SOPRA */}
                {event.percorso && (
                  <a 
                    href={event.percorso} 
                    target="_blank" 
                    rel="noopener" 
                    className="flex items-center justify-center w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded font-black text-xs uppercase italic tracking-tighter transition-all"
                  >
                    <MapPin className="h-4 w-4 mr-2" /> Visualizza Percorso
                  </a>
                )}

                {/* 2. TASTINI PICCOLI SOTTO */}
                <div className="flex flex-wrap gap-2">
                  {/* Tasto Carica Foto Piccolo e Nero */}
                  {user && (
                    <CldImageUpload 
                      onUploadSuccess={() => {}} // Logica semplificata per test
                      buttonText="Carica Foto"
                    />
                  )}

                  {/* Tasto Meteo Piccolo e Giallo */}
                  {event.metaMeteo && (
                    <a 
                      href={`https://www.ilmeteo.it/meteo/${encodeURIComponent(event.metaMeteo)}`} 
                      target="_blank" 
                      rel="noopener" 
                      className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-black rounded font-black text-[10px] uppercase tracking-tighter h-8"
                    >
                      <CloudSun className="h-3.5 w-3.5 mr-1.5" /> Meteo
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