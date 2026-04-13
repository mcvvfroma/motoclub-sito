
"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import sociData from "@/app/lib/soci.json"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulazione controllo credenziali basato su soci.json
    const user = sociData.soci.find(s => s.email.toLowerCase() === email.toLowerCase())

    if (user) {
      // In un'app reale useremmo Firebase Auth o un sistema di sessioni
      // Qui simuliamo salvando i dati dell'utente nel localStorage
      localStorage.setItem("vvf_user", JSON.stringify(user))
      
      toast({
        title: "Accesso effettuato",
        description: `Benvenuto, ${user.nome}!`,
      })
      
      router.push("/")
      router.refresh()
    } else {
      toast({
        variant: "destructive",
        title: "Errore di accesso",
        description: "Email non trovata nel registro soci. Contatta la segreteria.",
      })
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background">
      <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 relative mb-2 drop-shadow-xl">
            <Image 
              src="/logo_motoclub.gif" 
              alt="Logo Motoclub VVF Roma" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-headline font-bold">Area Soci</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Motoclub VVF Roma - Accesso Riservato</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email istituzionale o privata</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nome.cognome@vigilfuoco.it" 
                className="bg-background border-border h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline font-bold">Recupera password</Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                className="bg-background border-border h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Inserisci la tua password"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-white h-14 font-bold text-lg rounded-xl transition-all shadow-lg shadow-primary/30">
              {isLoading ? "Verifica in corso..." : "Entra"}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Non sei ancora dei nostri?{" "}
              <Link href="/register" className="text-accent font-bold hover:underline">Fai domanda di iscrizione</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
