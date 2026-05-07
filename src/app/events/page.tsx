'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, addDoc, setDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, CloudSun, Calendar, Trash2, Edit, PlusCircle, Clock, Route, ChevronRight, Users, CheckCircle2, XCircle, ClipboardList, User, Radio, Info } from 'lucide-react';
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
  const [isParticipating, setIsParticipating] = useState(false);
  
  const [numPeople, setNumPeople] = useState(1);
  const [numBikes, setNumBikes] = useState(1);
  const [notes, setNotes] = useState("");
  
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (eventDetails?.id) {
      const unsub = onSnapshot(collection(db, `events/${eventDetails.id}/participants`), (snapshot) => {
        const pList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setParticipants(pList);
        setIsParticipating(pList.some(p => p.id === auth.currentUser?.uid));
      });
      return () => unsub();
    }
  }, [eventDetails, auth.currentUser]);

  const handleJoinEvent = async () => {
    const user = auth.currentUser;
    if (!user || !eventDetails?.id) {
      alert("Errore: Devi essere loggato.");
      return;
    }

    try {
      const userEmail = user.email;
      if (!userEmail) return;

      const userDocRef = doc(db, "users", userEmail);
      const userSnap = await getDoc(userDocRef);
      
      let nomeCompleto = "";
      let photoURL = "";

      if (userSnap.exists()) {
        const d = userSnap.data();
        photoURL = d.photoURL || "";
        if (d.nome && d.cognome) {
          nomeCompleto = `${d.nome} ${d.cognome}`;
        } else {
          nomeCompleto = d.nome || user.displayName || userEmail.split('@')[0];
        }
      } else {
        nomeCompleto = user.displayName || userEmail.split('@')[0];
      }

      await setDoc(doc(db, `events/${eventDetails.id}/participants`, user.uid), {
        name: nomeCompleto.toUpperCase(),
        photoURL: photoURL,
        people: Number(numPeople),
        bikes: Number(numBikes),
        notes: notes,
        joinedAt: new Date().toISOString()
      });
      
      alert(`Iscrizione confermata per: ${nomeCompleto.toUpperCase()}`);
    } catch (error: any) {
      console.error(error);
      alert("Errore: " + error.message);
    }
  };

  const handleCancelParticipation = async () => {
    const user = auth.currentUser;
    if (!user || !eventDetails?.id) return;
    try {
      await deleteDoc(doc(db, `events/${eventDetails.id}/participants`, user.uid));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveEvent = async (formData: any) => {
    if (!isAdmin) return;
    try {
      if (selectedEvent?.id) {
        await updateDoc(doc(db, "events", selectedEvent.id), formData);
      } else {
        await addDoc(collection(db, "events"), formData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const confirmDelete = async () => {
    if (eventToDelete && isAdmin) {
      await deleteDoc(doc(db, "events", eventToDelete));
      setIsDeleteConfirmOpen(false);
    }
  };

  const totalPeople = participants.reduce((acc, p) => acc + (p.people || 0), 0);
  const totalBikes = participants.reduce((acc, p) => acc + (p.bikes || 0), 0);

  if (loading || adminLoading) return <div className="p-10 text-white text-center font-black uppercase italic tracking-widest">In sella...</div>;

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
              <p className="text-xs text-zinc-400 italic line-clamp-2">"{event.description}"</p>
              
              <div className="mt-auto space-y-3">
                <div className="flex gap-2">
                  {event.percorso && (
                    <a href={event.percorso} target="_blank" className="flex-1 flex items-center justify-center py-3 bg-red-600 text-white rounded font-black text-[10px] uppercase italic">
                      <MapPin className="h-3.5 w-3.5 mr-1" /> Percorso
                    </a>
                  )}
                  {event.metaMeteo && (
                    <a href={`https://www.ilmeteo.it/meteo/${event.metaMeteo}`} target="_blank" className="flex-1 flex items-center justify-center py-3 bg-yellow-600 text-black rounded font-black text-[10px] uppercase">
                      <CloudSun className="h-3.5 w-3.5 mr-1" /> Meteo
                    </a>
                  )}
                </div>

                <Button 
                  onClick={() => { setEventDetails(event); setIsDetailOpen(true); }}
                  className="w-full bg-zinc-100 hover:bg-white text-black font-black text-xs uppercase italic py-6"
                >
                  Dettagli <ChevronRight className="ml-1 h-4 w-4" />
                </Button>

                {isAdmin && (
                  <div className="flex justify-end gap-4 pt-2 border-t border-zinc-900">
                    <button onClick={() => { setSelectedEvent(event); setIsDialogOpen(true); }} className="text-zinc-500 hover:text-white transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setEventToDelete(event.id); setIsDeleteConfirmOpen(true); }} className="text-zinc-500 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto p-0 scrollbar-hide">
          <div className="p-6 space-y-6">
            <DialogTitle className="text-3xl font-black uppercase italic text-red-600 tracking-tighter">
              {eventDetails?.title}
            </DialogTitle>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900 p-4 rounded border border-zinc-800 flex flex-col gap-1">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Orario Ritrovo</span>
                  <span className="text-xs font-black uppercase text-zinc-200">{eventDetails?.meetingTime || "---"}</span>
                </div>
                <div className="bg-zinc-900 p-4 rounded border border-zinc-800 flex flex-col gap-1">
                  <Route className="h-4 w-4 text-red-600" />
                  <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Distanza Totale</span>
                  <span className="text-xs font-black uppercase text-zinc-200">{eventDetails?.distanceKm ? `${eventDetails.distanceKm} KM` : "---"}</span>
                </div>
              </div>
              
              <div className="bg-zinc-900 p-4 rounded border border-zinc-800 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Punto di Incontro</span>
                </div>
                <p className="text-[11px] font-black uppercase text-zinc-200 leading-relaxed italic">
                  {eventDetails?.meetingPoint || "DA DEFINIRE"}
                </p>
              </div>
            </div>

            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-6">
              <h3 className="text-sm font-black uppercase flex items-center gap-2 italic">
                {isParticipating ? <CheckCircle2 className="text-green-500 h-5 w-5" /> : <PlusCircle className="text-red-600 h-5 w-5" />}
                {isParticipating ? "Iscrizione Confermata" : "Partecipa al Giro"}
              </h3>
              
              {!isParticipating ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-zinc-500 font-bold">N° Persone</Label>
                      <Input type="number" min="1" value={numPeople} onChange={(e) => setNumPeople(Number(e.target.value))} className="bg-black border-zinc-700 h-11 text-white focus:border-red-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-zinc-500 font-bold">N° Moto</Label>
                      <Input type="number" min="0" value={numBikes} onChange={(e) => setNumBikes(Number(e.target.value))} className="bg-black border-zinc-700 h-11 text-white focus:border-red-600" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-zinc-500 font-bold">Note / Allergeni</Label>
                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note..." className="bg-black border-zinc-700 h-11 text-white focus:border-red-600" />
                  </div>
                  <Button onClick={handleJoinEvent} className="w-full bg-red-600 hover:bg-red-700 font-black uppercase italic h-12 shadow-lg shadow-red-900/20">
                    Conferma Partecipazione
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button onClick={handleCancelParticipation} variant="outline" className="w-full border-zinc-800 text-zinc-500 hover:bg-red-600 hover:text-white font-black uppercase italic h-12 transition-all">
                    <XCircle className="h-4 w-4 mr-2" /> Annulla Partecipazione
                  </Button>
                </div>
              )}
            </div>
            
            {isAdmin && (
              <div className="space-y-4 border-t-2 border-red-600 pt-6 mt-6">
                <h3 className="text-xs font-black uppercase text-red-600 flex items-center gap-2 italic">
                  <ClipboardList className="h-4 w-4" /> Dashboard Organizzatore
                </h3>
                
                <div className="overflow-x-auto rounded border border-zinc-800 bg-black">
                  <table className="w-full text-[10px] text-left uppercase">
                    <thead className="bg-zinc-900 text-zinc-500 border-b border-zinc-800">
                      <tr>
                        <th className="p-3 font-bold">Socio</th>
                        <th className="p-3 font-bold text-center">Pers</th>
                        <th className="p-3 font-bold text-center">Moto</th>
                        <th className="p-3 font-bold">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p) => (
                        <tr key={p.id} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/30">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700 flex items-center justify-center">
                                {p.photoURL ? (
                                  <img src={p.photoURL} className="w-full h-full object-cover" />
                                ) : (
                                  <User className="h-5 w-5 text-zinc-500" />
                                )}
                              </div>
                              <span className="font-black text-white">{p.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center text-zinc-300 font-bold">{p.people}</td>
                          <td className="p-3 text-center text-zinc-300 font-bold">{p.bikes}</td>
                          <td className="p-3 text-[9px] text-zinc-500 italic min-w-[120px] max-w-[200px] leading-relaxed break-words whitespace-normal">
                            {p.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-zinc-900/50">
                      <tr className="font-black text-red-600 italic">
                        <td className="p-3">TOTALE EVENTO</td>
                        <td className="p-3 text-center border-l border-zinc-800">{totalPeople} PERSONE</td>
                        <td className="p-3 text-center border-l border-zinc-800">{totalBikes} MOTO</td>
                        <td className="p-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {!isAdmin && (
               <div className="space-y-4 border-t border-zinc-900 pt-6">
                 <div className="flex justify-between items-end">
                   <h3 className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
                     <Users className="h-4 w-4" /> Soci Iscritti ({participants.length})
                   </h3>
                   <div className="text-[11px] font-black text-red-600 uppercase italic">
                      Totale: {totalPeople} Persone / {totalBikes} Moto
                   </div>
                 </div>
                 <div className="grid gap-2">
                   {participants.map((p) => (
                     <div key={p.id} className="bg-zinc-900/40 p-3 rounded border border-zinc-900/50 flex justify-between items-center group">
                       <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 group-hover:border-red-600 transition-colors shrink-0 flex items-center justify-center">
                            {p.photoURL ? (
                              <img src={p.photoURL} className="w-full h-full object-cover" />
                            ) : (
                              <User className="h-6 w-6 text-zinc-600" />
                            )}
                          </div>
                          <span className="font-bold text-xs uppercase text-white tracking-tighter">{p.name}</span>
                       </div>
                       <span className="text-[10px] font-black text-zinc-400 bg-black/50 px-2 py-1 rounded">
                         {p.people} Persone / {p.bikes} Moto
                       </span>
                     </div>
                   ))}
                 </div>
               </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EventDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} event={selectedEvent} onSave={handleSaveEvent} />
      <ConfirmDeleteDialog isOpen={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen} onConfirm={confirmDelete} title="Elimina Evento" description="Sei sicuro?" />
    </div>
  );
}