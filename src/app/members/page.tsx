
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Calendar, Shield, Bike } from "lucide-react"
import sociData from "@/app/lib/soci.json"

export default function MembersPage() {
  const { soci } = sociData

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-none font-bold uppercase tracking-wider">La nostra comunità</Badge>
          <h1 className="text-4xl font-headline font-bold mb-2 text-foreground">Anagrafica Soci</h1>
          <p className="text-muted-foreground max-w-2xl">Elenco ufficiale dei colleghi e soci iscritti al Motoclub VVF Roma.</p>
        </header>

        <section className="hidden md:block">
          <Card className="bg-card border-border overflow-hidden shadow-xl">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="text-accent font-bold">Socio</TableHead>
                  <TableHead className="text-accent font-bold">Grado VVF</TableHead>
                  <TableHead className="text-accent font-bold">Ruolo Club</TableHead>
                  <TableHead className="text-accent font-bold">Iscritto dal</TableHead>
                  <TableHead className="text-accent font-bold">Motocicletta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soci.map((socio) => (
                  <TableRow key={socio.id} className="hover:bg-primary/5 transition-colors border-border">
                    <TableCell className="font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-4 h-4" />
                      </div>
                      {socio.nome}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{socio.grado}</TableCell>
                    <TableCell>
                      <Badge variant={socio.ruolo === "Socio Ordinario" ? "outline" : "default"} className={socio.ruolo !== "Socio Ordinario" ? "bg-accent text-accent-foreground" : "border-accent text-accent"}>
                        {socio.ruolo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{socio.dataIscrizione}</TableCell>
                    <TableCell className="italic text-sm">{socio.moto}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* Mobile View: Cards instead of table */}
        <section className="md:hidden grid grid-cols-1 gap-4">
          {soci.map((socio) => (
            <Card key={socio.id} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{socio.nome}</CardTitle>
                  <p className="text-xs text-accent font-bold uppercase">{socio.ruolo}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>{socio.grado}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Iscritto: {socio.dataIscrizione}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bike className="w-4 h-4 text-primary" />
                  <span>{socio.moto}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  )
}
