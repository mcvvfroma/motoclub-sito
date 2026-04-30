'use client';

import { menuItems } from '@/config/menu';
import { X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '@/hooks/use-admin'; // <-- IMPORTIAMO IL CONTROLLO ADMIN

interface AppSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function AppSidebar({ isOpen, setIsOpen }: AppSidebarProps) {
  const router = useRouter();
  const { isAdmin, loading } = useAdmin(); // <-- USIAMO IL CONTROLLO

  const handleLogout = () => {
    console.log("Stato di autenticazione resettato (da sidebar).");
    setIsOpen(false);
    router.push('/login');
  };

  // Cambia '/soci' in '/members'
const filteredMenuItems = menuItems.filter(item => {
  if (item.href === '/members' && !isAdmin) {
    return false; 
  }
  return true;
});

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Menu</h2>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
            <span className="sr-only">Chiudi menu</span>
          </button>
        </div>
        <nav className="flex-1 flex flex-col p-4 space-y-2">
          {!loading && filteredMenuItems.map((item) => ( // <-- USIAMO I LINK FILTRATI
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 rounded-md p-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 rounded-md p-2 text-base font-medium text-red-500 hover:bg-accent hover:text-red-600"
          >
             <LogOut className="h-6 w-6" />
             <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}