"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, ShieldAlert, Loader2, Plus } from "lucide-react"
import sociData from "@/app/lib/soci.json"

export default function AdminMembersPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [members, setMembers] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [formData, setFormData] = useState({ nome: "", cognome: "", email: "", status: "socio" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("vvf_user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    
    try {
      const user = JSON.parse(storedUser)
      if (user.status !== 'admin') {
        toast({
          variant: "destructive",
          title: "Accesso Negato",
          description: "Non hai i permessi necessari per accedere a questa pagina.",
        })
        router.push("/")
        return
      }
      // Inizializziamo la lista dei soci dai dati locali
      setMembers(sociData.soci)
      setIsLoading(false)
    } catch (e) {
      router.push("/login")
    }
  }, [router, toast])

  const handleAddMember = () => {
    if (!formData.nome || !formData.cognome || !formData.email) {
      toast({ variant: "destructive", title: "Errore", description: "Tutti i campi sono obbligatori." })
      return
    }
    
    const exists = members.some(m => m.email.toLowerCase() === formData.email.toLowerCase())
    if (exists) {
      toast({ variant: "destructive", title: "Errore", description: "Questa email è già registrata." })
      return
    }

    const newMember = { ...formData }
    setMembers([...members, newMember])
    setIsAdding(false)
    setFormData({ nome: "", cognome: "", email: "", status: "socio" })
    toast({ title: "Socio aggiunto", description: `${newMember.nome} ${newMember.cognome} è stato inserito nel registro.` })
  }

  const handleEditMember = () => {
    const updatedMembers = members.map(m => 
      m.email === editingMember.email ? { ...formData } : m
    )
    setMembers(updatedMembers)
    setEditingMember(null)
    setFormData({ nome: "", cognome: "", email: "", status: "socio" })
    toast({ title: "Socio aggiornato", description: "Le modifiche sono state salvate correttamente." })
  }

  const handleDeleteMember = (email: string) => {
    setMembers(members.filter(m => m.email !== email))
    toast({ title: "Socio rimosso", description: "L'utente è stato eliminato dal registro." })
  }

  const openEditDialog = (member: any) => {
    setEditingMember(member)
    setFormData({ ...member })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Caricamento dati amministrativi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
           
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

          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 gap-2 h-12 px-6 rounded-full shadow-lg shadow-primary/30 font-bold">
                 <Plus className="w-5 h-5" /> Aggiungi Socio
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Nuovo Socio</DialogTitle>
                <DialogDescription>Inserisci i dati del nuovo collega per registrarlo.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="bg-background border-border" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cognome">Cognome</Label>
                  <Input id="cognome" value={formData.cognome} onChange={e => setFormData({...formData, cognome: e.target.value})} className="bg-background border-border" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-background border-border" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Seleziona status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="socio">Socio</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAdding(false)}>Annulla</Button>
                <Button onClick={handleAddMember} className="bg-primary text-white">Salva Socio</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <Card className="bg-card border-border overflow-x-auto shadow-xl">
          <CardHeader className="bg-secondary/30 border-b border-border">
            <CardTitle className="text-xl">Elenco Anagrafico</CardTitle>
            <CardDescription>Visualizzazione e modifica dei dati sensibili dei soci.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
{/* RIGA 169: Usiamo uno stile inline per essere sicuri al 100% */}
<div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', display: 'block' }}>
  <div style={{ minWidth: '850px', display: 'block' }}>
    <Table className="w-full">
          
              <TableHeader className="bg-secondary/50">
                <TableRow className="border-border">
                  <TableHead className="text-accent font-bold">Nome Completo</TableHead>
                  <TableHead className="text-accent font-bold">Email</TableHead>
                  <TableHead className="text-accent font-bold">Status</TableHead>
                  <TableHead className="text-accent font-bold text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                      Nessun socio trovato.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((socio: any) => (
                    <TableRow key={socio.email} className="hover:bg-primary/5 transition-colors border-border">
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditDialog(socio)} 
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Modifica</span>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Elimina</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-headline">Conferma Eliminazione</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Sei sicuro di voler rimuovere {socio.nome} {socio.cognome}? Questa operazione non può essere annullata.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-background border-border">Annulla</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteMember(socio.email)} 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Elimina
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Modal (Hidden unless triggered) */}
        {editingMember && (
          <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
            <DialogContent className="bg-card border-border sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Modifica Socio</DialogTitle>
                <DialogDescription>Aggiorna le informazioni di {editingMember.nome}.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-nome">Nome</Label>
                  <Input id="edit-nome" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="bg-background border-border" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-cognome">Cognome</Label>
                  <Input id="edit-cognome" value={formData.cognome} onChange={e => setFormData({...formData, cognome: e.target.value})} className="bg-background border-border" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email (Non modificabile)</Label>
                  <Input id="edit-email" type="email" value={formData.email} className="bg-background border-border opacity-50 cursor-not-allowed" disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Seleziona status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="socio">Socio</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditingMember(null)}>Annulla</Button>
                <Button onClick={handleEditMember} className="bg-accent text-accent-foreground font-bold">Salva Modifiche</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}
