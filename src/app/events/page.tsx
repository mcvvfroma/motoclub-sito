"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, Users, Filter, ArrowRight, Plus, Edit, Trash2, Clock, Info, CheckCircle, Sun, Cloud, CloudRain, Thermometer } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { cn } from "@/lib/utils"

const initialEvents = [
  {
    id: 1,
    title: "Uscita di Roma",
    date: "2026-05-29",
    time: "08:30",
    location: "Caserma VVF Roma",
    weatherLocation: "Roma",
    description: "Partenza dalla Caserma per un'uscita istituzionale tra i monumenti della Capitale.",
    type: "Touring",
    difficulty: "Easy",
    image: PlaceHolderImages.find(img => img.id === "event-1")?.imageUrl
  },
  {
    id: 2,
    title: "Passo del Terminillo",
    date: "2026-06-14",
    time: "09:00",
    location: "Comando VVF via Genova",
    weatherLocation: "Terminillo",
    description: "La classica scalata alla 'Montagna di Roma'. Curve mozzafiato e aria fresca.",
    type: "Touring",
    difficulty: "Medium",
    image: PlaceHolderImages.find(img => img.id === "gallery-3")?.imageUrl
  },
  {
    id: 3,
    title: "Raduno Nazionale VVF 2026",
    date: "2026-09-12",
    time: "09:00",
    location: "Piazza del Popolo, Roma",
    weatherLocation: "Roma",
    description: "Il grande raduno biennale di tutti i motoclub dei Vigili del Fuoco d'Italia.",
    type: "Raduno",
    difficulty: "Medium",
    image: PlaceHolderImages.find(img => img.id === "hero-ride")?.imageUrl
  }
]

