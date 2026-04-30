'use client';

import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center pt-16 px-4 text-center">
      <Image
        src="/logo_motoclub.gif"
        alt="Logo Moto Club"
        width={250}
        height={250}
        priority
      />
      
      <div className="mt-8 font-extrabold tracking-tight uppercase">
        {/* Prima Riga: Rosso */}
        <h2 className="text-2xl md:text-3xl text-red-600 mb-1">
          Motoclub Vigili del Fuoco
        </h2>
        
        {/* Seconda Riga: Rosso */}
        <h3 className="text-xl md:text-2xl text-red-600 mb-2">
          Italia
        </h3>
        
        {/* Terza Riga: Oro */}
        <h2 className="text-2xl md:text-3xl text-yellow-500">
          Sezione di Roma
        </h2>
      </div>
    </div>
  );
}