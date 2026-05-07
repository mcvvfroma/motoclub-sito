'use client';

import { useState, useEffect, useRef } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, addDoc, setDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, CloudSun, Calendar, Trash2, Edit, PlusCircle, Clock, Route, ChevronRight, Users, CheckCircle2, XCircle, User, Camera, Image as ImageIcon, Loader2, X } from 'lucide-react';
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
  
  // STATO PER LA FOTO SELEZIONATA
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const [numPeople, setNumPeople] = useState(1);
  const [numBikes, setNumBikes] = useState(1);
  const [notes, setNotes] = useState("");
  
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
        if (currentUid) {
          const count = phList.filter(ph => (ph as any).userId === currentUid).length;
          setMyPhotosCount(count);
        }
      });
      return () => { unsubP(); unsubPhotos(); };
    }
  }, [eventDetails?.id, auth.currentUser?.uid]);

  const getSocioName = async () => {
    if (!auth.currentUser?.email) return "SOCIO";
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.email));
    if (userDoc.exists()) {
      const d = userDoc.data();
      return `${d.nome || ""} ${d.cognome || ""}`.trim().toUpperCase() || "SOCIO";
    }
    return "SOCIO";
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser || !eventDetails?.id || myPhotosCount >= 3) return;
    setIsUploading(true);
    try {
      const nomeSocio = await getSocioName();
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = img.height * (800 / img.width);
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
    const nomeSocio = await getSocioName();
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.email!));
    await setDoc(doc(db, `events/${eventDetails.id}/participants`, auth.currentUser.uid), {
      name: nomeSocio,
      email: auth.currentUser.email,
      photoURL: userDoc.data()?.photoURL || "",
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

  const totalPeople = participants.reduce((acc, p) => acc + (Number(p.people) || 0), 0);
  const totalBikes = participants.reduce((acc, p) => acc + (Number(p.bikes) || 0), 0);

  if (loading || adminLoading) return <div className="p-10 text-white text-center font-black uppercase italic text-xs animate-pulse tracking-widest">In sella...</div>;

  return (
    <div className="w-full py-8 px-4 bg-black min-h-screen pb-24">
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
          <Card key={event.id} className="border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col group hover:border-red-600 transition-colors">
            <CardHeader className="p-0">
              <div className="h-52 bg-black flex items-center justify-center overflow-hidden">
                <img src={event.image || '/cascovigili.jpg'} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <CardTitle className="text-xl font-black text-white uppercase italic tracking-tighter">{event.title}</CardTitle>
                <CardDescription className="text-red-600 text-[10px] font-black uppercase italic">{event.date}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow flex flex-col gap-4">
              <p className="text-xs text-zinc-400 italic line-clamp-2">"{event.description}"</p>
              <div className="mt-auto space-y-3">
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
                {isAdmin && (
                  <div className="flex justify-end gap-4 pt-2 border-t border-zinc-900">
                    <button onClick={() => { setSelectedEvent(event); setIsDialogOpen(true); }} className="text-zinc-500 hover:text-white"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => { setEventToDelete(event.id); setIsDeleteConfirmOpen(true); }} className="text-zinc-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DIALOG DETTAGLI */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6 space-y-6">
            <DialogTitle className="text-3xl font-black uppercase italic text-red-600 tracking-tighter">{eventDetails?.title}</DialogTitle>

            <div className="space-y-4 border-t border-zinc-900 pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase italic flex items-center gap-2"><Camera className="h-4 w-4 text-red-600" /> Gallery ({eventPhotos.length})</h3>
                {isParticipating && (
                  <div className="relative">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
                    <Button disabled={myPhotosCount >= 3 || isUploading} onClick={() => fileInputRef.current?.click()} className={`text-[10px] h-8 font-black uppercase italic ${myPhotosCount >= 3 ? 'bg-zinc-800' : 'bg-red-600'}`}>
                      {isUploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
                      Carica ({myPhotosCount}/3)
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {eventPhotos.map((ph) => (
                  <div key={ph.id} className="relative aspect-square rounded overflow-hidden bg-zinc-900 border border-zinc-800">
                    <img 
                      src={ph.photoData} 
                      className="w-full h-full object-cover cursor-pointer" 
                      alt="" 
                      onClick={() => setSelectedPhoto(ph.photoData)} 
                    />
                    {(ph.userId === auth.currentUser?.uid || isAdmin) && (
                      <button onClick={async (e) => { e.stopPropagation(); await deleteDoc(doc(db, `events/${eventDetails.id}/photos`, ph.id)); }} className="absolute top-1 right-1 p-1 bg-black/80 rounded-full text-red-500 z-10"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                    <div className="absolute bottom-0 w-full p-1 bg-black/60 text-[8px] text-white font-black uppercase truncate text-center pointer-events-none">{ph.userName || "SOCIO"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Iscrizione */}
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-4">
              <h3 className="text-sm font-black uppercase flex items-center gap-2 italic">
                {isParticipating ? <CheckCircle2 className="text-green-500 h-5 w-5" /> : <PlusCircle className="text-red-600 h-5 w-5" />}
                {isParticipating ? "Iscrizione Confermata" : "Partecipa al Giro"}
              </h3>
              {!isParticipating ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">N° Persone</Label>
                      <Input type="number" min="1" value={numPeople} onChange={(e) => setNumPeople(Number(e.target.value))} className="bg-black border-zinc-700 text-white font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">N° Moto</Label>
                      <Input type="number" min="0" value={numBikes} onChange={(e) => setNumBikes(Number(e.target.value))} className="bg-black border-zinc-700 text-white font-bold" />
                    </div>
                  </div>
                  <Button onClick={handleJoinEvent} className="w-full bg-red-600 font-black uppercase italic h-12 text-sm">Conferma Partecipazione</Button>
                </div>
              ) : (
                <Button onClick={handleCancelParticipation} variant="outline" className="w-full border-zinc-800 text-zinc-500 font-black uppercase italic h-12 hover:bg-red-600 hover:text-white transition-colors">Annulla Partecipazione</Button>
              )}
            </div>

            {/* Lista Partecipanti */}
            <div className="space-y-4 border-t border-zinc-900 pt-6">
              <h3 className="text-[10px] font-black uppercase text-zinc-500 italic flex items-center gap-2">
                <Users className="h-4 w-4" /> Soci Iscritti ({participants.length})
              </h3>
              <div className="grid gap-2 pb-4">
                {participants.map((p) => (
                  <div key={p.id} className="bg-zinc-900/40 p-3 rounded border border-zinc-900/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-zinc-800">
                        {p.photoURL ? <img src={p.photoURL} className="w-full h-full object-cover" alt="" /> : <User className="h-4 w-4 text-zinc-600 m-auto" />}
                      </div>
                      <span className="font-bold text-xs uppercase text-white">{p.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-zinc-400">{p.people} P / {p.bikes} M</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG INGRANDIMENTO FOTO - SOLUZIONE DEFINITIVA */}
      {/* Usando un Dialog dedicato, Radix gestisce correttamente il focus e il tocco immediato */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-[95vw] w-fit p-0 border-none bg-transparent shadow-none flex items-center justify-center">
          <div className="relative group">
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 -right-2 p-3 bg-red-600 rounded-full text-white shadow-2xl z-50 hover:bg-red-700 active:scale-90"
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={selectedPhoto || ""} 
              className="max-w-full max-h-[80vh] object-contain rounded-md" 
              alt="Preview" 
            />
          </div>
        </DialogContent>
      </Dialog>

      <EventDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} event={selectedEvent} onSave={(d) => selectedEvent ? updateDoc(doc(db, "events", selectedEvent.id), d) : addDoc(collection(db, "events"), d)} />
      <ConfirmDeleteDialog isOpen={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen} onConfirm={() => deleteDoc(doc(db, "events", eventToDelete!))} title="Elimina" description="Sicuro?" />
    </div>
  );
}