'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { menuItems } from '@/config/menu';
import { useAdmin } from '@/hooks/use-admin';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

interface NavbarProps {
  setIsOpen: (isOpen: boolean) => void;
}

export default function Navbar({ setIsOpen }: NavbarProps) {
  const { isAdmin, loading } = useAdmin();

  const handleLogoff = async () => {
    try {
      // 1. Esci da Firebase
      await signOut(auth);
      
      // 2. Svuota completamente la memoria locale del browser
      window.localStorage.clear();
      window.sessionStorage.clear();

      // 3. Forza il reindirizzamento e il ricaricamento totale della pagina
      // Questo impedisce il "rimbalzo" all'interno dell'app
      window.location.href = '/login';
      
    } catch (error) {
      console.error("Errore durante il logout:", error);
      // In caso di errore, proviamo comunque a resettare la pagina
      window.location.href = '/login';
    }
  };

  // Filtriamo i link del menu: se l'utente non è admin, rimuoviamo '/members'
  const filteredMenuItems = menuItems.filter(item => {
    // La rotta corretta nel tuo sistema è /members
    if (item.href === '/members' && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        
        {/* SINISTRA: Logo e Titolo */}
        <Link href="/" className="flex items-center space-x-3">
          <Image 
            src="/logo_motoclub.gif"
            alt="Logo Motoclub VVF Roma"
            width={40}
            height={40}
            className="h-10 w-10 rounded-sm"
          />
          <span className="hidden sm:inline-block text-lg font-bold text-foreground whitespace-nowrap">
            Motoclub VVF - Sez. di Roma
          </span>
        </Link>

        {/* CENTRO: Menu Desktop (nascosto su mobile) */}
        <nav className="hidden md:flex items-center space-x-4">
          {!loading && filteredMenuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {loading && <span className="text-xs text-muted-foreground animate-pulse">...</span>}
        </nav>

        {/* DESTRA: Pulsante Logout e Menu Mobile */}
        <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogoff} 
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logoff</span>
            </Button>

            {/* Pulsante Hamburger (solo mobile) */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsOpen(true)}
            >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Apri menu</span>
            </Button>
        </div>

      </div>
    </header>
  );
}