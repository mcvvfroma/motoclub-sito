
"use client"

import { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ArrowRight, Map, Image as ImageIcon, User, MapPinned, FileText, Sun, Cloud, CloudRain, Clock, CheckCircle, Edit, Trash2 } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { cn } from "@/lib/utils"

const initialUpcomingEvents = [
  {
    id: 1,
    title: "Uscita di Roma",
    date: "2026-05-29",
    location: "Caserma VVF Roma ore 08:30",
    weatherLocation: "Roma",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Caserma+VVF+Roma",
    image: PlaceHolderImages.find(img => img.id === "event-1")?.imageUrl,
    description: "Partenza dalla Caserma per un'uscita istituzionale tra i monumenti della Capitale.",
    type: "Touring"
  },
  {
    id: 2,
    title: "Passo del Terminillo",
    date: "2026-06-14",
    location: "Comando VVF via Genova, ore 09:00",
    weatherLocation: "Terminillo",
    mapUrl: "https://www.google.com/maps/dir/Roma/Monte+Terminillo",
    image: PlaceHolderImages.find(img => img.id === "gallery-3")?.imageUrl,
    description: "La classica scalata alla 'Montagna di Roma'. Curve mozzafiato e aria fresca.",
    type: "Touring"
  },
  {
    id: 3,
    title: "Raduno Nazionale VVF 2026",
    date: "2026-09-12",
    location: "Piazza del Popolo, Roma",
    weatherLocation: "Roma",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Piazza+del+Popolo+Roma",
    image: PlaceHolderImages.find(img => img.id === "hero-ride")?.imageUrl,
    description: "Il grande raduno biennale di tutti i motoclub dei Vigili del Fuoco d'Italia.",
    type: "Raduno"
  }
]

