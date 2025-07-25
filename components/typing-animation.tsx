"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, BarChart3, LineChart, PieChart, RadarIcon, ScatterChart } from "lucide-react"
import { cn } from "@/lib/utils"

interface TypingAnimationProps {
  className?: string
}

export function TypingAnimation({ className }: TypingAnimationProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [currentChartType, setCurrentChartType] = useState<string>("bar")

  const prompts = [
    { text: "Create a bar chart showing monthly sales data for 2023", type: "bar" },
    { text: "Generate a line chart of website traffic over the past year", type: "line" },
    { text: "Show me a pie chart of budget allocation by department", type: "pie" },
    { text: "Create a radar chart comparing product features across competitors", type: "radar" },
    { text: "Plot customer satisfaction vs. price in a scatter plot", type: "scatter" },
  ]

  const typingSpeed = 50 // milliseconds per character
  const pauseDuration = 2000 // pause after typing completes
  const deletionSpeed = 20 // milliseconds per character when deleting

  useEffect(() => {
    const currentPrompt = prompts[currentPromptIndex].text

    if (isTyping) {
      if (displayedText.length < currentPrompt.length) {
        // Still typing the current prompt
        const timeoutId = setTimeout(() => {
          setDisplayedText(currentPrompt.slice(0, displayedText.length + 1))
        }, typingSpeed)
        return () => clearTimeout(timeoutId)
      } else {
        // Finished typing, pause before deleting
        setIsTyping(false)
        const timeoutId = setTimeout(() => {
          setIsTyping(false)
        }, pauseDuration)
        return () => clearTimeout(timeoutId)
      }
    } else {
      if (displayedText.length === 0) {
        // Move to the next prompt
        const nextIndex = (currentPromptIndex + 1) % prompts.length
        setCurrentPromptIndex(nextIndex)
        setCurrentChartType(prompts[nextIndex].type)
        setIsTyping(true)
      } else {
        // Deleting the current prompt
        const timeoutId = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1))
        }, deletionSpeed)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [displayedText, isTyping, currentPromptIndex, prompts])

  const getChartIcon = () => {
    switch (currentChartType) {
      case "bar":
        return <BarChart3 className="h-5 w-5 text-green-500" />
      case "line":
        return <LineChart className="h-5 w-5 text-green-500" />
      case "pie":
        return <PieChart className="h-5 w-5 text-green-500" />
      case "radar":
        return <RadarIcon className="h-5 w-5 text-green-500" />
      case "scatter":
        return <ScatterChart className="h-5 w-5 text-green-500" />
      default:
        return <BarChart3 className="h-5 w-5 text-green-500" />
    }
  }

  return (
    <div className={cn("bg-zinc-900/70 backdrop-blur-sm rounded-xl border border-zinc-800 p-6", className)}>
      <div className="flex items-center space-x-2 mb-2">
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <p className="text-sm text-zinc-400">Try these examples</p>
      </div>

      <div className="flex items-start space-x-3 min-h-[120px]">
        <div className="mt-1 flex-shrink-0">
          <ChevronRight className="h-5 w-5 text-green-500" />
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            {getChartIcon()}
            <span className="text-sm font-medium text-zinc-300">
              {currentChartType.charAt(0).toUpperCase() + currentChartType.slice(1)} Chart
            </span>
          </div>

          <div className="font-mono text-lg text-white">
            {displayedText}
            <span className="inline-block w-2 h-5 bg-green-500 ml-1 animate-pulse"></span>
          </div>

          <AnimatePresence>
            {!isTyping && displayedText.length === prompts[currentPromptIndex].text.length && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mt-4 flex justify-end"
              >
                <div className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded">Press Enter to generate</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
