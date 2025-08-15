"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "./supabaseClient"

export interface Message {
  id: string
  content: string
  type: "text" | "chart" | "diagram"
  role: "user" | "assistant"
  createdAt: Date
  chartData?: {
    type: "bar" | "line" | "pie" | "radar" | "scatter"
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
  fileAttachment?: {
    name: string
    type: string
    url?: string
    data?: any
  }
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  userId?: string
}

interface ConversationStore {
  conversations: Conversation[]
  currentConversationId: string | null
  isHomeView: boolean
  isLoading: boolean
  error: string | null

  // Actions
  loadConversations: () => Promise<void>
  addConversation: (title: string, userId?: string) => Promise<string>
  deleteConversation: (id: string) => Promise<void>
  updateConversationTitle: (id: string, title: string) => Promise<void>
  addMessage: (conversationId: string, message: Message) => Promise<void>
  setCurrentConversationId: (id: string | null) => void
  setIsHomeView: (isHome: boolean) => void
  clearError: () => void
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      isHomeView: true,
      isLoading: false,
      error: null,

      loadConversations: async () => {
        try {
          set({ isLoading: true, error: null })
          console.log("Loading conversations from database...")

          // Check if conversations table exists by trying to query it
          const { data: conversations, error } = await supabase
            .from("conversations")
            .select("*")
            .order("updated_at", { ascending: false })

          if (error) {
            console.error("Error loading conversations:", error)

            // If table doesn't exist, create a default conversation
            if (error.message.includes("does not exist")) {
              console.log("Conversations table doesn't exist, using local storage only")
              set({
                conversations: [],
                isLoading: false,
                error: "Database not initialized. Using local storage.",
              })
              return
            }

            throw error
          }

          // Load messages for each conversation
          const conversationsWithMessages = await Promise.all(
            (conversations || []).map(async (conv) => {
              const { data: messages, error: msgError } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", conv.id)
                .order("created_at", { ascending: true })

              if (msgError) {
                console.error("Error loading messages for conversation:", conv.id, msgError)
                return {
                  id: conv.id,
                  title: conv.title,
                  messages: [],
                  createdAt: new Date(conv.created_at),
                  updatedAt: new Date(conv.updated_at),
                  userId: conv.user_id,
                }
              }

              return {
                id: conv.id,
                title: conv.title,
                messages: (messages || []).map((msg) => ({
                  id: msg.id,
                  content: msg.content,
                  type: msg.type || "text",
                  role: msg.role,
                  createdAt: new Date(msg.created_at),
                  ...(msg.chart_data && { chartData: msg.chart_data }),
                  ...(msg.diagram_data && { diagramData: msg.diagram_data }),
                  ...(msg.file_attachment && { fileAttachment: msg.file_attachment }),
                })),
                createdAt: new Date(conv.created_at),
                updatedAt: new Date(conv.updated_at),
                userId: conv.user_id,
              }
            }),
          )

          console.log("Loaded conversations:", conversationsWithMessages.length)
          set({
            conversations: conversationsWithMessages,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          console.error("Error in loadConversations:", error)
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to load conversations",
          })
        }
      },

      addConversation: async (title: string, userId?: string) => {
        try {
          console.log("Adding new conversation:", title)

          const { data, error } = await supabase
            .from("conversations")
            .insert({
              title,
              user_id: userId || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (error) {
            console.error("Error creating conversation:", error)

            // Fallback to local storage if database fails
            const localId = crypto.randomUUID()
            const newConversation: Conversation = {
              id: localId,
              title,
              messages: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              userId,
            }

            set((state) => ({
              conversations: [newConversation, ...state.conversations],
              error: "Using local storage - database unavailable",
            }))

            return localId
          }

          const newConversation: Conversation = {
            id: data.id,
            title: data.title,
            messages: [],
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            userId: data.user_id,
          }

          set((state) => ({
            conversations: [newConversation, ...state.conversations],
            error: null,
          }))

          console.log("Created conversation:", data.id)
          return data.id
        } catch (error) {
          console.error("Error in addConversation:", error)

          // Fallback to local storage
          const localId = crypto.randomUUID()
          const newConversation: Conversation = {
            id: localId,
            title,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            userId,
          }

          set((state) => ({
            conversations: [newConversation, ...state.conversations],
            error: "Using local storage - database unavailable",
          }))

          return localId
        }
      },

      deleteConversation: async (id: string) => {
        try {
          console.log("Deleting conversation:", id)

          // Delete from database
          const { error: msgError } = await supabase.from("messages").delete().eq("conversation_id", id)

          if (msgError) {
            console.error("Error deleting messages:", msgError)
          }

          const { error: convError } = await supabase.from("conversations").delete().eq("id", id)

          if (convError) {
            console.error("Error deleting conversation:", convError)
          }

          // Remove from local state regardless of database result
          set((state) => ({
            conversations: state.conversations.filter((conv) => conv.id !== id),
            currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
          }))

          console.log("Deleted conversation:", id)
        } catch (error) {
          console.error("Error in deleteConversation:", error)

          // Still remove from local state
          set((state) => ({
            conversations: state.conversations.filter((conv) => conv.id !== id),
            currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
            error: "Deleted locally - database may be unavailable",
          }))
        }
      },

      updateConversationTitle: async (id: string, title: string) => {
        try {
          console.log("Updating conversation title:", id, title)

          const { error } = await supabase
            .from("conversations")
            .update({
              title,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)

          if (error) {
            console.error("Error updating conversation title:", error)
          }

          // Update local state regardless of database result
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === id ? { ...conv, title, updatedAt: new Date() } : conv,
            ),
          }))

          console.log("Updated conversation title:", id)
        } catch (error) {
          console.error("Error in updateConversationTitle:", error)

          // Still update local state
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === id ? { ...conv, title, updatedAt: new Date() } : conv,
            ),
            error: "Updated locally - database may be unavailable",
          }))
        }
      },

      addMessage: async (conversationId: string, message: Message) => {
        try {
          console.log("Adding message to conversation:", conversationId)

          // Prepare message data for database
          const messageData: any = {
            conversation_id: conversationId,
            content: message.content,
            role: message.role,
            type: message.type || "text",
            created_at: message.createdAt.toISOString(),
          }

          // Add optional fields only if they exist
          if (message.chartData) {
            messageData.chart_data = message.chartData
          }
          if (message.diagramData) {
            messageData.diagram_data = message.diagramData
          }
          if (message.fileAttachment) {
            messageData.file_attachment = message.fileAttachment
          }

          const { error } = await supabase.from("messages").insert(messageData)

          if (error) {
            console.error("Database insert error:", error)
            // Continue to update local state even if database fails
          }

          // Update local state
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    messages: [...conv.messages, message],
                    updatedAt: new Date(),
                  }
                : conv,
            ),
            error: error ? "Message saved locally - database may be unavailable" : null,
          }))

          console.log("Added message to conversation:", conversationId)
        } catch (error) {
          console.error("Error in addMessage:", error)

          // Still update local state
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    messages: [...conv.messages, message],
                    updatedAt: new Date(),
                  }
                : conv,
            ),
            error: "Message saved locally - database unavailable",
          }))
        }
      },

      setCurrentConversationId: (id: string | null) => {
        set({ currentConversationId: id })
      },

      setIsHomeView: (isHome: boolean) => {
        set({ isHomeView: isHome })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: "conversation-store",
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        isHomeView: state.isHomeView,
      }),
    },
  ),
)
