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

  const handleLogoff = async () => {
    try {
      await signOut(auth);
      window.sessionStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      window.location.href = '/login';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b h-24 flex items-center">
      <div className="container mx-auto flex max-w-screen-xl items-center justify-between px-4">
        
        {/* HAMBURGER MENU A SINISTRA - FORZATO A 40PX */}
        <Button 
          variant="ghost" 
          className="md:hidden relative h-20 w-20 p-0" 
          onClick={() => setIsOpen(true)}
        >
          <Menu 
            style={{ width: '40px', height: '40px' }} 
            className="text-white" 
            strokeWidth={2.5} 
          />
          {mounted && hasAnyNotif && (
            <span className="absolute top-4 right-4 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
            </span>
          )}
        </Button>

        {/* LOGO CENTRALE */}
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/logo_motoclub.gif" alt="Logo" width={50} height={50} className="h-12 w-12 rounded-sm" />
          <span className="hidden sm:inline-block text-xl font-bold text-foreground italic uppercase">Motoclub VVF</span>
        </Link>

        {/* LOGOFF A DESTRA - FORZATO A 40PX */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={handleLogoff} 
            className="text-red-600 hover:text-red-500 h-20 w-20 p-0"
          >
            <LogOut 
              style={{ width: '40px', height: '40px' }} 
              strokeWidth={2.5} 
            />
          </Button>
        </div>

      </div>
    </header>
  );
}