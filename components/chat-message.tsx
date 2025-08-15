"use client"

import type { Message } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { User, Bot } from "lucide-react"
import { ChartCard } from "./chart-card"
import { DiagramRenderer } from "./diagram-renderer"

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
    chartData: message.chartData,
  })

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
          <Card
            className={`p-4 ${
              isUser ? "bg-green-500 text-white ml-auto" : "bg-zinc-800 text-gray-100 border-zinc-700"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </Card>
        )}

        {message.type === "chart" && message.chartData && (
          <div className="space-y-2">
            {message.content && (
              <Card className="p-3 bg-zinc-800 text-gray-100 border-zinc-700">
                <p className="text-sm">{message.content}</p>
              </Card>
            )}
            <ChartCard
              title={message.chartData.title}
              description={message.chartData.description}
              type={message.chartData.type}
              data={message.chartData.data}
              xAxisLabel={message.chartData.xAxisLabel}
              yAxisLabel={message.chartData.yAxisLabel}
            />
          </div>
        )}

        {message.type === "diagram" && message.diagramData && (
          <div className="space-y-2">
            {message.content && (
              <Card className="p-3 bg-zinc-800 text-gray-100 border-zinc-700">
                <p className="text-sm">{message.content}</p>
              </Card>
            )}
            <DiagramRenderer
              title={message.diagramData.title}
              type={message.diagramData.type}
              code={message.diagramData.code}
            />
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
