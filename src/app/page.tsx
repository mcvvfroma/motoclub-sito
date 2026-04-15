
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ArrowRight, MapPin, Sun, Cloud, CloudRain, Clock, CheckCircle, Edit, Trash2, Camera, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const initialUpcomingEvents = [
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

export default function Home() {
  const { toast } = useToast()
  const [events, setEvents] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [isAddingPhoto, setIsAddingPhoto] = useState<number | null>(null)
  const [photoUrlInput, setPhotoUrlInput] = useState("")
  const [formData, setFormData] = useState<any>({
    title: "",
    date: "",
    time: "",
    location: "",
    weatherLocation: "",
    mapUrl: "",
    description: "",
    photos: []
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("vvf_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        setUser(null)
      }
    }

    const storedEvents = localStorage.getItem("vvf_all_events")
    if (storedEvents) {
      const allEvents = JSON.parse(storedEvents)
      setEvents(allEvents.slice(0, 3))
    } else {
      setEvents(initialUpcomingEvents)
      localStorage.setItem("vvf_all_events", JSON.stringify(initialUpcomingEvents))
    }
  }, [])

  const isAdmin = user?.status === "admin"

  const getMockWeather = (dateStr: string) => {
    const eventDate = new Date(dateStr)
    const today = new Date()
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { icon: CheckCircle, text: 'Concluso', temp: '', color: 'text-muted-foreground' }
    if (diffDays > 14) return { icon: Clock, text: 'Meteo', temp: '', color: 'text-white/70' }

    const weathers = [
      { icon: Sun, temp: '24°', color: 'text-accent' },
      { icon: Cloud, temp: '21°', color: 'text-white' },
      { icon: CloudRain, temp: '18°', color: 'text-blue-400' }
    ]
    const seed = eventDate.getDate() % 3
    return { ...weathers[seed] }
  }

  const handleDelete = (id: number) => {
    const allEvents = JSON.parse(localStorage.getItem("vvf_all_events") || "[]")
    const updatedAll = allEvents.filter((e: any) => e.id !== id)
    localStorage.setItem("vvf_all_events", JSON.stringify(updatedAll))
    setEvents(updatedAll.slice(0, 3))
    toast({ title: "Uscita rimossa", description: "L'uscita è stata eliminata correttamente." })
  }

  const openEdit = (event: any) => {
    setEditingEvent(event)
    setFormData({ ...event })
  }

  const saveEdit = () => {
    if (!formData.title || !formData.date) {
      toast({ variant: "destructive", title: "Errore", description: "Titolo e Data sono obbligatori." })
      return
    }
    const allEvents = JSON.parse(localStorage.getItem("vvf_all_events") || "[]")
    const updatedAll = allEvents.map((e: any) => e.id === editingEvent.id ? { ...formData } : e)
    localStorage.setItem("vvf_all_events", JSON.stringify(updatedAll))
    setEvents(updatedAll.slice(0, 3))
    setEditingEvent(null)
    toast({ title: "Uscita aggiornata", description: "Le modifiche sono state salvate correttamente." })
  }

  const handleAddPhotoSubmit = () => {
    if (!photoUrlInput) return

    const allEvents = JSON.parse(localStorage.getItem("vvf_all_events") || "[]")
    const updatedAll = allEvents.map((event: any) => {
      if (event.id === isAddingPhoto) {
        return { ...event, photos: [...(event.photos || []), photoUrlInput] }
      }
      return event
    })
    localStorage.setItem("vvf_all_events", JSON.stringify(updatedAll))
    setEvents(updatedAll.slice(0, 3))
    setIsAddingPhoto(null)
    setPhotoUrlInput("")
    toast({ title: "Foto aggiunta", description: "La foto è stata salvata con successo." })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
      <Navbar />
      
      <section className="relative h-[45vh] w-full flex items-center justify-center overflow-hidden px-6 pt-16 md:pt-0">
        <Image
          src="/cascovigili.jpg"
          alt="Background"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-[1]" />
        <div className="relative z-10 text-center max-w-3xl flex flex-col items-center">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6 animate-pulse">
            <Image src="/logo_motoclub.gif" alt="Logo" fill className="object-contain" priority />
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

      <main className="max-w-7xl mx-auto px-4 py-16">
        <section>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-headline font-bold border-l-4 border-primary pl-4 uppercase tracking-tighter">Prossime Uscite</h2>
              <p className="text-muted-foreground text-sm mt-2 ml-5">Il calendario ufficiale del Comando di Roma</p>
            </div>
            <Link href="/events" className="hidden md:flex items-center gap-2 text-primary hover:text-accent transition-colors font-bold uppercase text-xs tracking-widest">
              VEDI TUTTO <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.length === 0 ? (
               <div className="col-span-full py-20 text-center text-muted-foreground italic border-2 border-dashed border-border rounded-3xl">
                  Nessuna uscita programmata al momento.
               </div>
            ) : events.map(event => {
              const weather = getMockWeather(event.date)
              const WeatherIcon = weather.icon
              const weatherKey = event.weatherLocation || "Roma"
              const imageUrl = event.photos?.length > 0 ? event.photos[event.photos.length - 1] : "/cascovigili.jpg"
              
              return (
                <Card key={event.id} className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 group flex flex-col shadow-lg">
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image 
                      src={imageUrl} 
                      alt={event.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      unoptimized={imageUrl.startsWith('http') || imageUrl.startsWith('data:')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    <a 
                      href={`https://www.ilmeteo.it/meteo/${encodeURIComponent(weatherKey)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 hover:bg-primary hover:scale-110 transition-all z-10"
                    >
                      <WeatherIcon className={cn("w-4 h-4", weather.color)} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                        {weather.temp ? `${weather.temp} | ${weatherKey}` : weather.text}
                      </span>
                    </a>
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-accent text-[11px] font-bold uppercase tracking-widest mb-2">
                       <Calendar className="w-3.5 h-3.5" />
                       {new Date(event.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <CardTitle className="text-2xl text-foreground font-headline mb-4 leading-tight group-hover:text-primary transition-colors">{event.title}</CardTitle>
                    
                    <div className="flex items-center text-muted-foreground text-sm mb-8">
                      <MapPin className="w-4 h-4 mr-2 text-primary shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>

                    <div className="space-y-4 mt-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full gap-2 border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground font-bold uppercase tracking-tighter"
                        onClick={() => setIsAddingPhoto(event.id)}
                      >
                        <Camera className="w-4 h-4" /> AGGIUNGI FOTO
                      </Button>

                      <div className="flex items-center justify-between pt-5 border-t border-border">
                        <div className="flex gap-1">
                          {isAdmin && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => openEdit(event)} className="h-9 w-9 text-accent hover:bg-accent/10">
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
                                    <AlertDialogTitle className="text-2xl font-headline">Rimuovi Uscita</AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground font-medium">
                                      Sei sicuro di voler eliminare "{event.title}" dal calendario? L'operazione è immediata.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-background border-border">Annulla</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-destructive text-white font-bold">Rimuovi</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                        <Button asChild variant="link" className="text-primary p-0 h-auto font-bold text-xs uppercase tracking-widest hover:text-accent">
                          <Link href={`/events/${event.id}`}>DETTAGLI <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </main>

      {/* Dialog Aggiungi Foto */}
      <Dialog open={isAddingPhoto !== null} onOpenChange={(open) => !open && setIsAddingPhoto(null)}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Carica un Ricordo</DialogTitle>
            <DialogDescription>Incolla l'URL di un'immagine da aggiungere alla gallery di questa uscita.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo-url" className="text-xs uppercase tracking-widest font-bold">URL Immagine (Unsplash, etc.)</Label>
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

      {/* Dialog Modifica (Admin) */}
      {editingEvent && (
        <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
          <DialogContent className="bg-card border-border sm:max-w-[550px] text-foreground">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline">Modifica Dettagli Uscita</DialogTitle>
              <DialogDescription>Aggiorna le informazioni ufficiali per l'evento.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase">Titolo Evento</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background h-11" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase">Data</Label>
                  <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-background h-11" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase">Orario Ritrovo</Label>
                  <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-background h-11" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase">Luogo di Partenza</Label>
                <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-background h-11" />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase">Località per Meteo</Label>
                <Input value={formData.weatherLocation} onChange={e => setFormData({...formData, weatherLocation: e.target.value})} className="bg-background h-11" />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase">Descrizione / Itinerario</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background min-h-[120px] resize-none" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setEditingEvent(null)}>Annulla</Button>
              <Button onClick={saveEdit} className="bg-accent text-accent-foreground font-bold px-8">Salva Modifiche</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
