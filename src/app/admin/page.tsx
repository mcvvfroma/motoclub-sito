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
    // Ho corretto isLoading in loading per allinearlo al tuo hook useAdmin
    const { isAdmin, loading } = useAdmin();
    const [users, setUsers] = useState<AuthorizedUser[]>([]);
    const [email, setEmail] = useState('');
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "authorizedUsers"));
            const userList = querySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                email: doc.data().email || "" // Forza il recupero dell'email
            })) as AuthorizedUser[];
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
            // Aggiungiamo il trim e lowercase per evitare errori di battitura
            await addDoc(collection(db, "authorizedUsers"), { 
                email: email.toLowerCase().trim() 
            });
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white font-black uppercase italic tracking-widest">
                Verifica Permessi...
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar setIsOpen={() => {}} /> {/* Aggiunto prop necessario */}
                <div className="container mx-auto px-4 py-24 text-center">
                    <h1 className="text-4xl font-black text-red-600 uppercase italic tracking-tighter">Accesso Negato</h1>
                    <p className="mt-4 text-zinc-400 uppercase text-xs font-bold tracking-widest">Non hai i permessi per visualizzare questa area riservata.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar setIsOpen={() => {}} />
            <div className="container mx-auto px-4 py-24">
                <Card className="bg-zinc-950 border-zinc-800 text-white shadow-2xl">
                    <CardHeader className="border-b border-zinc-900 mb-6">
                        <CardTitle className="text-2xl font-black uppercase italic tracking-tighter text-red-600">
                            Gestione Utenti Autorizzati
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-8">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email da autorizzare (es. socio@email.it)"
                                className="bg-zinc-900 border-zinc-800 text-white focus:ring-red-600 focus:border-red-600"
                            />
                            <Button 
                                onClick={handleAddUser} 
                                className="bg-red-600 hover:bg-red-700 font-black uppercase italic px-6"
                            >
                                <UserPlus className="h-5 w-5 mr-2" />
                                Aggiungi
                            </Button>
                        </div>
                        
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Lista Admin Attivi</h3>
                            {users.map(user => (
                                <div key={user.id} className="flex justify-between items-center bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg hover:border-zinc-700 transition-colors">
                                    <span className="font-mono text-sm text-zinc-300">{user.email}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleRemoveUser(user.id, user.email)}
                                        className="text-zinc-500 hover:text-red-600 hover:bg-red-600/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {users.length === 0 && (
                                <p className="text-zinc-600 italic text-sm text-center py-4">Nessun utente autorizzato trovato.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}