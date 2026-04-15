
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ArrowRight, MapPin, Sun, Cloud, CloudRain, Clock, CheckCircle, Edit, Trash2, Camera, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

// DATI FISSI RICHIESTI DALL'UTENTE
const FORCED_EVENTS = [
  { id: 1, title: 'Uscita di Roma', date: '29 MAGGIO 2026', location: 'Roma', image: '/cascovigili.jpg', weatherLocation: 'Roma' },
  { id: 2, title: 'Passo del Terminillo', date: '14 GIUGNO 2026', location: 'Terminillo', image: '/cascovigili.jpg', weatherLocation: 'Terminillo' },
  { id: 3, title: 'Raduno Nazionale VVF', date: '12 SETTEMBRE 2026', location: 'Roma', image: '/cascovigili.jpg', weatherLocation: 'Roma' }
]

export default function Home() {
  const { toast } = useToast()
  const [events, setEvents] = useState<any[]>(FORCED_EVENTS)
  const [user, setUser] = useState<any>(null)
  const [isAddingPhoto, setIsAddingPhoto] = useState<number | null>(null)
  const [photoUrlInput, setPhotoUrlInput] = useState("")

  useEffect(() => {
    // Gestione utente
    const storedUser = localStorage.getItem("vvf_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        setUser(null)
      }
    }

    // Gestione eventi: Carichiamo dal localStorage se esistono, altrimenti usiamo i FORCED_EVENTS
    const storedEvents = localStorage.getItem("vvf_all_events")
    if (storedEvents) {
      try {
        const parsed = JSON.parse(storedEvents)
        if (parsed.length > 0) {
          setEvents(parsed.slice(0, 3))
        }
      } catch (e) {
        localStorage.setItem("vvf_all_events", JSON.stringify(FORCED_EVENTS))
      }
    } else {
      localStorage.setItem("vvf_all_events", JSON.stringify(FORCED_EVENTS))
    }
  }, [])

  const isAdmin = user?.status === "admin"

  const getMockWeatherIcon = () => {
    return Sun // Default soleggiato per l'anteprima
  }

  const handleDelete = (id: number) => {
    const updated = events.filter(e => e.id !== id)
    setEvents(updated)
    const all = JSON.parse(localStorage.getItem("vvf_all_events") || "[]")
    localStorage.setItem("vvf_all_events", JSON.stringify(all.filter((e: any) => e.id !== id)))
    toast({ title: "Uscita rimossa", description: "L'operazione è stata completata." })
  }

  const handleAddPhotoSubmit = () => {
    if (!photoUrlInput) return
    const updated = events.map(e => e.id === isAddingPhoto ? { ...e, image: photoUrlInput } : e)
    setEvents(updated)
    const all = JSON.parse(localStorage.getItem("vvf_all_events") || "[]")
    const updatedAll = all.map((e: any) => e.id === isAddingPhoto ? { ...e, image: photoUrlInput } : e)
    localStorage.setItem("vvf_all_events", JSON.stringify(updatedAll))
    setIsAddingPhoto(null)
    setPhotoUrlInput("")
    toast({ title: "Foto aggiunta", description: "La copertina è stata aggiornata." })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="relative h-[45vh] w-full flex items-center justify-center overflow-hidden px-6 pt-16 md:pt-0">
        <Image
          src="/cascovigili.jpg"
          alt="Hero Background"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-[1]" />
        <div className="relative z-10 text-center max-w-3xl flex flex-col items-center">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6">
            <Image src="/logo_motoclub.gif" alt="Logo Motoclub" fill className="object-contain" priority />
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent uppercase tracking-tighter">
            Motoclub VVF Roma
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium uppercase tracking-[0.2em] mb-8">Passione • Servizio • Strada</p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 h-14 font-bold text-lg shadow-xl shadow-primary/20" asChild>
            <Link href="/events">Esplora Uscite <ArrowRight className="ml-2 w-6 h-6" /></Link>
          </Button>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <section>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-headline font-bold border-l-4 border-primary pl-4 uppercase tracking-tighter">Prossime Uscite</h2>
              <p className="text-muted-foreground text-sm mt-2 ml-5">Calendario ufficiale del Comando di Roma</p>
            </div>
            <Link href="/events" className="hidden md:flex items-center gap-2 text-primary hover:text-accent transition-colors font-bold uppercase text-xs tracking-widest">
              VEDI TUTTO <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => {
              const WeatherIcon = getMockWeatherIcon()
              const weatherKey = event.weatherLocation || event.location || "Roma"
              const imageUrl = event.image || "/cascovigili.jpg"
              
              return (
                <Card key={event.id} className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 group flex flex-col shadow-lg">
                  {/* CARD IMAGE */}
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image 
                      src={imageUrl} 
                      alt={event.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      unoptimized={imageUrl.startsWith('http') || imageUrl.startsWith('data:')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    {/* WEATHER BADGE */}
                    <a 
                      href={`https://www.ilmeteo.it/meteo/${encodeURIComponent(weatherKey)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 hover:bg-primary hover:scale-110 transition-all z-10"
                    >
                      <WeatherIcon className="w-4 h-4 text-accent" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                         METEO | {weatherKey}
                      </span>
                    </a>
                  </div>

                  {/* CARD CONTENT */}
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-accent text-[11px] font-bold uppercase tracking-widest mb-2">
                       <Calendar className="w-3.5 h-3.5" />
                       {event.date}
                    </div>
                    <CardTitle className="text-2xl text-foreground font-headline mb-4 leading-tight group-hover:text-primary transition-colors">{event.title}</CardTitle>
                    
                    <div className="flex items-center text-muted-foreground text-sm mb-8">
                      <MapPin className="w-4 h-4 mr-2 text-primary shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>

                    <div className="space-y-4 mt-auto">
                      <div className="grid grid-cols-2 gap-2">
                        <Button asChild variant="outline" size="sm" className="border-accent/50 text-accent font-bold uppercase tracking-tighter">
                          <Link href={`/events/${event.id}`}>DETTAGLI</Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 border-primary/50 text-primary font-bold uppercase tracking-tighter"
                          onClick={() => setIsAddingPhoto(event.id)}
                        >
                          <Camera className="w-4 h-4" /> FOTO
                        </Button>
                      </div>

                      {/* ADMIN CONTROLS */}
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                          <Button variant="ghost" size="icon" asChild className="h-9 w-9 text-accent hover:bg-accent/10">
                            <Link href="/events"><Edit className="w-4 h-4" /></Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border text-foreground">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-headline">Rimuovi Uscita</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  Vuoi davvero eliminare "{event.title}"? Questa operazione è definitiva.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-background border-border">Annulla</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-destructive text-white font-bold">Rimuovi</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </main>

      {/* DIALOG AGGIUNGI FOTO */}
      <Dialog open={isAddingPhoto !== null} onOpenChange={(open) => !open && setIsAddingPhoto(null)}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Carica un Ricordo</DialogTitle>
            <DialogDescription>Incolla l'URL di un'immagine da aggiungere alla gallery di questa uscita.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo-url" className="text-xs uppercase tracking-widest font-bold">URL Immagine</Label>
              <Input 
                id="photo-url"
                placeholder="https://images.unsplash.com/..."
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                className="bg-background h-12"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddingPhoto(null)}>Annulla</Button>
            <Button onClick={handleAddPhotoSubmit} className="bg-primary text-white font-bold px-6">Salva Foto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
