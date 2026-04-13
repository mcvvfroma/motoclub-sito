import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Zap, Heart, Info, FileText, CheckCircle2 } from "lucide-react"

const benefits = [
  {
    title: "Sconti per i Soci",
    description: "Approfitta di sconti esclusivi fino al 20% presso officine e negozi di abbigliamento partner.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10"
  },
  {
    title: "Assistenza Stradale",
    description: "Assistenza stradale premium finanziata dal club per tutti i soci su tutto il territorio nazionale.",
    icon: ShieldCheck,
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    title: "Eventi della Comunità",
    description: "Accesso anticipato e prenotazione prioritaria per tutte le giornate in pista e i tour annuali del club.",
    icon: Heart,
    color: "text-accent",
    bg: "bg-accent/10"
  }
]

const conventions = [
  {
    id: "membership-rules",
    title: "Regole e Condotta dei Soci",
    description: "Linee guida per la partecipazione attiva e l'interazione nella comunità.",
    points: [
      "Rispettare tutte le norme del codice della strada durante i giri di gruppo.",
      "Mantenere una comunicazione attiva sui canali del club.",
      "Partecipare ad almeno una riunione del club a trimestre.",
      "Mantenere le proprietà e l'attrezzatura del club in buone condizioni."
    ]
  },
  {
    id: "ride-safety",
    title: "Protocollo Sicurezza Giri di Gruppo",
    description: "Standard di sicurezza obbligatori per ogni uscita organizzata dal club.",
    points: [
      "L'abbigliamento protettivo completo è obbligatorio per tutti i partecipanti.",
      "Politica rigorosa 'alcol zero' prima e durante i giri.",
      "Seguire le istruzioni del Capofila e del Chiudifila.",
      "Formazione sfalsata obbligatoria sui tratti rettilinei."
    ]
  }
]

export default function ConventionsPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12">
          <Badge className="mb-4 bg-primary/20 text-primary border-none font-bold uppercase tracking-wider">Iscrizione Esclusiva</Badge>
          <h1 className="text-4xl font-headline font-bold mb-2">Convenzioni e Regolamento</h1>
          <p className="text-muted-foreground max-w-2xl">Accedi ai vantaggi riservati ai soci e consulta le regole che mantengono la nostra comunità sicura e piacevole per tutti.</p>
        </header>

        <section className="mb-16">
          <h2 className="text-2xl font-headline font-bold mb-8 flex items-center gap-2 text-white">
            <Zap className="w-6 h-6 text-primary" /> Vantaggi per i Soci
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
                    <CardTitle className="text-xl text-white">{benefit.title}</CardTitle>
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
                    <CardTitle className="text-xl text-white">{conv.title}</CardTitle>
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
              <h3 className="text-xl font-headline font-bold text-white">Hai bisogno di più informazioni?</h3>
              <p className="text-muted-foreground text-sm">Scarica il manuale completo del club o contatta la segreteria per domande specifiche.</p>
            </div>
          </div>
          <Button variant="default" className="bg-primary text-white px-8 rounded-full h-12 font-bold">
            Scarica il Manuale PDF
          </Button>
        </div>
      </main>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}
