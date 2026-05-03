'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { usePathname, useRouter } from 'next/navigation'; // Aggiunto useRouter
import { useState, useEffect } from 'react'; // Aggiunto useEffect
import { auth } from '@/lib/firebase'; // Verifica che il percorso sia corretto
import { onAuthStateChanged } from 'firebase/auth';

import Navbar from '../components/Navbar';
import AppSidebar from '../components/AppSidebar';
import InstallPrompt from '../components/InstallPrompt';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/login';

  // --- PROTEZIONE ACCESSO ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Se l'utente non è loggato e prova ad andare su una pagina diversa da /login
      if (!user && !isLoginPage) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [isLoginPage, router]);
  // --------------------------

  return (
    <html lang="it">
      <head>
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

          {/* Il popup di installazione appare solo se l'utente è loggato */}
          {!isLoginPage && <InstallPrompt />} 
        </div>
      </body>
    </html>
  );
}