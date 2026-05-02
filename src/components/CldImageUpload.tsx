'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { ImagePlus } from 'lucide-react';

interface CldImageUploadProps {
  onUploadSuccess: (error: any, result: any) => void;
  maxFiles?: number;
  buttonText?: string;
}

export default function CldImageUpload({ 
  onUploadSuccess, 
  maxFiles = 1, 
  buttonText = "Carica Foto" 
}: CldImageUploadProps) {
  return (
    <CldUploadWidget 
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      onSuccess={(result, { widget }) => {
        onUploadSuccess(null, result);
        widget.close();
      }}
      options={{
        maxFiles: maxFiles,
        clientAllowedFormats: ["jpg", "png", "jpeg"],
      }}
    >
      {({ open }) => (
        <Button 
          type="button"
          onClick={() => open()}
          // Stile piccolo, nero e cattivo
          className="bg-zinc-900 hover:bg-black text-white border border-zinc-800 rounded font-black text-[10px] uppercase tracking-tighter transition-all h-8 px-3"
        >
          <ImagePlus className="h-3.5 w-3.5 mr-1.5 text-red-600" />
          {buttonText}
        </Button>
      )}
    </CldUploadWidget>
  );
}