export default function Home() {
  const { toast } = useToast()
  const [events, setEvents] = useState(initialUpcomingEvents)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  const heroImage = PlaceHolderImages.find(img => img.id === "hero-ride")

  const getMockWeather = (dateStr: string) => {
    const eventDate = new Date(dateStr)
    const today = new Date()
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { icon: CheckCircle, text: 'Concluso', temp: '', color: 'text-muted-foreground' }
    if (diffDays > 10) return { icon: Clock, text: 'Meteo', temp: '', color: 'text-white/70' }

    const weathers = [
      { icon: Sun, temp: '24°', color: 'text-accent' },
      { icon: Cloud, temp: '21°', color: 'text-white' },
      { icon: CloudRain, temp: '18°', color: 'text-blue-400' }
    ]
    const seed = eventDate.getDate() % 3
    return { ...weathers[seed] }
  }

  const handleDelete = (id: number) => {
    setEvents(events.filter(e => e.id !== id))
    toast({ title: "Uscita rimossa", description: "L'uscita è stata eliminata dalla Home." })
  }

  const openEdit = (event: any) => {
    setEditingEvent(event)
    setFormData({ ...event })
  }

  const saveEdit = () => {
    setEvents(events.map(e => e.id === editingEvent.id ? { ...formData } : e))
    setEditingEvent(null)
    toast({ title: "Uscita aggiornata", description: "Le modifiche sono state salvate." })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden px-6 pt-16 md:pt-0">
        {heroImage?.imageUrl && (
          <>
            <Image
              src={heroImage.imageUrl}
              alt="Background Casco"
              fill
              className="object-contain"
              priority
              data-ai-hint={heroImage.imageHint}
            />
            <div className="absolute inset-0 bg-black/40 z-[1]" />
          </>
        )}
        <div className="relative z-10 text-center max-w-2xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-6 drop-shadow-[0_0_20px_rgba(211,47,47,0.6)]">
            <Image 
              src="/logo_motoclub.gif" 
              alt="Logo Motoclub VVF Roma" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-bold mb-6 md:mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent uppercase tracking-tighter">
            Motoclub VVF Roma
          </h1>
          <div className="flex justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 md:px-10 h-12 md:h-14 text-base md:text-lg font-bold shadow-lg shadow-primary/30 border-2 border-accent/20" asChild>
              <Link href="/conventions">
                Vedi Convenzioni <FileText className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        
        {/* Upcoming Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-headline font-bold border-l-4 border-primary pl-4 text-foreground uppercase tracking-tighter">Prossime Uscite</h2>
            <Link href="/events" className="text-primary flex items-center gap-1 hover:underline font-bold uppercase text-sm tracking-tighter">
              Calendario completo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => {
              const weather = getMockWeather(event.date)
              const WeatherIcon = weather.icon
              const weatherKey = event.weatherLocation || "Roma"
              const mapUrl = event.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.weatherLocation || event.title)}`
              
              return (
                <Card key={event.id} className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all group shadow-md hover:shadow-xl flex flex-col">
                  <div className="relative h-56 w-full">
                    {event.image && (
                      <Image 
                        src={event.image} 
                        alt={event.title} 
                        fill 
                        className="object-cover transition-transform group-hover:scale-105" 
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-white border-none font-bold text-[10px] tracking-widest uppercase py-1">
                        PROSSIMA USCITA
                      </Badge>
                    </div>

                    <a 
                      href={`https://www.ilmeteo.it/meteo/${encodeURIComponent(weatherKey)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 hover:bg-black/80 hover:scale-110 transition-all cursor-pointer z-10"
                      title={`Vedi meteo per ${weatherKey}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <WeatherIcon className={cn("w-3.5 h-3.5", weather.color)} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                        {weather.temp ? `${weather.temp} | ${weatherKey}` : weather.text}
                      </span>
                    </a>

                    <div className="absolute bottom-4 left-4">
                      <p className="text-accent text-xs font-bold uppercase tracking-widest mb-1">
                        {new Date(event.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <CardTitle className="text-2xl text-white font-headline leading-tight">{event.title}</CardTitle>
                    </div>
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center text-muted-foreground text-sm mb-6">
                      <Map className="w-4 h-4 mr-2 text-primary shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                       <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEdit(event)}
                          className="h-8 w-8 text-accent hover:bg-accent/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border text-foreground">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-headline">Conferma Eliminazione</AlertDialogTitle>
                              <AlertDialogDescription>
                                Vuoi davvero rimuovere "{event.title}" dalla vetrina Home?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-background border-border">Annulla</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(event.id)} 
                                className="bg-destructive text-white"
                              >
                                Rimuovi
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <Link href={`/events/${event.id}`} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                        Dettagli <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-3 mt-auto">
                      <Button asChild variant="outline" className="border-accent/50 text-accent hover:bg-accent hover:text-white transition-colors py-6 font-bold uppercase tracking-tighter text-xs text-center w-full">
                        <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                          <MapPinned className="mr-2 w-4 h-4" /> VEDI PERCORSO COMPLETO
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Counters Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card p-8 rounded-2xl border border-border text-center hover:border-accent/50 transition-colors shadow-sm group">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold font-headline mb-1 text-foreground">12</h3>
            <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Uscite in programma</p>
          </div>
          <div className="bg-card p-8 rounded-2xl border border-border text-center hover:border-accent/50 transition-colors shadow-sm group">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold font-headline mb-1 text-foreground">256</h3>
            <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Soci Iscritti</p>
          </div>
          <div className="bg-card p-8 rounded-2xl border border-border text-center hover:border-accent/50 transition-colors shadow-sm group">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold font-headline mb-1 text-foreground">1.2k</h3>
            <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Foto Gallery</p>
          </div>
        </section>

        {/* Edit Dialog for Home */}
        {editingEvent && (
          <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
            <DialogContent className="bg-card border-border sm:max-w-[500px] text-foreground">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Modifica Veloce</DialogTitle>
                <DialogDescription>Stai modificando l'uscita direttamente dalla Home.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Titolo</Label>
                  <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label>Località Meteo</Label>
                  <Input value={formData.weatherLocation} onChange={e => setFormData({...formData, weatherLocation: e.target.value})} className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label>URL Percorso</Label>
                  <Input value={formData.mapUrl} onChange={e => setFormData({...formData, mapUrl: e.target.value})} className="bg-background" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditingEvent(null)}>Annulla</Button>
                <Button onClick={saveEdit} className="bg-accent text-accent-foreground font-bold">Salva</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

      </main>
    </div>
  )
}
