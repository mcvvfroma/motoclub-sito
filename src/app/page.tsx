
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ArrowRight, MapPin, Camera, Sun, Cloud, CloudRain, Trash2, Edit } from "lucide-react"
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
  if (!weatherData) return (
    <Link href={ilMeteoUrl} target="_blank">
      <Badge variant="outline" className="bg-black/40 text-white/50 text-[10px]">ilMeteo.it</Badge>
    </Link>
  )

  const isRainy = weatherData.prob > 50
  const Icon = weatherData.code <= 3 ? Sun : (weatherData.code <= 67 ? Cloud : CloudRain)

  return (
    <Link href={ilMeteoUrl} target="_blank">
      <div className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md transition-transform hover:scale-105",
        isRainy ? "bg-red-600 border-red-400 text-white" : "bg-black/60 border-white/10 text-white"
      )}>
        <Icon className={cn("w-3.5 h-3.5", !isRainy && "text-accent")} />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {isRainy ? "Pioggia" : `${weatherData.temp}°C`} | {location}
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

  useEffect(() => {
    const storedUser = localStorage.getItem("vvf_user")
    if (storedUser) setUser(JSON.parse(storedUser))
    const storedEvents = localStorage.getItem("vvf_all_events")
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents).slice(0, 3))
    } else {
      setEvents(DEFAULT_EVENTS)
      localStorage.setItem("vvf_all_events", JSON.stringify(DEFAULT_EVENTS))
    }
  }, [])

  const isAdmin = user?.status === "admin"

  const handleDelete = (id: number) => {
    const all = JSON.parse(localStorage.getItem("vvf_all_events") || "[]")
    const filtered = all.filter((e: any) => e.id !== id)
    localStorage.setItem("vvf_all_events", JSON.stringify(filtered))
    setEvents(filtered.slice(0, 3))
    toast({ title: "Uscita rimossa", description: "L'evento è stato eliminato dalla home." })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
      <Navbar />
      <section className="relative h-[45vh] w-full flex items-center justify-center overflow-hidden px-6 pt-16 md:pt-0">
        <Image src="/cascovigili.jpg" alt="Hero" fill className="object-cover opacity-30" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-[1]" />
        <div className="relative z-10 text-center max-w-3xl flex flex-col items-center">
          <div className="relative w-24 h-24 mb-6">
            <Image src="/logo_motoclub.gif" alt="Logo" fill className="object-contain" />
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent uppercase tracking-tighter">
            Motoclub VVF Roma
          </h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em] mb-8">Passione • Servizio • Strada</p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 h-14 font-bold" asChild>
            <Link href="/events">Esplora Uscite <ArrowRight className="ml-2 w-6 h-6" /></Link>
          </Button>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-headline font-bold border-l-4 border-primary pl-4 uppercase tracking-tighter">Prossime Uscite 2026</h2>
          <Link href="/events" className="text-primary font-bold uppercase text-xs tracking-widest">Vedi Tutto</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => {
            const imageUrl = event.image || "/cascovigili.jpg"
            return (
              <Card key={event.id} className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all group flex flex-col">
                <div className="relative h-56 w-full">
                  <Image src={imageUrl} alt={event.title} fill className="object-cover transition-transform group-hover:scale-105" unoptimized={imageUrl.startsWith('http') || imageUrl.startsWith('data:')} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent" />
                  <div className="absolute bottom-4 right-4 z-10">
                    <DynamicWeatherBadge location={event.weatherLocation || event.location} date={event.date} />
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-accent text-[11px] font-bold uppercase mb-2">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(event.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <CardTitle className="text-2xl font-headline mb-4 group-hover:text-primary transition-colors leading-tight">{event.title}</CardTitle>
                  <div className="flex items-center text-muted-foreground text-sm mb-8">
                    <MapPin className="w-4 h-4 mr-2 text-primary" /> {event.location}
                  </div>
                  <div className="mt-auto space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild variant="outline" size="sm" className="font-bold">
                        <Link href={`/events/${event.id}`}>DETTAGLI</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="gap-2 font-bold border-accent text-accent">
                        <Link href="/events"><Camera className="w-4 h-4" /> FOTO</Link>
                      </Button>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                        <Button variant="ghost" size="icon" className="text-accent" asChild>
                          <Link href="/events"><Edit className="w-4 h-4" /></Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border text-foreground">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Rimuovi Uscita</AlertDialogTitle>
                              <AlertDialogDescription>Vuoi davvero togliere questa uscita dalla home?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-destructive text-white">Rimuovi</AlertDialogAction>
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
    </div>
  )
}
