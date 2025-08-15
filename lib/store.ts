"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SupabaseClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

// Types
export type MessageType = "text" | "chart" | "diagram"
export type ChartType = "bar" | "line" | "pie" | "radar"

export interface Message {
  id: string
  content: string
  type: MessageType
  role: "user" | "assistant"
  createdAt: Date
  chartData?: {
    type: ChartType
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
  chart_data?: any
  diagram_data?: any
  file_attachment?: any
  created_at?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  userId: string
  isFavorite: boolean
}

interface ChatState {
  conversations: Conversation[]
  messages: Message[]
  currentConversationId: string | null
  selectedChartType: ChartType
  isHomeView: boolean
  error: string | null
  supabase: SupabaseClient | null
  isLoading: boolean
  isDeleting: boolean
  isRefreshing: boolean
  isDeletingFromSidebar: boolean
  isInitialized: boolean

  loadConversations: (userId: string) => Promise<void>
  loadMessages: (conversationId: string, userId: string) => Promise<void>
  addConversation: (title: string) => Promise<string>
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  addMessage: (message: Message) => void
  setCurrentConversationId: (id: string | null) => void
  setSelectedChartType: (type: ChartType) => void
  setIsHomeView: (isHome: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  getCurrentConversation: () => Conversation | null
  updateChartTitle: (conversationId: string, messageId: string, newTitle: string) => void
  deleteChart: (conversationId: string, messageId: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  setIsDeleting: (isDeleting: boolean) => void
  setIsRefreshing: (isRefreshing: boolean) => void
  setIsDeletingFromSidebar: (isDeletingFromSidebar: boolean) => void
  initializeStore: () => Promise<void>
  setIsLoading: (loading: boolean) => void
  setSupabase: (client: SupabaseClient) => void
  getChartHistory: () => Conversation[]
}

export const useConversationStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // State
      conversations: [],
      messages: [],
      currentConversationId: null,
      selectedChartType: "bar",
      isHomeView: true,
      error: null,
      supabase: supabase,
      isLoading: false,
      isDeleting: false,
      isRefreshing: false,
      isDeletingFromSidebar: false,
      isInitialized: false,

      // Actions
      setIsLoading: (loading) => set({ isLoading: loading }),

      loadConversations: async (userId: string) => {
        try {
          console.log("Loading conversations for user:", userId)
          set({ isLoading: true })

          const { data: conversationsData, error: conversationsError } = await supabase
            .from("conversations")
            .select("*")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false })

          if (conversationsError) {
            console.error("Conversations error:", conversationsError)
            throw conversationsError
          }

          console.log("Loaded conversations:", conversationsData)

          const conversations: Conversation[] = (conversationsData || []).map((conv) => ({
            id: conv.id,
            title: conv.title,
            messages: [],
            createdAt: new Date(conv.created_at),
            updatedAt: new Date(conv.updated_at),
            userId: conv.user_id,
            isFavorite: conv.is_favorite || false,
          }))

          set({ conversations, error: null })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to load conversations"
          console.error("Error in loadConversations:", error)
          set({ error: errorMessage, conversations: [] })
        } finally {
          set({ isLoading: false })
        }
      },

      loadMessages: async (conversationId: string, userId: string) => {
        try {
          console.log("Loading messages for conversation:", conversationId)
          set({ isLoading: true })

          // First verify the conversation belongs to the user
          const { data: conversation, error: convError } = await supabase
            .from("conversations")
            .select("id")
            .eq("id", conversationId)
            .eq("user_id", userId)
            .single()

          if (convError || !conversation) {
            throw new Error("Conversation not found or access denied")
          }

          const { data: messagesData, error: messagesError } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true })

          if (messagesError) {
            console.error("Messages error:", messagesError)
            throw messagesError
          }

          console.log("Loaded messages:", messagesData)

          const messages: Message[] = (messagesData || []).map((msg) => {
            // Parse chart_data if it exists
            let chartData = null
            if (msg.chart_data) {
              try {
                chartData = typeof msg.chart_data === "string" ? JSON.parse(msg.chart_data) : msg.chart_data
              } catch (e) {
                console.error("Error parsing chart_data:", e)
              }
            }

            // Parse diagram_data if it exists
            let diagramData = null
            if (msg.diagram_data) {
              try {
                diagramData = typeof msg.diagram_data === "string" ? JSON.parse(msg.diagram_data) : msg.diagram_data
              } catch (e) {
                console.error("Error parsing diagram_data:", e)
              }
            }

            return {
              id: msg.id,
              content: msg.content || "",
              type: (msg.type as MessageType) || "text",
              role: (msg.role as "user" | "assistant") || "user",
              chartData,
              diagramData,
              createdAt: new Date(msg.created_at),
              chart_data: msg.chart_data,
              diagram_data: msg.diagram_data,
              file_attachment: msg.file_attachment,
              created_at: msg.created_at,
            }
          })

