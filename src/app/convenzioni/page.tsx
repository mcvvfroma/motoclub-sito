'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Motore Firebase e Sicurezza
import { db } from '@/lib/firebase';
import { useAdmin } from "@/hooks/use-admin"; // Importiamo il controllo reale
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
  
  // Campi del form
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  // Controllo permessi REALE
  const { isAdmin, loading: authLoading } = useAdmin();

  // 1. RECUPERO DATI REAL-TIME
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

  // 2. SALVATAGGIO (Protetto)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !name || !category) return;

    try {
      const docId = editingId || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      await setDoc(doc(db, "conventions", docId), {
        name,
        category,
        description,
        discount,
        address,
        phone,
        website,
        updatedAt: serverTimestamp()
      }, { merge: true });
      resetForm();
    } catch (err) {
      console.error("Errore salvataggio:", err);
    }
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
    setName("");
    setCategory("");
    setDescription("");
    setDiscount("");
    setAddress("");
    setPhone("");
    setWebsite("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm("Sei sicuro di voler eliminare questa convenzione?")) return;
    try {
      await deleteDoc(doc(db, "conventions", id));
    } catch (err) {
      console.error("Errore eliminazione:", err);
    }
  };

  // Caricamento permessi
  if (authLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Verifica permessi...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight uppercase">Convenzioni Soci</h1>
          {/* Tasto visibile solo agli Admin */}
          {isAdmin && !showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700 text-white border-none">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nuova Convenzione
            </Button>
          )}
        </div>

        {/* Form protetto */}
        {isAdmin && showForm && (
          <Card className="mb-8 border-gray-800 bg-gray-900 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">{editingId ? "Modifica Convenzione" : "Nuova Convenzione"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm} className="text-white hover:bg-gray-800">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome Attività..." className="bg-black border-gray-700 text-white" disabled={!!editingId} />
                  <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Categoria (es. Officina)..." className="bg-black border-gray-700 text-white" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Sconto (es. 10%)..." className="bg-black border-gray-700 text-white" />
                  <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Indirizzo..." className="bg-black border-gray-700 text-white" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefono..." className="bg-black border-gray-700 text-white" />
                  <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="Sito Web..." className="bg-black border-gray-700 text-white" />
                </div>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrizione dettagliata..." className="min-h-[100px] bg-black border-gray-700 text-white" />
                <div className="flex gap-2">
                  <Button type="submit" className="bg-red-600 text-white hover:bg-red-700 border-none">
                    {editingId ? "Aggiorna" : "Pubblica"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="border-gray-700 text-white hover:bg-gray-800">Annulla</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isDataLoading ? (
          <div className="text-center py-10 text-gray-500">Caricamento dati in corso...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {convenzioni.map((c) => (
              <Card key={c.id} className="bg-gray-900 border-gray-800 flex flex-col relative text-white">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className='flex-grow pr-2'>
                      <CardTitle className="uppercase text-xl font-bold text-white">{c.name}</CardTitle>
                      <Badge variant="secondary" className="mt-2 bg-gray-800 text-gray-300 border-none uppercase text-[10px]">
                        {c.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <p className="text-red-500 font-bold">{c.discount}</p>
                  <p className="text-gray-400 text-sm italic">"{c.description}"</p>
                  <p className="text-gray-500 text-[11px] uppercase tracking-wider">{c.address}</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 border-t border-gray-800 pt-4">
                  {c.website && (
                    <Link href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800 gap-2 text-white">
                        <ExternalLink className="h-4 w-4" /> Vedi Sito
                      </Button>
                    </Link>
                  )}
                  {/* Tasti Edit/Delete visibili solo se Admin */}
                  {isAdmin && (
                    <div className="flex justify-end w-full gap-2 pt-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="hover:bg-gray-800 text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="hover:bg-gray-800 text-red-500">
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
    </div>
  );
}