"use client"

import { useState } from "react"

import { motion } from "framer-motion"
import { AIComparisonForm } from "@/components/ai-comparison-form"
import { ExamplePrompts } from "@/components/example-prompts"
import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown } from "lucide-react"

export default function ComparisonPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      if (!pageRef.current) return

      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const fullHeight = document.documentElement.scrollHeight

      // Hide indicator when user has scrolled a bit
      if (scrollPosition > windowHeight * 0.1) {
        setShowScrollIndicator(false)
      } else {
        setShowScrollIndicator(true)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen bg-black" ref={pageRef}>
      {/* Background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/10 via-black to-black pointer-events-none" />

      {/* Main content */}
      <ScrollArea className="h-screen w-full">
        <div className="relative pt-16 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4"
          >
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Header section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">AI-Powered Comparison Generator</h1>
                <p className="text-zinc-400 text-lg">Generate detailed comparisons using Gemini AI</p>
              </div>

              {/* Example prompts section */}
              <div className="mb-12">
                <ExamplePrompts isComparison={true} />
              </div>

              {/* Comparison form section */}
              <div className="relative">
                <AIComparisonForm />
              </div>
            </div>
          </motion.div>
        </div>
      </ScrollArea>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{
          opacity: showScrollIndicator ? 1 : 0,
          y: showScrollIndicator ? 0 : 20,
        }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <p className="text-zinc-400 text-sm">Scroll to explore</p>
        <ChevronDown className="w-6 h-6 text-zinc-400 animate-bounce" />
      </motion.div>

      {/* Scroll to top button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: !showScrollIndicator ? 1 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-zinc-800/80 hover:bg-zinc-700 text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-colors"
      >
        <ChevronDown className="w-6 h-6 transform rotate-180" />
      </motion.button>
    </div>
  )
}
