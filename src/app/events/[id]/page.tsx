
import Image from "next/image"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Calendar, ShieldCheck, Thermometer, Wind, CloudRain, AlertTriangle, CheckCircle2 } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { aiRideConditionAdvisory } from "@/ai/flows/ai-ride-condition-advisory"

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const eventId = (await params).id
  
  // Mock event data retrieval
  const event = {
    title: "Mountain Pass Adventure",
    date: "May 20, 2024",
    time: "08:30 AM",
    location: "Alps - Milan Base",
    description: "A breathtaking journey through the Stelvio Pass. We'll start from our Milan base early in the morning and navigate the serpentines of the Alps. Expect tight hairpins and incredible vistas.",
    route: "Milan -> Lecco -> Bormio -> Stelvio Pass -> Bolzano",
    distance: "280km",
    duration: "6 hours",
    image: PlaceHolderImages.find(img => img.id === "event-1")?.imageUrl,
    map: PlaceHolderImages.find(img => img.id === "map-placeholder")?.imageUrl
  }

  // Simulated weather data for AI input
  const mockWeatherData = JSON.stringify({
    temperature: { min: 8, max: 18, unit: "C" },
    precipitation_chance: 15,
    wind_speed: 25,
    visibility: "Excellent",
    forecast: "Cloudy with sunny intervals, high altitude sections might be colder and windy."
  })

  // Call GenAI Flow
  const advisory = await aiRideConditionAdvisory({
    locationDescription: `${event.location} on ${event.date}`,
    weatherData: mockWeatherData
  })

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <header>
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
              ← Back to Events
            </Button>
            <h1 className="text-4xl font-headline font-bold mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4 text-primary" /> {event.date}
              </span>
              <span className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 text-primary" /> {event.time}
              </span>
              <span className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                <MapPin className="w-4 h-4 text-primary" /> {event.location}
              </span>
            </div>
          </header>

          <div className="relative h-80 rounded-2xl overflow-hidden">
            <Image src={event.image || ""} alt={event.title} fill className="object-cover" />
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>About the Ride</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Total Distance</p>
                  <p className="text-lg font-headline font-bold">{event.distance}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Estimated Time</p>
                  <p className="text-lg font-headline font-bold">{event.duration}</p>
                </div>
              </div>

              <div>
                <h4 className="font-headline font-bold mb-2">Planned Route</h4>
                <p className="text-sm bg-background p-4 rounded-lg border border-border font-mono">
                  {event.route}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Route Map</CardTitle>
              <Button size="sm" variant="outline" className="border-primary text-primary">Open Maps</Button>
            </CardHeader>
            <div className="relative h-64 w-full">
              <Image src={event.map || ""} alt="Map" fill className="object-cover" />
              <div className="absolute inset-0 bg-primary/10 pointer-events-none"></div>
            </div>
          </Card>
        </div>

        {/* Right: Sidebar / AI Advisory */}
        <div className="space-y-6">
          <Card className="border-accent/30 bg-card shadow-lg shadow-accent/5">
            <CardHeader>
              <div className="flex items-center gap-2 text-accent mb-1">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">AI Ride Advisor</span>
              </div>
              <CardTitle className="text-2xl">Safety Advisory</CardTitle>
              <CardDescription>Generated for {event.date}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={cn(
                "p-4 rounded-xl flex items-start gap-3",
                advisory.isSafeToRide ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
              )}>
                {advisory.isSafeToRide ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <AlertTriangle className="w-6 h-6 text-red-500" />}
                <div>
                  <p className="font-bold text-sm">{advisory.isSafeToRide ? "Ready to Ride" : "Caution Advised"}</p>
                  <p className="text-xs text-muted-foreground">{advisory.overallAdvisory}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground"><Thermometer className="w-4 h-4" /> Temperature</span>
                  <span className="font-medium">{advisory.temperatureRange}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground"><CloudRain className="w-4 h-4" /> Rain Risk</span>
                  <span className="font-medium">{advisory.precipitationRisk}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground"><Wind className="w-4 h-4" /> Winds</span>
                  <span className="font-medium">{advisory.windConditions}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent" /> Expert Recommendations
                </h4>
                <ul className="text-xs space-y-2 text-muted-foreground">
                  {advisory.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
              <CardDescription className="text-primary-foreground/70">Secure your spot for this ride</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-headline font-bold">14</p>
                  <p className="text-xs opacity-70">Riders going</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">6</p>
                  <p className="text-xs opacity-70">Spots left</p>
                </div>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[70%]" />
              </div>
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold py-6 rounded-xl">
                I&apos;m Attending
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
