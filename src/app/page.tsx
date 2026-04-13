
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight, Map, Image as ImageIcon, User, MapPinned, FileText } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const upcomingEvents = [
  {
    id: 3,
    title: "Uscita al Terminillo",
    date: "25 Maggio, 2024",
    location: "Caserma VVF Roma ore 09:00",
    image: PlaceHolderImages.find(img => img.id === "gallery-3")?.imageUrl,
    mapUrl: "https://www.google.com/maps/dir/Roma/Monte+Terminillo"
  },
  {
    id: 1,
    title: "Giro dei Castelli Romani",
    date: "15 Giugno, 2024",
    location: "Partenza: Comando via Genova, Roma",
    image: PlaceHolderImages.find(img => img.id === "event-1")?.imageUrl,
    mapUrl: "https://www.google.com/maps/dir/Via+Genova,+Roma/Castel+Gandolfo"
  },
  {
    id: 2,
    title: "Litorale Laziale al Tramonto",
    date: "30 Giugno, 2024",
    location: "Ostia - Riva di Traiano",
    image: PlaceHolderImages.find(img => img.id === "event-2")?.imageUrl,
    mapUrl: "https://www.google.com/maps/dir/Roma/Riva+di+Traiano"
  }
]

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-ride")

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[75vh] w-full flex items-center justify-center overflow-hidden">
        {heroImage?.imageUrl && (
          <>
            <Image
              src={heroImage.imageUrl}
              alt="Roma Background"
              fill
              className="object-cover"
              priority
              data-ai-hint="Rome St. Peter"
            />
            {/* Dark Filter Overlay for readability */}
            <div className="absolute inset-0 bg-black/60 z-[1]" />
          </>
        )}
        <div className="relative z-10 text-center px-4 max-w-4xl flex flex-col items-center">
          <div className="relative w-32 h-32 md:w-48 md:h-48 mb-6 drop-shadow-[0_0_20px_rgba(211,47,47,0.6)]">
            <Image 
              src="/logo_motoclub.gif" 
              alt="Logo Motoclub VVF Roma" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-7xl font-headline font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent uppercase tracking-tighter">
            Motoclub VVF Roma
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-8 font-medium">
            Passione, Sicurezza e Fratellanza. Sulle strade con il coraggio dei Vigili del Fuoco.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 h-14 text-lg font-bold shadow-lg shadow-primary/30 border-2 border-accent/20" asChild>
              <Link href="/conventions">
                Vedi Convenzioni <FileText className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        
        {/* Upcoming Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-headline font-bold border-l-4 border-primary pl-4">Prossimi Giri</h2>
            <Link href="/events" className="text-primary flex items-center gap-1 hover:underline font-bold">
              Tutti gli eventi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {upcomingEvents.map(event => (
              <Card key={event.id} className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all group shadow-xl">
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
                  <div className="absolute bottom-4 left-4">
                    <p className="text-accent text-sm font-bold uppercase tracking-widest">{event.date}</p>
                    <CardTitle className="text-2xl text-white">{event.title}</CardTitle>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center text-muted-foreground text-sm mb-6">
                    <Map className="w-4 h-4 mr-2 text-primary" />
                    {event.location}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button asChild variant="secondary" className="hover:bg-primary hover:text-white transition-colors py-6">
                      <Link href={`/events/${event.id}`}>Dettagli</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground transition-colors py-6">
                      <a href={event.mapUrl} target="_blank" rel="noopener noreferrer">
                        <MapPinned className="mr-2 w-4 h-4" /> Apri Percorso
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Stats / Info */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card p-8 rounded-2xl border border-border text-center hover:border-accent/50 transition-colors">
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold font-headline mb-1 text-white">12</h3>
            <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Eventi Attivi</p>
          </div>
          <div className="bg-card p-8 rounded-2xl border border-border text-center hover:border-accent/50 transition-colors">
            <div className="w-12 h-12 bg-accent/20 text-accent rounded-xl flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold font-headline mb-1 text-white">256</h3>
            <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Soci Iscritti</p>
          </div>
          <div className="bg-card p-8 rounded-2xl border border-border text-center hover:border-accent/50 transition-colors">
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold font-headline mb-1 text-white">1.2k</h3>
            <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Foto Condivise</p>
          </div>
        </section>

      </main>
    </div>
  )
}
