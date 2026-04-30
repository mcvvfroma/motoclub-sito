'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// Righe 9 e 10 esatte:
import Navbar from '../components/Navbar';
import AppSidebar from '../components/AppSidebar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Controllo se siamo nella pagina di login
  const isLoginPage = pathname === '/login';

  return (
    <html lang="it">
      <body className={inter.className}>
        <div className="relative min-h-screen bg-background">
          {/* Mostra Navbar e Sidebar SOLO se NON siamo in /login */}
          {!isLoginPage && (
            <>
              <Navbar setIsOpen={setIsSidebarOpen} />
              <AppSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            </>
          )}
          
          <main className={!isLoginPage ? "pt-16" : ""}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}