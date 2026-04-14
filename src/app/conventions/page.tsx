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
import { ShieldCheck, Zap, Info, FileText, CheckCircle2, Wrench, ShoppingBag, Plus, Edit, Trash2, Bike } from "lucide-react"
import { cn } from "@/lib/utils"

const categoryIcons: Record<string, any> = {
  "Officina": { icon: Wrench, color: "text-primary", bg: "bg-primary/10" },
  "Assicurazione": { icon: ShieldCheck, color: "text-accent", bg: "bg-accent/10" },
  "Abbigliamento": { icon: ShoppingBag, color: "text-yellow-600", bg: "bg-yellow-500/10" },
  "Concessionario": { icon: Bike, color: "text-blue-400", bg: "bg-blue-400/10" },
  "Altro": { icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" }
}

const initialBenefits = [
  {
    id: 1,
    title: "Officina Moto Roma",
    category: "Officina",
    discount: "15%",
    description: "Sconto esclusivo su tutti i tagliandi e manutenzione ordinaria per i soci VVF."
  },
  {
    id: 2,
    title: "Assicurazione Veloci",
    category: "Assicurazione",
    discount: "Tariffe Agevolate",
    description: "Polizza dedicata ai soci VVF con assistenza stradale H24 inclusa."
  },
  {
    id: 3,
    title: "Negozio Accessori",
    category: "Abbigliamento",
    discount: "10%",
    description: "Sconto su tutto l'abbigliamento tecnico e buono da 20€ per acquisto nuovo casco."
  }
]

export default function ConventionsPage() {
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [benefits, setBenefits] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingBenefit, setEditingBenefit] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    category: "Officina",
    discount: "",
    description: ""
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("vvf_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    const storedBenefits = localStorage.getItem("vvf_conventions")
    if (storedBenefits) {
      try {
        setBenefits(JSON.parse(storedBenefits))
      } catch (e) {
        setBenefits(initialBenefits)
      }
    } else {
      setBenefits(initialBenefits)
    }
  }, [])

  useEffect(() => {
    if (benefits.length > 0) {
      localStorage.setItem("vvf_conventions", JSON.stringify(benefits))
    }
  }, [benefits])

  const isAdmin = user?.status === "admin"

  const handleSaveBenefit = () => {
    if (!formData.title || !formData.discount || !formData.description) {
      toast({ variant: "destructive", title: "Errore", description: "Tutti i campi sono obbligatori." })
      return
    }

    if (editingBenefit) {
      const updated = benefits.map(b => b.id === editingBenefit.id ? { ...formData, id: b.id } : b)
      setBenefits(updated)
      toast({ title: "Salvataggio completato", description: "Convenzione aggiornata con successo." })
      setEditingBenefit(null)
    } else {
      const newBenefit = { ...formData, id: Date.now() }
      const updated = [...benefits, newBenefit]
      setBenefits(updated)
      toast({ title: "Convenzione registrata", description: "Il nuovo vantaggio è stato salvato nel cloud locale." })
      setIsAdding(false)
    }
    setFormData({ title: "", category: "Officina", discount: "", description: "" })
  }

  const handleDeleteBenefit = (id: number) => {
    const updated = benefits.filter(b => b.id !== id)
    setBenefits(updated)
    toast({ title: "Convenzione rimossa", description: "Il vantaggio è stato eliminato correttamente." })
  }

  const openEditDialog = (benefit: any) => {
    setEditingBenefit(benefit)
    setFormData({ ...benefit })
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary border-none font-bold uppercase tracking-wider">Vantaggi Esclusivi</Badge>
            <h1 className="text-4xl font-headline font-bold mb-2 text-foreground">Convenzioni & Regolamento</h1>
            <p className="text-muted-foreground max-w-2xl">Accedi ai vantaggi riservati ai soci del Motoclub VVF Roma. I dati sono sincronizzati con il tuo dispositivo.</p>
          </div>

          {isAdmin && (
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
              <DialogTrigger asChild>
                <Button className="bg-destructive hover:bg-destructive/90 gap-2 h-12 px-6 rounded-full shadow-lg shadow-destructive/20 font-bold uppercase tracking-tighter">
                   <Plus className="w-5 h-5" /> + AGGIUNGI CONVENZIONE
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline">Nuova Convenzione</DialogTitle>
                  <DialogDescription>Inserisci i dettagli del nuovo vantaggio per i soci.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Nome Partner / Attività</Label>
                    <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background" placeholder="es: Officina Roma Nord" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Seleziona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Officina">Officina</SelectItem>
                          <SelectItem value="Assicurazione">Assicurazione</SelectItem>
                          <SelectItem value="Abbigliamento">Abbigliamento</SelectItem>
                          <SelectItem value="Concessionario">Concessionario</SelectItem>
                          <SelectItem value="Altro">Altro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="discount">Sconto / Vantaggio</Label>
                      <Input id="discount" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="bg-background" placeholder="es: 15% o Buono 20€" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrizione Breve</Label>
                    <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background" placeholder="Dettagli sulla convenzione..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAdding(false)}>Annulla</Button>
                  <Button onClick={handleSaveBenefit} className="bg-primary text-white font-bold">Salva Convenzione</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </header>

        <section className="mb-16">
          <h2 className="text-2xl font-headline font-bold mb-8 flex items-center gap-2 text-foreground">
            <Zap className="w-6 h-6 text-accent" /> Vantaggi Attivi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => {
              const catInfo = categoryIcons[benefit.category] || categoryIcons["Altro"]
              const Icon = catInfo.icon
              return (
                <Card key={benefit.id} className="bg-card border-border hover:border-primary/50 transition-all shadow-sm group relative overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", catInfo.bg)}>
                        <Icon className={cn("w-6 h-6", catInfo.color)} />
                      </div>
                      <Badge variant="outline" className="border-accent text-accent font-bold">
                        {benefit.discount}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">{benefit.title}</CardTitle>
                    <CardDescription className="text-accent text-xs font-bold uppercase tracking-widest">{benefit.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-12">
                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                    
                    {isAdmin && (
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditDialog(benefit)}
                          className="h-8 w-8 text-accent hover:bg-accent/10"
                        >
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
                              <AlertDialogTitle className="font-headline">Conferma Eliminazione</AlertDialogTitle>
                              <AlertDialogDescription>Vuoi davvero rimuovere la convenzione con {benefit.title}? L'azione è immediata.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-background border-border">Annulla</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteBenefit(benefit.id)} className="bg-destructive text-white">Elimina</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
            
            {benefits.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground italic border-2 border-dashed border-border rounded-2xl">
                Nessuna convenzione disponibile al momento.
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-card border-border overflow-hidden shadow-sm">
            <CardHeader className="bg-secondary border-b border-border">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <CardTitle className="text-xl text-foreground">Regole e Condotta</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Rispettare le norme del codice della strada durante le uscite.</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Mantenere una comunicazione attiva sui canali ufficiali.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border overflow-hidden shadow-sm">
            <CardHeader className="bg-secondary border-b border-border">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-primary" />
                <CardTitle className="text-xl text-foreground">Protocollo Sicurezza</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Abbigliamento protettivo obbligatorio per tutti.</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Politica "alcol zero" prima e durante la guida.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {editingBenefit && (
          <Dialog open={!!editingBenefit} onOpenChange={(open) => !open && setEditingBenefit(null)}>
            <DialogContent className="bg-card border-border sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Modifica Convenzione</DialogTitle>
                <DialogDescription>Aggiorna i dettagli per {editingBenefit.title}.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Nome Partner</Label>
                  <Input id="edit-title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category">Categoria</Label>
                    <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Officina">Officina</SelectItem>
                        <SelectItem value="Assicurazione">Assicurazione</SelectItem>
                        <SelectItem value="Abbigliamento">Abbigliamento</SelectItem>
                        <SelectItem value="Concessionario">Concessionario</SelectItem>
                        <SelectItem value="Altro">Altro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-discount">Sconto</Label>
                    <Input id="edit-discount" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="bg-background" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Descrizione</Label>
                  <Textarea id="edit-description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditingBenefit(null)}>Annulla</Button>
                <Button onClick={handleSaveBenefit} className="bg-accent text-accent-foreground font-bold">Salva Modifiche</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}
