
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Mail } from "lucide-react"
import sociData from "@/app/lib/soci.json"

export default function MembersPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  
  useEffect(() => {
    const storedUser = localStorage.getItem("vvf_user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(storedUser)
      // Controllo sicurezza: solo gli admin possono vedere l'anagrafica soci
      if (user.status !== 'admin') {
        router.push("/")
      } else {
        setIsAuthorized(true)
      }
    } catch (e) {
      router.push("/login")
    }
  }, [router])

  const soci = sociData?.soci || []

  if (!isAuthorized) return null

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-none font-bold uppercase tracking-wider">Accesso Riservato Admin</Badge>
          <h1 className="text-4xl font-headline font-bold mb-2 text-foreground">Anagrafica Soci</h1>
          <p className="text-muted-foreground max-w-2xl">Elenco completo dei soci iscritti al Motoclub VVF Roma.</p>
        </header>

        <section className="hidden md:block">
          <Card className="bg-card border-border overflow-hidden shadow-xl">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="text-accent font-bold">Nome</TableHead>
                  <TableHead className="text-accent font-bold">Cognome</TableHead>
                  <TableHead className="text-accent font-bold">Email</TableHead>
                  <TableHead className="text-accent font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soci.map((socio: any, index: number) => (
                  <TableRow key={index} className="hover:bg-primary/5 transition-colors border-border">
                    <TableCell className="font-medium text-foreground">
                      {socio.nome}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {socio.cognome}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {socio.email}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={socio.status === "admin" ? "default" : "outline"} 
                        className={socio.status === "admin" ? "bg-accent text-accent-foreground" : "border-muted-foreground text-muted-foreground"}
                      >
                        {socio.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* Mobile View */}
        <section className="md:hidden grid grid-cols-1 gap-4">
          {soci.map((socio: any, index: number) => (
            <Card key={index} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{socio.nome} {socio.cognome}</CardTitle>
                  <Badge 
                    variant={socio.status === "admin" ? "default" : "outline"} 
                    className={socio.status === "admin" ? "bg-accent text-accent-foreground text-[10px]" : "border-muted-foreground text-muted-foreground text-[10px]"}
                  >
                    {socio.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="font-mono text-xs">{socio.email}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  )
}
