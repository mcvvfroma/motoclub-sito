'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
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
  const [isLoading, setIsLoading] = useState(true); // Stato per il caricamento
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Stato per l'autenticazione
  
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        if (!isLoginPage) {
          router.push('/login');
        }
      }
      setIsLoading(false); // Caricamento terminato
    });

    return () => unsubscribe();
  }, [isLoginPage, router]);

  // Se sta ancora caricando e non siamo nella pagina di login, 
  // mostriamo una schermata vuota (o un logo) così non può cliccare nulla
  if (isLoading && !isLoginPage) {
    return (
      <html lang="it">
        <body className="bg-background flex items-center justify-center min-h-screen">
          {/* Qui volendo puoi mettere un'icona di caricamento o il logo del motoclub */}
          <div className="animate-pulse text-muted-foreground italic">Verifica accesso...</div>
        </body>
      </html>
    );
  }

  return (
    <html lang="it">
      <head>
        <title>Motoclub VVF Roma</title>
        <meta name="description" content="Sito ufficiale Motoclub Vigili del Fuoco Sezione di Roma" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Motoclub VVF Roma" />
        <link rel="apple-touch-icon" href="/logo_motoclub.gif" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <div className="relative min-h-screen bg-background">
          {/* Mostriamo Navbar e Sidebar SOLO se loggato e non in pagina login */}
          {isAuthenticated && !isLoginPage && (
            <>
              <Navbar setIsOpen={setIsSidebarOpen} />
              <AppSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            </>
          )}
          
          <main className={isAuthenticated && !isLoginPage ? "pt-16" : ""}>
            {children}
          </main>

          {isAuthenticated && !isLoginPage && <InstallPrompt />} 
        </div>
      </body>
    </html>
  );
}