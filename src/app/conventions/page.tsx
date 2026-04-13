
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Zap, Heart, Info, FileText, CheckCircle2 } from "lucide-react"

const benefits = [
  {
    title: "Member Discounts",
    description: "Enjoy exclusive discounts of up to 20% at our partner garages and gear shops.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10"
  },
  {
    title: "Roadside Assistance",
    description: "Premium club-funded roadside assistance for all members within national borders.",
    icon: ShieldCheck,
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    title: "Community Events",
    description: "Early access and priority booking for all track days and annual club tours.",
    icon: Heart,
    color: "text-accent",
    bg: "bg-accent/10"
  }
]

const conventions = [
  {
    id: "membership-rules",
    title: "Membership Rules & Conduct",
    description: "Guidelines for active membership and community interaction.",
    points: [
      "Respect all road safety regulations during group rides.",
      "Maintain active communication on club channels.",
      "Attend at least one club meeting every quarter.",
      "Keep club property and gear in good condition."
    ]
  },
  {
    id: "ride-safety",
    title: "Group Ride Safety Protocol",
    description: "Mandatory safety standards for every club-organized outing.",
    points: [
      "Full protective gear is mandatory for all participants.",
      "Strict 'no alcohol' policy during and before rides.",
      "Follow the Lead Rider and Tail Gunner instructions.",
      "Staggered formation mandatory on straight roads."
    ]
  }
]

export default function ConventionsPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12">
          <Badge className="mb-4 bg-primary/20 text-primary border-none">Exclusive Membership</Badge>
          <h1 className="text-4xl font-headline font-bold mb-2">Member Conventions</h1>
          <p className="text-muted-foreground max-w-2xl">Access your club benefits and understand the rules that keep our community safe and enjoyable for everyone.</p>
        </header>

        <section className="mb-16">
          <h2 className="text-2xl font-headline font-bold mb-8 flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" /> Club Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <Card key={i} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", benefit.bg)}>
                      <Icon className={cn("w-6 h-6", benefit.color)} />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {conventions.map((conv) => (
            <Card key={conv.id} className="bg-card border-border overflow-hidden">
              <CardHeader className="bg-secondary/30 border-b border-border">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle className="text-xl">{conv.title}</CardTitle>
                    <CardDescription>{conv.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {conv.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="mt-16 p-8 rounded-3xl bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-headline font-bold">Need more information?</h3>
              <p className="text-muted-foreground text-sm">Download our full club handbook or contact the secretary for specific inquiries.</p>
            </div>
          </div>
          <Button variant="default" className="bg-primary text-white px-8 rounded-full h-12">
            Download PDF Handbook
          </Button>
        </div>
      </main>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}
