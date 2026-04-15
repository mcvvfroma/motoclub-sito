
"use client"

import { useState } from "react"
import Image from "next/image"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Camera, Plus, Heart, MessageSquare, Download } from "lucide-react"

const initialPhotos = [
  { id: 1, src: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000", author: "Marco R.", likes: 24, comments: 5 },
  { id: 2, src: "https://images.unsplash.com/photo-1558980394-34764db076b4?q=80&w=1000", author: "Elena S.", likes: 45, comments: 12 },
  { id: 3, src: "https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=1000", author: "Giani V.", likes: 18, comments: 3 },
  { id: 4, src: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000", author: "Luca M.", likes: 32, comments: 8 },
  { id: 5, src: "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?q=80&w=1000", author: "Sofia D.", likes: 12, comments: 1 },
  { id: 6, src: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1000", author: "David K.", likes: 55, comments: 22 },
]

export default function GalleryPage() {
  const [photos] = useState(initialPhotos)

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-headline font-bold mb-2">Galleria del Club</h1>
            <p className="text-muted-foreground">Rivivi i momenti delle nostre passate avventure.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 gap-2 h-12 px-6 rounded-full shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" /> Carica Foto
          </Button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-card cursor-pointer">
              {photo.src && (
                <Image 
                  src={photo.src} 
                  alt={`Foto di ${photo.author}`} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110" 
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-white">
                    {photo.author.charAt(0)}
                  </div>
                  <p className="text-xs font-medium text-white">{photo.author}</p>
                </div>
                
                <div className="flex items-center justify-between text-white/90">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px]">
                      <Heart className="w-3.5 h-3.5" /> {photo.likes}
                    </span>
                    <span className="flex items-center gap-1 text-[10px]">
                      <MessageSquare className="w-3.5 h-3.5" /> {photo.comments}
                    </span>
                  </div>
                  <Download className="w-4 h-4 hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}

          {/* Empty State / Call to action grid cell */}
          <div className="border-2 border-dashed border-muted rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-card/50 hover:bg-card hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Aggiungi ricordi</p>
          </div>
        </div>
      </main>
    </div>
  )
}
