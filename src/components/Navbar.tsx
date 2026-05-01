'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { menuItems } from '@/config/menu';
import { useAdmin } from '@/hooks/use-admin';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface NavbarProps {
  setIsOpen: (isOpen: boolean) => void;
}

export default function Navbar({ setIsOpen }: NavbarProps) {
  const { isAdmin, loading } = useAdmin();
  const [hasNewNotices, setHasNewNotices] = useState(false);
  const [latestNoticeId, setLatestNoticeId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "communications"), orderBy("createdAt", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const latestId = snapshot.docs[0].id;
        setLatestNoticeId(latestId);
        const lastReadId = localStorage.getItem('lastReadNoticeId');
        setHasNewNotices(lastReadId !== latestId);
      }
    });
    return () => unsubscribe();
  }, []);

  // CORREZIONE: Forza lo stato a false non appena l'utente clicca
  const handleLinkClick = (href: string) => {
    if (href === '/comunicazioni' && latestNoticeId) {
      localStorage.setItem('lastReadNoticeId', latestNoticeId);
      setHasNewNotices(false); // <--- Sparisce istantaneamente!
    }
  };

  const handleLogoff = async () => {
    try {
      await signOut(auth);
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error("Errore durante il logout:", error);
      window.location.href = '/login';
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (item.href === '/members' && !isAdmin) return false;
    return true;
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        
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

        <nav className="hidden md:flex items-center space-x-4">
          {!loading && filteredMenuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={() => handleLinkClick(item.href)}
              className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground px-2"
            >
              {item.label}
              {mounted && item.href === '/comunicazioni' && hasNewNotices && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleLogoff} className="text-red-500 hover:text-red-600">
                <LogOut className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="md:hidden relative" onClick={() => setIsOpen(true)}>
                <Menu className="h-6 w-6" />
                {mounted && hasNewNotices && (
                  <span className="absolute top-2 right-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                )}
            </Button>
        </div>
      </div>
    </header>
  );
}