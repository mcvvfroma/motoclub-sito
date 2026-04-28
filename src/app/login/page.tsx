'use client';

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // Impedisce il ricaricamento della pagina al submit del form
    console.log("Tentativo di accesso...");
    // In una vera app, qui ci sarebbe la logica di autenticazione.
    // Per ora, simuliamo il successo e reindirizziamo alla home.
    router.push('/');
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-sm p-4">
        <div className="flex flex-col items-center text-center mb-6">
            <Image 
              src="/logo_motoclub.gif"
              alt="Logo Motoclub VVF Roma"
              width={80}
              height={80}
              className="h-20 w-20 mb-4 rounded-md"
            />
            <h1 className="text-2xl font-semibold tracking-tight">Accesso Riservato</h1>
            <p className="text-sm text-muted-foreground">Inserisci le tue credenziali per entrare</p>
        </div>
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="mario.rossi@vvf.it"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">Accedi</Button>
        </form>
      </div>
    </div>
  );
}
