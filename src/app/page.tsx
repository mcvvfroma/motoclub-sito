'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6 text-white text-center">
      {/* Contenitore Logo */}
      <div className="relative w-48 h-48 mb-10">
        <Image 
          src="/logo_motoclub.gif" 
          alt="Logo Motoclub VVF Roma" 
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Testi Principali */}
      <h1 className="text-4xl font-extrabold tracking-tighter mb-2">RideRoute</h1>
      <p className="text-red-600 font-bold uppercase tracking-[0.2em] mb-12">
        Moto Club VV.F. Roma
      </p>
      
      {/* Tasto di Accesso - Modificato per puntare a /events */}
      <Link href="/events" className="w-full max-w-xs">
        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all active:scale-95 text-xl uppercase">
          ENTRA NEL PORTALE
        </button>
      </Link>

      <p className="mt-16 text-[10px] text-gray-500 uppercase tracking-widest opacity-50">
        Versione Ufficiale 2026.1
      </p>
    </div>
  );
}