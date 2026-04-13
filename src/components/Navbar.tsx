
"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Calendar, Image as ImageIcon, FileText, User, Home, Menu, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Eventi", href: "/events", icon: Calendar },
  { name: "Soci", href: "/members", icon: Users },
  { name: "Galleria", href: "/gallery", icon: ImageIcon },
  { name: "Convenzioni", href: "/conventions", icon: FileText },
]

export function Navbar() {
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()

  if (pathname === "/login" || pathname === "/register") return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-card/80 backdrop-blur-lg border-b border-border h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Mobile: Hamburger Button */}
        <div className="flex md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-[#FFD700] hover:bg-white/10"
          >
            <Menu className="w-8 h-8" />
            <span className="sr-only">Apri menu</span>
          </Button>
        </div>

        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <Image 
              src="/logo_motoclub.gif" 
              alt="Logo Motoclub VVF Roma" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-lg leading-none tracking-tight">Motoclub VVF</span>
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Roma</span>
          </div>
        </Link>

        {/* Desktop: Navigation Links */}
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

        {/* User Area */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-xs font-medium hover:text-primary transition-colors text-muted-foreground">
            Logout
          </Link>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <User className="w-4 h-4 text-accent-foreground" />
          </div>
        </div>

        {/* Mobile Spacer (to keep logo centered or balanced) */}
        <div className="flex md:hidden w-10" />
      </div>
    </nav>
  )
}
