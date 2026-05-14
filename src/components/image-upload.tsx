'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash2, UploadCloud } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (base64: string) => void;
  currentImage?: string | null;
}

export default function ImageUpload({ onImageUpload, currentImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.src = e.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Massima dimensione accettabile per mantenere il Base64 leggero
          const MAX_SIZE = 1024; 

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Esportiamo in JPEG con qualità 0.7 (ottimo compromesso peso/qualità)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          setPreview(compressedBase64);
          onImageUpload(compressedBase64);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload('');
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-[150px] h-[150px] rounded-full relative bg-muted flex items-center justify-center border border-dashed overflow-hidden">
        {preview ? (
          <Image 
            src={preview} 
            alt="Anteprima foto" 
            fill 
            className="object-cover"
            unoptimized // Importante per stringhe Base64 pesanti
          />
        ) : (
          <UploadCloud className="w-12 h-12 text-muted-foreground" />
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="outline">
          <label htmlFor="photo-upload" className="cursor-pointer">
            {preview ? 'Sostituisci Foto' : 'Carica Foto'}
          </label>
        </Button>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {preview && (
          <Button variant="destructive" size="icon" onClick={handleRemoveImage}>
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Rimuovi Foto</span>
          </Button>
        )}
      </div>
    </div>
  );
}