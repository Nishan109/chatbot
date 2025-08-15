"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import {
  Bot,
  BarChart,
  Share2,
  History,
  Download,
  Table,
  Grid,
  LineChart,
  PieChart,
  FileJson,
  Sparkles,
  Zap,
} from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI-Powered Analysis",
    description: "Generate detailed comparisons using advanced AI technology",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart,
    title: "Multiple Chart Types",
    description: "Visualize data with bar, line, and pie charts",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share your comparisons with team members instantly",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: History,
    title: "History Tracking",
    description: "Keep track of all your previous comparisons",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: Download,
    title: "Export Options",
    description: "Download your comparisons in multiple formats",
    color: "from-red-500 to-rose-500",
  },
  {
    icon: Table,
    title: "Table View",
    description: "View your data in a clean, organized table format",
    color: "from-teal-500 to-green-500",
  },
  {
    icon: Grid,
    title: "Grid Layout",
    description: "Compare items side by side in a grid layout",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: FileJson,
    title: "JSON Export",
    description: "Export your data in JSON format for further analysis",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Sparkles,
    title: "Smart Suggestions",
    description: "Get intelligent suggestions for better comparisons",
    color: "from-amber-500 to-yellow-500",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "See changes and updates in real-time",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: LineChart,
    title: "Trend Analysis",
    description: "Analyze trends and patterns in your data",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: PieChart,
    title: "Distribution View",
    description: "Visualize data distribution with pie charts",
    color: "from-violet-500 to-purple-500",
  },
]

export function ComparisonFeatures() {
  return (
    <div className="py-12">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-center mb-12"
      >
        Powerful Features
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 bg-black/50 backdrop-blur-sm border-zinc-800/50 hover:border-green-500/20 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className={`bg-gradient-to-br ${feature.color} p-3 rounded-xl`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
