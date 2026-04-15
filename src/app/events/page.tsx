
"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, ArrowRight, Plus, Edit, Trash2, Clock, CheckCircle, Sun, Cloud, CloudRain, Camera, Thermometer, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

// Componente Badge Meteo Dinamico
function DynamicWeatherBadge({ location, date }: { location: string; date: string }) {
  const [weatherData, setWeatherData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWeather() {
      if (!location || !date) return
      
      const eventDate = new Date(date)
      const today = new Date()
      const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Open-Meteo fornisce previsioni fino a 16 giorni
      if (diffDays < 0 || diffDays > 14) {
        setLoading(false)
        return
      }

      try {
        // 1. Geocoding per ottenere lat/lon
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=it&format=json`)
        const geoData = await geoRes.json()
        
        if (!geoData.results?.[0]) throw new Error("Città non trovata")
        
        const { latitude, longitude } = geoData.results[0]

        // 2. Fetch Meteo
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,precipitation_probability_max&timezone=auto`)
        const weather = await weatherRes.json()

        // Trova l'indice della data corretta
        const dateStr = eventDate.toISOString().split('T')[0]
        const dateIndex = weather.daily.time.indexOf(dateStr)

        if (dateIndex !== -1) {
          setWeatherData({
            temp: Math.round(weather.daily.temperature_2m_max[dateIndex]),
            prob: weather.daily.precipitation_probability_max[dateIndex],
            code: weather.daily.weathercode[dateIndex]
          })
        }
      } catch (e) {
        console.error("Errore meteo:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [location, date])

  if (loading) return <Badge variant="outline" className="bg-black/40 text-[10px] animate-pulse">Analisi Meteo...</Badge>
  
  if (!weatherData) return (
    <Badge variant="outline" className="bg-black/40 text-white/50 text-[10px] uppercase tracking-tighter">
      Meteo non disponibile
    </Badge>
  )

  const isRainy = weatherData.prob > 50
  const Icon = weatherData.code <= 3 ? Sun : (weatherData.code <= 67 ? Cloud : CloudRain)

  return (
    <a 
      href={`https://www.ilmeteo.it/meteo/${encodeURIComponent(location)}`}
      target="_blank"
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all hover:scale-105",
        isRainy ? "bg-red-600 border-red-400 text-white" : "bg-black/60 border-white/10 text-white"
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", !isRainy && "text-accent")} />
      <span className="text-[10px] font-bold uppercase tracking-widest">
        {isRainy ? "Rischio Pioggia" : `${weatherData.temp}°C`} | {location}
      </span>
    </a>
  )
}

const initialEvents = [
  {
    id: 1,
    title: "Uscita di Roma",
    date: "2026-05-29",
    time: "08:30",
    location: "Caserma VVF Roma",
    weatherLocation: "Roma",
    mapUrl: "",
    photos: [],
    description: "Partenza dalla Caserma per un'uscita istituzionale tra i monumenti della Capitale.",
    type: "Touring"
  },
  {
    id: 2,
    title: "Passo del Terminillo",
    date: "2026-06-14",
    time: "09:00",
    location: "Comando VVF via Genova",
    weatherLocation: "Rieti",
    mapUrl: "",
    photos: [],
    description: "La classica scalata alla 'Montagna di Roma'. Curve mozzafiato e aria fresca.",
    type: "Touring"
  },
  {
    id: 3,
    title: "Raduno Nazionale VVF 2026",
    date: "2026-09-12",
    time: "09:00",
    location: "Piazza del Popolo, Roma",
    weatherLocation: "Roma",
    mapUrl: "",
    photos: [],
    description: "Il grande raduno biennale di tutti i motoclub dei Vigili del Fuoco d'Italia.",
    type: "Raduno"
  }
]

export default function EventsPage() {
  const { toast } = useToast()
  const [events, setEvents] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [isAddingPhoto, setIsAddingPhoto] = useState<number | null>(null)
  const [photoUrlInput, setPhotoUrlInput] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    weatherLocation: "",
    mapUrl: "",
    description: "",
    photos: [],
    type: "Touring"
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("vvf_user")
    if (storedUser) setUser(JSON.parse(storedUser))

    const storedEvents = localStorage.getItem("vvf_all_events")
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents))
    } else {
      setEvents(initialEvents)
    }
  }, [])

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("vvf_all_events", JSON.stringify(events))
    }
  }, [events])

  const isAdmin = user?.status === "admin"

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events])

  const handleSaveEvent = () => {
    if (!formData.title || !formData.date || !formData.location || !formData.weatherLocation) {
      toast({ variant: "destructive", title: "Errore", description: "Compila tutti i campi, inclusa la Località Meteo." })
      return
    }

    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...formData, id: e.id } : e))
      toast({ title: "Uscita aggiornata", description: "Le modifiche sono state salvate correttamente." })
      setEditingEvent(null)
    } else {
      const newEvent = { ...formData, id: Date.now(), photos: [] }
      setEvents([newEvent, ...events])
      toast({ title: "Uscita creata", description: "La nuova uscita è stata aggiunta al calendario." })
      setIsAdding(false)
    }
    
    setFormData({ title: "", date: "", time: "", location: "", weatherLocation: "", mapUrl: "", description: "", photos: [], type: "Touring" })
  }

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter(e => e.id !== id))
    toast({ title: "Uscita rimossa", description: "L'uscita è stata eliminata." })
  }

  const handleAddPhotoSubmit = () => {
    if (!photoUrlInput) return
    setEvents(events.map(event => {
      if (event.id === isAddingPhoto) {
        return { ...event, photos: [...(event.photos || []), photoUrlInput] }
      }
      return event
    }))
    setIsAddingPhoto(null)
    setPhotoUrlInput("")
    toast({ title: "Foto aggiunta", description: "La foto è stata salvata correttamente." })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge className="mb-4 bg-accent/10 text-accent border-none font-bold uppercase tracking-widest">Calendario Uscite</Badge>
            <h1 className="text-4xl font-headline font-bold mb-2 text-foreground uppercase tracking-tighter">Eventi & Uscite</h1>
            <p className="text-muted-foreground max-w-2xl">Partecipa alle nostre uscite programmate del Motoclub VVF Roma.</p>
          </div>
          
          {isAdmin && (
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 gap-2 h-12 px-6 rounded-full shadow-lg shadow-primary/20 font-bold">
                   <Plus className="w-5 h-5" /> AGGIUNGI USCITA
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline text-foreground">Nuova Uscita</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2 text-foreground">
                  <div className="grid gap-2">
                    <Label>Titolo dell'Uscita</Label>
                    <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Data</Label>
                      <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-background" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Orario Ritrovo</Label>
                      <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-background" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Luogo di Ritrovo</Label>
                    <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-background" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Località Meteo (Città per previsioni)</Label>
                    <Input value={formData.weatherLocation} onChange={e => setFormData({...formData, weatherLocation: e.target.value})} className="bg-background" placeholder="es: Roma" />
                  </div>
                  <div className="grid gap-2">
                    <Label>URL Percorso Google Maps</Label>
                    <Input value={formData.mapUrl} onChange={e => setFormData({...formData, mapUrl: e.target.value})} className="bg-background" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Descrizione</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background min-h-[100px]" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAdding(false)}>Annulla</Button>
                  <Button onClick={handleSaveEvent} className="bg-primary text-white font-bold">Salva Uscita</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedEvents.map((event) => {
            const imageUrl = event.photos?.length > 0 ? event.photos[event.photos.length - 1] : "/cascovigili.jpg"
            const eventDate = new Date(event.date)
            const isPast = eventDate.getTime() < new Date().setHours(0,0,0,0)

            return (
              <Card key={event.id} className={cn(
                "bg-card border-border overflow-hidden transition-all group flex flex-col",
                isPast ? "opacity-60 grayscale-[0.5]" : "hover:shadow-2xl hover:shadow-primary/5"
              )}>
                <div className="relative h-48">
                  <Image 
                    src={imageUrl} 
                    alt={event.title} 
                    fill 
                    className="object-cover transition-transform group-hover:scale-105 duration-500"
                    unoptimized={imageUrl.startsWith('data:') || imageUrl.startsWith('http')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <Badge className={cn("absolute top-4 left-4 border-none font-bold", isPast ? "bg-muted text-muted-foreground" : "bg-primary text-white")}>
                    {isPast ? "CONCLUSO" : "PROSSIMA USCITA"}
                  </Badge>

                  <div className="absolute bottom-4 right-4 z-10">
                    <DynamicWeatherBadge location={event.weatherLocation} date={event.date} />
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-accent text-sm mb-3 font-bold uppercase tracking-wider">
                    <Calendar className="w-4 h-4" />
                    {eventDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })} {event.time && `• ${event.time}`}
                  </div>
                  <CardTitle className="text-2xl mb-3 leading-tight font-headline text-foreground">{event.title}</CardTitle>
                  <div className="flex items-center text-muted-foreground text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-2 text-primary shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  
                  <div className="space-y-4 mt-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 border-accent text-accent font-bold uppercase tracking-tighter"
                      onClick={() => setIsAddingPhoto(event.id)}
                    >
                      <Camera className="w-4 h-4" /> AGGIUNGI FOTO
                    </Button>

                    <div className="flex items-center justify-between pt-5 border-t border-border">
                      <div className="flex gap-2">
                        {isAdmin && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingEvent(event); setFormData({...event}) }} className="h-9 w-9 text-accent hover:bg-accent/10">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border text-foreground">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl font-headline">Elimina Uscita</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-background border-border">Annulla</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-destructive text-white font-bold">Elimina</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                      <Button variant="link" asChild className="text-primary p-0 h-auto font-bold text-xs uppercase tracking-tighter">
                        <Link href={`/events/${event.id}`}>Vedi Dettagli <ArrowRight className="ml-1 w-3 h-3" /></Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Dialog Aggiungi Foto */}
        <Dialog open={isAddingPhoto !== null} onOpenChange={(open) => !open && setIsAddingPhoto(null)}>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Condividi una Foto</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label className="block mb-2">URL Immagine</Label>
              <Input 
                placeholder="https://..."
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                className="bg-background"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddingPhoto(null)}>Annulla</Button>
              <Button onClick={handleAddPhotoSubmit} className="bg-primary text-white font-bold">Aggiungi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {editingEvent && (
          <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
            <DialogContent className="bg-card border-border sm:max-w-[500px] text-foreground">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Modifica Uscita</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid gap-2">
                  <Label>Titolo</Label>
                  <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data</Label>
                    <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-background" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Orario</Label>
                    <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-background" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Luogo Ritrovo</Label>
                  <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label>Località Meteo</Label>
                  <Input value={formData.weatherLocation} onChange={e => setFormData({...formData, weatherLocation: e.target.value})} className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label>URL Percorso</Label>
                  <Input value={formData.mapUrl} onChange={e => setFormData({...formData, mapUrl: e.target.value})} className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label>Descrizione</Label>
                  <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background min-h-[100px]" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditingEvent(null)}>Annulla</Button>
                <Button onClick={handleSaveEvent} className="bg-accent text-accent-foreground font-bold">Salva Modifiche</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}
