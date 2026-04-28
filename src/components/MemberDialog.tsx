'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Member = {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  status: 'admin' | 'socio';
};

interface MemberDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  member?: Member | null;
  onSave: (data: any) => void;
}

export default function MemberDialog({ isOpen, setIsOpen, member, onSave }: MemberDialogProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    status: 'socio' as 'admin' | 'socio'
  });

  useEffect(() => {
    if (member) {
      setFormData({
        nome: member.nome || '',
        cognome: member.cognome || '',
        email: member.email || '',
        status: member.status || 'socio'
      });
    } else {
      setFormData({ nome: '', cognome: '', email: '', status: 'socio' });
    }
  }, [member, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{member ? 'Modifica Socio' : 'Aggiungi Nuovo Socio'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cognome">Cognome</Label>
            <Input
              id="cognome"
              value={formData.cognome}
              onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Ruolo</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: 'admin' | 'socio') => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un ruolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="socio">Socio</SelectItem>
                <SelectItem value="admin">Amministratore</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annulla
            </Button>
            <Button type="submit">Salva</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}