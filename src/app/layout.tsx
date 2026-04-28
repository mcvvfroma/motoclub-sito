'use client';

import { useState } from 'react';
import './globals.css';
import AppSidebar from '@/components/AppSidebar';
import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <html lang="it">
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        {/* La Navbar è perfetta e non viene toccata */}
        <Navbar setIsOpen={setIsOpen} /> 

        {/* La Sidebar "fai-da-te" che usa lo stato locale */}
        <AppSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

        {/* Layout principale con classi per la centratura universale */}
        <main className="flex-1 w-full flex flex-col items-center justify-start pt-24">
        <div className="w-full max-w-4xl px-4 flex flex-col items-center overflow-x-clip">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
