"use client"

import { useRef, useEffect, useState } from "react"
import { type Message, useConversationStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { generateResponse } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { X, Upload } from "lucide-react"

declare global {
  interface Crypto {
    randomUUID: () => string
  }
}

interface ChatProps {
  isChartCreationMode: boolean
  onExitChartMode: () => void
}

export function Chat({ isChartCreationMode, onExitChartMode }: ChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const store = useConversationStore()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const currentConversation = store.conversations?.find((c) => c.id === store.currentConversationId) || null
  const currentMessages = currentConversation?.messages ?? []

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentMessages.length])

  useEffect(() => {
    const initializeStore = async () => {
      if (store.conversations.length === 0) {
        try {
          await store.loadConversations()
        } catch (error) {
          console.error("Failed to initialize store:", error)
          toast({
            title: "Error",
            description: "Failed to load conversations. Please try again.",
            variant: "destructive",
          })
        }
      }
    }

    initializeStore()
  }, [store, toast])

  const handleSend = async (content: string, chartType?: string) => {
    if (!store.currentConversationId) {
      toast({
        title: "Error",
        description: "No active conversation. Please start a new chat.",
        variant: "destructive",
      })
      return
    }

    if (!content?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        content,
        type: "text",
        role: "user",
        createdAt: new Date(),
      }
      await store.addMessage(store.currentConversationId, userMessage)

      // Generate response
      const response = await generateResponse(content, chartType)

      if (!response) {
        throw new Error("No response received from AI")
      }

      // Create assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: response.type === "text" ? response.content : `Here's your ${response.chartType} chart:`,
        type: response.type,
        role: "assistant",
        createdAt: new Date(),
        ...(response.type === "chart" && {
          chartData: {
            type: response.chartType,
            title: response.title,
            description: response.description || "",
            data: response.data,
            ...(response.chartType === "scatter" && {
              xAxisLabel: response.xAxisLabel,
              yAxisLabel: response.yAxisLabel,
            }),
          },
        }),
        ...(response.type === "diagram" && {
          diagramData: {
            type: response.diagramType,
            title: response.title,
            code: response.code,
          },
        }),
      }

      await store.addMessage(store.currentConversationId, assistantMessage)
    } catch (error) {
      console.error("Error in handleSend:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      })

      // Add error message to the conversation
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content:
          error instanceof Error
            ? error.message
            : "I apologize, but I encountered an error while processing your request.",
        type: "text",
        role: "assistant",
        createdAt: new Date(),
      }

      try {
        await store.addMessage(store.currentConversationId, errorMessage)
      } catch (e) {
        console.error("Failed to add error message to conversation:", e)
      }

      // Show toast with user-friendly error message
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate response. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = async () => {
    try {
      const id = await store.addConversation("New Conversation")
      store.setCurrentConversationId(id)
      store.setIsHomeView(false)
    } catch (error) {
      console.error("Failed to create new conversation:", error)
      toast({
        title: "Error",
        description: "Failed to create a new conversation. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <AnimatePresence>
        {isChartCreationMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-between items-center mb-4 px-4 py-2 bg-zinc-900/50 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Chart Creation</h2>
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={onExitChartMode}>
              <X className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {currentConversation && (
        <>
          <div className="bg-zinc-900 p-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">{currentConversation.title}</h2>
          </div>
          <Card className="flex-1 border-0 bg-zinc-950 rounded-none sm:rounded-lg overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-4 p-4"
              >
                {currentMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ChatMessage message={message} />
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 items-center text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={scrollRef} />
              </motion.div>
            </div>
            <ChatInput onSend={handleSend} isLoading={isLoading} />
          </Card>
        </>
      )}
      {!currentConversation && (
        <div className="flex items-center justify-center h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={handleNewChat}
              className="bg-green-500 hover:bg-green-600 text-white font-medium shadow-lg transition-all duration-200"
            >
              Start New Chat
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
