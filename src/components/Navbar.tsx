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

  // FUNZIONE LOGOUT POTENZIATA (PIAZZA PULITA)
  const handleLogoff = async () => {
    try {
      await signOut(auth);
      window.sessionStorage.clear();
      
      // Svuota i cookie di sessione per evitare blocchi sul Middleware
      document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "__session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      window.location.href = '/login';
    } catch (error) {
      window.location.href = '/login';
    }
  };

  return (
    /* h-16 su desktop (IDX), h-24 su mobile */
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b h-16 md:h-16 lg:h-16 max-md:h-24 flex items-center">
      <div className="container mx-auto flex max-w-screen-xl items-center justify-between px-4">
        
        {/* HAMBURGER - Gigante solo su mobile, normale altrove */}
        <Button 
          variant="ghost" 
          className="md:hidden relative h-12 w-12 max-md:h-20 max-md:w-20 p-0" 
          onClick={() => setIsOpen(true)}
        >
          <Menu 
            className="text-white"
            strokeWidth={2.5}
            /* Stile inline condizionale: 40px solo su schermi piccoli */
            style={typeof window !== 'undefined' && window.innerWidth < 768 ? { width: '40px', height: '40px' } : { width: '24px', height: '24px' }}
          />
          {mounted && hasAnyNotif && (
            <span className="absolute top-2 right-2 max-md:top-4 max-md:right-4 flex h-3 w-3 max-md:h-4 max-md:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-red-600"></span>
            </span>
          )}
        </Button>

        {/* LOGO - Dimensione adattiva */}
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/logo_motoclub.gif" alt="Logo" width={40} height={40} className="h-10 w-10 max-md:h-12 max-md:w-12 rounded-sm" />
          <span className="hidden sm:inline-block text-lg font-bold text-foreground italic uppercase">Motoclub VVF</span>
        </Link>

        {/* MENU DESKTOP (Quello che serve a te su IDX) */}
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

        {/* LOGOFF - Gigante solo su mobile */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={handleLogoff} 
            className="text-red-600 hover:text-red-500 h-12 w-12 max-md:h-20 max-md:w-20 p-0"
          >
            <LogOut 
              style={typeof window !== 'undefined' && window.innerWidth < 768 ? { width: '40px', height: '40px' } : { width: '24px', height: '24px' }}
              strokeWidth={2.5} 
            />
          </Button>
        </div>

      </div>
    </header>
  );
}