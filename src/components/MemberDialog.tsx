'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, X } from 'lucide-react';

export default function MemberDialog({ isOpen, setIsOpen, member, onSave }: any) {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    status: 'socio',
    photoURL: '' // Uniformato
  });

  useEffect(() => {
    if (member) {
      setFormData({
        nome: member.nome || '',
        cognome: member.cognome || '',
        email: member.email || '',
        status: member.status || 'socio',
        photoURL: member.photoURL || ''
      });
    } else {
      setFormData({ nome: '', cognome: '', email: '', status: 'socio', photoURL: '' });
    }
  }, [member, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(prev => ({ ...prev, photoURL: '' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-zinc-950 text-white border-zinc-800 sm:max-w-[425px] font-sans">
        <DialogHeader>
          <DialogTitle className="text-white font-black uppercase text-center tracking-tighter">Dettagli Socio</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-28 w-28 rounded-full border-2 border-red-600 overflow-hidden bg-zinc-900 flex items-center justify-center relative shadow-2xl">
                {formData.photoURL ? (
                  <img src={formData.photoURL} className="h-full w-full object-cover" alt="Profilo" />
                ) : (
                  <Camera className="h-10 w-10 text-zinc-700" />
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
              </div>
              {formData.photoURL && (
                <button type="button" onClick={removePhoto} className="absolute -top-1 -right-1 h-8 w-8 bg-red-600 text-white rounded-full flex items-center justify-center z-30 border-2 border-zinc-950 shadow-lg">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest italic">Tocca per caricare foto</p>
          </div>

          <div className="grid gap-4 text-left">
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-black text-zinc-500">Nome</Label>
              <Input className="bg-zinc-900 border-zinc-800" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-black text-zinc-500">Cognome</Label>
              <Input className="bg-zinc-900 border-zinc-800" value={formData.cognome} onChange={(e) => setFormData({...formData, cognome: e.target.value})} required />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-black text-zinc-500">Email</Label>
              <Input type="email" className="bg-zinc-900 border-zinc-800" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-black text-zinc-500">Ruolo</Label>
              <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white font-sans">
                  <SelectItem value="socio">Socio</SelectItem>
                  <SelectItem value="admin">Amministratore</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 text-lg uppercase italic tracking-tighter">
              Salva Socio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}