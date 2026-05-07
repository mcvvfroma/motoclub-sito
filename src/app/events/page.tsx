'use client';

import { useState, useEffect, useRef } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, addDoc, setDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, CloudSun, Calendar, Trash2, Edit, PlusCircle, ChevronRight, Users, CheckCircle2, User, Camera, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/use-admin';
import EventDialog from '@/components/EventDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [eventPhotos, setEventPhotos] = useState<any[]>([]);
  const [isParticipating, setIsParticipating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [myPhotosCount, setMyPhotosCount] = useState(0); 
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [numPeople, setNumPeople] = useState(1);
  const [numBikes, setNumBikes] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (eventDetails?.id) {
      const unsubP = onSnapshot(collection(db, `events/${eventDetails.id}/participants`), (snapshot) => {
        const pList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setParticipants(pList);
        setIsParticipating(pList.some(p => p.id === auth.currentUser?.uid));
      });
      const qPhotos = query(collection(db, `events/${eventDetails.id}/photos`), orderBy("createdAt", "desc"));
      const unsubPhotos = onSnapshot(qPhotos, (snapshot) => {
        const phList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEventPhotos(phList);
        const currentUid = auth.currentUser?.uid;
        if (currentUid) setMyPhotosCount(phList.filter(ph => (ph as any).userId === currentUid).length);
      });
      return () => { unsubP(); unsubPhotos(); };
    }
  }, [eventDetails?.id, auth.currentUser?.uid]);

  const handleJoinEvent = async () => {
    if (!auth.currentUser || !eventDetails?.id) return;
    await setDoc(doc(db, `events/${eventDetails.id}/participants`, auth.currentUser.uid), {
      name: auth.currentUser.displayName || "SOCIO",
      people: Number(numPeople),
      bikes: Number(numBikes),
      joinedAt: new Date().toISOString()
    });
  };

  if (loading || adminLoading) return <div className="p-10 text-white text-center font-black uppercase italic text-xs animate-pulse">In sella...</div>;

  return (
    <div className="w-full py-8 px-4 bg-black min-h-screen pb-24">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Eventi</h1>
        {isAdmin && (
          <Button onClick={() => { setSelectedEvent(null); setIsDialogOpen(true); }} className="bg-red-600 font-black uppercase italic">
            <PlusCircle className="h-4 w-4 mr-2" /> Aggiungi
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col group">
            <CardHeader className="p-0 h-52 bg-black">
              <img src={event.image || '/cascovigili.jpg'} alt="" className="w-full h-full object-contain" />
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col gap-4">
              <div>
                <CardTitle className="text-xl font-black text-white uppercase italic tracking-tighter">{event.title}</CardTitle>
                <CardDescription className="text-red-600 text-[10px] font-black uppercase italic">{event.date}</CardDescription>
              </div>
              
              <div className="flex gap-2">
                {event.percorso && (
                  <a href={event.percorso} target="_blank" className="flex-1 flex items-center justify-center py-2 bg-red-600 text-white rounded font-black text-[10px] uppercase italic">
                    <MapPin className="h-3 w-3 mr-1" /> Percorso
                  </a>
                )}
                {event.metaMeteo && (
                  <a href={`https://www.ilmeteo.it/meteo/${event.metaMeteo}`} target="_blank" className="flex-1 flex items-center justify-center py-2 bg-yellow-600 text-black rounded font-black text-[10px] uppercase">
                    <CloudSun className="h-3 w-3 mr-1" /> Meteo
                  </a>
                )}
              </div>

              <Button onClick={() => { setEventDetails(event); setIsDetailOpen(true); }} className="w-full bg-zinc-100 text-black font-black uppercase italic">
                Dettagli <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-2xl font-black uppercase italic text-red-600">{eventDetails?.title}</DialogTitle>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {eventPhotos.map((ph) => (
              <img key={ph.id} src={ph.photoData} className="aspect-square object-cover rounded cursor-pointer" onClick={() => setSelectedPhoto(ph.photoData)} />
            ))}
          </div>
          <div className="mt-6 border-t border-zinc-900 pt-6">
            <Button onClick={handleJoinEvent} className="w-full bg-red-600 font-black uppercase italic h-12">Conferma Partecipazione</Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/95 z-[99999] flex items-center justify-center" onClick={() => setSelectedPhoto(null)}>
          <button className="absolute top-6 right-6 p-4 bg-red-600 rounded-full text-white z-[100000]" onClick={() => setSelectedPhoto(null)}>
            <X size={32} />
          </button>
          <img src={selectedPhoto} className="max-w-full max-h-full object-contain" alt="" />
        </div>
      )}

      <EventDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} event={selectedEvent} onSave={(d) => selectedEvent ? updateDoc(doc(db, "events", selectedEvent.id), d) : addDoc(collection(db, "events"), d)} />
      <ConfirmDeleteDialog isOpen={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen} onConfirm={() => deleteDoc(doc(db, "events", eventToDelete!))} title="Elimina" description="Sicuro?" />
    </div>
  );
}