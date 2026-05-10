'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, ShieldAlert, Loader2, Plus, MoreHorizontal, User } from "lucide-react"

export default function AdminMembersPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [members, setMembers] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [deletingMember, setDeletingMember] = useState<any>(null)
  const [formData, setFormData] = useState({ nome: "", cognome: "", email: "", status: "socio" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("vvf_user")
    if (!storedUser) {
      router.push("/login");
      return;
    }
    try {
      const user = JSON.parse(storedUser)
      if (user.status !== 'admin') {
        toast({ variant: "destructive", title: "Accesso Negato" });
        router.push("/");
        return;
      }
    } catch (e) { router.push("/login"); }

    const q = query(collection(db, "users"), orderBy("cognome"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const membersData: any[] = [];
      querySnapshot.forEach((doc) => {
        membersData.push({ id: doc.id, ...doc.data() });
      });
      setMembers(membersData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching members: ", error);
      toast({ variant: "destructive", title: "Errore", description: "Impossibile caricare i dati dei soci." });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast])

  const handleAddMember = async () => {
    if (!formData.nome || !formData.cognome || !formData.email) {
      toast({ variant: "destructive", title: "Errore", description: "Tutti i campi sono obbligatori." });
      return;
    }
    const newEmail = formData.email.toLowerCase();
    if (members.some(m => m.id.toLowerCase() === newEmail)) {
      toast({ variant: "destructive", title: "Errore", description: "Questa email è già registrata." });
      return;
    }
    try {
      await setDoc(doc(db, "users", newEmail), { 
        nome: formData.nome, cognome: formData.cognome, status: formData.status, photoURL: ""
      });
      setIsAdding(false);
      setFormData({ nome: "", cognome: "", email: "", status: "socio" });
      toast({ title: "Socio aggiunto" });
    } catch (error) {
      toast({ variant: "destructive", title: "Errore", description: "Impossibile aggiungere il socio." });
    }
  }

  const handleEditMember = async () => {
    if (!editingMember) return;
    try {
      const memberDocRef = doc(db, "users", editingMember.id);
      await updateDoc(memberDocRef, { nome: formData.nome, cognome: formData.cognome, status: formData.status });
      setEditingMember(null);
      toast({ title: "Socio aggiornato" });
    } catch (error) {
      toast({ variant: "destructive", title: "Errore", description: "Impossibile aggiornare il socio." });
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteDoc(doc(db, "users", memberId));
      toast({ title: "Socio rimosso" });
      setDeletingMember(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Errore", description: "Impossibile rimuovere il socio." });
    }
  }

  const openEditDialog = (member: any) => {
    setEditingMember(member);
    setFormData({ nome: member.nome, cognome: member.cognome, email: member.id, status: member.status });
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
  )

  return (
    <div className="min-h-screen pb-24 bg-background text-foreground">
      {/* 1. RIDOTTO IL PADDING LATERALE SU MOBILE (px-2) */}
      <main className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
        
        {/* 2. HEADER CENTRATO E RESPONSIVE */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-primary shrink-0" />
            <h1 className="text-xl md:text-2xl font-bold uppercase italic tracking-tighter">Gestione Soci</h1>
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto gap-2 rounded-full font-bold h-11 px-6">
                 <Plus className="w-5 h-5" /> Aggiungi Socio
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
               <DialogHeader><DialogTitle>Nuovo Socio</DialogTitle><DialogDescription>Inserisci i dati per registrare un nuovo membro.</DialogDescription></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2"><Label>Nome</Label><Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>Cognome</Label><Input value={formData.cognome} onChange={e => setFormData({...formData, cognome: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>Status</Label><Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="socio">Socio</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select></div>
                </div>
                <DialogFooter><Button variant="ghost" onClick={() => setIsAdding(false)}>Annulla</Button><Button onClick={handleAddMember}>Salva Socio</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        {/* 3. LISTA OTTIMIZZATA SENZA MARGINI NEGATIVI */}
        <div className="bg-card border sm:rounded-xl border-border overflow-hidden">
          <ul className="divide-y divide-border">
              {members.length === 0 ? (
                  <li className="py-12 text-center text-muted-foreground italic">Nessun socio nel database.</li>
              ) : (
                  members.map((socio) => (
                  <li key={socio.id} className="py-4 px-3 sm:px-6 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                          {/* Info Socio: flex-1 e min-w-0 forzano il truncate */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Avatar className="h-12 w-12 shrink-0 border border-border">
                                  <AvatarImage src={socio.photoURL} alt={socio.nome} className="object-cover" />
                                  <AvatarFallback><User className="text-muted-foreground" /></AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                  <p className="font-bold uppercase italic leading-none truncate mb-1">
                                    {socio.nome} {socio.cognome}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate opacity-70">
                                    {socio.id}
                                  </p>
                              </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                              {socio.status === 'admin' && (
                                <Badge variant="default" className="hidden xs:flex text-[10px] h-5 px-1.5 font-bold uppercase">
                                  ADMIN
                                </Badge>
                              )}
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                                        <MoreHorizontal className="h-5 w-5" />
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem onClick={() => openEditDialog(socio)} className="cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4"/>Modifica
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => setDeletingMember(socio)} className="text-destructive focus:text-destructive cursor-pointer">
                                        <Trash2 className="mr-2 h-4 w-4"/>Elimina
                                      </DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </div>
                      </div>
                  </li>
                  ))
              )}
          </ul>
        </div>

        {/* Edit Modal */}
        {editingMember && (
          <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Modifica Socio</DialogTitle><DialogDescription>Aggiorna le informazioni di {editingMember.nome}.</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid gap-2"><Label>Nome</Label><Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>Cognome</Label><Input value={formData.cognome} onChange={e => setFormData({...formData, cognome: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>Email (Non modificabile)</Label><Input value={formData.email} disabled /></div>
                  <div className="grid gap-2"><Label>Status</Label><Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="socio">Socio</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select></div>
              </div>
              <DialogFooter><Button variant="ghost" onClick={() => setEditingMember(null)}>Annulla</Button><Button onClick={handleEditMember}>Salva Modifiche</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        {deletingMember && (
            <AlertDialog open={!!deletingMember} onOpenChange={() => setDeletingMember(null)}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader><AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle><AlertDialogDescription>Sei sicuro di voler rimuovere {deletingMember.nome} {deletingMember.cognome}? L'azione è irreversibile.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteMember(deletingMember.id)} className="bg-destructive hover:bg-destructive/90">Elimina</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
      </main>
    </div>
  )
}