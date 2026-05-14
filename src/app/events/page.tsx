'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, addDoc, setDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, CloudSun, Calendar, Trash2, Edit, PlusCircle, ChevronRight, Users, CheckCircle2, User, Camera, Image as ImageIcon, Loader2, X, MessageSquare, Archive, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/use-admin';
import EventDialog from '@/components/EventDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PhotoPortal = ({ photoUrl, onClose }: { photoUrl: string; onClose: () => void }) => {
  if (typeof window === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/95 z-[999999] flex items-center justify-center touch-none" onClick={onClose}>
      <button className="absolute top-6 right-6 p-4 bg-red-600 rounded-full text-white z-[1000000] shadow-2xl active:scale-90" onClick={(e) => { e.stopPropagation(); onClose(); }}>
        <X className="h-8 w-8" strokeWidth={3} />
      </button>
      <img src={photoUrl} className="max-w-full max-h-full object-contain p-2" alt="Zoom" onClick={(e) => e.stopPropagation()} />
    </div>,
    document.body
  );
};

export default function EventsPage() {
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [archivedEvents, setArchivedEvents] = useState<any[]>([]);
  const [showArchive, setShowArchive] = useState(false);
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
  const [notes, setNotes] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
      const allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const today = new Date().toISOString().split('T')[0];
      setActiveEvents(allEvents.filter((e: any) => e.date >= today));
      setArchivedEvents(allEvents.filter((e: any) => e.date < today));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (eventDetails?.id) {
      const unsubP = onSnapshot(collection(db, `events/${eventDetails.id}/participants`), (snapshot) => {
        const pList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setParticipants(pList);
        const me = pList.find(p => p.id === auth.currentUser?.uid);
        setIsParticipating(!!me);
        if (me) {
          setNumPeople((me as any).people || 1);
          setNumBikes((me as any).bikes || 1);
          setNotes((me as any).notes || "");
        }
      });
      const qPhotos = query(collection(db, `events/${eventDetails.id}/photos`), orderBy("createdAt", "desc"));
      const unsubPhotos = onSnapshot(qPhotos, (snapshot) => {
        const phList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEventPhotos(phList);
        if (auth.currentUser?.uid) {
          setMyPhotosCount(phList.filter(ph => (ph as any).userId === auth.currentUser?.uid).length);
        }
      });
      return () => { unsubP(); unsubPhotos(); };
    }
  }, [eventDetails?.id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser || !eventDetails?.id || myPhotosCount >= 3) return;
    setIsUploading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.email!));
      const nomeSocio = `${userDoc.data()?.nome || ""} ${userDoc.data()?.cognome || ""}`.trim().toUpperCase() || "SOCIO";
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
          await addDoc(collection(db, `events/${eventDetails.id}/photos`), {
            userId: auth.currentUser?.uid,
            userName: nomeSocio,
            photoData: canvas.toDataURL('image/jpeg', 0.6),
            createdAt: new Date().toISOString()
          });
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        };
      };
    } catch (err) { setIsUploading(false); }
  };

  const handleJoinEvent = async () => {
    if (!auth.currentUser || !eventDetails?.id) return;
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.email!));
    const userData = userDoc.data();
    await setDoc(doc(db, `events/${eventDetails.id}/participants`, auth.currentUser.uid), {
      name: `${userData?.nome || ""} ${userData?.cognome || ""}`.trim().toUpperCase() || "SOCIO",
      email: auth.currentUser.email,
      photoURL: userData?.photoURL || "",
      people: Number(numPeople),
      bikes: Number(numBikes),
      notes: notes,
      joinedAt: new Date().toISOString()
    });
  };

  const handleCancelParticipation = async () => {
    if (auth.currentUser && eventDetails?.id) {
      await deleteDoc(doc(db, `events/${eventDetails.id}/participants`, auth.currentUser.uid));
    }
  };

  const handleDeletePhoto = async (photoId: string, photoUserId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!eventDetails?.id || !auth.currentUser) return;
    if (photoUserId === auth.currentUser.uid || isAdmin) {
      await deleteDoc(doc(db, `events/${eventDetails.id}/photos`, photoId));
    }
  };

  const totalPeople = participants.reduce((acc, p) => acc + (Number((p as any).people) || 0), 0);
  const totalBikes = participants.reduce((acc, p) => acc + (Number((p as any).bikes) || 0), 0);

  const EventCard = (event: any, isArchived: boolean = false) => (
    <Card key={event.id} className={`border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col group hover:border-red-600 transition-all ${isArchived ? 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100' : ''}`}>
      <CardHeader className="p-0 h-52 bg-black overflow-hidden relative">
        <img src={event.image || '/cascovigili.jpg'} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <Button size="icon" variant="destructive" className="h-8 w-8 shadow-xl" onClick={() => { setEventToDelete(event.id); setIsDeleteConfirmOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
            <Button size="icon" className="h-8 w-8 bg-zinc-100 text-black shadow-xl" onClick={() => { setSelectedEvent(event); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex flex-col gap-4">
        <div>
          <CardTitle className="text-xl font-black uppercase italic tracking-tighter leading-none">{event.title}</CardTitle>
          <CardDescription className="text-red-600 text-[10px] font-black uppercase italic mt-1">{event.date}</CardDescription>
        </div>
        <div className="flex gap-2">
          {event.percorso && (
            <a href={event.percorso} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center py-3 bg-red-600 text-white rounded font-black text-[10px] uppercase italic">
              <MapPin className="h-3.5 w-3.5 mr-1" /> Percorso
            </a>
          )}
          {event.metaMeteo && (
            <a href={`https://www.ilmeteo.it/meteo/${event.metaMeteo.replace(/\s+/g, '+')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center py-3 bg-yellow-600 text-black rounded font-black text-[10px] uppercase">
              <CloudSun className="h-3.5 w-3.5 mr-1" /> Meteo
            </a>
          )}
        </div>
        <Button onClick={() => { setEventDetails(event); setIsDetailOpen(true); }} className="w-full bg-zinc-100 hover:bg-white text-black font-black uppercase italic py-6 transition-all">
          Dettagli <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  if (loading || adminLoading) return <div className="p-10 text-white text-center font-black uppercase italic text-xs animate-pulse tracking-widest">In sella...</div>;

  return (
    <div className="w-full py-8 px-4 bg-black min-h-screen pb-24 text-white">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-red-600" />
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Prossimi Eventi</h1>
        </div>
        {isAdmin && (
          <Button onClick={() => { setSelectedEvent(null); setIsDialogOpen(true); }} className="bg-red-600 text-white font-black uppercase italic">
            <PlusCircle className="h-4 w-4 mr-2" /> Aggiungi
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeEvents.length > 0 ? (
          activeEvents.map((event) => EventCard(event))
        ) : (
          <div className="col-span-full py-12 text-center border border-dashed border-zinc-900 rounded-2xl">
            <p className="text-zinc-600 font-black uppercase italic text-sm">Nessuna uscita in programma</p>
          </div>
        )}
      </div>

      {/* PULSANTE ARCHIVIO CORRETTO */}
      {archivedEvents.length > 0 && (
        <div className="mt-20 flex flex-col items-center">
          <Button 
            onClick={() => setShowArchive(!showArchive)} 
            variant="ghost" 
            className="group flex flex-col items-center gap-2 hover:bg-transparent text-white hover:text-red-600 transition-all"
          >
            <Archive className="h-7 w-7 mb-1" />
            <span className="text-[14px] font-black uppercase italic tracking-widest">
              {showArchive ? 'Nascondi Archivio' : 'Vedi Uscite Precedenti'}
            </span>
            <ChevronDown className={`h-5 w-5 transition-transform duration-500 ${showArchive ? 'rotate-180' : ''}`} />
          </Button>

          {showArchive && (
            <div className="w-full mt-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-zinc-900"></div>
                <span className="text-xs font-black uppercase italic text-zinc-800">Memorie</span>
                <div className="h-[1px] flex-1 bg-zinc-900"></div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {archivedEvents.map((event) => EventCard(event, true))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DETTAGLI */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-0 z-50 rounded-lg">
          <div className="p-4 sm:p-6 space-y-6">
            <DialogTitle className="text-2xl sm:text-3xl font-black uppercase italic text-red-600 leading-none">
              {eventDetails?.title}
            </DialogTitle>
            
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase italic flex items-center gap-2"><Camera className="h-4 w-4 text-red-600" /> Gallery ({eventPhotos.length})</h3>
                {isParticipating && (
                   <Button disabled={myPhotosCount >= 3 || isUploading} onClick={() => fileInputRef.current?.click()} className="text-[10px] h-8 font-black uppercase italic bg-red-600">
                     {isUploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
                     Carica ({myPhotosCount}/3)
                   </Button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {eventPhotos.map((ph) => (
                  <div key={ph.id} className="relative aspect-square rounded overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer" onClick={() => setSelectedPhoto(ph.photoData)}>
                    <img src={ph.photoData} className="w-full h-full object-cover" alt="" />
                    {(ph.userId === auth.currentUser?.uid || isAdmin) && (
                      <button onClick={(e) => handleDeletePhoto(ph.id, ph.userId, e)} className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-red-500"><Trash2 className="h-3 w-3" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-[10px] uppercase text-zinc-500">Persone</Label><Input type="number" value={numPeople} onChange={(e) => setNumPeople(Number(e.target.value))} className="bg-black border-zinc-700" /></div>
                <div className="space-y-1.5"><Label className="text-[10px] uppercase text-zinc-500">Moto</Label><Input type="number" value={numBikes} onChange={(e) => setNumBikes(Number(e.target.value))} className="bg-black border-zinc-700" /></div>
              </div>
              <Button onClick={handleJoinEvent} className="w-full bg-red-600 font-black uppercase italic">{isParticipating ? "Aggiorna Dati" : "Partecipa"}</Button>
            </div>

            <div className="space-y-4 border-t border-zinc-900 pt-6">
               <h3 className="text-[10px] font-black uppercase text-zinc-500 italic">Iscritti ({participants.length})</h3>
               <div className="grid gap-2">
                {participants.map((p) => (
                  <div key={p.id} className="bg-zinc-900/40 p-3 rounded border border-zinc-900/50 flex justify-between items-center">
                    <span className="font-bold text-[11px] uppercase">{(p as any).name}</span>
                    <span className="text-[10px] font-black text-zinc-400">{(p as any).people}P / {(p as any).bikes}M</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedPhoto && <PhotoPortal photoUrl={selectedPhoto} onClose={() => setSelectedPhoto(null)} />}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
      <EventDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} event={selectedEvent} onSave={(d) => selectedEvent ? updateDoc(doc(db, "events", selectedEvent.id), d) : addDoc(collection(db, "events"), d)} />
      <ConfirmDeleteDialog isOpen={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen} onConfirm={() => deleteDoc(doc(db, "events", eventToDelete!))} title="Elimina" description="Sicuro?" />
    </div>
  );
}