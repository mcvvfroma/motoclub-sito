import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight, ShieldCheck, Map, Image as ImageIcon, User } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const upcomingEvents = [
  {
    id: 1,
    title: "Mountain Pass Adventure",
    date: "May 20, 2024",
    location: "Alps - Milan Base",
    image: PlaceHolderImages.find(img => img.id === "event-1")?.imageUrl
  },
  {
    id: 2,
    title: "Lakeside Sunset Cruise",
    date: "June 05, 2024",
    location: "Lake Como",
    image: PlaceHolderImages.find(img => img.id === "event-2")?.imageUrl
  }
]

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-ride")

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden">
        <Image
          src={heroImage?.imageUrl || ""}
          alt="Hero"
          fill
          className="object-cover opacity-40"
          priority
          data-ai-hint="motorcycle highway"
        />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Fuel Your Passion. Ride Together.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Connect with fellow riders, discover epic routes, and manage your club life all in one place.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8">
              Explore Events <Calendar className="ml-2 w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 border-accent text-accent hover:bg-accent/10">
              Member Benefits <ShieldCheck className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        
        {/* Upcoming Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-headline font-bold">Upcoming Rides</h2>
            <Link href="/events" className="text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {upcomingEvents.map(event => (
              <Card key={event.id} className="overflow-hidden border-border bg-card hover:border-primary/50 transition-all group">
                <div className="relative h-48 w-full">
                  <Image src={event.image || ""} alt={event.title} fill className="object-cover transition-transform group-hover:scale-105" />
                </div>
                <CardContent className="p-6">
                  <p className="text-accent text-sm font-medium mb-2">{event.date}</p>
                  <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Map className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <Button asChild className="mt-6 w-full bg-secondary hover:bg-secondary/80">
                    <Link href={`/events/${event.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Stats / Info */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card p-8 rounded-2xl border border-border text-center">
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold font-headline mb-1">12</h3>
            <p className="text-muted-foreground">Active Events</p>
          </div>
          <div className="bg-card p-8 rounded-2xl border border-border text-center">
            <div className="w-12 h-12 bg-accent/20 text-accent rounded-xl flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold font-headline mb-1">256</h3>
            <p className="text-muted-foreground">Club Members</p>
          </div>
          <div className="bg-card p-8 rounded-2xl border border-border text-center">
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold font-headline mb-1">1.2k</h3>
            <p className="text-muted-foreground">Photos Shared</p>
          </div>
        </section>

      </main>
    </div>
  )
}
