import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // Definiamo il tipo del body per TypeScript
    const body = await request.json() as { publicId: string };
    const publicId = body.publicId;

    if (!publicId) {
      return NextResponse.json({ error: "ID pubblico mancante" }, { status: 400 });
    }

    // Comandiamo a Cloudinary di eliminare il file
    const result = await cloudinary.uploader.destroy(publicId);
    
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("Errore eliminazione Cloudinary:", error);
    return NextResponse.json({ error: error.message || "Errore durante l'eliminazione" }, { status: 500 });
  }
}