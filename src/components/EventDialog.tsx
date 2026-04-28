'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from 'lucide-react';
import { Event } from '@/app/events/page';

interface EventDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  event: Event | null;
  onSave: (event: Event) => void;
}

const DEFAULT_EVENT_IMAGE = '/logo_motoclub.gif';

export default function EventDialog({ isOpen, setIsOpen, event, onSave }: EventDialogProps) {
  const [formData, setFormData] = useState<Omit<Event, 'id'> & { id?: number }>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        if (event) {
          setFormData(event);
          setPreviewImage(event.image);
        } else {
          // Reset per un nuovo evento
          setFormData({ title: '', date: '', description: '', image: '' });
          setPreviewImage(null);
        }
    }
  }, [event, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const localImageUrl = URL.createObjectURL(file);
          setPreviewImage(localImageUrl);
          setFormData(prev => ({...prev, image: localImageUrl}));
      }
  }

  const handleSubmit = () => {
    const dataToSave = { ...formData };
    if (!dataToSave.image) {
        dataToSave.image = DEFAULT_EVENT_IMAGE;
    }
    
    onSave(dataToSave as Event);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? 'Modifica Evento' : 'Aggiungi Nuovo Evento'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Campi di testo non modificati */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Titolo</Label>
            <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Data</Label>
            <Input id="date" name="date" type="date" value={formData.date || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Descrizione</Label>
            <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} className="col-span-3" />
          </div>

          {/* Sezione Immagine Migliorata */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Immagine</Label>
            <div className="col-span-3 flex flex-col gap-2">
                 {previewImage && (
                    <div className="relative w-full h-32 rounded-md overflow-hidden">
                        <img src={previewImage} alt="Anteprima" className="w-full h-full object-cover" />
                    </div>
                )}
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2"/>
                    {previewImage ? 'Cambia Immagine' : 'Carica Immagine'}
                </Button>
                <Input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                />
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
