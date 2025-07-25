import "@/styles/globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { inter } from "@/lib/fonts"
import type React from "react"
import { AnimatedBackground } from "@/components/animated-background"
import { AuthProvider } from "@/components/auth-context"
import { MobileDesktopPrompt } from "@/components/mobile-desktop-prompt"
import { BackToTop } from "@/components/back-to-top"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark", inter.variable)}>
      <body className={cn(inter.className, "bg-black text-gray-100 min-h-screen")}>
        <AnimatedBackground />
        <ThemeProvider>
          <AuthProvider>
            <div className="flex flex-col h-screen">
              <Navbar />
              <main className="flex-1 overflow-hidden">{children}</main>
            </div>
            <Toaster />
            <MobileDesktopPrompt />
            <BackToTop />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
