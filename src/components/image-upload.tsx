'use client';

import { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';

export default function ImageUpload({ onImageUpload, currentImage }: { onImageUpload: (base64: string) => void, currentImage?: string | null }) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Usiamo FileReader puro come nella sezione eventi
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setPreview(base64String);
        onImageUpload(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-32 h-32 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden bg-zinc-900">
        {preview ? (
          <img src={preview} alt="Anteprima" className="w-full h-full object-cover" />
        ) : (
          <UploadCloud className="w-10 h-10 text-zinc-700" />
        )}
      </div>
      <label className="cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase italic border border-zinc-800 transition-all">
        Seleziona Foto
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>
    </div>
  );
}