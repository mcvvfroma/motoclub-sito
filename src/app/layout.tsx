'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import Navbar from '../components/Navbar';
import AppSidebar from '../components/AppSidebar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isLoginPage = pathname === '/login';

  return (
    <html lang="it">
      <head>
        {/* Titolo e Manifest */}
        <title>Motoclub VVF Roma</title>
        <meta name="description" content="Sito ufficiale Motoclub Vigili del Fuoco Sezione di Roma" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Configurazione specifica per iOS (Apple) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Motoclub VVF Roma" />
        <link rel="apple-touch-icon" href="/logo_motoclub.gif" />
        
        {/* Colore tema per la barra del browser */}
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <div className="relative min-h-screen bg-background">
          {!isLoginPage && (
            <>
              <Navbar setIsOpen={setIsSidebarOpen} />
              <AppSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            </>
          )}
          
          <main className={!isLoginPage ? "pt-16" : ""}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}