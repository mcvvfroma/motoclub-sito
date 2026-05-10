'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, onSnapshot, query, addDoc, deleteDoc, doc, updateDoc, where, Timestamp 
} from 'firebase/firestore';
import { 
  Trash2, Camera, ShoppingBag, Pencil, MessageCircle, X, Plus 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function MercatinoPage() {
  const [annunci, setAnnunci] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [formData, setFormData] = useState({ 
    titolo: '', prezzo: '', descrizione: '', venditore: '', telefono: '', foto: [] as string[] 
  });

  // 1. Sincronizzazione con Firebase
  useEffect(() => {
    const q = query(collection(db, 'mercatino'), where('expireAt', '>=', Timestamp.now()));
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAnnunci(docs.sort((a:any, b:any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return () => unsubscribe();
  }, []);

  // 2. Gestione Foto (Compressione + Max 3)
  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (formData.foto.length + files.length > 3) return alert("Massimo 3 foto!");

    setLoadingImg(true);
    const compressed = await Promise.all(files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (ev) => {
          const img = new Image();
          img.src = ev.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            let width = img.width;
            let height = img.height;
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
        };
      });
    }));
    setFormData(prev => ({ ...prev, foto: [...prev.foto, ...compressed].slice(0, 3) }));
    setLoadingImg(false);
  };

  // 3. Cancellazione (Senza popup per evitare blocchi cellulare)
  const handleElimina = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'mercatino', id));
    } catch (err) { console.error("Errore cancellazione:", err); }
  };

  // 4. Invio / Modifica
  const handleSubmit = async () => {
    if (!formData.titolo || !formData.prezzo || !formData.telefono) return alert("Dati obbligatori mancanti!");
    try {
      if (editingId) {
        await updateDoc(doc(db, 'mercatino', editingId), formData);
      } else {
        const scad = new Date(); scad.setDate(scad.getDate() + 10);
        await addDoc(collection(db, 'mercatino'), { 
          ...formData, createdAt: Timestamp.now(), expireAt: Timestamp.fromDate(scad) 
        });
      }
      setIsDialogOpen(false);
      setFormData({ titolo: '', prezzo: '', descrizione: '', venditore: '', telefono: '', foto: [] });
      setEditingId(null);
    } catch (e) { alert("Errore nel salvataggio"); }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-4 font-sans">
      <div className="max-w-md mx-auto">
        
        {/* HEADER RESPONSIVE: Colonna su mobile, Riga su desktop */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between items-start gap-5 mb-8 bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800 shadow-xl">
          <div className="flex items-center gap-3 text-red-600">
            <ShoppingBag className="h-8 w-8" />
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">MERCATINO</h1>
          </div>
          
          <Button 
            onClick={() => { setEditingId(null); setIsDialogOpen(true); }} 
            className="bg-red-600 hover:bg-red-700 text-white font-black italic rounded-xl px-5 h-11 flex gap-2 items-center shadow-lg active:scale-95 transition-all w-auto"
          >
            <Plus size={18} strokeWidth={4} /> VENDI / CERCA
          </Button>
        </header>

        {/* DIALOG GESTIONE ANNUNCIO */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-[95vw] rounded-[3rem] p-6 overflow-y-auto max-h-[90vh]">
             <DialogHeader><DialogTitle className="text-center font-black italic uppercase text-xl text-red-600">Inserimento Annuncio</DialogTitle></DialogHeader>
             <div className="space-y-4 mt-6">
                <Input placeholder="Cosa vendi o cerchi? *" className="bg-zinc-900 border-zinc-800 h-12 rounded-2xl" value={formData.titolo} onChange={e => setFormData({...formData, titolo: e.target.value})} />
                <Input placeholder="Prezzo (€) o 'Trattabile' *" className="bg-zinc-900 border-zinc-800 h-12 rounded-2xl" value={formData.prezzo} onChange={e => setFormData({...formData, prezzo: e.target.value})} />
                <Input placeholder="Tuo Cellulare (solo cifre) *" className="bg-zinc-900 border-zinc-800 h-12 rounded-2xl" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                <Textarea placeholder="Descrizione dettagliata (es: è cromata, cerco marmitta...) *" className="bg-zinc-900 border-zinc-800 rounded-2xl min-h-[120px]" value={formData.descrizione} onChange={e => setFormData({...formData, descrizione: e.target.value})} />
                
                <div className="grid grid-cols-3 gap-2 py-2">
                  {formData.foto.map((f, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800">
                      <img src={f} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => setFormData({...formData, foto: formData.foto.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 bg-red-600 p-1.5 rounded-full shadow-lg"><X size={12} className="text-white"/></button>
                    </div>
                  ))}
                  {formData.foto.length < 3 && (
                    <label className="aspect-square border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900 transition-colors group">
                      <Camera className="text-zinc-500 group-hover:text-red-600 mb-1" size={24} />
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Foto</span>
                      <input type="file" hidden accept="image/*" multiple onChange={handlePhoto} />
                    </label>
                  )}
                </div>

                <Button onClick={handleSubmit} disabled={loadingImg} className="w-full bg-red-600 hover:bg-red-700 font-black h-14 rounded-2xl uppercase italic text-lg shadow-lg active:scale-95 transition-all">
                  {loadingImg ? "CARICAMENTO..." : (editingId ? "AGGIORNA ANNUNCIO" : "PUBBLICA ORA")}
                </Button>
             </div>
          </DialogContent>
        </Dialog>

        {/* LISTA ANNUNCI */}
        <div className="space-y-8">
          {annunci.map((a) => (
            <Card key={a.id} className="bg-zinc-950 border-zinc-900 overflow-hidden rounded-[2.5rem] shadow-2xl border-b-4 border-b-red-600/10">
              {/* Carosello Foto */}
              <div className="relative h-80 bg-zinc-900 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                {a.foto && a.foto.length > 0 ? a.foto.map((img: string, idx: number) => (
                  <div key={idx} className="min-w-full h-full snap-center"><img src={img} className="w-full h-full object-cover" alt="" /></div>
                )) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-800"><Camera size={56} /></div>
                )}
              </div>

              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-2xl font-black uppercase italic leading-none tracking-tighter">{a.titolo}</h2>
                  <div className="bg-red-600 px-4 py-1 rounded-full text-lg font-black italic">{a.prezzo}€</div>
                </div>

                <p className="text-zinc-400 text-sm mb-6 leading-relaxed bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50 italic">
                  "{a.descrizione}"
                </p>

                <div className="flex gap-2">
                  <Button asChild className="flex-1 bg-green-600 hover:bg-green-700 h-12 rounded-2xl font-black italic uppercase text-xs shadow-lg">
                    <a href={`https://wa.me/39${(a.telefono || '').replace(/\D/g, '')}`} target="_blank">
                      <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                    </a>
                  </Button>
                  
                  <button 
                    onClick={() => {
                      setFormData({ titolo: a.titolo, prezzo: a.prezzo, descrizione: a.descrizione, venditore: a.venditore || '', telefono: a.telefono, foto: a.foto || [] });
                      setEditingId(a.id);
                      setIsDialogOpen(true);
                    }} 
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-zinc-800 text-zinc-400 bg-zinc-900 hover:text-white shadow-md active:scale-90 transition-all"
                  >
                    <Pencil size={18} />
                  </button>
                  
                  <button 
                    onClick={() => handleElimina(a.id)} 
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-zinc-800 text-red-600 bg-zinc-900 hover:bg-red-950 shadow-md active:scale-90 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}