
"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Megaphone, Calendar, AlertCircle, Info, Plus, Edit, Trash2, FileText, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

const initialCommunications = [
  {
    id: 1,
    title: "Benvenuto dal Direttivo",
    date: "2026-01-01",
    priority: "Info",
    content: "Benvenuti soci nel nuovo portale del Motoclub VVF Roma. Questo spazio è dedicato alla trasparenza e alla condivisione di tutte le decisioni del Direttivo di Sezione. Qui troverete verbali, nuove quote associative e avvisi urgenti. Buona strada a tutti!\n\nIl Motoclub VVF Roma nasce con l'obiettivo di unire la passione per le due ruote con lo spirito di corpo che contraddistingue i Vigili del Fuoco. Attraverso questo portale, vogliamo rendere più agevole la consultazione dei documenti ufficiali e la partecipazione alle nostre attività sociali.\n\nOgni socio è invitato a consultare regolarmente questa bacheca per rimanere aggiornato sulle ultime circolari e decisioni assembleari.\n\nLa passione per le moto ci unisce, la sicurezza ci protegge. Ricordate sempre di controllare la pressione degli pneumatici e lo stato dei freni prima di ogni uscita sociale. Il Direttivo è a vostra disposizione per qualsiasi chiarimento sulle attività del club.",
    author: "Direttivo di Sezione"
  }
]

