'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, addDoc, setDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, CloudSun, Calendar, Trash2, Edit, PlusCircle, ChevronRight, Users, CheckCircle2, User, Camera, Image as ImageIcon, Loader2, X, MessageSquare } from 'lucide-react';
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
      <button className="absolute top-6 right-6 p-4 bg-red-600 rounded-full text-white z-[1000000]" onClick={(e) => { e.stopPropagation(); onClose(); }}>
        <X className="h-8 w-8" strokeWidth={3} />
      </button>
      <img src={photoUrl} className="max-w-full max-h-full object-contain p-2" alt="Zoom" onClick={(e) => e.stopPropagation()} />
    </div>,
    document.body
  );
};

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
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
          const myData = me as any;
          setNumPeople(myData.people || 1);
          setNumBikes(myData.bikes || 1);
          setNotes(myData.notes || "");
        }
      });
      const qPhotos = query(collection(db, `events/${eventDetails.id}/photos`), orderBy("createdAt", "desc"));
      const unsubPhotos = onSnapshot(qPhotos, (snapshot) => {
        const phList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEventPhotos(phList);
        if (auth.currentUser?.uid) setMyPhotosCount(phList.filter(ph => (ph as any).userId === auth.currentUser?.uid).length);
      });
      return () => { unsubP(); unsubPhotos(); };
    }
  }, [eventDetails?.id, auth.currentUser?.uid]);

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

  // FUNZIONE PER CANCELLARE LA FOTO
  const handleDeletePhoto = async (photoId: string, photoUserId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Impedisce l'apertura dell'ingrandimento
    if (!eventDetails?.id || !auth.currentUser) return;
    
    // Verifichiamo la proprietà o se è admin
    if (photoUserId === auth.currentUser.uid || isAdmin) {
      // Non usiamo un Dialog di conferma separato per le foto per non appesantire, cancelliamo direttamente
      await deleteDoc(doc(db, `events/${eventDetails.id}/photos`, photoId));
    }
  };

  const totalPeople = participants.reduce((acc, p) => acc + (Number((p as any).people) || 0), 0);
  const totalBikes = participants.reduce((acc, p) => acc + (Number((p as any).bikes) || 0), 0);

  if (loading || adminLoading) return <div className="p-10 text-white text-center font-black uppercase italic text-xs animate-pulse tracking-widest">In sella...</div>;

  return (
    <div className="w-full py-8 px-4 bg-black min-h-screen pb-24 text-white">
      {/* ... (Header e Grid rimangono identici, non tocchiamo nulla) ... */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-red-600" />
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Eventi</h1>
        </div>
        {isAdmin && (
          <Button onClick={() => { setSelectedEvent(null); setIsDialogOpen(true); }} className="bg-red-600 text-white font-black uppercase italic">
            <PlusCircle className="h-4 w-4 mr-2" /> Aggiungi
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col group hover:border-red-600 transition-colors">
            <CardHeader className="p-0 h-52 bg-black overflow-hidden relative">
              <img src={event.image || '/cascovigili.jpg'} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button size="icon" variant="destructive" className="h-8 w-8 z-10" onClick={() => { setEventToDelete(event.id); setIsDeleteConfirmOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                  <Button size="icon" className="h-8 w-8 bg-zinc-100 text-black z-10" onClick={() => { setSelectedEvent(event); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
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
              <Button onClick={() => { setEventDetails(event); setIsDetailOpen(true); }} className="w-full bg-zinc-100 hover:bg-white text-black font-black text-xs uppercase italic py-6">
                Dettagli <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto p-0 z-50 shadow-2xl">
          <div className="p-6 space-y-6">
            <DialogTitle className="text-3xl font-black uppercase italic text-red-600 leading-none">{eventDetails?.title}</DialogTitle>
            
            {/* Gallery - CON CANCELLAZIONE FOTO RIPRISTINATA */}
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
                    <img src={ph.photoData} className="w-full h-full object-cover select-none" alt="" />
                    
                    {/* PULSANTE CANCELLAZIONE FOTO (Cestino Rosso) */}
                    {(ph.userId === auth.currentUser?.uid || isAdmin) && (
                      <button 
                        onClick={(e) => handleDeletePhoto(ph.id, ph.userId, e)} 
                        className="absolute top-1 right-1 p-1.5 bg-black/70 rounded-full text-red-500 hover:bg-red-600 hover:text-white transition-colors z-20 active:scale-90"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    
                    <div className="absolute bottom-0 w-full p-1 bg-black/60 text-[8px] font-black uppercase truncate text-center">{ph.userName}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Iscrizione, Note, Partecipanti (Non tocchiamo nulla) ... */}
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-4 shadow-inner">
              <h3 className="text-sm font-black uppercase flex items-center gap-2 italic">
                {isParticipating ? <CheckCircle2 className="text-green-500 h-5 w-5" /> : <PlusCircle className="text-red-600 h-5 w-5" />}
                {isParticipating ? "Iscrizione Confermata" : "Partecipa al Giro"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Persone</Label>
                  <Input type="number" min="1" value={numPeople} onChange={(e) => setNumPeople(Number(e.target.value))} className="bg-black border-zinc-700 text-white font-bold h-12" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Moto</Label>
                  <Input type="number" min="0" value={numBikes} onChange={(e) => setNumBikes(Number(e.target.value))} className="bg-black border-zinc-700 text-white font-bold h-12" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Note (es: ristorante, ritardo...)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-black border-zinc-700 text-white min-h-[80px]" placeholder="Scrivi qui..." />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleJoinEvent} className="flex-1 bg-red-600 font-black uppercase italic h-12 shadow-lg active:scale-95 transition-transform">
                  {isParticipating ? "Aggiorna Iscrizione" : "Conferma Partecipazione"}
                </Button>
                {isParticipating && (
                  <Button onClick={handleCancelParticipation} variant="outline" className="border-zinc-800 text-zinc-500 font-black uppercase italic h-12 px-4 hover:bg-red-600 hover:text-white transition-colors">Annulla</Button>
                )}
              </div>
            </div>

            <div className="space-y-4 border-t border-zinc-900 pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase text-zinc-500 italic flex items-center gap-2"><Users className="h-4 w-4" /> Iscritti ({participants.length})</h3>
                <div className="text-[11px] font-black text-red-600 uppercase italic bg-black/50 px-3 py-1 rounded-full border border-zinc-800">
                  TOT: {totalPeople} P / {totalBikes} M
                </div>
              </div>
              <div className="grid gap-2 pb-4">
                {participants.map((p) => (
                  <div key={p.id} className="bg-zinc-900/40 p-3 rounded border border-zinc-900/50 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                          {p.photoURL ? <img src={p.photoURL} className="w-full h-full object-cover" alt="" /> : <User className="h-4 w-4 text-zinc-600" />}
                        </div>
                        <span className="font-bold text-[11px] uppercase text-white tracking-tight">{p.name || "SOCIO"}</span>
                      </div>
                      <span className="text-[10px] font-black text-zinc-400 bg-black/50 px-2 py-1 rounded border border-zinc-800/50">{(p as any).people || 0} P / {(p as any).bikes || 0} M</span>
                    </div>
                    {(p as any).notes && (
                      <div className="flex gap-2 items-start pl-11">
                        <MessageSquare className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-zinc-400 italic leading-tight">"{(p as any).notes}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ingrandimento Foto (Portal, NO LAG) */}
      {selectedPhoto && <PhotoPortal photoUrl={selectedPhoto} onClose={() => setSelectedPhoto(null)} />}
      
      {/* Input File Nascosto */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />

      {/* Dialog per Admin */}
      <EventDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} event={selectedEvent} onSave={(d) => selectedEvent ? updateDoc(doc(db, "events", selectedEvent.id), d) : addDoc(collection(db, "events"), d)} />
      <ConfirmDeleteDialog isOpen={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen} onConfirm={() => deleteDoc(doc(db, "events", eventToDelete!))} title="Elimina" description="Sicuro?" />
    </div>
  );
}