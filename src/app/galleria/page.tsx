
"use client"

import { Navbar } from "@/components/Navbar"
import { Camera } from "lucide-react"

export default function GalleriaPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
          <Camera className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-bold mb-4 text-foreground uppercase tracking-tighter">
          Galleria Fotografica
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-md italic">
          "I ricordi più belli delle nostre uscite saranno presto disponibili in questa sezione."
        </p>
        <div className="mt-8 px-6 py-2 border border-primary/30 rounded-full text-xs font-bold text-primary uppercase tracking-widest">
          In arrivo • 2026
        </div>
      </main>
    </div>
  )
}
