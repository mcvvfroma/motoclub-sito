'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, setDoc, updateDoc, deleteDoc, doc, addDoc } from 'firebase/firestore';
// ... gli altri import (PlusCircle, Button, Card, ecc.) restano uguali

import { PlusCircle, MoreHorizontal } from 'lucide-react';
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

  const openMemberDialog = (s: Member | null = null) => {
    setSelectedMember(s);

    setIsMemberDialogOpen(true);
  };

  const openDeleteConfirmation = (id: string) => {
    setIdSocioDaEliminare(id);
    setIsConfirmDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!idSocioDaEliminare) return;
    try {
      // Usiamo firestoreDoc per non confonderlo con i dati
      await deleteDoc(doc(db, 'users', idSocioDaEliminare));
      setIsConfirmDialogOpen(false);
      setIdSocioDaEliminare(null);
    } catch (e) {
      console.error("Errore eliminazione:", e);
    }
  };
  const handleSaveMember = async (data: any) => {
    setIsMemberDialogOpen(false);
    setSelectedMember(null);

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
      console.log("Salvataggio riuscito!");
    } catch (e: any) {
      console.error("ERRORE FIREBASE:", e);
      alert("Errore nel salvataggio: " + e.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestione Soci</CardTitle>
          {isAdmin && (
            <Button onClick={() => {
              setSelectedMember(null);
              setIsMemberDialogOpen(true);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Aggiungi Socio
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {soci.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.nome} {s.cognome}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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

      {isAdmin && (
        <>
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
        </>
      )}
    </div>
  );
}