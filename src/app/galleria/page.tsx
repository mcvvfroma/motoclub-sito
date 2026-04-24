import React from 'react';
import Link from 'next/link';

export default function GalleriaPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">GALLERIA FOTO</h1>
      <p className="text-xl text-gray-400 mb-8">In aggiornamento...</p>
      <Link href="/" className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition">
        TORNA ALLA HOME
      </Link>
    </main>
  );
}
