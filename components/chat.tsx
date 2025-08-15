"use client"

import { useEffect, useState } from "react"
import { useConversationStore } from "@/lib/store"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { createChat } from "@/app/actions"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  type: "text" | "chart" | "diagram"
  chart_data?: any
  diagram_data?: any
  file_attachment?: any
  created_at: string
}

export function Chat() {
  const { user } = useAuth()
  const {
    messages = [],
    currentConversationId,
    isLoading,
    loadMessages,
    loadConversations,
    addMessage,
  } = useConversationStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  console.log("Chat component render:", {
    messagesCount: messages?.length || 0,
    currentConversationId,
    isLoading,
    userId: user?.id,
    messages: messages || [],
  })

  useEffect(() => {
    if (user?.id) {
      console.log("Loading conversations for user:", user.id)
      loadConversations(user.id)
    }
  }, [user?.id, loadConversations])

  useEffect(() => {
    if (currentConversationId && user?.id) {
      console.log("Loading messages for conversation:", currentConversationId)
      loadMessages(currentConversationId, user.id)
    }
  }, [currentConversationId, user?.id, loadMessages])

  const handleSendMessage = async (message: string) => {
    if (!user?.id || isSubmitting) {
      console.log("Cannot send message:", { userId: user?.id, isSubmitting })
      return
    }

    console.log("Sending message:", message)
    setIsSubmitting(true)

    try {
      // Add user message to local state immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        content: message,
        role: "user",
        type: "text",
        created_at: new Date().toISOString(),
      }

      addMessage(userMessage)

      // Create chat via server action
      const result = await createChat(message, user.id)

      console.log("Chat creation result:", result)

      if (result.success) {
        // Add assistant message to local state
        const assistantMessage: Message = {
          id: `temp-assistant-${Date.now()}`,
          content: result.message || "",
          role: "assistant",
          type: result.type || "text",
          chart_data: result.chartData,
          created_at: new Date().toISOString(),
        }

        addMessage(assistantMessage)

        // Reload conversations and messages to sync with database
        if (result.conversationId) {
          await loadConversations(user.id)
          await loadMessages(result.conversationId, user.id)
        }
      } else {
        console.error("Failed to create chat:", result.error)
        // Add error message
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content: `Error: ${result.error}`,
          role: "assistant",
          type: "text",
          created_at: new Date().toISOString(),
        }
        addMessage(errorMessage)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Sorry, there was an error processing your request. Please try again.",
        role: "assistant",
        type: "text",
        created_at: new Date().toISOString(),
      }
      addMessage(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefresh = () => {
    if (user?.id) {
      loadConversations(user.id)
      if (currentConversationId) {
        loadMessages(currentConversationId, user.id)
      }
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-muted-foreground">You need to be signed in to use the chat.</p>
        </div>
      </div>
    )
  }

  // Ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages : []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-lg font-semibold">Chart Bot</h1>
          <p className="text-sm text-muted-foreground">
            Messages: {safeMessages.length} | Conversation: {currentConversationId || "None"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {safeMessages.length === 0 && !isLoading ? (
            <div className="text-center py-8">
              <div className="bg-muted rounded-lg p-6 max-w-md mx-auto">
                <h3 className="font-semibold mb-2">Welcome to Chart Bot!</h3>
                <p className="text-sm text-muted-foreground">
                  I'm specialized in creating charts and data visualizations. Ask me to create a chart, graph, or
                  visualize some data!
                </p>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <p>Try asking:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>"Make a bar chart of top 5 tech companies"</li>
                    <li>"Create a pie chart of sales data"</li>
                    <li>"Show me a line graph of monthly revenue"</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            safeMessages.map((message) => <ChatMessage key={message.id} message={message} />)
          )}

          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isSubmitting || isLoading}
          placeholder={isSubmitting ? "Sending..." : "Ask me to create a chart or visualization..."}
        />
      </div>
    </div>
  )
}
