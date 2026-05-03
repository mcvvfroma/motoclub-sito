'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import { PlusCircle, MoreHorizontal, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MemberDialog from '@/components/MemberDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';

export type Member = {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  status: 'admin' | 'socio';
  createdAt?: string;
};

export default function MembersPage() {
  const [soci, setSoci] = useState<Member[]>([]);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [idSocioDaEliminare, setIdSocioDaEliminare] = useState<string | null>(null);

  const isAdmin = true;

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const dati = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Member[];
      setSoci(dati);
    });
    return () => unsubscribe();
  }, []);

  // FUNZIONE ELIMINAZIONE CON PULIZIA FORZATA DEL DOM
  const executeDelete = async () => {
    if (!idSocioDaEliminare) return;
    
    const targetId = idSocioDaEliminare;

    // 1. Reset degli stati
    setIsConfirmDialogOpen(false);
    setIdSocioDaEliminare(null);
    setSelectedMember(null);

    // 2. TRUCCO "SBLOCCA-SCHERMO": Rimuoviamo forzatamente i blocchi che i dialoghi lasciano sul body
    setTimeout(() => {
      document.body.style.pointerEvents = 'auto';
      document.body.style.overflow = 'auto';
    }, 100);

    try {
      // 3. Esecuzione su Firebase
      await deleteDoc(doc(db, 'users', targetId));
      console.log("Cancellazione eseguita");
    } catch (e: any) {
      console.error("Errore:", e);
      alert("Errore durante l'eliminazione.");
    }
  };

  const handleSaveMember = async (data: any) => {
    setIsMemberDialogOpen(false);
    setSelectedMember(null);
    
    // Pulizia anche qui per sicurezza dopo la chiusura del form
    setTimeout(() => {
      document.body.style.pointerEvents = 'auto';
    }, 100);

    try {
      if (selectedMember) {
        await updateDoc(doc(db, 'users', selectedMember.id), data);
      } else {
        const userEmail = data.email.trim().toLowerCase();
        await setDoc(doc(db, 'users', userEmail), {
          nome: data.nome || '',
          cognome: data.cognome || '',
          email: userEmail,
          status: data.status || 'socio',
          createdAt: new Date().toISOString()
        });
      }
    } catch (e: any) {
      console.error("ERRORE FIREBASE:", e);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-black min-h-screen text-white">
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-red-600" />
            <CardTitle className="text-white uppercase tracking-tight">Gestione Soci</CardTitle>
          </div>
          
          <Button 
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              setSelectedMember(null);
              setIsMemberDialogOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Aggiungi Socio
          </Button>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader className="border-zinc-800">
              <TableRow className="hover:bg-transparent border-zinc-800">
                <TableHead className="text-zinc-400">Nome</TableHead>
                <TableHead className="text-zinc-400">Stato</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {soci.map((s) => (
                <TableRow key={s.id} className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell className="font-medium">{s.nome} {s.cognome}</TableCell>
                  <TableCell className="capitalize text-zinc-300">{s.status}</TableCell>
                  <TableCell>
                    <DropdownMenu modal={false}> {/* Aggiunto modal={false} per evitare blocchi */}
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:bg-zinc-800 text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                        <DropdownMenuItem onClick={() => {
                          setSelectedMember(s);
                          setIsMemberDialogOpen(true);
                        }}>
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setIdSocioDaEliminare(s.id);
                            setIsConfirmDialogOpen(true);
                          }}
                        >
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
        description="L'azione rimuoverà il socio permanentemente."
      />
    </div>
  );
}