
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, Image as ImageIcon, FileText, User, Home, Menu, Users, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toggleSidebar } = useSidebar()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("vvf_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        setUser(null)
      }
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("vvf_user")
    setUser(null)
    router.push("/login")
  }

  if (pathname === "/login" || pathname === "/register") return null

  const isAdmin = user?.status === "admin"

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Eventi", href: "/events", icon: Calendar },
    ...(isAdmin ? [{ name: "Soci", href: "/members", icon: Users }] : []),
    { name: "Galleria", href: "/galleria", icon: ImageIcon },
    { name: "Convenzioni", href: "/conventions", icon: FileText },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-card/80 backdrop-blur-lg border-b border-border h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-accent hover:bg-white/10"
          >
            <Menu className="w-8 h-8" />
            <span className="sr-only">Apri menu</span>
          </Button>
        </div>

        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-12 h-12">
            <Image 
              src="/logo_motoclub.gif" 
              alt="Logo Motoclub VVF Roma" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-lg leading-none tracking-tight text-foreground">Motoclub VVF</span>
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Roma</span>
          </div>
        </Link>

        <div className="hidden md:flex flex-1 justify-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded-md transition-colors",
                  isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="text-xs font-medium text-muted-foreground">{user.nome}</span>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-primary">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link href="/login" className="text-xs font-medium hover:text-primary transition-colors text-muted-foreground">
              Login
            </Link>
          )}
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <User className="w-4 h-4 text-accent-foreground" />
          </div>
        </div>

        <div className="flex md:hidden w-10" />
      </div>
    </nav>
  )
}
