
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Calendar, ShieldCheck, Thermometer, Wind, CloudRain, AlertTriangle, CheckCircle2, Camera, X } from "lucide-react"
import { aiRideConditionAdvisory } from "@/ai/flows/ai-ride-condition-advisory"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<any>(null)
  const [advisory, setAdvisory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    const storedEvents = localStorage.getItem("vvf_all_events")
    const allEvents = storedEvents ? JSON.parse(storedEvents) : []
    const foundEvent = allEvents.find((e: any) => e.id.toString() === eventId)
    
    if (foundEvent) {
      setEvent(foundEvent)
      
      const mockWeatherData = JSON.stringify({
        temperature: { min: 12, max: 22, unit: "C" },
        precipitation_chance: 5,
        wind_speed: 15,
        visibility: "Ottima"
      })

      aiRideConditionAdvisory({
        locationDescription: `${foundEvent.location} il ${foundEvent.date}`,
        weatherData: mockWeatherData
      }).then(res => {
        setAdvisory(res)
        setIsLoading(false)
      })
    }
  }, [eventId])

  if (!event || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="font-headline animate-pulse">Caricamento dettagli uscita...</p>
      </div>
    )
  }

  const coverImage = event.photos?.length > 0 ? event.photos[event.photos.length - 1] : "/cascovigili.jpg"

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-foreground">
        
        <div className="lg:col-span-2 space-y-8">
          <header>
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" asChild>
              <Link href="/events">
                ← Torna agli Eventi
              </Link>
            </Button>
            <h1 className="text-4xl font-headline font-bold mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4 text-primary" /> {new Date(event.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 text-primary" /> {event.time || "Orario N/D"}
              </span>
              <span className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                <MapPin className="w-4 h-4 text-primary" /> {event.location}
              </span>
            </div>
          </header>

          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-border shadow-xl">
            <Image 
              src={coverImage} 
              alt={event.title} 
              fill 
              className="object-cover"
              unoptimized={coverImage.startsWith('data:') || coverImage.startsWith('http')}
            />
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl">Informazioni sull'Uscita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">{event.description || "Nessuna descrizione disponibile."}</p>
              
              <div>
                <h4 className="font-headline font-bold mb-2">Punto di Ritrovo</h4>
                <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center gap-3">
                   <MapPin className="w-5 h-5 text-primary" />
                   <p className="text-sm font-medium">{event.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <section>
            <h3 className="text-2xl font-headline font-bold mb-6 flex items-center gap-2">
              <Camera className="w-6 h-6 text-accent" /> Gallery Evento
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {event.photos && event.photos.map((photo: string, i: number) => (
                <div 
                  key={i} 
                  className="relative aspect-square rounded-md overflow-hidden border border-border group shadow-sm cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Image 
                    src={photo} 
                    alt={`Foto ${i}`} 
                    fill 
                    className="object-cover transition-transform group-hover:scale-110" 
                    unoptimized 
                  />
                </div>
              ))}
              {(!event.photos || event.photos.length === 0) && (
                <div className="col-span-full py-12 text-center text-muted-foreground italic border-2 border-dashed border-border rounded-xl">
                  Nessuna foto caricata dai soci.
                </div>
              )}
            </div>
          </section>

          <Card className="bg-card border-border overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Percorso Pianificato</CardTitle>
              {event.mapUrl && (
                <Button size="sm" variant="outline" className="border-primary text-primary" asChild>
                  <Link href={event.mapUrl} target="_blank">Apri in Maps</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground bg-background p-4 rounded-lg border border-border italic">
                {event.mapUrl ? "Mappa interattiva disponibile." : "Percorso non disponibile."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-accent/30 bg-card shadow-lg shadow-accent/5">
            <CardHeader>
              <div className="flex items-center gap-2 text-accent mb-1">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">AI Ride Advisor</span>
              </div>
              <CardTitle className="text-2xl">Sicurezza</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {advisory ? (
                <>
                  <div className={cn(
                    "p-4 rounded-xl flex items-start gap-3",
                    advisory.isSafeToRide ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
                  )}>
                    {advisory.isSafeToRide ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <AlertTriangle className="w-6 h-6 text-red-500" />}
                    <div>
                      <p className="font-bold text-sm">{advisory.isSafeToRide ? "Pronti a Partire" : "Attenzione"}</p>
                      <p className="text-xs text-muted-foreground">{advisory.overallAdvisory}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><Thermometer className="w-4 h-4" /> Temp. Prevista</span>
                      <span className="font-medium">{advisory.temperatureRange}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground"><CloudRain className="w-4 h-4" /> Rischio Pioggia</span>
                      <span className="font-medium">{advisory.precipitationRisk}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-accent" /> Raccomandazioni
                    </h4>
                    <ul className="text-xs space-y-2 text-muted-foreground">
                      {advisory.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-xs italic text-muted-foreground">Analisi in corso...</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader>
              <CardTitle>Stato Iscrizioni</CardTitle>
              <CardDescription className="text-primary-foreground/70">Posti disponibili per i soci</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-headline font-bold">12</p>
                  <p className="text-xs opacity-70">Presenti</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">8</p>
                  <p className="text-xs opacity-70">Liberi</p>
                </div>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[60%]" />
              </div>
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold py-6 rounded-xl">
                Parteciperò
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 flex items-center justify-center">
            <div className="relative w-full h-full flex flex-col">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="w-8 h-8" />
              </Button>
              <div className="relative flex-1 w-full h-full min-h-[70vh]">
                <Image 
                  src={selectedPhoto} 
                  alt="Foto Galleria" 
                  fill 
                  className="object-contain" 
                  unoptimized 
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
