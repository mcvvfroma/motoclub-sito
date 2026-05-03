'use client';

import { useState, useEffect } from 'react';
import { menuItems } from '@/config/menu';
import { X, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '@/hooks/use-admin';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface AppSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function AppSidebar({ isOpen, setIsOpen }: AppSidebarProps) {
  const router = useRouter();
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
      const q = query(collection(db, s.coll), orderBy(s.field, "desc"), limit(1));
      return onSnapshot(q, (snip) => {
        if (!snip.empty) {
          setLatestIds(prev => ({ ...prev, [s.path]: snip.docs[0].id }));
        }
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
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
        
        // LOGICA PERSISTENZA: Se non c'è memoria precedente (es. nuovo login),
        // salviamo l'ID attuale come letto per non mostrare pallini su roba vecchia.
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

  const handleLogout = () => {
    setIsOpen(false);
    // IMPORTANTE: Non usiamo localStorage.clear() qui per mantenere i pallini letti
    router.push('/login');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-background transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold uppercase tracking-tighter italic">Menu</h2>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 flex flex-col p-4 space-y-2">
          {!loading && menuItems.filter(item => item.href !== '/members' || isAdmin).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="relative flex items-center space-x-3 rounded-md p-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <span>{item.label}</span>
              {mounted && notifs[item.href] && (
                <span className="absolute right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex w-full items-center space-x-3 rounded-md p-2 text-base font-medium text-red-500 hover:bg-accent hover:text-red-600">
             <LogOut className="h-6 w-6" />
             <span className="font-bold uppercase tracking-tighter">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}