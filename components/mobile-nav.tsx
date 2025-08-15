"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSwipe } from "@/hooks/use-swipe"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  useSwipe({
    onSwipeLeft: () => setIsOpen(false),
    onSwipeRight: () => setIsOpen(true),
  })

  // Close sidebar on route change
  useEffect(() => {
    const handleRouteChange = () => setIsOpen(false)
    window.addEventListener("popstate", handleRouteChange)
    return () => window.removeEventListener("popstate", handleRouteChange)
  }, [])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2 hover:bg-accent active:bg-accent/70 transition-colors duration-200"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[80%] max-w-[400px] h-[100dvh] border-r border-gray-800">
        <AnimatePresence>
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="h-full"
          >
            <Sidebar className="border-r-0" closeMobileNav={() => setIsOpen(false)} />
          </motion.div>
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  )
}
