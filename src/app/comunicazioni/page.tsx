'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, X, Megaphone } from 'lucide-react';

// Importiamo il componente di conferma grafico
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

// Motore Firebase
import { db } from '@/lib/firebase';
import { useAdmin } from "@/hooks/use-admin";
import { 
  collection, 
  setDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';

export default function ComunicazioniPage() {
  const [communications, setCommunications] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // STATI PER LA CANCELLAZIONE SICURA
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  // Campi del form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState(""); 
  const [date, setDate] = useState(""); 

  const { isAdmin, loading } = useAdmin();

  // 1. RECUPERO DATI REAL-TIME
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

  // 2. SALVATAGGIO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !title || !content) return;

    try {
      const docId = editingId || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const customDate = date ? Timestamp.fromDate(new Date(date)) : serverTimestamp();

      await setDoc(doc(db, "communications", docId), {
        title,
        content,
        author: author.trim() || "Direttivo",
        createdAt: customDate,
        lastUpdate: serverTimestamp()
      }, { merge: true });

      resetForm();
    } catch (err) {
      console.error("Errore salvataggio:", err);
    }
  };

  const handleEdit = (com: any) => {
    if (!isAdmin) return;
    setEditingId(com.id);
    setTitle(com.title);
    setContent(com.content);
    setAuthor(com.author || "Direttivo");
    
    if (com.createdAt?.toDate) {
      const d = com.createdAt.toDate();
      const formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setDate(formattedDate);
    }
    setShowForm(true);
  };

  const resetForm = () => {
    setTitle(""); setContent(""); setAuthor(""); setDate("");
    setEditingId(null); setShowForm(false);
  };

  // 3. LOGICA CANCELLAZIONE
  const confirmDelete = async () => {
    if (idToDelete && isAdmin) {
      try {
        await deleteDoc(doc(db, "communications", idToDelete));
        setIsDeleteConfirmOpen(false);
        setIdToDelete(null);
      } catch (err) {
        console.error("Errore eliminazione:", err);
      }
    }
  };

  if (loading) return <div className="w-full py-20 text-center">Verifica permessi...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* INTESTAZIONE RESPONSIVE: Incolonna su mobile, riga su desktop */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Megaphone className="h-8 w-8 text-red-600 shrink-0" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight uppercase">
            Bacheca Comunicazioni
          </h1>
        </div>

        {isAdmin && !showForm && (
          <Button 
            onClick={() => setShowForm(true)} 
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Aggiungi
          </Button>
        )}
      </div>

      {isAdmin && showForm && (
        <Card className="mb-8 border-2 border-zinc-800 bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">{editingId ? "Modifica Comunicazione" : "Nuova Comunicazione"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm} className="text-white">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titolo..." className="bg-black border-zinc-700 text-white" />
                <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Pubblicato da..." className="bg-black border-zinc-700 text-white" />
                <div className="md:col-span-2">
                   <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="bg-black border-zinc-700 text-white" />
                </div>
              </div>
              <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Testo della comunicazione..." className="min-h-[120px] bg-black border-zinc-700 text-white" />
              <div className="flex gap-2">
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Pubblica</Button>
                <Button type="button" variant="outline" onClick={resetForm} className="border-zinc-700 text-white">Annulla</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {communications.map((c) => (
          <Card key={c.id} className="flex flex-col border-zinc-800 bg-zinc-950/50 text-white">
            <CardHeader>
              <CardTitle className="uppercase text-red-500">{c.title}</CardTitle>
              <CardDescription className="text-zinc-400">
                {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "In caricamento..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-zinc-300 italic">"{c.content}"</p>
              <p className="text-[10px] mt-4 uppercase text-zinc-500 tracking-widest font-bold">Autore: {c.author || "Direttivo"}</p>
            </CardContent>
            
            {isAdmin && (
              <div className="flex justify-end p-4 border-t border-zinc-900 gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-zinc-800" onClick={() => handleEdit(c)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-zinc-800" 
                  onClick={() => { setIdToDelete(c.id); setIsDeleteConfirmOpen(true); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* DIALOG DI CONFERMA */}
      {isAdmin && (
        <ConfirmDeleteDialog 
          isOpen={isDeleteConfirmOpen} 
          onOpenChange={setIsDeleteConfirmOpen} 
          onConfirm={confirmDelete} 
          title="Elimina Comunicazione" 
          description="Sei sicuro di voler eliminare questo avviso? L'azione è immediata e irreversibile." 
        />
      )}
    </div>
  );
}