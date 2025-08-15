"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3 } from "lucide-react"

interface ChartPreviewProps {
  chartType: string
  className?: string
}

export function ChartPreview({ chartType, className }: ChartPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(true)

  useEffect(() => {
    // Simulate chart generation
    const timer = setTimeout(() => {
      setIsGenerating(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [chartType])

  useEffect(() => {
    if (chartType) {
      setIsGenerating(true)
      const timer = setTimeout(() => {
        setIsGenerating(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [chartType])

  const renderChartPlaceholder = () => {
    switch (chartType) {
      case "bar":
        return (
          <div className="flex flex-col items-center justify-end h-full w-full space-y-2">
            <div className="flex items-end space-x-4 h-full w-full justify-center">
              {[0.6, 0.8, 0.4, 0.9, 0.5, 0.7].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="w-8 bg-gradient-to-t from-green-600 to-green-400 rounded-t-md"
                />
              ))}
            </div>
            <div className="h-px w-full bg-zinc-700" />
          </div>
        )
      case "line":
        return (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <motion.path
                d="M0,40 C20,35 40,10 60,25 S80,40 100,20"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2 }}
              />
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )
      case "pie":
        return (
          <div className="flex items-center justify-center h-full w-full">
            <svg viewBox="0 0 100 100" className="w-3/4 h-3/4">
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#059669"
                strokeWidth="20"
                strokeDasharray="251.2"
                strokeDashoffset="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 62.8 }}
                transition={{ duration: 1 }}
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="20"
                strokeDasharray="251.2"
                strokeDashoffset="188.4"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 188.4 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#34d399"
                strokeWidth="20"
                strokeDasharray="251.2"
                strokeDashoffset="62.8"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1, delay: 1 }}
              />
            </svg>
          </div>
        )
      case "radar":
        return (
          <div className="flex items-center justify-center h-full w-full">
            <svg viewBox="0 0 100 100" className="w-3/4 h-3/4">
              <motion.polygon
                points="50,10 90,50 50,90 10,50"
                fill="rgba(16, 185, 129, 0.2)"
                stroke="#10b981"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
              />
              <motion.circle
                cx="50"
                cy="10"
                r="3"
                fill="#10b981"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              />
              <motion.circle
                cx="90"
                cy="50"
                r="3"
                fill="#10b981"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
              />
              <motion.circle
                cx="50"
                cy="90"
                r="3"
                fill="#10b981"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 }}
              />
              <motion.circle
                cx="10"
                cy="50"
                r="3"
                fill="#10b981"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
              />
            </svg>
          </div>
        )
      case "scatter":
        return (
          <div className="flex items-center justify-center h-full w-full">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {[
                [20, 30],
                [30, 70],
                [40, 40],
                [50, 20],
                [60, 50],
                [70, 30],
                [80, 60],
              ].map(([x, y], i) => (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#10b981"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              ))}
              <motion.line
                x1="10"
                y1="90"
                x2="90"
                y2="90"
                stroke="#666"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />
              <motion.line
                x1="10"
                y1="90"
                x2="10"
                y2="10"
                stroke="#666"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />
            </svg>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <BarChart3 className="h-24 w-24 text-green-500 opacity-50" />
          </div>
        )
    }
  }

  return (
    <div className={className}>
      <div className="relative bg-zinc-800/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-700 shadow-2xl h-full">
        <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          AI-Powered
        </div>

        <div className="h-[300px] md:h-[400px] rounded-lg bg-zinc-900 flex items-center justify-center overflow-hidden">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full"
              />
              <p className="text-zinc-400 text-sm">Generating chart...</p>
            </div>
          ) : (
            renderChartPlaceholder()
          )}
        </div>

        <div className="mt-4 flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
          <p className="text-zinc-300 text-sm">
            {isGenerating ? "Chart generation in progress..." : "Chart generated successfully"}
          </p>
        </div>
      </div>
    </div>
  )
}
