'use client';
import { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';

export default function ImageUpload({ onImageUpload, currentImage }: { onImageUpload: (base: string) => void, currentImage?: string | null }) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (currentImage) setPreview(currentImage);
  }, [currentImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Se result è vuoto o nullo, la funzione si ferma qui
        if (!result) return;
        
        setPreview(result);
        onImageUpload(result); // Passa la stringa al padre
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center">
        {preview ? (
          <img src={preview} className="w-full h-full object-cover" alt="Preview" />
        ) : (
          <UploadCloud className="text-zinc-700 w-10 h-10" />
        )}
      </div>
      <label className="cursor-pointer bg-zinc-800 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase italic transition-all hover:bg-zinc-700">
        Seleziona Foto
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>
    </div>
  );
}