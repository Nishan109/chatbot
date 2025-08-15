"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Monitor } from "lucide-react"

export function MobileDesktopPrompt() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      setIsOpen(isMobile)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleEnableDesktopView = () => {
    alert(
      "To enable desktop view:\n1. Open your browser's settings\n2. Find 'Request Desktop Site' or similar option\n3. Enable it for this website",
    )
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enable Desktop View</DialogTitle>
          <DialogDescription>
            For the best experience with Chart Bot, we recommend using the desktop view on your mobile device.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <Monitor className="h-16 w-16 text-primary" />
          <Button onClick={handleEnableDesktopView}>How to Enable Desktop View</Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Continue with Mobile View
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
