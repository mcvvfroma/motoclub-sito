'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, X, ExternalLink, Handshake, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [convToDelete, setConvToDelete] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  const { isAdmin, loading: authLoading } = useAdmin();

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
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setName(""); setCategory(""); setDescription(""); setDiscount("");
    setAddress(""); setPhone(""); setWebsite("");
    setEditingId(null); 
    setIsDialogOpen(false);
  };

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

  if (authLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Verifica permessi...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Handshake className="h-8 w-8 text-red-600 shrink-0" />
            <h1 className="text-3xl font-bold tracking-tight uppercase leading-tight">
              Convenzioni Soci
            </h1>
          </div>
          
          {isAdmin && (
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold uppercase"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Aggiungi
            </Button>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight">
                {editingId ? "Modifica Convenzione" : "Nuova Convenzione"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome Attività..." className="bg-black border-zinc-700 text-white" />

              <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Categoria..." className="bg-black border-zinc-700 text-white" />

              <Textarea 
                value={discount} 
                onChange={e => setDiscount(e.target.value)} 
                placeholder="Le condizioni sopra indicate saranno riservate..." 
                className="h-[80px] overflow-y-auto bg-black border-zinc-700 text-white resize-none" 
              />

              <Textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="La convenzione prevede le seguenti agevolazioni..." 
                className="h-[80px] overflow-y-auto bg-black border-zinc-700 text-white resize-none" 
              />

              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Indirizzo..." className="bg-black border-zinc-700 text-white" />

              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefono..." className="bg-black border-zinc-700 text-white" />
              
              <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="Sito Web..." className="bg-black border-zinc-700 text-white" />
              
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 bg-red-600 text-white hover:bg-red-700 font-bold uppercase">
                  {editingId ? "Aggiorna" : "Pubblica"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 border-zinc-700 text-white uppercase font-bold">Annulla</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

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
                  
                  {c.address && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-zinc-500 hover:text-zinc-200 transition-colors group mt-2"
                    >
                      <MapPin className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] uppercase tracking-wider group-hover:underline italic">
                        {c.address}
                      </span>
                    </a>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t border-zinc-900 pt-4">
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {c.phone && (
                      <a href={`tel:${c.phone.replace(/\s+/g, '')}`} className="w-full">
                        <Button variant="outline" className="w-full border-zinc-700 hover:bg-green-900/30 hover:text-green-400 text-white text-[11px] uppercase font-bold">
                          <Phone className="h-4 w-4 mr-2 text-green-500" /> Chiama
                        </Button>
                      </a>
                    )}
                    {c.website && (
                      <Link href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" className="w-full">
                        <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-white text-[11px] uppercase font-bold">
                          <ExternalLink className="h-4 w-4 mr-2 text-red-600" /> Sito Web
                        </Button>
                      </Link>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex justify-end w-full gap-2 pt-2 border-t border-zinc-900/50">
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

      {isAdmin && (
        <ConfirmDeleteDialog 
          isOpen={isDeleteConfirmOpen} 
          onOpenChange={setIsDeleteConfirmOpen} 
          onConfirm={confirmDelete} 
          title="Elimina Convenzione" 
          description="Sei sicuro di voler rimuovere questa convenzione?" 
        />
      )}
    </div>
  );
}