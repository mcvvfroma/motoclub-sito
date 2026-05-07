'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Camera, Calendar, ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function GalleriaPage() {
  const [galleryData, setGalleryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stati per la gestione dello slider
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [currentGroupPhotos, setCurrentGroupPhotos] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeEvents = onSnapshot(collection(db, "events"), (eventSnapshot) => {
      if (eventSnapshot.empty) {
        setGalleryData([]);
        setLoading(false);
        return;
      }

      eventSnapshot.docs.forEach((eventDoc) => {
        const eventId = eventDoc.id;
        const eventTitle = eventDoc.data().title || "Evento senza titolo";
        const qPhotos = query(collection(db, `events/${eventId}/photos`), orderBy("createdAt", "desc"));
        
        onSnapshot(qPhotos, (photoSnapshot) => {
          const photos = photoSnapshot.docs.map(p => ({ id: p.id, ...p.data() }));
          setGalleryData(prev => {
            const otherEvents = prev.filter(item => item.id !== eventId);
            if (photos.length > 0) {
              return [...otherEvents, { id: eventId, title: eventTitle, photos }].sort((a, b) => b.id.localeCompare(a.id));
            }
            return otherEvents;
          });
        });
      });
      setLoading(false);
    });
    return () => unsubscribeEvents();
  }, []);

  // Funzioni di navigazione
  const openPhoto = (photos: any[], index: number) => {
    setCurrentGroupPhotos(photos);
    setSelectedPhotoIndex(index);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null && selectedPhotoIndex < currentGroupPhotos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

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
        {galleryData.map((group) => (
          <section key={group.id} className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <h2 className="text-sm font-black uppercase italic text-red-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> {group.title}
              </h2>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{group.photos.length} Foto</span>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {group.photos.map((ph: any, index: number) => (
                <div 
                  key={ph.id} 
                  className="relative aspect-square rounded bg-zinc-900 border border-zinc-800 overflow-hidden cursor-pointer"
                  onClick={() => openPhoto(group.photos, index)}
                >
                  <img src={ph.photoData} className="w-full h-full object-cover" alt="" />
                  <div className="absolute bottom-0 w-full p-1 bg-black/70 text-[7px] text-white font-black uppercase truncate text-center font-bold">
                    {ph.userName || "SOCIO"}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Pulsante Home */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <Link href="/" className="px-8 py-3 bg-red-600 text-white rounded-full font-black uppercase italic text-xs shadow-2xl hover:bg-red-700 transition">
          Torna alla Home
        </Link>
      </div>

      {/* SLIDER FOTO FULLSCREEN */}
      {selectedPhotoIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-0"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Tasto Chiusura */}
          <button className="fixed top-6 right-6 p-2 bg-red-600 rounded-full text-white z-[110]">
            <X className="h-6 w-6" />
          </button>

          {/* Freccia Sinistra */}
          {selectedPhotoIndex > 0 && (
            <button 
              onClick={prevPhoto}
              className="fixed left-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-900/50 rounded-full text-white hover:bg-red-600 z-[110] transition-colors"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* Freccia Destra */}
          {selectedPhotoIndex < currentGroupPhotos.length - 1 && (
            <button 
              onClick={nextPhoto}
              className="fixed right-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-900/50 rounded-full text-white hover:bg-red-600 z-[110] transition-colors"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
          
          <div className="w-full h-full flex flex-col items-center justify-center">
            <img 
              src={currentGroupPhotos[selectedPhotoIndex].photoData} 
              className="max-w-full max-h-[85vh] object-contain shadow-2xl" 
              alt="Zoom"
              onClick={(e) => e.stopPropagation()} 
            />
            {/* Nome Socio in basso nello slider */}
            <p className="mt-4 text-white font-black uppercase italic tracking-widest text-xs bg-red-600 px-4 py-1 rounded">
              {currentGroupPhotos[selectedPhotoIndex].userName}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}