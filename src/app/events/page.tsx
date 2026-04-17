
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
import { Calendar, MapPin, Plus, Edit, Trash2, Camera, Sun, Cloud, CloudRain, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

function DynamicWeatherBadge({ location, date }: { location: string; date: string }) {
  const [weatherData, setWeatherData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWeather() {
      if (!location || !date) {
        setLoading(false)
        return
      }
      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=it&format=json`)
        const geoData = await geoRes.json()
        if (!geoData.results?.[0]) throw new Error("Città non trovata")
        const { latitude, longitude } = geoData.results[0]
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,precipitation_probability_max&timezone=auto`)
        const weather = await weatherRes.json()
        const dateStr = new Date(date).toISOString().split('T')[0]
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

  const ilMeteoUrl = `https://www.ilmeteo.it/meteo/${encodeURIComponent(location)}`

  if (loading) return <Badge variant="outline" className="bg-black/40 text-[10px] animate-pulse">Analisi Meteo...</Badge>
  if (!weatherData) return (
    <Link href={ilMeteoUrl} target="_blank">
      <Badge variant="outline" className="bg-black/40 text-white/50 text-[10px] uppercase tracking-tighter">Vedi ilMeteo.it</Badge>
    </Link>
  )

  const isRainy = weatherData.prob > 50
  const Icon = weatherData.code <= 3 ? Sun : (weatherData.code <= 67 ? Cloud : CloudRain)

  return (
    <Link href={ilMeteoUrl} target="_blank">
      <div className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md hover:bg-black/80 transition-all",
        isRainy ? "bg-red-600 border-red-400 text-white" : "bg-black/60 border-white/10 text-white"
      )}>
        <Icon className={cn("w-3.5 h-3.5", !isRainy && "text-accent")} />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {isRainy ? "Rischio Pioggia" : `${weatherData.temp}°C`} | {location}
        </span>
      </div>
    </Link>
  )
}

const initialEvents = [
  { id: 1, title: "Uscita di Roma", date: "2026-05-29", time: "08:30", location: "Roma", weatherLocation: "Roma", mapUrl: "", photos: [], description: "Giro istituzionale nella Capitale.", type: "Touring" },
  { id: 2, title: "Passo del Terminillo", date: "2026-06-14", time: "09:00", location: "Terminillo", weatherLocation: "Rieti", mapUrl: "", photos: [], description: "Scalata alla Montagna di Roma.", type: "Touring" },
  { id: 3, title: "Raduno Nazionale VVF 2026", date: "2026-09-12", time: "09:00", location: "Roma", weatherLocation: "Roma", mapUrl: "", photos: [], description: "Grande raduno biennale.", type: "Raduno" }
]

