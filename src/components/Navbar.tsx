'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { menuItems } from '@/config/menu';

interface NavbarProps {
  setIsOpen: (isOpen: boolean) => void;
}

export default function Navbar({ setIsOpen }: NavbarProps) {

  const handleLogoff = () => {
    // Forza il reset completo dello stato e torna alla pagina di login.
    // Questo approccio è più drastico di router.push e pulisce lo stato client-side.
    window.location.href = '/login';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        {/* SINISTRA: Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <Image 
            src="/logo_motoclub.gif"
            alt="Logo Motoclub VVF Roma"
            width={40}
            height={40}
            className="h-10 w-10 rounded-sm"
          />
          <span className="hidden sm:inline-block text-lg font-bold text-foreground whitespace-nowrap">Motoclub VVF - Sez. di Roma</span>
        </Link>

        {/* CENTRO: Menu per schermi grandi */}
        <nav className="hidden md:flex items-center space-x-4">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* DESTRA: Pulsanti Logoff e Menu Mobile */}
        <div className="flex items-center space-x-2">
            {/* Il Button di shadcn renderizza un <button> HTML, garantendo la cliccabilità */}
            <Button variant="ghost" size="icon" onClick={handleLogoff} className="text-red-500 hover:text-red-600">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logoff</span>
            </Button>

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