          set({ messages, currentConversationId: conversationId, error: null })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to load messages"
          console.error("Error in loadMessages:", error)
          set({ error: errorMessage, messages: [] })
        } finally {
          set({ isLoading: false })
        }
      },

      addConversation: async (title) => {
        const id = crypto.randomUUID()

        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser()
          if (userError) throw userError
          if (!user) throw new Error("No authenticated user")

          const newConversation: Conversation = {
            id,
            title,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: user.id,
            isFavorite: false,
          }

          console.log("Creating new conversation:", newConversation)

          const { error } = await supabase.from("conversations").insert({
            id: newConversation.id,
            title: newConversation.title,
            user_id: newConversation.userId,
            created_at: newConversation.createdAt.toISOString(),
            updated_at: newConversation.updatedAt.toISOString(),
            is_favorite: false,
          })

          if (error) {
            console.error("Error creating conversation:", error)
            throw error
          }

          set((state) => ({
            conversations: [newConversation, ...state.conversations],
            currentConversationId: id,
            isHomeView: false,
            error: null,
          }))

          return id
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create conversation"
          console.error("Error in addConversation:", error)
          set({ error: errorMessage })
          throw error
        }
      },

      updateConversation: async (id, updates) => {
        try {
          const { error } = await supabase
            .from("conversations")
            .update({
              title: updates.title,
              updated_at: new Date().toISOString(),
              is_favorite: updates.isFavorite,
            })
            .eq("id", id)

          if (error) throw error

          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === id ? { ...conv, ...updates, updatedAt: new Date() } : conv,
            ),
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update conversation"
          set({ error: errorMessage })
          throw error
        }
      },

      deleteConversation: async (id) => {
        set({ isDeletingFromSidebar: true })

        try {
          const { error: messagesError } = await supabase.from("messages").delete().eq("conversation_id", id)

          if (messagesError) throw messagesError

          const { error: conversationError } = await supabase.from("conversations").delete().eq("id", id)

          if (conversationError) throw conversationError

          set((state) => ({
            conversations: state.conversations.filter((c) => c.id !== id),
            currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
            isHomeView: true,
          }))

          set({ isRefreshing: true })
          await new Promise((resolve) => setTimeout(resolve, 500))

          if (typeof window !== "undefined") {
            window.location.reload()
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete conversation"
          set({ error: errorMessage, isDeletingFromSidebar: false, isRefreshing: false })
          throw error
        }
      },

      addMessage: (message: Message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }))
      },

      setCurrentConversationId: (id) => set({ currentConversationId: id, isHomeView: !id }),
      setSelectedChartType: (type) => set({ selectedChartType: type }),
      setIsHomeView: (isHome) => set({ isHomeView: isHome }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      getCurrentConversation: () => {
        const state = get()
        return state.conversations.find((c) => c.id === state.currentConversationId) || null
      },
      updateChartTitle: (conversationId, messageId, newTitle) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId && msg.type === "chart" && msg.chartData
                      ? { ...msg, chartData: { ...msg.chartData, title: newTitle } }
                      : msg,
                  ),
                }
              : conv,
          ),
        }))
      },

      deleteChart: async (conversationId, messageId) => {
        set({ isRefreshing: true })

        try {
          const { error } = await supabase
            .from("messages")
            .delete()
            .eq("id", messageId)
            .eq("conversation_id", conversationId)

          if (error) throw error

          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    messages: conv.messages.filter((msg) => msg.id !== messageId),
                  }
                : conv,
            ),
          }))

          await new Promise((resolve) => setTimeout(resolve, 1000))

          if (typeof window !== "undefined") {
            window.location.reload()
          }
        } catch (error) {
          console.error("Error deleting chart:", error)
          set({ isRefreshing: false })
          throw error
        }
      },

      toggleFavorite: async (id) => {
        try {
          const conversation = get().conversations.find((c) => c.id === id)
          if (!conversation) throw new Error("Conversation not found")

          const newFavoriteStatus = !conversation.isFavorite

          const { error } = await supabase.from("conversations").update({ is_favorite: newFavoriteStatus }).eq("id", id)

          if (error) throw error

          set((state) => ({
            conversations: state.conversations.map((c) => (c.id === id ? { ...c, isFavorite: newFavoriteStatus } : c)),
          }))
        } catch (error) {
          console.error("Error toggling favorite:", error)
          throw error
        }
      },

      setIsDeleting: (isDeleting) => set({ isDeleting }),
      setIsRefreshing: (isRefreshing) => set({ isRefreshing }),
      setIsDeletingFromSidebar: (isDeletingFromSidebar) => set({ isDeletingFromSidebar }),
      initializeStore: async () => {
        set({ isLoading: true })
        try {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession()
          if (sessionError) throw sessionError

          if (!session) {
            throw new Error("No active session")
          }

          set({ isInitialized: true })
        } catch (error) {
          console.error("Failed to initialize store:", error)
          set({ error: error instanceof Error ? error.message : "Failed to initialize" })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      setSupabase: (client) => set({ supabase: client }),

      getChartHistory: () => {
        const state = get()
        return state.conversations.sort((a, b) => {
          const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt)
          const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt)
          return dateB.getTime() - dateA.getTime()
        })
      },
    }),
    {
      name: "chat-store",
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        selectedChartType: state.selectedChartType,
        isHomeView: state.isHomeView,
      }),
    },
  ),
)

export const useChatStore = useConversationStore
