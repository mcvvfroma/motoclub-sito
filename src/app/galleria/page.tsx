
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Camera, Plus, X, Maximize2, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Photo {
  id: string;
  url: string;
  event: string;
  author: string;
  date: string;
}

const initialPhotos: Photo[] = [
  { id: "1", url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000", event: "Roma", author: "Marco R.", date: "2026-05-29" },
  { id: "2", url: "https://images.unsplash.com/photo-1558980394-34764db076b4?q=80&w=1000", event: "Roma", author: "Elena S.", date: "2026-05-29" },
  { id: "3", url: "https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=1000", event: "Terminillo", author: "Gianni V.", date: "2026-06-14" },
  { id: "4", url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000", event: "Roma", author: "Luca M.", date: "2026-09-12" },
]

export default function GalleriaPage() {
  const { toast } = useToast()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [filter, setFilter] = useState("Tutti")
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [newPhotoData, setNewPhotoData] = useState({ event: "Altro", author: "" })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  useEffect(() => {
    const storedPhotos = localStorage.getItem("vvf_gallery_photos")
    if (storedPhotos) {
      try {
        setPhotos(JSON.parse(storedPhotos))
      } catch (e) {
        setPhotos(initialPhotos)
      }
    } else {
      setPhotos(initialPhotos)
    }
    
    const storedUser = localStorage.getItem("vvf_user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setNewPhotoData(prev => ({ ...prev, author: user.nome }))
    }
  }, [])

  useEffect(() => {
    if (photos.length > 0) {
      localStorage.setItem("vvf_gallery_photos", JSON.stringify(photos))
    }
  }, [photos])

  const filteredPhotos = filter === "Tutti" 
    ? photos 
    : photos.filter(p => p.event === filter)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!uploadedFile) {
      toast({ variant: "destructive", title: "Errore", description: "Seleziona un file prima di caricare." })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url: reader.result as string,
        event: newPhotoData.event,
        author: newPhotoData.author || "Socio Anonimo",
        date: new Date().toISOString().split('T')[0]
      }
      setPhotos([newPhoto, ...photos])
      setIsUploading(false)
      setUploadedFile(null)
      toast({ title: "Foto caricata", description: "La tua foto è stata aggiunta alla galleria!" })
    }
    reader.readAsDataURL(uploadedFile)
  }

  const uniqueEvents = ["Tutti", ...Array.from(new Set(photos.map(p => p.event)))]

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest">Memorie di Strada</Badge>
            <h1 className="text-4xl font-headline font-bold text-foreground flex items-center gap-3">
              <Camera className="w-10 h-10 text-primary" /> Galleria Fotografica
            </h1>
            <p className="text-muted-foreground">Rivivi le emozioni delle nostre uscite ufficiali.</p>
          </div>

          <div className="flex flex-wrap gap-3">
             <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full">
              <Filter className="w-4 h-4 text-accent" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="border-none bg-transparent h-auto p-0 focus:ring-0 text-sm font-bold">
                  <SelectValue placeholder="Filtra per evento" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueEvents.map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isUploading} onOpenChange={setIsUploading}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 gap-2 h-12 px-6 rounded-full shadow-lg shadow-primary/20 font-bold uppercase tracking-tighter">
                   <Plus className="w-5 h-5" /> CARICA FOTO
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-[450px] text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline">Carica Ricordo</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Seleziona File</Label>
                    <Input type="file" accept="image/*" onChange={handleFileChange} className="bg-background cursor-pointer" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Evento / Luogo</Label>
                    <Select value={newPhotoData.event} onValueChange={v => setNewPhotoData({...newPhotoData, event: v})}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Roma">Roma</SelectItem>
                        <SelectItem value="Terminillo">Terminillo</SelectItem>
                        <SelectItem value="Altro">Altro / Raduno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsUploading(false)}>Annulla</Button>
                  <Button onClick={handleUpload} className="bg-primary text-white font-bold">Pubblica in Gallery</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <Card 
              key={photo.id} 
              className="group relative aspect-square overflow-hidden border-border bg-card cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => setSelectedPhoto(photo)}
            >
              <CardContent className="p-0 h-full">
                <Image 
                  src={photo.url} 
                  alt={photo.event} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  unoptimized={photo.url.startsWith('data:') || photo.url.startsWith('http')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-white font-bold text-xs uppercase tracking-tighter">{photo.event}</p>
                      <p className="text-white/70 text-[10px] italic">Foto di {photo.author}</p>
                    </div>
                    <Maximize2 className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredPhotos.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-3xl bg-card/30">
              <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground italic font-medium">Nessuna foto trovata per questo filtro.</p>
            </div>
          )}
        </div>

        {selectedPhoto && (
          <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 flex items-center justify-center overflow-hidden">
              <div className="relative w-full h-full flex flex-col">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="w-8 h-8" />
                </Button>
                
                <div className="relative flex-1 w-full h-full min-h-[70vh]">
                  <Image 
                    src={selectedPhoto.url} 
                    alt={selectedPhoto.event} 
                    fill 
                    className="object-contain" 
                    unoptimized={selectedPhoto.url.startsWith('data:') || selectedPhoto.url.startsWith('http')}
                  />
                </div>
                
                <div className="bg-black/80 backdrop-blur-md p-6 border-t border-white/10">
                  <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-white font-headline font-bold text-2xl uppercase tracking-tighter">{selectedPhoto.event}</h3>
                      <p className="text-white/60 text-sm">Pubblicata il {new Date(selectedPhoto.date).toLocaleDateString('it-IT')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-accent font-bold text-sm uppercase tracking-widest">Autore</p>
                      <p className="text-white text-lg font-medium">{selectedPhoto.author}</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}
