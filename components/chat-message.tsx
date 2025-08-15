"use client"

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { User, Bot } from "lucide-react"
import { ChartCard } from "./chart-card"
import { DiagramRenderer } from "./diagram-renderer"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  type: "text" | "chart" | "diagram"
  chart_data?: any
  diagram_data?: any
  file_attachment?: any
  created_at: string
  chartData?: {
    type: string
    title: string
    description: string
    data: any[]
    xAxisLabel?: string
    yAxisLabel?: string
  }
  diagramData?: {
    type: string
    title: string
    code: string
  }
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  console.log("ChatMessage rendering:", {
    id: message.id,
    type: message.type,
    role: message.role,
    content: message.content,
    chartData: message.chartData || message.chart_data,
  })

  // Parse chart data if it exists
  let chartData = message.chartData
  if (!chartData && message.chart_data) {
    try {
      chartData = typeof message.chart_data === "string" ? JSON.parse(message.chart_data) : message.chart_data
    } catch (e) {
      console.error("Error parsing chart_data:", e)
    }
  }

  // Parse diagram data if it exists
  let diagramData = message.diagramData
  if (!diagramData && message.diagram_data) {
    try {
      diagramData = typeof message.diagram_data === "string" ? JSON.parse(message.diagram_data) : message.diagram_data
    } catch (e) {
      console.error("Error parsing diagram_data:", e)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
        {message.type === "text" && (
          <Card className={`p-4 ${isUser ? "bg-green-500 text-white ml-auto" : "bg-muted text-muted-foreground"}`}>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </Card>
        )}

        {(message.type === "chart" || chartData) && (
          <div className="space-y-2">
            {message.content && (
              <Card className="p-3 bg-muted text-muted-foreground">
                <p className="text-sm">{message.content}</p>
              </Card>
            )}
            {chartData && (
              <ChartCard
                title={chartData.title || "Chart"}
                description={chartData.description || "Data visualization"}
                type={chartData.type || "bar"}
                data={chartData.data || []}
                xAxisLabel={chartData.xAxisLabel}
                yAxisLabel={chartData.yAxisLabel}
              />
            )}
          </div>
        )}

        {(message.type === "diagram" || diagramData) && (
          <div className="space-y-2">
            {message.content && (
              <Card className="p-3 bg-muted text-muted-foreground">
                <p className="text-sm">{message.content}</p>
              </Card>
            )}
            {diagramData && (
              <DiagramRenderer
                title={diagramData.title || "Diagram"}
                type={diagramData.type || "flowchart"}
                code={diagramData.code || ""}
              />
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  )
}
