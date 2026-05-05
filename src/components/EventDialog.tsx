'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, MapPin, CloudSun, Clock, Route } from 'lucide-react';

// Definizione locale dell'interfaccia per evitare errori di importazione alla riga 10
interface Event {
  id?: string;
  title: string;
  date: string;
  description: string;
  image: string;
  percorso?: string;
  metaMeteo?: string;
  meetingTime?: string;
  distanceKm?: string;
  meetingPoint?: string;
}

interface EventDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  event: Event | null;
  onSave: (event: any) => void;
}

const DEFAULT_EVENT_IMAGE = '/cascovigili.jpg';

export default function EventDialog({ isOpen, setIsOpen, event, onSave }: EventDialogProps) {
  const [formData, setFormData] = useState<any>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        if (event) {
          setFormData(event);
          setPreviewImage(event.image || null);
        } else {
          setFormData({ 
            title: '', 
            date: '', 
            description: '', 
            image: '', 
            percorso: '', 
            metaMeteo: '',
            meetingTime: '',
            distanceKm: '',
            meetingPoint: ''
          });
          setPreviewImage(null);
        }
    }
  }, [event, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const localImageUrl = URL.createObjectURL(file);
          setPreviewImage(localImageUrl);
          setFormData((prev: any) => ({...prev, image: localImageUrl}));
      }
  }

  const handleSubmit = () => {
    const dataToSave = { ...formData };
    if (!dataToSave.image) dataToSave.image = DEFAULT_EVENT_IMAGE;
    onSave(dataToSave);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Modifica Evento' : 'Aggiungi Nuovo Evento'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right text-xs font-bold uppercase">Titolo</Label>
            <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right text-xs font-bold uppercase">Data</Label>
            <Input id="date" name="date" type="date" value={formData.date || ''} onChange={handleInputChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meetingTime" className="text-right text-xs font-bold uppercase flex items-center justify-end">
              <Clock className="h-3 w-3 mr-1 text-red-600" /> Orario
            </Label>
            <Input id="meetingTime" name="meetingTime" placeholder="Es: 09:00" value={formData.meetingTime || ''} onChange={handleInputChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="distanceKm" className="text-right text-xs font-bold uppercase flex items-center justify-end">
              <Route className="h-3 w-3 mr-1 text-red-600" /> KM
            </Label>
            <Input id="distanceKm" name="distanceKm" placeholder="Es: 250" value={formData.distanceKm || ''} onChange={handleInputChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meetingPoint" className="text-right text-xs font-bold uppercase flex items-center justify-end">
              <MapPin className="h-3 w-3 mr-1 text-red-600" /> Incontro
            </Label>
            <Input id="meetingPoint" name="meetingPoint" placeholder="Luogo ritrovo" value={formData.meetingPoint || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="metaMeteo" className="text-right text-xs font-bold uppercase flex items-center justify-end text-orange-600">
              <CloudSun className="h-3 w-3 mr-1" /> Meteo
            </Label>
            <Input 
              id="metaMeteo" 
              name="metaMeteo" 
              placeholder="Es: Bormio" 
              value={formData.metaMeteo || ''} 
              onChange={handleInputChange} 
              className="col-span-3 border-orange-200 focus:border-orange-500" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="percorso" className="text-right text-xs font-bold uppercase flex items-center justify-end text-blue-600">
              <MapPin className="h-3 w-3 mr-1" /> Maps
            </Label>
            <Input id="percorso" name="percorso" placeholder="Link Google Maps" value={formData.percorso || ''} onChange={handleInputChange} className="col-span-3 border-blue-200" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right text-xs font-bold uppercase">Info</Label>
            <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2 text-xs font-bold uppercase">Locandina</Label>
            <div className="col-span-3 flex flex-col gap-2">
                 {previewImage && (
                    <div className="relative w-full h-32 rounded-md overflow-hidden bg-black">
                        <img src={previewImage} alt="Anteprima" className="w-full h-full object-contain" />
                    </div>
                )}
                <Button variant="outline" type="button" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2"/> Seleziona Foto
                </Button>
                <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Annulla</Button>
          <Button type="submit" onClick={handleSubmit} className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase italic">Salva Evento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}