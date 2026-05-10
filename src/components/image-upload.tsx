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
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageUpload(base64String);
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
      <div className="w-[150px] h-[150px] rounded-full relative bg-muted flex items-center justify-center border border-dashed">
        {preview ? (
          <Image src={preview} alt="Anteprima foto" layout="fill" className="rounded-full object-cover" />
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
