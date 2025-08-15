"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Grid, Laptop, Briefcase, LayoutGrid, Car, Clock, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTypewriter, Cursor } from "react-simple-typewriter"
import { useToast } from "@/components/ui/use-toast"

const categoryPrompts = {
  all: [
    "Compare MacBook Pro, Dell XPS, and ThinkPad X1 laptops",
    "Compare iPhone 15, Samsung S24, and Google Pixel 8",
    "Compare Netflix, Disney+, and Amazon Prime Video streaming services",
  ],
  technology: [
    "Compare gaming consoles: PS5, Xbox Series X, and Nintendo Switch",
    "Compare wireless earbuds: AirPods Pro, Galaxy Buds, and Sony WF-1000XM4",
    "Compare smartwatches: Apple Watch, Galaxy Watch, and Garmin Venu",
  ],
  services: [
    "Compare cloud storage: Google Drive, Dropbox, and OneDrive",
    "Compare food delivery: UberEats, DoorDash, and Grubhub",
    "Compare streaming services: Spotify, Apple Music, and YouTube Music",
  ],
  categories: [
    "Compare operating systems: iOS, Android, and HarmonyOS",
    "Compare programming languages: Python, JavaScript, and Java",
    "Compare browsers: Chrome, Firefox, and Safari",
  ],
  transportation: [
    "Compare electric cars: Tesla Model 3, BMW i4, and Polestar 2",
    "Compare airlines: Emirates, Qatar Airways, and Singapore Airlines",
    "Compare ride-sharing: Uber, Lyft, and traditional taxis",
  ],
}

const categories = [
  {
    id: "all",
    label: "All",
    icon: Grid,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "technology",
    label: "Technology",
    icon: Laptop,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "services",
    label: "Services",
    icon: Briefcase,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "categories",
    label: "Categories",
    icon: LayoutGrid,
    color: "from-orange-500 to-yellow-500",
  },
  {
    id: "transportation",
    label: "Transportation",
    icon: Car,
    color: "from-red-500 to-rose-500",
  },
]

export function ComparisonSidebar({ onPromptChange }: { onPromptChange: (prompt: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [promptIndex, setPromptIndex] = useState(0)
  const { toast } = useToast()

  const currentPrompts = categoryPrompts[selectedCategory as keyof typeof categoryPrompts]
  const currentPrompt = currentPrompts[promptIndex]

  // Typewriter effect for the current prompt
  const [text] = useTypewriter({
    words: [currentPrompt],
    loop: 1,
    typeSpeed: 40,
    deleteSpeed: 20,
    delaySpeed: 1000,
    key: `${selectedCategory}-${promptIndex}`, // Add key to force reset
  })

  // Update main form prompt when current prompt changes
  useEffect(() => {
    if (currentPrompt) {
      onPromptChange(currentPrompt)
    }
  }, [currentPrompt, onPromptChange])

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId)
      setPromptIndex(0) // Reset prompt index when changing category
      // Force immediate prompt update
      const newPrompt = categoryPrompts[categoryId as keyof typeof categoryPrompts][0]
      onPromptChange(newPrompt)
    }
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt)
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="fixed left-0 w-[300px] h-[calc(100vh-4rem)] border-r border-zinc-800 bg-black/50 backdrop-blur-sm">
      <div className="p-4 space-y-6">
        {/* Categories */}
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id
            return (
              <motion.div
                key={category.id}
                initial={false}
                animate={{ scale: isSelected ? 1 : 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={isSelected ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2 text-zinc-400 hover:text-white transition-all relative",
                    isSelected && `bg-gradient-to-r ${category.color} bg-opacity-20 text-white`,
                    "group overflow-hidden",
                  )}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <Icon className={cn("h-4 w-4 transition-colors", isSelected && "text-white")} />
                  {category.label}
                  {isSelected && (
                    <motion.div
                      className={cn("absolute inset-0 opacity-20 bg-gradient-to-r", category.color)}
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />
                  )}
                </Button>
              </motion.div>
            )
          })}
        </div>

        {/* Example Prompts with Typing Animation */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-400">Example Prompts</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-400 hover:text-white"
                onClick={handleCopyPrompt}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-black/50 p-3 min-h-[80px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedCategory}-${promptIndex}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-zinc-400"
                >
                  {text}
                  <Cursor cursorStyle="|" />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex justify-center mt-2">
              <div className="flex gap-1">
                {currentPrompts.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      promptIndex === index ? "bg-white" : "bg-zinc-600",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Comparisons */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock className="h-4 w-4" />
              <h3 className="text-sm font-medium">Recent Comparisons</h3>
            </div>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="rounded-lg border border-zinc-800 bg-black/50 p-4 text-center"
              >
                <p className="text-sm text-zinc-500">
                  No saved comparisons yet. Generate some comparisons to see them here.
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  )
}
