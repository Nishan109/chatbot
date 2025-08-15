"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  RadarIcon,
  Copy,
  Check,
  Laptop,
  ShoppingBag,
  Car,
  Wrench,
  LayoutGrid,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

// Chart types for the main page
const chartTypes = [
  { id: "all", name: "All", icon: BarChart3, color: "text-green-500", bgColor: "bg-green-500/10" },
  { id: "bar", name: "Bar Chart", icon: BarChart3, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "line", name: "Line Chart", icon: LineChart, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { id: "pie", name: "Pie Chart", icon: PieChart, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  { id: "radar", name: "Radar Chart", icon: RadarIcon, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  { id: "scatter", name: "Scatter Plot", icon: ScatterChart, color: "text-pink-500", bgColor: "bg-pink-500/10" },
] as const

// Comparison types for the comparison page
const comparisonTypes = [
  { id: "all", name: "All", icon: LayoutGrid, color: "text-green-500", bgColor: "bg-green-500/10" },
  { id: "technology", name: "Technology", icon: Laptop, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "services", name: "Services", icon: Wrench, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { id: "categories", name: "Categories", icon: ShoppingBag, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  { id: "transportation", name: "Transportation", icon: Car, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
] as const

// Chart prompts for the main page
const chartPrompts = {
  all: [
    "Create a visualization of monthly sales data",
    "Show me a chart of website traffic over time",
    "Generate a radar chart of employee performance metrics",
    "Create a scatter plot of price vs. ratings",
  ],
  bar: [
    "Show monthly revenue by product category",
    "Compare sales across different regions",
    "Display customer satisfaction ratings",
  ],
  line: ["Track stock prices over the past year", "Show daily temperature variations", "Plot user growth trends"],
  pie: [
    "Show market share distribution",
    "Display budget allocation by department",
    "Visualize revenue sources breakdown",
  ],
  radar: [
    "Create a skills assessment radar chart",
    "Show product features comparison",
    "Display team performance metrics",
  ],
  scatter: [
    "Plot price vs. customer ratings",
    "Show correlation between age and income",
    "Analyze marketing spend vs. sales",
  ],
}

// Comparison prompts for the comparison page
const comparisonPrompts = {
  all: [
    "Compare the latest iPhone, Samsung Galaxy, and Google Pixel phones",
    "Compare MacBook Pro, Dell XPS, and ThinkPad X1 laptops",
    "Compare popular wireless earbuds: AirPods Pro, Galaxy Buds, and Sony WF-1000XM4",
  ],
  technology: [
    "Compare the latest iPhone, Samsung Galaxy, and Google Pixel phones",
    "Compare MacBook Pro, Dell XPS, and ThinkPad X1 laptops",
    "Compare popular wireless earbuds: AirPods Pro, Galaxy Buds, and Sony WF-1000XM4",
  ],
  services: [
    "Compare popular cloud services: AWS, Azure, and Google Cloud",
    "Compare streaming services: Netflix, Disney+, and Amazon Prime",
    "Compare food delivery apps: UberEats, DoorDash, and Grubhub",
  ],
  categories: [
    "Compare smartphone features: Camera, Battery Life, and Performance",
    "Compare subscription tiers: Basic, Standard, and Premium",
    "Compare payment methods: Credit Card, Digital Wallet, and Cryptocurrency",
  ],
  transportation: [
    "Compare electric cars: Tesla Model 3, Ford Mustang Mach-E, and Chevrolet Bolt",
    "Compare airline services: Delta, United, and American Airlines",
    "Compare ride-sharing services: Uber, Lyft, and traditional taxis",
  ],
}

interface ExamplePromptsProps {
  onPromptSelect?: (prompt: string) => void
  isComparison?: boolean
}

export function ExamplePrompts({ onPromptSelect, isComparison = false }: ExamplePromptsProps) {
  const [selectedType, setSelectedType] = useState<string>("all")
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [promptIndex, setPromptIndex] = useState(0)
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  // Use appropriate types and prompts based on isComparison
  const types = isComparison ? comparisonTypes : chartTypes
  const prompts = isComparison ? comparisonPrompts : chartPrompts

  useEffect(() => {
    if (selectedType) {
      setIsTyping(true)
      let i = 0
      const prompt = prompts[selectedType as keyof typeof prompts][promptIndex]
      const typingInterval = setInterval(() => {
        if (i < prompt.length) {
          setCurrentPrompt(prompt.slice(0, i + 1))
          i++
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [selectedType, promptIndex, prompts])

  // Auto-rotate prompts
  useEffect(() => {
    if (!isTyping) {
      const rotationInterval = setInterval(() => {
        setPromptIndex((prev) => (prev + 1) % prompts[selectedType as keyof typeof prompts].length)
      }, 10000)

      return () => clearInterval(rotationInterval)
    }
  }, [isTyping, selectedType, prompts])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt)
      setIsCopied(true)
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
        duration: 2000,
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-white font-poppins">
            {isComparison ? "AI-Powered Comparison Generator" : "Try these examples"}
          </h2>
          <p className="text-sm text-zinc-400 font-poppins">
            {isComparison
              ? "Generate detailed comparisons using Gemini AI"
              : "Create beautiful charts with natural language"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <Button
            key={type.id}
            variant={selectedType === type.id ? "secondary" : "outline"}
            className={cn(
              "relative group transition-all duration-200",
              selectedType === type.id
                ? `${type.bgColor} hover:${type.bgColor}/80`
                : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50 hover:text-white",
            )}
            onClick={() => {
              setSelectedType(type.id)
              setPromptIndex(0)
            }}
          >
            <type.icon className={cn("mr-2 h-4 w-4", type.color)} />
            <span className={cn(selectedType === type.id && type.color)}>{type.name}</span>
            {selectedType === type.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-current"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedType + promptIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative p-6 bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
            <p className="text-lg text-zinc-200 min-h-[60px] mb-4 font-poppins">
              {currentPrompt}
              {isTyping && <span className="animate-cursor-blink">|</span>}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "transition-all duration-200 bg-zinc-900/50 border-zinc-800",
                  isCopied ? "text-green-500" : "text-zinc-400 hover:text-white",
                )}
                onClick={copyToClipboard}
                disabled={isTyping}
              >
                <motion.div animate={{ scale: isCopied ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.2 }}>
                  {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                </motion.div>
                Copy prompt
              </Button>
              {onPromptSelect && (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => onPromptSelect(currentPrompt)}
                  disabled={isTyping}
                >
                  Try this example
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
