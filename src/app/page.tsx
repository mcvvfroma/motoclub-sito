'use client';

import Image from 'next/image';
import { Black_Ops_One, Kanit } from 'next/font/google';

// Configurazione font Black Ops One per la prima e terza riga
const blackOps = Black_Ops_One({ 
  subsets: ['latin'],
  weight: ['400'], 
});

// Configurazione font Kanit per la riga centrale "Italia"
const kanit = Kanit({ 
  subsets: ['latin'],
  weight: ['700'], 
});

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center pt-16 px-4 text-center">
      
      {/* CONTENITORE LOGO ANIMATO */}
      <div className="relative group overflow-hidden rounded-full inline-block">
        
        {/* Il tuo logo originale */}
        <Image
          src="/logo_motoclub.gif"
          alt="Logo Moto Club"
          width={250}
          height={250}
          priority
          className="relative z-10"
        />
        
        {/* L'effetto luce (Shimmer) */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>

      </div>
      {/* FINE LOGO ANIMATO */}
      
      <div className="mt-8 tracking-tight uppercase">
        {/* Prima Riga: Rosso - Black Ops One */}
        <h2 className={`${blackOps.className} text-3xl md:text-4xl text-red-600 mb-1 leading-tight`}>
          Motoclub Vigili del Fuoco
        </h2>
        
        {/* Seconda Riga: Rosso - Kanit */}
        <h3 className={`${kanit.className} text-xl md:text-2xl text-red-600 mb-2 leading-none italic`}>
          Italia
        </h3>
        
        {/* Terza Riga: Oro - Black Ops One (Formato più piccolo) */}
        <h2 className={`${blackOps.className} text-2xl md:text-3xl text-yellow-500 leading-tight`}>
          Sezione di Roma
        </h2>
      </div>
    </div>
  );
}