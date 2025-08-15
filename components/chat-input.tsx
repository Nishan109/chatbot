"use client"

import type React from "react"

import { useState, useRef, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip } from "lucide-react"
import { motion } from "framer-motion"

interface ChatInputProps {
  onSend: (message: string, chartType?: string) => void
  isLoading: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      console.log("ChatInput submitting message:", message)
      onSend(message.trim())
      setMessage("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-gray-800 bg-zinc-900 p-4"
    >
      <div className="flex gap-2 items-end">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white flex-shrink-0"
          disabled={isLoading}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            className="min-h-[44px] max-h-32 resize-none bg-zinc-800 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
            disabled={isLoading}
            rows={1}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          className="bg-green-500 hover:bg-green-600 text-white flex-shrink-0"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {isLoading && (
        <div className="mt-2 text-sm text-gray-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Generating response...
        </div>
      )}
    </motion.div>
  )
}