export default function CommunicationsPage() {
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [comms, setComms] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingComm, setEditingComm] = useState<any>(null)
  const [readingComm, setReadingComm] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split('T')[0],
    priority: "Info",
    content: "",
    author: "Direttivo di Sezione"
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("vvf_user")
    if (storedUser) setUser(JSON.parse(storedUser))

    const storedComms = localStorage.getItem("vvf_communications")
    if (storedComms) {
      try {
        setComms(JSON.parse(storedComms))
      } catch (e) {
        setComms(initialCommunications)
      }
    } else {
      setComms(initialCommunications)
      localStorage.setItem("vvf_communications", JSON.stringify(initialCommunications))
    }
  }, [])

  useEffect(() => {
    if (comms.length > 0) {
      localStorage.setItem("vvf_communications", JSON.stringify(comms))
    }
  }, [comms])

  const isAdmin = user?.status === "admin"

  const handleSaveComm = () => {
    if (!formData.title.trim()) {
      toast({ variant: "destructive", title: "Errore", description: "Il Titolo è obbligatorio." })
      return
    }

    if (editingComm) {
      const updated = comms.map(c => c.id === editingComm.id ? { ...formData, id: c.id } : c)
      setComms(updated)
      toast({ title: "Comunicazione aggiornata", description: "Le modifiche sono state salvate." })
      setEditingComm(null)
    } else {
      const newComm = { ...formData, id: Date.now() }
      const updated = [newComm, ...comms]
      setComms(updated)
      toast({ title: "Comunicazione pubblicata", description: "Il messaggio è ora visibile a tutti i soci." })
      setIsAdding(false)
    }
    setFormData({ title: "", date: new Date().toISOString().split('T')[0], priority: "Info", content: "", author: "Direttivo di Sezione" })
  }

  const handleDeleteComm = (id: number) => {
    const updated = comms.filter(c => c.id !== id)
    setComms(updated)
    toast({ title: "Comunicazione rimossa", description: "Il messaggio è stato eliminato." })
  }

  const openEditDialog = (comm: any) => {
    setEditingComm(comm)
    setFormData({ ...comm })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest">Bacheca Ufficiale Sezione</Badge>
            <h1 className="text-4xl font-headline font-bold text-foreground flex items-center gap-3">
              <Megaphone className="w-10 h-10 text-primary" /> Comunicazioni
            </h1>
            <p className="text-muted-foreground max-w-2xl">Verbali, circolari e avvisi dal Direttivo di Sezione del Motoclub VVF Roma.</p>
          </div>

          {isAdmin && (
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
              <DialogTrigger asChild>
                <Button className="bg-destructive hover:bg-destructive/90 gap-2 h-12 px-6 rounded-full shadow-lg shadow-destructive/20 font-bold uppercase tracking-tighter">
                   <Plus className="w-5 h-5" /> NUOVA COMUNICAZIONE
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-[550px] text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline">Nuova Comunicazione</DialogTitle>
                  <DialogDescription>Solo il Titolo è obbligatorio.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Titolo *</Label>
                    <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background" placeholder="es: Verbale Assemblea 2026" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Priorità</Label>
                      <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Info">Info (Blu)</SelectItem>
                          <SelectItem value="Urgente">Urgente (Rosso)</SelectItem>
                          <SelectItem value="Verbale">Verbale (Grigio)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Data Pubblicazione</Label>
                      <Input id="date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-background" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Contenuto del Messaggio</Label>
                    <Textarea id="content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="bg-background min-h-[150px]" placeholder="Scrivi qui il testo completo..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAdding(false)}>Annulla</Button>
                  <Button onClick={handleSaveComm} className="bg-primary text-white font-bold">Pubblica ora</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </header>

        <div className="space-y-6">
          {comms.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl bg-card/30">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground italic font-medium">Nessuna comunicazione presente al momento.</p>
            </div>
          ) : (
            comms.map((comm) => (
              <Card key={comm.id} className="bg-card border-border hover:border-primary/40 transition-all shadow-sm group overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className={cn(
                        "font-bold uppercase tracking-widest text-[10px]",
                        comm.priority === "Urgente" ? "bg-red-600 text-white" : 
                        comm.priority === "Verbale" ? "bg-muted text-muted-foreground" : "bg-blue-600 text-white"
                      )}>
                        {comm.priority || "Info"}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" /> {new Date(comm.date).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(comm)} className="h-8 w-8 text-accent hover:bg-accent/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border text-foreground">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-headline">Elimina Comunicazione</AlertDialogTitle>
                              <AlertDialogDescription>Vuoi davvero rimuovere questo avviso?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-background border-border">Annulla</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteComm(comm.id)} className="bg-destructive text-white">Elimina</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors">{comm.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-6 leading-relaxed">
                    {comm.content || "Nessun testo inserito."}
                  </p>
                  <div className="flex items-center justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setReadingComm(comm)}
                      className="border-primary/50 text-primary font-bold hover:bg-primary hover:text-white transition-all rounded-full px-5"
                    >
                      LEGGI TUTTO <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Read More Dialog with FIXED Scroll and Sticky Footer */}
        {readingComm && (
          <Dialog open={!!readingComm} onOpenChange={(open) => !open && setReadingComm(null)}>
            <DialogContent className="bg-card border-border sm:max-w-[650px] text-foreground p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden">
              <DialogHeader className="p-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3 mb-2">
                   <Badge className={cn(
                    "font-bold uppercase tracking-widest text-[10px]",
                    readingComm.priority === "Urgente" ? "bg-red-600 text-white" : 
                    readingComm.priority === "Verbale" ? "bg-muted text-muted-foreground" : "bg-blue-600 text-white"
                  )}>
                    {readingComm.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(readingComm.date).toLocaleDateString('it-IT')}</span>
                </div>
                <DialogTitle className="text-3xl font-headline leading-tight">{readingComm.title}</DialogTitle>
                <DialogDescription className="text-accent font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
                   Motoclub VVF Roma - Sezione Sezionale
                </DialogDescription>
              </DialogHeader>

              {/* AREA DI TESTO CON ALTEZZA FISSA E SCROLL FORZATO */}
              <div 
                className="flex-1 px-6 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-primary" 
                style={{ maxHeight: '400px', overflowY: 'auto' }}
              >
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base font-medium opacity-90 pb-4">
                  {readingComm.content}
                </p>
              </div>

              {/* FOOTER SEMPRE VISIBILE CON TASTO CHIUDI */}
              <DialogFooter className="p-4 bg-secondary/30 border-t border-border mt-auto">
                <Button 
                  onClick={() => setReadingComm(null)} 
                  className="bg-primary text-white hover:bg-primary/90 font-bold px-10 rounded-full h-11 shadow-lg shadow-primary/20 w-full sm:w-auto"
                >
                  CHIUDI
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Dialog */}
        {editingComm && (
          <Dialog open={!!editingComm} onOpenChange={(open) => !open && setEditingComm(null)}>
            <DialogContent className="bg-card border-border sm:max-w-[550px] text-foreground">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Modifica Comunicazione</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Titolo *</Label>
                  <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Priorità</Label>
                    <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Info">Info</SelectItem>
                        <SelectItem value="Urgente">Urgente</SelectItem>
                        <SelectItem value="Verbale">Verbale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Data</Label>
                    <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-background" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Contenuto</Label>
                  <Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="bg-background min-h-[150px]" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditingComm(null)}>Annulla</Button>
                <Button onClick={handleSaveComm} className="bg-accent text-accent-foreground font-bold">Salva Modifiche</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}
