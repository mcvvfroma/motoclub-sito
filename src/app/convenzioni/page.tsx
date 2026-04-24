
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/hooks/use-admin';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import Link from 'next/link';

type Convenzione = {
    id: string;
    title: string;
    category: string;
    description: string;
    link: string;
};

const EMPTY_FORM = { title: "", category: "", description: "", link: "" };

export default function ConvenzioniPage() {
    const { isAdmin } = useAdmin();
    const { toast } = useToast();
    const [convenzioni, setConvenzioni] = useState<Convenzione[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingConvenzione, setEditingConvenzione] = useState<Convenzione | null>(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const fetchConvenzioni = useCallback(async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "convenzioni"));
            const convenzioniData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Convenzione[];
            setConvenzioni(convenzioniData);
        } catch (error) {
            toast({ variant: "destructive", title: "Errore", description: "Impossibile caricare le convenzioni." });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchConvenzioni();
    }, [fetchConvenzioni]);

    const handleCreate = () => {
        setEditingConvenzione(null);
        setFormData(EMPTY_FORM);
        setIsDialogOpen(true);
    };

    const handleEdit = (convenzione: Convenzione) => {
        setEditingConvenzione(convenzione);
        setFormData(convenzione);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Sei sicuro di voler eliminare questa convenzione? L\'azione è irreversibile.')) {
            try {
                await deleteDoc(doc(db, "convenzioni", id));
                toast({ title: "Successo", description: "Convenzione eliminata correttamente." });
                fetchConvenzioni();
            } catch (error) {
                toast({ variant: "destructive", title: "Errore", description: "Impossibile eliminare la convenzione." });
            }
        }
    };

    const handleFormSubmit = async () => {
        try {
            if (editingConvenzione) {
                const convenzioneRef = doc(db, "convenzioni", editingConvenzione.id);
                await updateDoc(convenzioneRef, formData);
                toast({ title: "Successo", description: "Convenzione aggiornata." });
            } else {
                await addDoc(collection(db, "convenzioni"), formData);
                toast({ title: "Successo", description: "Nuova convenzione creata." });
            }
            setIsDialogOpen(false);
            fetchConvenzioni();
        } catch (error) {
            toast({ variant: "destructive", title: "Errore", description: "Salvataggio fallito." });
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">CONVENZIONI SOCI</h1>
                    {isAdmin && (
                        <Button onClick={handleCreate} className="flex items-center gap-2">
                            <PlusCircle className="h-5 w-5" />
                            NUOVA CONVENZIONE
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="text-center"><p>Caricamento convenzioni...</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {convenzioni.map((convenzione) => (
                            <Card key={convenzione.id} className="bg-gray-900 border-gray-800 flex flex-col relative">
                                {isAdmin && (
                                    <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(convenzione)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(convenzione.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="pr-16">{convenzione.title}</CardTitle>
                                    <Badge variant="secondary" className="w-fit">{convenzione.category}</Badge>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <CardDescription>{convenzione.description}</CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <Link href={convenzione.link || '#'} passHref legacyBehavior>
                                        <a target="_blank" rel="noopener noreferrer" className='w-full'>
                                            <Button className='w-full' variant='outline'>Vedi Dettagli</Button>
                                        </a>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{editingConvenzione ? "Modifica Convenzione" : "Crea Nuova Convenzione"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Titolo</Label>
                            <Input id="title" name="title" value={formData.title} onChange={handleFormChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Categoria</Label>
                            <Input id="category" name="category" value={formData.category} onChange={handleFormChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="link" className="text-right">Link</Label>
                            <Input id="link" name="link" value={formData.link} onChange={handleFormChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Descrizione</Label>
                            <Textarea id="description" name="description" value={formData.description} onChange={handleFormChange} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Annulla</Button></DialogClose>
                        <Button onClick={handleFormSubmit}>Salva</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
