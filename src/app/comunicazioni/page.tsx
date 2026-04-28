'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, X } from 'lucide-react';

// Motore Firebase
import { db } from '@/lib/firebase';
import { 
  collection, 
  setDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';

export default function ComunicazioniPage() {
  const [communications, setCommunications] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Campi del form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const isAdmin = true; // Mantengo la logica di controllo che hai in eventi

  // 1. RECUPERO DATI (Stessa logica real-time di eventi)
  useEffect(() => {
    const q = query(collection(db, "communications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCommunications(snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })));
    }, (error) => console.error("Errore Firestore:", error));
    return () => unsubscribe();
  }, []);

  // 2. SALVATAGGIO (Con ID pulito come chiesto per gli eventi)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      // Se è modifica usiamo l'ID esistente, altrimenti ne creiamo uno dal titolo
      const docId = editingId || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      await setDoc(doc(db, "communications", docId), {
        title,
        content,
        author: "Direttivo",
        createdAt: editingId ? (communications.find(c => c.id === editingId)?.createdAt || serverTimestamp()) : serverTimestamp(),
        lastUpdate: serverTimestamp()
      }, { merge: true });

      resetForm();
    } catch (err) {
      console.error("Errore salvataggio:", err);
    }
  };

  const handleEdit = (com: any) => {
    setEditingId(com.id);
    setTitle(com.title);
    setContent(com.content);
    setShowForm(true);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa comunicazione?")) return;
    try {
      await deleteDoc(doc(db, "communications", id));
    } catch (err) {
      console.error("Errore eliminazione:", err);
    }
  };

  return (
    <div className="w-full py-8">
      {/* HEADER: Identico a Eventi */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Bacheca Comunicazioni</h1>
        {isAdmin && !showForm && (
          <Button onClick={() => setShowForm(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Aggiungi Comunicazione
          </Button>
        )}
      </div>

      {/* FORM DI INSERIMENTO/MODIFICA (Stile Card di Eventi) */}
      {showForm && (
        <Card className="mb-8 border-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? "Modifica Comunicazione" : "Nuova Comunicazione"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Titolo..." 
                disabled={!!editingId}
              />
              <Textarea 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                placeholder="Testo del messaggio..." 
                className="min-h-[150px]"
              />
              <div className="flex gap-2">
                <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                  {editingId ? "Aggiorna" : "Pubblica"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Annulla</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* GRIGLIA COMUNICAZIONI: Stessa struttura di Eventi */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {communications.map((c) => (
          <Card key={c.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className='flex-grow pr-2'>
                  <CardTitle className="uppercase">{c.title}</CardTitle>
                  <CardDescription>
                    {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "In caricamento..."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-slate-600 italic">"{c.content}"</p>
              <p className="text-[10px] mt-4 uppercase text-gray-400 tracking-widest font-bold">Autore: {c.author || "Direttivo"}</p>
            </CardContent>
            {isAdmin && (
              <div className="flex justify-end p-4 border-t gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}