export default function EventsPage() {
  const { toast } = useToast()
  const [events, setEvents] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [isAddingPhoto, setIsAddingPhoto] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
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
      localStorage.setItem("vvf_all_events", JSON.stringify(initialEvents))
    }
  }, [])

  const isAdmin = user?.status === "admin"

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events])

  const handleSaveEvent = () => {
    if (!formData.title.trim() || !formData.date) {
      toast({ variant: "destructive", title: "Campi Mancanti", description: "Titolo e Data sono obbligatori." })
      return
    }

    let updatedEvents;
    if (editingEvent) {
      updatedEvents = events.map(e => e.id === editingEvent.id ? { ...formData, id: e.id } : e)
      toast({ title: "Modifica Salvata", description: "L'uscita è stata aggiornata correttamente." })
    } else {
      const newEvent = { ...formData, id: Date.now(), photos: [] }
      updatedEvents = [newEvent, ...events]
      toast({ title: "Uscita Creata", description: "La nuova uscita è stata aggiunta al calendario." })
    }
    
    setEvents(updatedEvents)
    localStorage.setItem("vvf_all_events", JSON.stringify(updatedEvents))
    setIsAdding(false)
    setEditingEvent(null)
    setFormData({ title: "", date: "", time: "", location: "", weatherLocation: "", mapUrl: "", description: "", photos: [], type: "Touring" })
  }

  const handleDeleteEvent = (id: number) => {
    const updated = events.filter(e => e.id !== id)
    setEvents(updated)
    localStorage.setItem("vvf_all_events", JSON.stringify(updated))
    toast({ title: "Uscita rimossa", description: "L'evento è stato eliminato dal registro." })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedFile(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddPhotoSubmit = () => {
    if (!selectedFile || isAddingPhoto === null) return
    setIsUploading(true)
    
    const targetEvent = events.find(e => e.id === isAddingPhoto)
    
    const updated = events.map(e => {
      if (e.id === isAddingPhoto) {
        const newPhotos = [...(e.photos || []), selectedFile]
        return { ...e, photos: newPhotos, image: selectedFile }
      }
      return e
    })
    
    setEvents(updated)
    localStorage.setItem("vvf_all_events", JSON.stringify(updated))
    
    // Sincronizza con la galleria
    const galleryPhotos = JSON.parse(localStorage.getItem("vvf_gallery_photos") || "[]")
    const newGalleryPhoto = {
      id: Date.now().toString(),
      url: selectedFile,
      event: targetEvent?.title || "Evento",
      author: user?.nome || "Socio",
      date: new Date().toISOString().split('T')[0]
    }
    localStorage.setItem("vvf_gallery_photos", JSON.stringify([newGalleryPhoto, ...galleryPhotos]))

    setIsAddingPhoto(null)
    setSelectedFile(null)
    setIsUploading(false)
    toast({ title: "Foto caricata", description: "L'immagine è stata aggiunta all'evento e alla galleria." })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary border-none font-bold uppercase tracking-widest">Motoclub VVF Roma</Badge>
            <h1 className="text-4xl font-headline font-bold mb-2 text-foreground uppercase tracking-tighter">Calendario Eventi</h1>
            <p className="text-muted-foreground max-w-2xl">Gestione e consultazione delle uscite ufficiali.</p>
          </div>
          {isAdmin && (
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 gap-2 h-12 px-6 rounded-full shadow-lg shadow-primary/20 font-bold">
                   <Plus className="w-5 h-5" /> NUOVA USCITA
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline text-foreground">Aggiungi Uscita</DialogTitle>
                  <DialogDescription>Titolo e Data sono obbligatori.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2 text-foreground">
                  <div className="grid gap-2">
                    <Label>Titolo Uscita *</Label>
                    <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background" placeholder="es: Giro dei Castelli" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Data *</Label>
                      <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-background" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Orario Ritrovo</Label>
                      <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-background" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Luogo di Ritrovo</Label>
                    <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-background" placeholder="es: Caserma VVF" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Località Meteo</Label>
                    <Input value={formData.weatherLocation} onChange={e => setFormData({...formData, weatherLocation: e.target.value})} className="bg-background" placeholder="es: Roma" />
                  </div>
                  <div className="grid gap-2">
                    <Label>URL Mappa</Label>
                    <Input value={formData.mapUrl} onChange={e => setFormData({...formData, mapUrl: e.target.value})} className="bg-background" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Descrizione</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background min-h-[80px]" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAdding(false)}>Annulla</Button>
                  <Button onClick={handleSaveEvent} className="bg-primary text-white font-bold px-8">Salva Uscita</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedEvents.map((event) => {
            const imageUrl = event.image || "/cascovigili.jpg"
            const eventDate = new Date(event.date)
            return (
              <Card key={event.id} className="bg-card border-border overflow-hidden group flex flex-col hover:border-primary/50 transition-all">
                <div className="relative h-48">
                  <Image src={imageUrl} alt={event.title} fill className="object-cover transition-transform group-hover:scale-105 duration-500" unoptimized={imageUrl.startsWith('data:') || imageUrl.startsWith('http')} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                  <div className="absolute bottom-4 right-4 z-10">
                    <DynamicWeatherBadge location={event.weatherLocation || event.location} date={event.date} />
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-accent text-sm mb-2 font-bold uppercase tracking-wider">
                    <Calendar className="w-4 h-4" />
                    {eventDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <CardTitle className="text-2xl mb-3 font-headline text-foreground">{event.title}</CardTitle>
                  <div className="flex items-center text-muted-foreground text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-2 text-primary shrink-0" />
                    <span className="line-clamp-1">{event.location || "Punto di ritrovo da definire"}</span>
                  </div>
                  <div className="mt-auto space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild variant="outline" size="sm" className="font-bold border-border">
                        <Link href={`/events/${event.id}`}>DETTAGLI</Link>
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 border-accent text-accent font-bold" onClick={() => setIsAddingPhoto(event.id)}>
                        <Camera className="w-4 h-4" /> FOTO
                      </Button>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
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
                              <AlertDialogTitle className="font-headline">Elimina Uscita</AlertDialogTitle>
                              <AlertDialogDescription>Vuoi rimuovere definitivamente questa uscita?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-background border-border">Annulla</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-destructive text-white">Elimina</AlertDialogAction>
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
      </main>

      <Dialog open={isAddingPhoto !== null} onOpenChange={(open) => !open && setIsAddingPhoto(null)}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Aggiungi Foto</DialogTitle>
            <DialogDescription>Seleziona una foto dalla tua galleria per condividerla con il club.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label htmlFor="photo-file">Scegli file (JPG, PNG)</Label>
            <Input id="photo-file" type="file" accept="image/*" onChange={handleFileChange} className="bg-background cursor-pointer" />
            {selectedFile && (
              <div className="relative h-40 w-full rounded-lg overflow-hidden border border-border">
                <Image src={selectedFile} alt="Preview" fill className="object-cover" unoptimized />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setIsAddingPhoto(null); setSelectedFile(null); }}>Annulla</Button>
            <Button onClick={handleAddPhotoSubmit} disabled={!selectedFile || isUploading} className="bg-primary text-white">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "CARICA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingEvent && (
        <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
          <DialogContent className="bg-card border-border sm:max-w-[500px] text-foreground">
            <DialogHeader><DialogTitle className="text-2xl font-headline">Modifica Uscita</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
              <div className="grid gap-2"><Label>Titolo *</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Data *</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-background" /></div>
                <div className="grid gap-2"><Label>Orario</Label><Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-background" /></div>
              </div>
              <div className="grid gap-2"><Label>Luogo</Label><Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-background" /></div>
              <div className="grid gap-2"><Label>Meteo Loc.</Label><Input value={formData.weatherLocation} onChange={e => setFormData({...formData, weatherLocation: e.target.value})} className="bg-background" /></div>
              <div className="grid gap-2"><Label>Descrizione</Label><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background" /></div>
            </div>
            <DialogFooter><Button variant="ghost" onClick={() => setEditingEvent(null)}>Annulla</Button><Button onClick={handleSaveEvent} className="bg-accent text-accent-foreground font-bold">Salva Modifiche</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