export default function EventsPage() {
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>(initialEvents)
  const [isAdding, setIsAdding] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    weatherLocation: "",
    description: "",
    type: "Touring",
    difficulty: "Medium"
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("vvf_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

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

  // Weather Mock Function
  const getMockWeather = (dateStr: string) => {
    const eventDate = new Date(dateStr)
    const today = new Date()
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { status: 'concluso', icon: CheckCircle, text: 'Evento concluso', temp: '' }
    if (diffDays > 10) return { status: 'n/d', icon: Clock, text: 'Meteo N/D', temp: '' }

    // Simula meteo realistico per i prossimi 10 giorni
    const weathers = [
      { icon: Sun, temp: '24°', color: 'text-accent' },
      { icon: Cloud, temp: '21°', color: 'text-muted-foreground' },
      { icon: CloudRain, temp: '18°', color: 'text-blue-400' }
    ]
    const seed = eventDate.getDate() % 3
    return { status: 'ok', ...weathers[seed] }
  }

  const handleSaveEvent = () => {
    if (!formData.title || !formData.date || !formData.location) {
      toast({ variant: "destructive", title: "Errore", description: "Compila i campi obbligatori (Titolo, Data, Luogo)." })
      return
    }

    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...formData, id: e.id, image: e.image } : e))
      toast({ title: "Uscita aggiornata", description: "Le modifiche sono state salvate correttamente." })
      setEditingEvent(null)
    } else {
      const newEvent = {
        ...formData,
        id: Date.now(),
        image: "https://picsum.photos/seed/" + Math.random() + "/600/400"
      }
      setEvents([newEvent, ...events])
      toast({ title: "Uscita creata", description: "La nuova uscita è stata aggiunta al calendario." })
      setIsAdding(false)
    }
    
    setFormData({ title: "", date: "", time: "", location: "", weatherLocation: "", description: "", type: "Touring", difficulty: "Medium" })
  }

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter(e => e.id !== id))
    toast({ title: "Uscita rimossa", description: "L'uscita è stata eliminata con successo." })
  }

  const openEditDialog = (event: any) => {
    setEditingEvent(event)
    setFormData({ ...event })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background text-foreground">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge className="mb-4 bg-accent/10 text-accent border-none font-bold uppercase tracking-widest">Calendario Uscite</Badge>
            <h1 className="text-4xl font-headline font-bold mb-2 text-foreground uppercase tracking-tighter">Eventi & Uscite</h1>
            <p className="text-muted-foreground max-w-2xl">Partecipa alle nostre uscite programmate e agli incontri sociali del club.</p>
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
                  <DialogTitle className="text-2xl font-headline">Nuova Uscita</DialogTitle>
                  <DialogDescription>Inserisci i dettagli della prossima uscita organizzata.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Titolo dell'Uscita</Label>
                    <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background" placeholder="es: Passo del Terminillo" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Data</Label>
                      <Input id="date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-background" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Orario</Label>
                      <Input id="time" type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-background" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Luogo di Ritrovo</Label>
                    <Input id="location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-background" placeholder="es: Comando VVF via Genova" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="weatherLocation">Località Meteo</Label>
                    <Input id="weatherLocation" value={formData.weatherLocation} onChange={e => setFormData({...formData, weatherLocation: e.target.value})} className="bg-background" placeholder="es: Terminillo" />
                    <p className="text-[10px] text-muted-foreground italic">Inserisci solo il comune o la vetta (es: Terminillo) per previsioni precise.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrizione / Percorso</Label>
                    <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background min-h-[100px]" placeholder="Dettagli sul percorso e tappe previste..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAdding(false)}>Annulla</Button>
                  <Button onClick={handleSaveEvent} className="bg-primary text-white font-bold">Crea Uscita</Button>
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
            const weatherKey = event.weatherLocation || event.title
              .replace(/Uscita di /g, '')
              .replace(/Raduno Nazionale /g, '')
              .replace(/ 2026/g, '')
              .trim()

            return (
              <Card key={event.id} className={cn(
                "bg-card border-border overflow-hidden transition-all group flex flex-col",
                isPast ? "opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0" : "hover:shadow-2xl hover:shadow-primary/5"
              )}>
                <div className="relative h-48">
                  {event.image && (
                    <Image src={event.image} alt={event.title} fill className="object-cover transition-transform group-hover:scale-105 duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {isPast ? (
                    <Badge className="absolute top-4 left-4 bg-muted/80 backdrop-blur-sm text-muted-foreground border-none font-bold">
                      <CheckCircle className="w-3 h-3 mr-1" /> CONCLUSO
                    </Badge>
                  ) : (
                    <Badge className="absolute top-4 left-4 bg-primary text-white border-none font-bold animate-pulse">
                      PROSSIMA USCITA
                    </Badge>
                  )}
                  <Badge className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground border-accent/20">
                    {event.type}
                  </Badge>

                  {/* Weather Overlay Cliccabile */}
                  <a 
                    href={`https://www.ilmeteo.it/meteo/${encodeURIComponent(weatherKey)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 hover:bg-black/80 hover:scale-110 transition-all cursor-pointer z-10"
                    title={`Vedi meteo per ${weatherKey}`}
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
                  <CardTitle className="text-2xl mb-3 leading-tight font-headline group-hover:text-primary transition-colors">{event.title}</CardTitle>
                  
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-start text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" />
                      {event.location}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 italic leading-relaxed">
                      "{event.description}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-border mt-auto">
                    <div className="flex gap-2">
                      {isAdmin ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditDialog(event)}
                            className="h-9 w-9 text-accent hover:bg-accent/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-9 w-9 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border text-foreground">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-headline">Conferma Eliminazione</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Vuoi davvero eliminare l'uscita "{event.title}"? Tutti i dati andranno persi.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-background border-border">Annulla</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteEvent(event.id)} 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Elimina
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      ) : (
                        <Badge variant="outline" className="border-muted-foreground/30 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                          {event.difficulty}
                        </Badge>
                      )}
                    </div>
                    <Button variant="link" asChild className="text-primary p-0 h-auto font-bold group-hover:translate-x-1 transition-transform">
                      <Link href={`/events/${event.id}`}>Dettagli <ArrowRight className="ml-1 w-4 h-4" /></Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          
          {events.length === 0 && (
            <div className="col-span-full py-20 text-center bg-card/50 rounded-3xl border-2 border-dashed border-border">
              <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">Nessuna uscita programmata al momento.</p>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        {editingEvent && (
          <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
            <DialogContent className="bg-card border-border sm:max-w-[500px] text-foreground">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Modifica Uscita</DialogTitle>
                <DialogDescription>Aggiorna le informazioni per "{editingEvent.title}".</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Titolo</Label>
                  <Input id="edit-title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-date">Data</Label>
                    <Input id="edit-date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-background" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-time">Orario</Label>
                    <Input id="edit-time" type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-background" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Luogo di Ritrovo</Label>
                  <Input id="edit-location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-weatherLocation">Località Meteo</Label>
                  <Input id="edit-weatherLocation" value={formData.weatherLocation} onChange={e => setFormData({...formData, weatherLocation: e.target.value})} className="bg-background" placeholder="es: Terminillo" />
                  <p className="text-[10px] text-muted-foreground italic">Inserisci solo il comune o la vetta per previsioni precise.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Descrizione</Label>
                  <Textarea id="edit-description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background min-h-[100px]" />
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
