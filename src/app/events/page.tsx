
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Filter } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const events = [
  {
    id: 1,
    title: "Mountain Pass Adventure",
    date: "May 20, 2024",
    time: "08:30 AM",
    location: "Alps - Milan Base",
    attending: 14,
    maxSpots: 20,
    type: "Touring",
    difficulty: "Medium",
    image: PlaceHolderImages.find(img => img.id === "event-1")?.imageUrl
  },
  {
    id: 2,
    title: "Lakeside Sunset Cruise",
    date: "June 05, 2024",
    time: "05:00 PM",
    location: "Lake Como",
    attending: 24,
    maxSpots: 40,
    type: "Social",
    difficulty: "Easy",
    image: PlaceHolderImages.find(img => img.id === "event-2")?.imageUrl
  },
  {
    id: 3,
    title: "Retro Bike Meet",
    date: "June 12, 2024",
    time: "10:00 AM",
    location: "Monza Square",
    attending: 45,
    maxSpots: 100,
    type: "Meetup",
    difficulty: "Easy",
    image: PlaceHolderImages.find(img => img.id === "gallery-1")?.imageUrl
  }
]

export default function EventsPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold mb-2">Events & Rides</h1>
            <p className="text-muted-foreground">Join our upcoming scheduled outings and social gatherings.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
            <Button variant="default" size="sm" className="bg-primary text-white">
              Create Event
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="bg-card border-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all">
              <div className="relative h-40">
                <Image src={event.image || ""} alt={event.title} fill className="object-cover" />
                <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background">
                  {event.type}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-accent text-sm mb-2 font-medium">
                  <Calendar className="w-4 h-4" />
                  {event.date} • {event.time}
                </div>
                <CardTitle className="text-xl mb-4 leading-tight">{event.title}</CardTitle>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {event.attending}/{event.maxSpots} Attending
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded",
                    event.difficulty === "Easy" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                  )}>
                    {event.difficulty}
                  </span>
                  <Button variant="link" asChild className="text-primary p-0 h-auto font-bold">
                    <Link href={`/events/${event.id}`}>View Route <ArrowRight className="ml-1 w-4 h-4" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
