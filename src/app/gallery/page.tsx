'use client';

import Image from 'next/image';

// Definiamo le immagini da usare, prese esclusivamente da /public
const images = [
  { id: 1, src: '/logo_motoclub.gif', alt: 'Logo Motoclub VVF Roma' },
  { id: 2, src: '/logo_vvf.png', alt: 'Logo Corpo Nazionale dei Vigili del Fuoco' },
  { id: 3, src: '/logo_vvf_2.jpeg', alt: 'Logo Storico Vigili del Fuoco' },
];

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
        Galleria Immagini
      </h1>
      
      {/* Contenitore della griglia centrato */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((image) => (
          <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Image
              src={image.src}
              alt={image.alt}
              width={500}
              height={500}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-0 left-0 p-4">
                <p className="text-white text-sm font-semibold">{image.alt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
