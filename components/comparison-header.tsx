"use client"

import Link from "next/link"
import { BarChart3, Home, Info, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function ComparisonHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/50 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-500" />
          <span className="text-xl font-semibold text-white">Chart Bot</span>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
            <span className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </span>
          </Link>
          <Link href="/about" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              About
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-zinc-400 hover:text-white"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
