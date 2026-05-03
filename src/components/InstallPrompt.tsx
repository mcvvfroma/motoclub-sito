'use client';

import { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Download, MonitorSmartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Verifica se è già installata
    const isPWA = window.matchMedia('(display-mode: standalone)').matches 
                  || (window.navigator as any).standalone;
    setIsStandalone(isPWA);

    // 2. Rileva il sistema operativo
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const android = /android/.test(ua);
    setIsIOS(ios);
    setIsAndroid(android);

    // 3. Mostra solo se mobile, non installata e non rifiutata di recente
    if (!isPWA && (ios || android)) {
      const lastDismissed = localStorage.getItem('installPromptDismissed');
      const now = new Date().getTime();
      
      // Mostra di nuovo dopo 7 giorni se è stato chiuso
      if (!lastDismissed || (now - parseInt(lastDismissed)) > 7 * 24 * 60 * 60 * 1000) {
        setIsVisible(true);
      }
    }
  }, []);

  if (!isVisible || isStandalone) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('installPromptDismissed', new Date().getTime().toString());
  };

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-8">
      <div className="bg-card border-2 border-primary/20 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] rounded-2xl p-5 relative">
        <button onClick={handleDismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg">
              <MonitorSmartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">App Motoclub VVF</h3>
              <p className="text-xs text-muted-foreground mt-1 text-balance">Porta i percorsi e i soci sempre in tasca!</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 text-sm border border-border/50">
            {isIOS ? (
              <div className="space-y-3">
                <p className="flex items-center gap-3 font-medium">
                  <span className="bg-background w-6 h-6 flex items-center justify-center rounded-full text-[10px] border">1</span>
                  Tocca il tasto <Share className="h-5 w-5 text-blue-500" /> in basso
                </p>
                <p className="flex items-center gap-3 font-medium">
                  <span className="bg-background w-6 h-6 flex items-center justify-center rounded-full text-[10px] border">2</span>
                  Seleziona <strong className="text-primary">Aggiungi alla Home</strong> <PlusSquare className="h-5 w-5" />
                </p>
              </div>
            ) : (
              <p className="leading-relaxed italic">
                "Tocca i tre puntini <strong className="text-lg">⋮</strong> in alto a destra e seleziona <strong>Installa applicazione</strong> o <strong>Aggiungi a schermata Home</strong>"
              </p>
            )}
          </div>

          <Button onClick={handleDismiss} className="w-full font-bold uppercase tracking-tighter italic h-11">
            Ricevuto, ci vediamo in strada! 🏍️
          </Button>
        </div>
      </div>
    </div>
  );
}