
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/hooks/use-admin';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Trash2, UserPlus } from 'lucide-react';

type AuthorizedUser = {
    id: string;
    email: string;
};

export default function AdminPage() {
    const { isAdmin, isLoading } = useAdmin();
    const [users, setUsers] = useState<AuthorizedUser[]>([]);
    const [email, setEmail] = useState('');
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "authorizedUsers"));
            const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AuthorizedUser[];
            setUsers(userList);
        } catch (error) {
            toast({ variant: "destructive", title: "Errore", description: "Impossibile caricare gli utenti autorizzati." });
        }
    }, [toast]);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, fetchUsers]);

    const handleAddUser = async () => {
        if (!email.trim() || !email.includes('@')) {
            toast({ variant: "destructive", title: "Errore", description: "Inserisci un indirizzo email valido." });
            return;
        }
        try {
            await addDoc(collection(db, "authorizedUsers"), { email });
            toast({ title: "Successo", description: `L'utente ${email} è stato aggiunto.` });
            setEmail('');
            fetchUsers();
        } catch (error) {
            toast({ variant: "destructive", title: "Errore", description: "Impossibile aggiungere l'utente." });
        }
    };

    const handleRemoveUser = async (id: string, userEmail: string) => {
        if (!window.confirm(`Sei sicuro di voler rimuovere l'utente ${userEmail}?`)) return;
        try {
            await deleteDoc(doc(db, "authorizedUsers", id));
            toast({ title: "Successo", description: `L'utente ${userEmail} è stato rimosso.` });
            fetchUsers();
        } catch (error) {
            toast({ variant: "destructive", title: "Errore", description: "Impossibile rimuovere l'utente." });
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white">Caricamento...</div>;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-3xl font-bold text-red-500">Accesso Negato</h1>
                    <p className="mt-4">Non hai i permessi per visualizzare questa pagina.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Gestione Utenti Autorizzati</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-6">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email da autorizzare"
                                className="bg-gray-800 border-gray-700 text-white"
                            />
                            <Button onClick={handleAddUser} className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Aggiungi
                            </Button>
                        </div>
                        <ul className="space-y-3">
                            {users.map(user => (
                                <li key={user.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-md">
                                    <span className="font-mono">{user.email}</span>
                                    <Button variant="destructive" size="sm" onClick={() => handleRemoveUser(user.id, user.email)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
