
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
import { Calendar, MapPin, ArrowRight, Plus, Edit, Trash2, Clock, CheckCircle, Sun, Cloud, CloudRain, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

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
    weatherLocation: "Terminillo",
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
  const [newPhotoUrl, setNewPhotoUrl] = useState("")
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
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return [...events].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      const isPastA = dateA < today.getTime()
      const isPastB = dateB < today.getTime()
      if (!isPastA && isPastB) return -1
      if (isPastA && !isPastB) return 1
      return dateA - dateB
    })
  }, [events])

  const isEventPast = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(dateStr).getTime() < today.getTime()
  }

  const getMockWeather = (dateStr: string) => {
    const eventDate = new Date(dateStr)
    const today = new Date()
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { icon: CheckCircle, text: 'concluso', temp: '', color: 'text-muted-foreground' }
    if (diffDays > 10) return { icon: Clock, text: 'Meteo', temp: '', color: 'text-white/70' }

    const weathers = [
      { icon: Sun, temp: '24°', color: 'text-accent' },
      { icon: Cloud, temp: '21°', color: 'text-white' },
      { icon: CloudRain, temp: '18°', color: 'text-blue-400' }
    ]
    const seed = eventDate.getDate() % 3
    return { ...weathers[seed] }
  }

  const handleSaveEvent = () => {
    if (!formData.title || !formData.date || !formData.location) {
      toast({ variant: "destructive", title: "Errore", description: "Compila i campi obbligatori (Titolo, Data, Luogo)." })
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

  const handleAddPhoto = () => {
    if (!newPhotoUrl) return
    const updated = events.map(e => {
      if (e.id === isAddingPhoto) {
        return { ...e, photos: [...(e.photos || []), newPhotoUrl] }
      }
      return e
    })
    setEvents(updated)
    setNewPhotoUrl("")
    setIsAddingPhoto(null)
    toast({ title: "Foto aggiunta", description: "La foto è stata salvata nell'archivio dell'uscita." })
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
                <Button className="bg-destructive hover:bg-destructive/90 gap-2 h-12 px-6 rounded-full shadow-lg shadow-destructive/20 font-bold uppercase tracking-tighter">
                   <Plus className="w-5 h-5" /> + AGGIUNGI USCITA
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline text-foreground">Nuova Uscita</DialogTitle>
                  <DialogDescription className="text-muted-foreground">Compila tutti i dettagli per pubblicare l'uscita.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2 text-foreground">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Titolo dell'Uscita</Label>
                    <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Data</Label>
                      <Input id="date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-background" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Orario Ritrovo</Label>
                      <Input id="time" type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-background" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Luogo di Ritrovo</Label>
                    <Input id="location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-background" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="weatherLocation">Località Meteo</Label>
                    <Input id="weatherLocation" value={formData.weatherLocation} onChange={e => setFormData({...formData, weatherLocation: e.target.value})} className="bg-background" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="mapUrl">URL Google Maps (Percorso)</Label>
                    <Input id="mapUrl" value={formData.mapUrl} onChange={e => setFormData({...formData, mapUrl: e.target.value})} className="bg-background" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrizione / Tappe</Label>
                    <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background min-h-[100px]" />
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
            const isPast = isEventPast(event.date)
            const weather = getMockWeather(event.date)
            const WeatherIcon = weather.icon
            const weatherKey = event.weatherLocation || "Roma"
            const imageUrl = event.photos?.length > 0 ? event.photos[event.photos.length - 1] : "/cascovigili.jpg"

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
                    priority
                    unoptimized={imageUrl.startsWith('http')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <Badge className={cn("absolute top-4 left-4 border-none font-bold", isPast ? "bg-muted text-muted-foreground" : "bg-primary text-white")}>
                    {isPast ? "CONCLUSO" : "PROSSIMA USCITA"}
                  </Badge>

                  <a 
                    href={`https://www.ilmeteo.it/meteo/${encodeURIComponent(weatherKey)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 hover:bg-black/80 hover:scale-110 transition-all cursor-pointer z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <WeatherIcon className={cn("w-4 h-4", (weather as any).color || "text-accent")} />
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">
                      {weather.temp ? `${weather.temp} | ${weatherKey}` : weather.text}
                    </span>
                  </a>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-accent text-sm mb-3 font-bold uppercase tracking-wider">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })} {event.time && `• ${event.time}`}
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
                            <Button variant="ghost" size="icon" onClick={() => setEditingEvent(event)} className="h-9 w-9 text-accent hover:bg-accent/10">
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
                                  <AlertDialogTitle className="text-xl font-headline">Conferma Eliminazione</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Vuoi davvero eliminare l'uscita "{event.title}"?
                                  </AlertDialogDescription>
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
                      <div className="flex gap-4">
                        <Button variant="link" asChild className="text-accent p-0 h-auto font-bold text-xs uppercase tracking-tighter">
                          <Link href={event.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(weatherKey)}`} target="_blank">Percorso</Link>
                        </Button>
                        <Button variant="link" asChild className="text-primary p-0 h-auto font-bold text-xs uppercase tracking-tighter">
                          <Link href={`/events/${event.id}`}>Dettagli <ArrowRight className="ml-1 w-3 h-3" /></Link>
                        </Button>
                      </div>
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
              <DialogDescription>Incolla l'URL di una foto scattata durante l'uscita.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Link Immagine</Label>
              <Input 
                value={newPhotoUrl} 
                onChange={e => setNewPhotoUrl(e.target.value)} 
                placeholder="https://..." 
                className="bg-background"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddingPhoto(null)}>Annulla</Button>
              <Button onClick={handleAddPhoto} className="bg-primary text-white font-bold">CARICA</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {editingEvent && (
          <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
            <DialogContent className="bg-card border-border sm:max-w-[500px] text-foreground">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Modifica Uscita</DialogTitle>
                <DialogDescription className="text-muted-foreground">Aggiorna le informazioni per "{editingEvent.title}".</DialogDescription>
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
                  <Label>Link Percorso Maps</Label>
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
