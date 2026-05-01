'use client';

import { useState, useEffect } from 'react';
import { menuItems } from '@/config/menu';
import { X, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation'; // Aggiunto usePathname
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
  const pathname = usePathname(); // Monitora il cambio pagina
  const { isAdmin, loading } = useAdmin();
  const [hasNewNotices, setHasNewNotices] = useState(false);
  const [latestNoticeId, setLatestNoticeId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync con Firebase
  useEffect(() => {
    const q = query(collection(db, "communications"), orderBy("createdAt", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLatestNoticeId(snapshot.docs[0].id);
      }
    });
    return () => unsubscribe();
  }, []);

  // CONTROLLO AUTOMATICO: Se sono in /comunicazioni, il pallino deve sparire
  useEffect(() => {
    if (latestNoticeId) {
      if (pathname === '/comunicazioni') {
        localStorage.setItem('lastReadNoticeId', latestNoticeId);
        setHasNewNotices(false);
      } else {
        const lastReadId = localStorage.getItem('lastReadNoticeId');
        setHasNewNotices(lastReadId !== latestNoticeId);
      }
    }
  }, [pathname, latestNoticeId]);

  const handleLinkClick = (href: string) => {
    if (href === '/comunicazioni' && latestNoticeId) {
      localStorage.setItem('lastReadNoticeId', latestNoticeId);
      setHasNewNotices(false);
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    router.push('/login');
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (item.href === '/members' && !isAdmin) return false; 
    return true;
  });

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-background transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold uppercase italic">Menu</h2>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 flex flex-col p-4 space-y-2">
          {!loading && filteredMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleLinkClick(item.href)}
              className="relative flex items-center space-x-3 rounded-md p-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <span>{item.label}</span>
              {mounted && item.href === '/comunicazioni' && hasNewNotices && (
                <span className="absolute right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex w-full items-center space-x-3 rounded-md p-2 text-base font-medium text-red-500 hover:bg-accent">
             <LogOut className="h-6 w-6" />
             <span className="font-bold uppercase">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}