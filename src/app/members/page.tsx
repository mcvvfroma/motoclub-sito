'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import { PlusCircle, MoreHorizontal, Users, Camera, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import MemberDialog from '@/components/MemberDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MembersPage() {
  const [soci, setSoci] = useState<any[]>([]);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [idSocioDaEliminare, setIdSocioDaEliminare] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setSoci(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSaveMember = async (data: any) => {
    setIsMemberDialogOpen(false);
    try {
      if (selectedMember) {
        await updateDoc(doc(db, 'users', selectedMember.id), data);
      } else {
        const userEmail = data.email.trim().toLowerCase();
        await setDoc(doc(db, 'users', userEmail), {
          nome: data.nome || '',
          cognome: data.cognome || '',
          email: userEmail,
          photoURL: data.photoURL || '',
          status: data.status || 'socio',
          createdAt: new Date().toISOString()
        });
      }
      setSelectedMember(null);
    } catch (e: any) {
      console.error("ERRORE FIREBASE:", e);
    }
  };

  const executeDelete = async () => {
    if (!idSocioDaEliminare) return;
    setIsConfirmDialogOpen(false);
    try {
      await deleteDoc(doc(db, 'users', idSocioDaEliminare));
      setIdSocioDaEliminare(null);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20">
      {/* Container principale con padding ridotto su mobile */}
      <main className="max-w-4xl mx-auto p-2 sm:p-6 space-y-6">
        
        <Card className="bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-900 pb-6">
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <Users className="h-6 w-6 text-red-600 shrink-0" />
              <CardTitle className="text-white uppercase font-black tracking-tighter text-xl">
                Gestione Soci
              </CardTitle>
            </div>
            
            <Button 
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold rounded-full h-11" 
              onClick={() => { setSelectedMember(null); setIsMemberDialogOpen(true); }}
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Aggiungi Socio
            </Button>
          </CardHeader>

          <CardContent className="p-0 sm:p-6">
            {/* Lista Soci ottimizzata per Mobile */}
            <ul className="divide-y divide-zinc-900">
              {soci.length === 0 ? (
                <li className="py-10 text-center text-zinc-500 italic">Nessun socio trovato.</li>
              ) : (
                soci.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 p-4 sm:px-0 hover:bg-zinc-900/30 transition-colors">
                    
                    {/* Parte Sinistra: Avatar + Nome */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-12 w-12 border border-zinc-800 shrink-0">
                        <AvatarImage src={s.photoURL} className="object-cover" />
                        <AvatarFallback className="bg-zinc-900 text-zinc-600">
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-zinc-100 uppercase italic leading-tight truncate">
                          {s.nome} {s.cognome}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate font-mono mt-1 opacity-70">
                          {s.id}
                        </p>
                      </div>
                    </div>

                    {/* Parte Destra: Menu Azioni */}
                    <div className="shrink-0">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-10 w-10">
                            <MoreHorizontal className="h-6 w-6" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-white font-sans w-40">
                          <DropdownMenuItem 
                            className="cursor-pointer focus:bg-zinc-900"
                            onClick={() => { setSelectedMember(s); setIsMemberDialogOpen(true); }}
                          >
                            Modifica
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 cursor-pointer focus:bg-red-950/30"
                            onClick={() => { setIdSocioDaEliminare(s.id); setIsConfirmDialogOpen(true); }}
                          >
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </main>

      <MemberDialog 
        isOpen={isMemberDialogOpen} 
        setIsOpen={setIsMemberDialogOpen} 
        member={selectedMember} 
        onSave={handleSaveMember} 
      />
      
      <ConfirmationDialog 
        isOpen={isConfirmDialogOpen} 
        setIsOpen={setIsConfirmDialogOpen} 
        onConfirm={executeDelete} 
        title="Sei sicuro?" 
        description="Rimuoverai il socio permanentemente." 
      />
    </div>
  );
}