
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Home, Calendar, Image as ImageIcon, FileText, User, Users, ShieldAlert, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile } = useSidebar()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("vvf_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("vvf_user")
    setUser(null)
    setOpenMobile(false)
    router.push("/login")
  }

  if (pathname === "/login" || pathname === "/register") return null

  const isAdmin = user?.status === "admin"

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Eventi", href: "/events", icon: Calendar },
    ...(isAdmin ? [{ name: "Soci", href: "/members", icon: Users }] : []),
    { name: "Galleria", href: "/gallery", icon: ImageIcon },
    { name: "Convenzioni", href: "/conventions", icon: FileText },
  ]

  return (
    <Sidebar side="left" collapsible="offcanvas" className="border-r border-border bg-card">
      <SidebarHeader className="border-b border-border p-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpenMobile(false)}>
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
            <span className="font-headline font-bold text-lg leading-none tracking-tight text-foreground">Motoclub VVF</span>
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Roma</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  className="h-12 text-base font-medium transition-colors hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
                >
                  <Link href={item.href} onClick={() => setOpenMobile(false)}>
                    <Icon className="mr-3 h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
          
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === "/members"}
                className="h-12 text-base font-medium transition-colors border-t border-border mt-2 pt-4 hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
              >
                <Link href="/members" onClick={() => setOpenMobile(false)}>
                  <ShieldAlert className="mr-3 h-5 w-5 text-primary" />
                  <span className="font-bold">Anagrafica Soci</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4">
        {user ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground p-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <User className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="truncate">{user.nome}</span>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="justify-start gap-3 h-10 text-muted-foreground hover:text-destructive text-sm font-medium">
              <LogOut className="w-4 h-4" />
              <span>Esci</span>
            </Button>
          </div>
        ) : (
          <Link 
            href="/login" 
            className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors p-2"
            onClick={() => setOpenMobile(false)}
          >
            <User className="w-5 h-5" />
            <span>Accedi</span>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
