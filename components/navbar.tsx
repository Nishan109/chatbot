"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { BarChart3, Home } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"
import { useAuth } from "@/components/auth-context"
import { useRouter } from "next/navigation"
import { useConversationStore } from "@/lib/store"

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { setIsHomeView, setCurrentConversationId } = useConversationStore()

  const handleHomeClick = () => {
    setIsHomeView(true)
    setCurrentConversationId(null)
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center">
        <MobileNav />
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BarChart3 className="h-6 w-6 text-green-500" />
          <span className="hidden sm:inline-block">Chart Bot</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleHomeClick}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          {user && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
          )}
          <Link href="/about" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              About
            </Button>
          </Link>
          <ModeToggle />
          {user && (
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
