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

  // Slower typing speed for a more professional look
  const typingSpeed = 80 // milliseconds per character (increased from 50)
  const pauseDuration = 3000 // pause after typing completes (increased from 2000)
  const deletionSpeed = 30 // milliseconds per character when deleting (increased from 20)

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
        return <BarChart3 className="h-5 w-5 text-emerald-500" />
      case "line":
        return <LineChart className="h-5 w-5 text-emerald-500" />
      case "pie":
        return <PieChart className="h-5 w-5 text-emerald-500" />
      case "radar":
        return <RadarIcon className="h-5 w-5 text-emerald-500" />
      case "scatter":
        return <ScatterChart className="h-5 w-5 text-emerald-500" />
      default:
        return <BarChart3 className="h-5 w-5 text-emerald-500" />
    }
  }

  return (
    <div
      className={cn(
        "bg-zinc-900/80 backdrop-blur-lg rounded-xl border border-zinc-800/80 p-6 shadow-xl",
        "transition-all duration-300 hover:border-emerald-800/50 hover:shadow-emerald-900/10",
        className,
      )}
    >
      <div className="flex items-center space-x-2 mb-3">
        <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
        <p className="text-sm text-zinc-400 font-poppins">Try these examples</p>
      </div>

      <div className="flex items-start space-x-3 min-h-[120px]">
        <div className="mt-1 flex-shrink-0">
          <ChevronRight className="h-5 w-5 text-emerald-500" />
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {getChartIcon()}
            </motion.div>
            <span className="text-sm font-medium text-zinc-300 font-poppins">
              {currentChartType.charAt(0).toUpperCase() + currentChartType.slice(1)} Chart
            </span>
          </div>

          <div className="font-poppins text-lg text-white leading-relaxed">
            {displayedText}
            <span className="inline-block w-[2px] h-5 bg-emerald-500 ml-1 animate-pulse"></span>
          </div>

          <AnimatePresence>
            {!isTyping && displayedText.length === prompts[currentPromptIndex].text.length && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-4 flex justify-end"
              >
                <div className="bg-zinc-800/80 text-zinc-300 text-xs px-3 py-1.5 rounded-full font-poppins border border-zinc-700/50 shadow-inner">
                  Press Enter to generate
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
