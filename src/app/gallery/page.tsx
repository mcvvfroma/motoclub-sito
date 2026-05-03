'use client';

import { HardHat, Truck } from 'lucide-react';

export default function GalleryPage() {
  const helmetStyle = (delay: string) => ({
    animation: `ultraSoftFade 6s infinite ease-in-out`,
    animationDelay: delay,
    opacity: 0,
  });

  // Stile per il mezzo in transito
  const truckStyle = (delay: string) => ({
    animation: `transitoContinuo 12s linear infinite`,
    animationDelay: delay,
    position: 'absolute' as const,
    left: '-150px', // Parte da fuori schermo
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <style jsx global>{`
        @keyframes ultraSoftFade {
          0% { opacity: 0; transform: translateY(10px); }
          15% { opacity: 1; transform: translateY(0); }
          35% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 0; }
        }

        @keyframes sirenaLampeggiante {
          0%, 100% { border-color: #1d4ed8; box-shadow: 0 0 2px #1d4ed8; }
          50% { border-color: #60a5fa; box-shadow: 0 0 10px #60a5fa, 0 0 20px #1d4ed8; }
        }

        @keyframes transitoContinuo {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 300px)); }
        }
      `}</style>

      {/* SEZIONE SUPERIORE */}
      <div className="text-center space-y-16 z-10 relative">
        <div className="flex justify-center items-center gap-12 pt-6">
          <div style={helmetStyle('0s')}>
            <HardHat className="h-24 w-24 text-zinc-300 stroke-[1.2] drop-shadow-[0_0_30px_rgba(212,212,216,0.15)]" />
          </div>
          <div style={helmetStyle('2s')}>
            <HardHat className="h-24 w-24 text-red-600 stroke-[1.2] drop-shadow-[0_0_30px_rgba(220,38,38,0.2)]" />
          </div>
          <div style={helmetStyle('4s')}>
            <HardHat className="h-24 w-24 text-zinc-800 stroke-[1.2]" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">
            Galleria Immagini
          </h1>
          <div className="inline-block border border-zinc-800 bg-zinc-950 px-6 py-2 rounded-sm">
            <span className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em]">
              Intervento Tecnico in Corso
            </span>
          </div>
        </div>
      </div>

      {/* CORRIDOIO DI TRANSITO: Flusso continuo con due mezzi */}
      <div className="w-full h-24 flex items-center relative z-0">
        
        {/* PRIMO MEZZO */}
        <div style={truckStyle('0s')}>
          <div className="relative flex items-center">
            <Truck className="h-14 w-14 text-red-700 stroke-[1] drop-shadow-[0_0_15px_rgba(185,28,28,0.3)]" />
            <div className="absolute top-2 left-8 w-3 h-2 bg-transparent rounded-t-full border-2 border-blue-700 animate-[sirenaLampeggiante_0.4s_infinite_alternate]"></div>
          </div>
        </div>

        {/* SECONDO MEZZO (Parte con 6 secondi di ritardo, a metà del ciclo del primo) */}
        <div style={truckStyle('6s')}>
          <div className="relative flex items-center">
            <Truck className="h-14 w-14 text-red-700 stroke-[1] drop-shadow-[0_0_15px_rgba(185,28,28,0.3)]" />
            <div className="absolute top-2 left-8 w-3 h-2 bg-transparent rounded-t-full border-2 border-blue-700 animate-[sirenaLampeggiante_0.4s_infinite_alternate]"></div>
          </div>
        </div>

      </div>

      {/* SEZIONE INFERIORE */}
      <div className="text-center space-y-12 z-10 relative">
        <div className="max-w-xl mx-auto border-t border-zinc-900 pt-8">
          <p className="text-zinc-500 italic text-sm tracking-wide leading-relaxed">
            "Le squadre stanno mettendo in sicurezza i ricordi più belli.<br/>
            La galleria sarà operativa non appena terminata la manutenzione."
          </p>
        </div>

        <div className="pt-4">
            <div className="w-16 h-1 bg-red-600 mx-auto mb-4"></div>
            <p className="text-zinc-800 font-black uppercase text-[9px] tracking-[0.5em]">
                Moto Club Vigili del Fuoco
            </p>
        </div>
      </div>
    </div>
  );
}