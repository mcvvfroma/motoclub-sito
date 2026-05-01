'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, X, ExternalLink, Handshake } from 'lucide-react';
import Link from 'next/link';

// Componenti di supporto (Importanti per non avere errori rossi)
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

// Motore Firebase e Sicurezza
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
  onSnapshot 
} from 'firebase/firestore';

export default function ConvenzioniPage() {
  const [convenzioni, setConvenzioni] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // STATI PER LA CANCELLAZIONE (Essenziali per la logica Events)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [convToDelete, setConvToDelete] = useState<string | null>(null);
  
  // Campi del form
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  const { isAdmin, loading: authLoading } = useAdmin();

  // 1. RECUPERO DATI
  useEffect(() => {
    const q = query(collection(db, "conventions"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setConvenzioni(snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })));
      setIsDataLoading(false);
    }, (error) => {
      console.error("Errore Firestore:", error);
      setIsDataLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. SALVATAGGIO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !name || !category) return;
    try {
      const docId = editingId || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      await setDoc(doc(db, "conventions", docId), {
        name, category, description, discount, address, phone, website,
        updatedAt: serverTimestamp()
      }, { merge: true });
      resetForm();
    } catch (err) { console.error("Errore salvataggio:", err); }
  };

  const handleEdit = (conv: any) => {
    if (!isAdmin) return;
    setEditingId(conv.id);
    setName(conv.name || "");
    setCategory(conv.category || "");
    setDescription(conv.description || "");
    setDiscount(conv.discount || "");
    setAddress(conv.address || "");
    setPhone(conv.phone || "");
    setWebsite(conv.website || "");
    setShowForm(true);
  };

  const resetForm = () => {
    setName(""); setCategory(""); setDescription(""); setDiscount("");
    setAddress(""); setPhone(""); setWebsite("");
    setEditingId(null); setShowForm(false);
  };

  // 3. LOGICA CANCELLAZIONE (Presa da Events per evitare il blocco browser)
  const confirmDelete = async () => {
    if (convToDelete && isAdmin) {
      try {
        await deleteDoc(doc(db, "conventions", convToDelete));
        setIsDeleteConfirmOpen(false);
        setConvToDelete(null);
      } catch (error) {
        console.error("Errore cancellazione:", error);
      }
    }
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center">Verifica permessi...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        
        {/* INTESTAZIONE: Handshake in rosso h-8 w-8 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Handshake className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold tracking-tight uppercase">Convenzioni Soci</h1>
          </div>
          
          {isAdmin && !showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Aggiungi
            </Button>
          )}
        </div>

        {/* FORM DI EDITING */}
        {isAdmin && showForm && (
          <Card className="mb-8 border-zinc-800 bg-zinc-900 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? "Modifica Convenzione" : "Nuova Convenzione"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm} className="text-white hover:bg-zinc-800">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome Attività..." className="bg-black border-zinc-700 text-white" />
                  <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Categoria..." className="bg-black border-zinc-700 text-white" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Sconto..." className="bg-black border-zinc-700 text-white" />
                  <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Indirizzo..." className="bg-black border-zinc-700 text-white" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefono..." className="bg-black border-zinc-700 text-white" />
                  <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="Sito Web..." className="bg-black border-zinc-700 text-white" />
                </div>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrizione..." className="min-h-[100px] bg-black border-zinc-700 text-white" />
                <div className="flex gap-2">
                  <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                    {editingId ? "Aggiorna" : "Pubblica"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="border-zinc-700 text-white">Annulla</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* GRIGLIA CARTE */}
        {!isDataLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {convenzioni.map((c) => (
              <Card key={c.id} className="bg-zinc-950/50 border-zinc-800 flex flex-col text-white">
                <CardHeader>
                  <CardTitle className="uppercase text-xl font-bold">{c.name}</CardTitle>
                  <Badge variant="secondary" className="mt-2 bg-zinc-800 text-zinc-300 border-none uppercase text-[10px]">
                    {c.category}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <p className="text-red-500 font-bold">{c.discount}</p>
                  <p className="text-zinc-400 text-sm italic">"{c.description}"</p>
                  <p className="text-zinc-500 text-[11px] uppercase tracking-wider">{c.address}</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 border-t border-zinc-900 pt-4">
                  {c.website && (
                    <Link href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" className="w-full">
                      <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-white">
                        <ExternalLink className="h-4 w-4 mr-2" /> Vedi Sito
                      </Button>
                    </Link>
                  )}
                  {isAdmin && (
                    <div className="flex justify-end w-full gap-2 pt-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="text-white h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setConvToDelete(c.id); setIsDeleteConfirmOpen(true); }} 
                        className="text-red-500 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* DIALOG DI CONFERMA (Stessa logica di Events) */}
      {isAdmin && (
        <ConfirmDeleteDialog 
          isOpen={isDeleteConfirmOpen} 
          onOpenChange={setIsDeleteConfirmOpen} 
          onConfirm={confirmDelete} 
          title="Elimina Convenzione" 
          description="Sei sicuro di voler rimuovere questa convenzione? L'azione non è reversibile." 
        />
      )}
    </div>
  );
}