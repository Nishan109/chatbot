"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Users2, LineChart, BarChart2, PieChart } from "lucide-react"

const stats = [
  {
    icon: Users2,
    value: "10K+",
    label: "Active Users",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: LineChart,
    value: "50K+",
    label: "Comparisons Made",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: BarChart2,
    value: "100+",
    label: "Chart Types",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: PieChart,
    value: "99%",
    label: "Accuracy Rate",
    color: "from-orange-500 to-yellow-500",
  },
]

export function ComparisonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="p-6 bg-black/50 backdrop-blur-sm border-zinc-800/50 hover:border-green-500/20 transition-all duration-300">
            <div className="space-y-4">
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl inline-block`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
