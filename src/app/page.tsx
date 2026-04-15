
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
import { PlaceHolderImages } from "@/lib/placeholder-images"
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
  const [newPhotoUrl, setNewPhotoUrl] = useState("")
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
    if (storedUser) setUser(JSON.parse(storedUser))

    const storedEvents = localStorage.getItem("vvf_home_events")
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents))
    } else {
      setEvents(initialUpcomingEvents)
    }
  }, [])

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("vvf_home_events", JSON.stringify(events))
    }
  }, [events])

  const isAdmin = user?.status === "admin"

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
    if (!formData.title || !formData.date) {
      toast({ variant: "destructive", title: "Errore", description: "Titolo e Data sono obbligatori." })
      return
    }
    setEvents(events.map(e => e.id === editingEvent.id ? { ...formData } : e))
    setEditingEvent(null)
    toast({ title: "Uscita aggiornata", description: "Le modifiche sono state salvate correttamente." })
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

  const heroImage = PlaceHolderImages.find(img => img.id === "hero-ride")

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16">
      <Navbar />
      
      <section className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden px-6 pt-16 md:pt-0">
        {heroImage?.imageUrl && (
          <>
            <Image
              src={heroImage.imageUrl}
              alt="Logo Background"
              fill
              className="object-contain"
              priority
            />
            <div className="absolute inset-0 bg-black/40 z-[1]" />
          </>
        )}
        <div className="relative z-10 text-center max-w-2xl flex flex-col items-center">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6">
            <Image src="/logo_motoclub.gif" alt="Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-bold mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent uppercase tracking-tighter">
            Motoclub VVF Roma
          </h1>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 h-14 font-bold" asChild>
            <Link href="/events">Esplora Uscite <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-headline font-bold border-l-4 border-primary pl-4 uppercase tracking-tighter">Prossime Uscite</h2>
            <Link href="/events" className="text-primary flex items-center gap-1 hover:underline font-bold uppercase text-sm">
              Calendario <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => {
              const weather = getMockWeather(event.date)
              const WeatherIcon = weather.icon
              const weatherKey = event.weatherLocation || "Roma"
              const imageUrl = event.photos?.length > 0 ? event.photos[event.photos.length - 1] : "/cascovigili.jpg"
              
              return (
                <Card key={event.id} className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all group flex flex-col">
                  <div className="relative h-56 w-full">
                    <Image 
                      src={imageUrl} 
                      alt={event.title} 
                      fill 
                      className="object-cover transition-transform group-hover:scale-105" 
                      priority
                      unoptimized={imageUrl.startsWith('http')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <Badge className="absolute top-4 left-4 bg-primary text-white border-none font-bold uppercase py-1 text-[10px]">
                      PROSSIMA USCITA
                    </Badge>

                    <a 
                      href={`https://www.ilmeteo.it/meteo/${encodeURIComponent(weatherKey)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 hover:bg-black/80 hover:scale-110 transition-all z-10"
                    >
                      <WeatherIcon className={cn("w-4 h-4", weather.color)} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                        {weather.temp ? `${weather.temp} | ${weatherKey}` : weather.text}
                      </span>
                    </a>
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">
                      {new Date(event.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <CardTitle className="text-2xl text-foreground font-headline mb-4">{event.title}</CardTitle>
                    
                    <div className="flex items-center text-muted-foreground text-sm mb-6">
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

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex gap-2">
                          {isAdmin && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => openEdit(event)} className="h-8 w-8 text-accent hover:bg-accent/10">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border text-foreground">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-headline">Rimuovi Uscita</AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">Vuoi davvero togliere questa uscita dalla vetrina Home?</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-background border-border">No</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-destructive text-white font-bold">Sì, Rimuovi</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                        <Button asChild variant="outline" className="h-9 text-xs border-primary text-primary font-bold uppercase">
                          <Link href={`/events/${event.id}`}>Dettagli</Link>
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
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Condividi una Foto</DialogTitle>
            <DialogDescription>Incolla l'URL di una foto scattata durante l'uscita. Diventerà l'anteprima principale.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Link Immagine</Label>
            <Input 
              value={newPhotoUrl} 
              onChange={e => setNewPhotoUrl(e.target.value)} 
              placeholder="https://images.unsplash.com/..." 
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
              <DialogDescription className="text-muted-foreground">Aggiorna i dettagli dell'uscita in vetrina.</DialogDescription>
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
                <Label>Luogo di Ritrovo</Label>
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
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background min-h-[80px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditingEvent(null)}>Annulla</Button>
              <Button onClick={saveEdit} className="bg-accent text-accent-foreground font-bold">Salva Modifiche</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
