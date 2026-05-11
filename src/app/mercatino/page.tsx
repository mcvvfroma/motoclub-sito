'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, onSnapshot, query, addDoc, deleteDoc, doc, updateDoc, where, Timestamp 
} from 'firebase/firestore';
import { 
  Trash2, Camera, ShoppingBag, Pencil, MessageCircle, X, Plus, CheckCircle2, Truck, Clock 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function MercatinoPage() {
  const [annunci, setAnnunci] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRegolamentoOpen, setIsRegolamentoOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({ 
    titolo: '', prezzo: '', descrizione: '', venditore: '', telefono: '', foto: [] as string[] 
  });

  useEffect(() => {
    const q = query(collection(db, 'mercatino'), where('expireAt', '>=', Timestamp.now()));
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAnnunci(docs.sort((a:any, b:any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return () => unsubscribe();
  }, []);

  // FUNZIONE PER IL CONTO ALLA ROVESCIA
  const getScadenza = (expireAt: any) => {
    if (!expireAt) return null;
    const scadenza = expireAt.toDate();
    const oggi = new Date();
    const diffTime = scadenza.getTime() - oggi.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "In scadenza";
    if (diffDays === 1) return "Ultimo giorno!";
    return `${diffDays} giorni rimasti`;
  };

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

  const handleElimina = async (id: string) => {
    try { await deleteDoc(doc(db, 'mercatino', id)); } catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    if (!formData.titolo || !formData.prezzo || !formData.telefono) return alert("Mancano dati!");
    try {
      if (editingId) { await updateDoc(doc(db, 'mercatino', editingId), formData);
      } else {
        const scad = new Date(); 
        scad.setDate(scad.getDate() + 20); // AGGIORNATO A 20 GIORNI
        await addDoc(collection(db, 'mercatino'), { ...formData, createdAt: Timestamp.now(), expireAt: Timestamp.fromDate(scad) });
      }
      setIsDialogOpen(false);
      setFormData({ titolo: '', prezzo: '', descrizione: '', venditore: '', telefono: '', foto: [] });
      setEditingId(null);
      setShowToast(true); setTimeout(() => setShowToast(false), 3000);
    } catch (e) { alert("Errore"); }
  };

  const truckStyle = (delay: string) => ({
    animation: `transitoContinuo 8s linear infinite`,
    animationDelay: delay,
    position: 'absolute' as const,
    left: '-120px',
  });

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-4 font-sans relative overflow-hidden">
      
      <style jsx global>{`
        @keyframes sirenaLampeggiante {
          0%, 100% { border-color: #1d4ed8; box-shadow: 0 0 2px #1d4ed8; }
          50% { border-color: #60a5fa; box-shadow: 0 0 10px #60a5fa, 0 0 20px #1d4ed8; }
        }
        @keyframes transitoContinuo {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 300px)); }
        }
      `}</style>

      <div className="max-w-md mx-auto relative">
        
        <Dialog open={isRegolamentoOpen} onOpenChange={setIsRegolamentoOpen}>
          <DialogContent className="bg-zinc-950 border-2 border-zinc-800 text-white max-w-[95vw] rounded-[2.5rem] p-8 overflow-hidden shadow-2xl">
            <div className="w-full h-20 flex items-center relative mb-4 overflow-hidden border-b border-zinc-900/50">
               <div style={truckStyle('0s')}><div className="relative flex items-center"><Truck className="h-10 w-10 text-red-700 stroke-[1.5]" /><div className="absolute top-0.5 left-6 w-2.5 h-1.5 bg-transparent rounded-t-full border-2 border-blue-700 animate-[sirenaLampeggiante_0.4s_infinite_alternate]"></div></div></div>
               <div style={truckStyle('4s')}><div className="relative flex items-center"><Truck className="h-10 w-10 text-red-700 stroke-[1.5]" /><div className="absolute top-0.5 left-6 w-2.5 h-1.5 bg-transparent rounded-t-full border-2 border-blue-700 animate-[sirenaLampeggiante_0.4s_infinite_alternate]"></div></div></div>
            </div>
            <DialogHeader><DialogTitle className="text-xl font-black italic uppercase tracking-tighter text-center text-white">Regole del Mercatino</DialogTitle></DialogHeader>
            <div className="space-y-4 my-6 text-center">
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50"><p className="text-red-600 font-black text-lg italic tracking-tight uppercase leading-none">Massimo 3 Foto</p><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2 italic">Non intasare la memoria</p></div>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50"><p className="text-red-600 font-black text-lg italic tracking-tight uppercase leading-none">Scadenza 20 Giorni</p><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2 italic">Pulizia automatica dei post</p></div>
            </div>
            <Button onClick={() => setIsRegolamentoOpen(false)} className="w-full bg-red-600 hover:bg-red-700 h-12 rounded-xl font-black italic uppercase text-base shadow-lg transition-all active:scale-95">HO CAPITO, PROCEDI</Button>
          </DialogContent>
        </Dialog>

        {showToast && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-full font-bold italic shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in duration-300"><CheckCircle2 size={20} /> PUBBLICATO!</div>}
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between items-start gap-5 mb-8 bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800 shadow-xl">
          <div className="flex items-center gap-3 text-red-600">
            <ShoppingBag className="h-8 w-8" />
            <h1 className="text-2xl font-black italic uppercase text-white tracking-tighter">MERCATINO</h1>
          </div>
          <Button onClick={() => { setEditingId(null); setIsDialogOpen(true); }} className="bg-red-600 font-black italic rounded-xl px-5 h-11 flex gap-2 items-center active:scale-95 transition-all">
            <Plus size={18} strokeWidth={4} /> VENDI
          </Button>
        </header>

        <div className="space-y-8">
          {annunci.map((a) => (
            <Card key={a.id} className="bg-zinc-950 border-zinc-900 overflow-hidden rounded-[2.5rem] shadow-2xl border-b-4 border-b-red-600/10">
              <div className="relative h-80 bg-zinc-900 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                {a.foto?.map((img: string, idx: number) => (
                  <div key={idx} className="min-w-full h-full snap-center"><img src={img} className="w-full h-full object-cover" /></div>
                ))}
                
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <Clock size={14} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase italic text-white tracking-tight">
                    {getScadenza(a.expireAt)}
                  </span>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-2xl font-black uppercase italic leading-none tracking-tighter">{a.titolo}</h2>
                  <div className="bg-red-600 px-4 py-1 rounded-full text-lg font-black italic">{a.prezzo}€</div>
                </div>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50 italic">"{a.descrizione}"</p>
                <div className="flex gap-2">
                  <Button asChild className="flex-1 bg-green-600 h-12 rounded-2xl font-black italic uppercase text-xs">
                    <a href={`https://wa.me/39${(a.telefono || '').replace(/\D/g, '')}`} target="_blank"><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp</a>
                  </Button>
                  <button onClick={() => { setFormData({ ...a }); setEditingId(a.id); setIsDialogOpen(true); }} className="w-12 h-12 flex items-center justify-center rounded-2xl border border-zinc-800 text-zinc-400 bg-zinc-900 active:scale-90 transition-all"><Pencil size={18} /></button>
                  <button onClick={() => handleElimina(a.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl border border-zinc-800 text-red-600 bg-zinc-900 active:bg-red-950 transition-all"><Trash2 size={18} /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-[95vw] rounded-[3rem] p-6 overflow-y-auto max-h-[90vh]">
           <DialogHeader><DialogTitle className="text-center font-black italic uppercase text-xl text-red-600">Nuovo Annuncio</DialogTitle></DialogHeader>
           <div className="space-y-4 mt-6">
              <Input placeholder="Titolo *" className="bg-zinc-900 border-zinc-800 h-12 rounded-2xl" value={formData.titolo} onChange={e => setFormData({...formData, titolo: e.target.value})} />
              <Input placeholder="Prezzo *" className="bg-zinc-900 border-zinc-800 h-12 rounded-2xl" value={formData.prezzo} onChange={e => setFormData({...formData, prezzo: e.target.value})} />
              <Input placeholder="Telefono *" className="bg-zinc-900 border-zinc-800 h-12 rounded-2xl" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              <Textarea placeholder="Descrizione *" className="bg-zinc-900 border-zinc-800 rounded-2xl min-h-[100px]" value={formData.descrizione} onChange={e => setFormData({...formData, descrizione: e.target.value})} />
              <div className="grid grid-cols-3 gap-2 py-2">
                {formData.foto.map((f, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800">
                    <img src={f} className="w-full h-full object-cover" />
                    <button onClick={() => setFormData({...formData, foto: formData.foto.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 bg-red-600 p-1.5 rounded-full"><X size={12} className="text-white"/></button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900 transition-colors">
                  <Camera className="text-zinc-500 mb-1" size={24} />
                  <input type="file" hidden accept="image/*" multiple onChange={handlePhoto} />
                </label>
              </div>
              <Button onClick={handleSubmit} disabled={loadingImg} className="w-full bg-red-600 font-black h-14 rounded-2xl uppercase italic text-lg shadow-lg">
                {loadingImg ? "CARICAMENTO..." : "PUBBLICA"}
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}