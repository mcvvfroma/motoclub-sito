"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ArrowRight, MapPin, Camera, Sun, Cloud, CloudRain, Trash2, Edit, Loader2 } from "lucide-react"
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

  if (loading) return <Badge variant="outline" className="bg-black/40 text-[10px] animate-pulse">Meteo...</Badge>
  
  const isRainy = weatherData?.prob > 50
  const Icon = !weatherData ? Sun : (weatherData.code <= 3 ? Sun : (weatherData.code <= 67 ? Cloud : CloudRain))

  return (
    <Link href={ilMeteoUrl} target="_blank">
      <div className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md transition-transform hover:scale-105",
        isRainy ? "bg-red-600 border-red-400 text-white" : "bg-black/60 border-white/10 text-white"
      )}>
        <Icon className={cn("w-3.5 h-3.5", !isRainy && "text-accent")} />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {weatherData ? `${weatherData.temp}°C` : "Vedi Meteo"} | {location}
        </span>
      </div>
    </Link>
  )
}

const DEFAULT_EVENTS = [
  { id: 1, title: 'Uscita di Roma', date: '2026-05-29', location: 'Roma', weatherLocation: 'Roma', image: '/cascovigili.jpg', photos: [] },
  { id: 2, title: 'Passo del Terminillo', date: '2026-06-14', location: 'Terminillo', weatherLocation: 'Rieti', image: '/cascovigili.jpg', photos: [] },
  { id: 3, title: 'Raduno Nazionale VVF 2026', date: '2026-09-12', location: 'Roma', weatherLocation: 'Roma', image: '/cascovigili.jpg', photos: [] }
]

export default function Home() {
  const { toast } = useToast()
  const [events, setEvents] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [isAddingPhoto, setIsAddingPhoto] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("vvf_user")
    if (storedUser) setUser(JSON.parse(storedUser))
    
    const storedEvents = localStorage.getItem("vvf_all_events")
    if (storedEvents && JSON.parse(storedEvents).length > 0) {
      setEvents(JSON.parse(storedEvents).slice(0, 3))
    } else {
      setEvents(DEFAULT_EVENTS)
      localStorage.setItem("vvf_all_events", JSON.stringify(DEFAULT_EVENTS))
    }
  }, [])

  const isAdmin = user?.status === "admin"

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

  const handleUploadPhoto = () => {
    if (!selectedFile || isAddingPhoto === null) return
    setIsUploading(true)
    const allEvents = JSON.parse(localStorage.getItem("vvf_all_events") || "[]")
    const updatedEvents = allEvents.map((e: any) => {
      if (e.id === isAddingPhoto) {
        return { ...e, image: selectedFile, photos: [...(e.photos || []), selectedFile] }
      }
      return e
    })
    localStorage.setItem("vvf_all_events", JSON.stringify(updatedEvents))
    setEvents(updatedEvents.slice(0, 3))
    
    const gallery = JSON.parse(localStorage.getItem("vvf_gallery_photos") || "[]")
    gallery.unshift({ id: Date.now().toString(), url: selectedFile, event: "Evento", author: user?.nome || "Socio", date: new Date().toISOString() })
    localStorage.setItem("vvf_gallery_photos", JSON.stringify(gallery))

    toast({ title: "Foto pubblicata", description: "L'immagine è ora visibile a tutti i soci." })
    setIsAddingPhoto(null); setSelectedFile(null); setIsUploading(false);
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
      <Navbar />
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <Image src="/cascovigili.jpg" alt="Hero" fill className="object-cover opacity-30" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="relative z-10 text-center px-4">
          <Image src="/logo_motoclub.gif" alt="Logo" width={120} height={120} className="mx-auto mb-8 drop-shadow-2xl" />
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent uppercase tracking-tighter">Motoclub VVF Roma</h1>
          <p className="text-muted-foreground uppercase tracking-[0.4em] text-sm md:text-lg mb-8">Passione • Servizio • Strada</p>
          <Button size="lg" className="rounded-full px-10 h-14 font-bold text-lg" asChild><Link href="/events">CALENDARIO 2026</Link></Button>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-12 border-l-4 border-primary pl-4">
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tighter">Prossime Uscite</h2>
          <Link href="/events" className="text-primary font-bold uppercase text-xs tracking-widest hover:text-accent">Vedi Tutto</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <Card key={event.id} className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all group flex flex-col">
              <div className="relative h-56">
                <Image src={event.image || "/cascovigili.jpg"} alt={event.title} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
                <div className="absolute bottom-4 right-4 z-10">
                  <DynamicWeatherBadge location={event.weatherLocation || event.location} date={event.date} />
                </div>
              </div>
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="text-accent text-[11px] font-bold uppercase mb-2 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <CardTitle className="text-2xl font-headline mb-4 uppercase tracking-tighter">{event.title}</CardTitle>
                <div className="flex items-center text-muted-foreground text-sm mb-6"><MapPin className="w-4 h-4 mr-2 text-primary" /> {event.location}</div>
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="rounded-full font-bold text-xs"><Link href={`/events/${event.id}`}>DETTAGLI</Link></Button>
                  <Button variant="outline" className="rounded-full font-bold text-xs gap-2 border-accent text-accent" onClick={() => setIsAddingPhoto(event.id)}><Camera className="w-4 h-4" /> FOTO</Button>
                </div>
                {isAdmin && (
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="ghost" size="icon" className="text-accent"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={isAddingPhoto !== null} onOpenChange={() => setIsAddingPhoto(null)}>
        <DialogContent className="bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">Aggiungi Foto</DialogTitle>
            <DialogDescription>Seleziona una foto dalla tua galleria per condividerla con il club.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <Label>Scegli Immagine (JPG/PNG)</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} className="bg-background cursor-pointer" />
            {selectedFile && <div className="relative h-40 rounded-xl overflow-hidden border"><Image src={selectedFile} alt="Preview" fill className="object-cover" unoptimized /></div>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddingPhoto(null)}>Annulla</Button>
            <Button onClick={handleUploadPhoto} disabled={!selectedFile || isUploading} className="bg-primary text-white font-bold">{isUploading ? <Loader2 className="animate-spin" /> : "CARICA"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
