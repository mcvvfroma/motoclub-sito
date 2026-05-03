'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const { isAdmin, loading } = useAdmin();
  const [mounted, setMounted] = useState(false);
  
  const [notifs, setNotifs] = useState<{ [key: string]: boolean }>({
    '/comunicazioni': false,
    '/convenzioni': false,
    '/events': false
  });
  const [latestIds, setLatestIds] = useState<{ [key: string]: string }>({
    '/comunicazioni': '',
    '/convenzioni': '',
    '/events': ''
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const sections = [
      { path: '/comunicazioni', coll: 'communications', field: 'createdAt' },
      { path: '/convenzioni', coll: 'conventions', field: 'updatedAt' },
      { path: '/events', coll: 'events', field: 'publishedAt' }
    ];
    const unsubscribes = sections.map(s => {
      return onSnapshot(query(collection(db, s.coll), orderBy(s.field, "desc"), limit(1)), (snip) => {
        if (!snip.empty) setLatestIds(prev => ({ ...prev, [s.path]: snip.docs[0].id }));
      });
    });
    return () => unsubscribes.forEach(u => u());
  }, []);

  useEffect(() => {
    const updated = { ...notifs };
    Object.keys(latestIds).forEach(path => {
      const storageKey = `lastRead_${path}`;
      if (pathname === path) {
        if (latestIds[path]) localStorage.setItem(storageKey, latestIds[path]);
        updated[path] = false;
      } else {
        const lastRead = localStorage.getItem(storageKey);
        
        // MODIFICA QUI: Se è un nuovo login (lastRead vuoto), segnamo come letto l'ID attuale
        // così i pallini non appaiono per i vecchi contenuti.
        if (!lastRead && latestIds[path]) {
          localStorage.setItem(storageKey, latestIds[path]);
          updated[path] = false;
        } else {
          updated[path] = latestIds[path] !== '' && lastRead !== latestIds[path];
        }
      }
    });
    setNotifs(updated);
  }, [pathname, latestIds]);

  const hasAnyNotif = Object.values(notifs).some(v => v);

  const handleLogoff = async () => {
    try {
      await signOut(auth);
      // RIMOSSO localStorage.clear() per non perdere la memoria dei pallini letti
      window.sessionStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      window.location.href = '/login';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/logo_motoclub.gif" alt="Logo" width={40} height={40} className="h-10 w-10 rounded-sm" />
          <span className="hidden sm:inline-block text-lg font-bold text-foreground">Motoclub VVF - Roma</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-4">
          {!loading && menuItems.filter(i => i.href !== '/members' || isAdmin).map((item) => (
            <Link key={item.href} href={item.href} className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground px-2">
              {item.label}
              {mounted && notifs[item.href] && (
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
                {mounted && hasAnyNotif && (
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