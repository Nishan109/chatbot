"use client"

import { useEffect, useRef } from "react"
import type { Message } from "@/lib/store"
import { cn } from "@/lib/utils"
import { ChartCard } from "@/components/chart-card"
import { DiagramRenderer } from "@/components/diagram-renderer"
import { motion } from "framer-motion"
import { FileAttachment } from "./file-attachment"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (message.type === "diagram" && messageRef.current) {
      const diagramContainer = messageRef.current.querySelector(".mermaid")
      if (diagramContainer) {
        diagramContainer.innerHTML = "" // Clear previous render
      }
    }
  }, [message])

  if (message.type === "chart" && message.chartData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex", isUser ? "justify-end" : "justify-start")}
      >
        <div className="max-w-[80%] space-y-2">
          <div className={cn("px-4 py-2 rounded-lg", isUser ? "bg-green-500 text-white" : "bg-zinc-800 text-white")}>
            {message.content}
          </div>
          <ChartCard
            type={message.chartData.type}
            title={message.chartData.title}
            description={message.chartData.description}
            data={message.chartData.data}
          />
        </div>
      </motion.div>
    )
  }

  if (message.type === "diagram" && message.diagramData) {
    return (
      <motion.div
        ref={messageRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex", isUser ? "justify-end" : "justify-start")}
      >
        <div className="max-w-[90%] w-full space-y-2">
          <div className={cn("px-4 py-2 rounded-lg", isUser ? "bg-green-500 text-white" : "bg-zinc-800 text-white")}>
            {message.content}
          </div>
          <DiagramRenderer
            key={`${message.id}-${message.diagramData.code}`}
            code={message.diagramData.code}
            title={message.diagramData.title}
          />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div className="max-w-[80%] space-y-2">
        <div className={cn("px-4 py-2 rounded-lg", isUser ? "bg-green-500 text-white" : "bg-zinc-800 text-white")}>
          {message.content}
        </div>
        {message.fileAttachment && (
          <FileAttachment
            fileName={message.fileAttachment.name}
            fileType={message.fileAttachment.type}
            onRemove={() => {}} // Read-only in chat history
          />
        )}
      </div>
    </motion.div>
  )
}
