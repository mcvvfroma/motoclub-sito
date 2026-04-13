"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, ShieldAlert, UserCog, Loader2 } from "lucide-react"
import sociData from "@/app/lib/soci.json"

export default function AdminMembersPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Simulazione di stato utente (Admin di default per questa demo)
  const [currentUser] = useState({
    nome: "Leonardo Bocale",
    status: "admin" 
  })

  // Safe extraction of soci list
  const soci = sociData?.soci || []

  useEffect(() => {
    if (currentUser.status !== 'admin') {
      toast({
        variant: "destructive",
        title: "Accesso Negato",
        description: "Non hai i permessi necessari per accedere a questa pagina.",
      })
      router.push("/")
    }
  }, [currentUser, router, toast])

  if (currentUser.status !== 'admin') return null

  if (!soci || soci.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Caricamento dati amministrativi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <Badge variant="outline" className="border-primary text-primary font-bold uppercase tracking-wider">Pannello Admin</Badge>
            </div>
            <h1 className="text-4xl font-headline font-bold mb-2 text-foreground">Gestione Soci</h1>
            <p className="text-muted-foreground max-w-2xl">Amministrazione completa degli iscritti e dei permessi di accesso.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
             <UserCog className="w-4 h-4" /> Aggiungi Socio
          </Button>
        </header>

        <Card className="bg-card border-border overflow-hidden shadow-xl">
          <CardHeader className="bg-secondary/30 border-b border-border">
            <CardTitle className="text-xl">Elenco Anagrafico</CardTitle>
            <CardDescription>Visualizzazione e modifica dei dati sensibili dei soci.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow className="border-border">
                  <TableHead className="text-accent font-bold">Nome Completo</TableHead>
                  <TableHead className="text-accent font-bold">Email</TableHead>
                  <TableHead className="text-accent font-bold">Status</TableHead>
                  <TableHead className="text-accent font-bold text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soci.map((socio: any) => (
                  <TableRow key={socio.id || socio.email} className="hover:bg-primary/5 transition-colors border-border">
                    <TableCell className="font-medium text-foreground">
                      {socio.nome} {socio.cognome}
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Modifica</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Elimina</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}