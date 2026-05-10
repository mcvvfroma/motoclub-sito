'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import { PlusCircle, MoreHorizontal, Users, Camera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import MemberDialog from '@/components/MemberDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';

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
        // AGGIORNAMENTO: data contiene già photoURL dal Dialog
        await updateDoc(doc(db, 'users', selectedMember.id), data);
      } else {
        const userEmail = data.email.trim().toLowerCase();
        await setDoc(doc(db, 'users', userEmail), {
          nome: data.nome || '',
          cognome: data.cognome || '',
          email: userEmail,
          photoURL: data.photoURL || '', // Uniformato a photoURL
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
    <div className="p-4 sm:p-6 space-y-6 bg-black min-h-screen text-white font-sans">
      <Card className="bg-zinc-950 border-zinc-800 font-sans">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-900 pb-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-red-600" />
            <CardTitle className="text-white uppercase font-black tracking-tighter">Gestione Soci</CardTitle>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white font-bold" onClick={() => { setSelectedMember(null); setIsMemberDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Aggiungi Socio
          </Button>
        </CardHeader>
        <CardContent className="pt-6 font-sans">
          <Table>
            <TableHeader className="border-zinc-800">
              <TableRow className="hover:bg-transparent border-zinc-800">
                <TableHead className="text-zinc-500 uppercase text-[10px] font-black w-[80px]">Foto</TableHead>
                <TableHead className="text-zinc-500 uppercase text-[10px] font-black">Nominativo</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {soci.map((s) => (
                <TableRow key={s.id} className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell>
                    <div className="h-12 w-12 rounded-full border border-zinc-800 overflow-hidden bg-zinc-900 flex items-center justify-center">
                      {s.photoURL ? (
                        <img src={s.photoURL} className="h-full w-full object-cover" alt="" />
                      ) : (
                        <Camera className="h-5 w-5 text-zinc-800" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-zinc-200 uppercase">{s.nome} {s.cognome}</TableCell>
                  <TableCell>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:bg-zinc-800 text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white font-sans">
                        <DropdownMenuItem onClick={() => { setSelectedMember(s); setIsMemberDialogOpen(true); }}>Modifica</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => { setIdSocioDaEliminare(s.id); setIsConfirmDialogOpen(true); }}>Elimina</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <MemberDialog isOpen={isMemberDialogOpen} setIsOpen={setIsMemberDialogOpen} member={selectedMember} onSave={handleSaveMember} />
      <ConfirmationDialog isOpen={isConfirmDialogOpen} setIsOpen={setIsConfirmDialogOpen} onConfirm={executeDelete} title="Sei sicuro?" description="Rimuoverai il socio permanentemente." />
    </div>
  );
}