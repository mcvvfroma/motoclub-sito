
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/hooks/use-admin';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react';

type Member = {
    id: string;
    nome: string;
    cognome: string;
    email: string;
    status: 'socio' | 'admin';
};

const EMPTY_FORM = { nome: "", cognome: "", email: "", status: "socio" as const };

export default function MembersPage() {
    const { isAdmin, isLoading: isAdminLoading } = useAdmin();
    const { toast } = useToast();
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [formData, setFormData] = useState<Omit<Member, 'id'> | Member>(EMPTY_FORM);

    const fetchMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "users"), orderBy("cognome", "asc"));
            const querySnapshot = await getDocs(q);
            const membersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Member[];
            setMembers(membersData);
        } catch (error) {
            toast({ variant: "destructive", title: "Errore", description: "Impossibile caricare i soci." });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (isAdmin) {
            fetchMembers();
        }
    }, [isAdmin, fetchMembers]);

    const handleCreate = () => {
        setEditingMember(null);
        setFormData(EMPTY_FORM);
        setIsDialogOpen(true);
    };

    const handleEdit = (member: Member) => {
        setEditingMember(member);
        setFormData(member);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string, nome: string, cognome: string) => {
        if (window.confirm(`Sei sicuro di voler eliminare ${nome} ${cognome}?`)) {
            try {
                await deleteDoc(doc(db, "users", id));
                toast({ title: "Successo", description: "Socio eliminato correttamente." });
                fetchMembers();
            } catch (error) {
                toast({ variant: "destructive", title: "Errore", description: "Impossibile eliminare il socio." });
            }
        }
    };

    const handleFormSubmit = async () => {
        if (!formData.nome || !formData.cognome || !formData.email) {
            toast({ variant: "destructive", title: "Errore", description: "Tutti i campi sono obbligatori." });
            return;
        }

        try {
            if (editingMember) {
                const memberRef = doc(db, "users", editingMember.id);
                await updateDoc(memberRef, formData);
                toast({ title: "Successo", description: "Dati del socio aggiornati." });
            } else {
                await addDoc(collection(db, "users"), { ...formData, createdAt: new Date().toISOString() });
                toast({ title: "Successo", description: "Nuovo socio aggiunto." });
            }
            setIsDialogOpen(false);
            fetchMembers();
        } catch (error) {
            toast({ variant: "destructive", title: "Errore", description: "Salvataggio fallito." });
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, status: value as Member['status'] }));
    };

    if (isAdminLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white">Caricamento...</div>;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-3xl font-bold text-red-500">Accesso Negato</h1>
                    <p className="mt-4">Solo gli amministratori possono visualizzare questa pagina.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">ANAGRAFICA SOCI</h1>
                    <Button onClick={handleCreate} className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5" />
                        AGGIUNGI SOCIO
                    </Button>
                </div>

                <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-800">
                                    <TableHead className="text-white">Cognome</TableHead>
                                    <TableHead className="text-white">Nome</TableHead>
                                    <TableHead className="text-white">Email</TableHead>
                                    <TableHead className="text-white">Status</TableHead>
                                    <TableHead className="text-right text-white">Azioni</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-12"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
                                ) : members.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-12">Nessun socio trovato.</TableCell></TableRow>
                                ) : (
                                    members.map((socio) => (
                                        <TableRow key={socio.id} className="border-gray-800">
                                            <TableCell>{socio.cognome}</TableCell>
                                            <TableCell>{socio.nome}</TableCell>
                                            <TableCell className="text-gray-400">{socio.email}</TableCell>
                                            <TableCell><Badge variant={socio.status === 'admin' ? 'default' : 'secondary'}>{socio.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(socio)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(socio.id, socio.nome, socio.cognome)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingMember ? "Modifica Socio" : "Nuovo Socio"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cognome" className="text-right">Cognome</Label>
                            <Input id="cognome" name="cognome" value={formData.cognome} onChange={handleFormChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome" className="text-right">Nome</Label>
                            <Input id="nome" name="nome" value={formData.nome} onChange={handleFormChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleFormChange} className="col-span-3" disabled={!!editingMember} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <Select onValueChange={handleSelectChange} value={formData.status}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleziona status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="socio">Socio</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
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
