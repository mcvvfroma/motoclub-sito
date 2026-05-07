'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Camera, Calendar, ImageIcon, X } from 'lucide-react';
import Link from 'next/link';

export default function GalleriaPage() {
  const [galleryData, setGalleryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    // 1. Ascolta i cambiamenti negli eventi
    const unsubscribeEvents = onSnapshot(collection(db, "events"), (eventSnapshot) => {
      if (eventSnapshot.empty) {
        setGalleryData([]);
        setLoading(false);
        return;
      }

      // Per ogni evento, creiamo un listener per le sue foto
      eventSnapshot.docs.forEach((eventDoc) => {
        const eventId = eventDoc.id;
        const eventTitle = eventDoc.data().title || "Evento senza titolo";

        const qPhotos = query(collection(db, `events/${eventId}/photos`), orderBy("createdAt", "desc"));
        
        onSnapshot(qPhotos, (photoSnapshot) => {
          const photos = photoSnapshot.docs.map(p => ({ id: p.id, ...p.data() }));
          
          setGalleryData(prev => {
            // Rimuoviamo la vecchia versione dell'evento e aggiungiamo quella aggiornata (se ha foto)
            const otherEvents = prev.filter(item => item.id !== eventId);
            if (photos.length > 0) {
              const updated = [...otherEvents, { id: eventId, title: eventTitle, photos }];
              // Ordiniamo per ID (o potresti ordinare per data evento se ce l'hai)
              return updated.sort((a, b) => b.id.localeCompare(a.id));
            }
            return otherEvents;
          });
        });
      });
      setLoading(false);
    });

    return () => unsubscribeEvents();
  }, []);

  if (loading) return <div className="p-10 text-white text-center font-black uppercase italic text-xs animate-pulse tracking-widest">Caricamento Ricordi...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-4 pb-24">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10 mt-6 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
          <Camera className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Galleria Foto</h1>
        </div>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Archivio storico dei nostri giri</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        {galleryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-lg">
            <ImageIcon className="h-12 w-12 text-zinc-800 mb-4" />
            <p className="text-zinc-500 font-black uppercase italic text-xs">Nessuna foto disponibile al momento</p>
          </div>
        ) : (
          galleryData.map((group) => (
            <section key={group.id} className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <h2 className="text-sm font-black uppercase italic text-red-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> {group.title}
                </h2>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{group.photos.length} Foto</span>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {group.photos.map((ph: any) => (
                  <div 
                    key={ph.id} 
                    className="relative aspect-square rounded bg-zinc-900 border border-zinc-800 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedPhoto(ph.photoData)}
                  >
                    <img 
                      src={ph.photoData} 
                      className="w-full h-full object-cover" 
                      alt="" 
                    />
                    <div className="absolute bottom-0 w-full p-1 bg-black/70 text-[7px] text-white font-black uppercase truncate text-center">
                      {ph.userName || "SOCIO"}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Pulsante Home */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Link href="/" className="px-8 py-3 bg-red-600 text-white rounded-full font-black uppercase italic text-xs shadow-2xl hover:bg-red-700 transition flex items-center gap-2">
          Torna alla Home
        </Link>
      </div>

      {/* Visualizzatore Foto (Nativo per Zoom) */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center overflow-auto p-0"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Tasto chiusura puramente visivo */}
          <div className="fixed top-6 right-6 p-2 bg-red-600 rounded-full text-white z-[110]">
            <X className="h-6 w-6" />
          </div>
          
          <div className="min-w-full min-h-full flex items-center justify-center">
            <img 
              src={selectedPhoto} 
              className="max-w-full h-auto object-contain shadow-2xl" 
              alt="Zoom"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </main>
  );
}