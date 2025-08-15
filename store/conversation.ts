"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase"

export type MessageType = "text" | "chart" | "diagram"
export type ChartType = "bar" | "line" | "pie"

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
  userId: string
  isFavorite: boolean
}

interface ConversationState {
  conversations: Conversation[]
  currentConversationId: string | null
  isHomeView: boolean
  error: string | null
  loadConversations: () => Promise<Conversation[]>
  addConversation: (title: string) => Promise<string>
  deleteConversation: (id: string) => Promise<void>
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<void>
  addMessage: (conversationId: string, message: Message) => Promise<void>
  setCurrentConversationId: (id: string | null) => void
  setIsHomeView: (isHome: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      isHomeView: true,
      error: null,

      loadConversations: async () => {
        const { data, error } = await supabase.from("conversations").select("*")
        if (error) {
          set({ error: error.message })
          throw error
        }
        const conversations = data || []
        set({ conversations })
        return conversations
      },

      addConversation: async (title) => {
        const id = crypto.randomUUID()
        const newConversation: Conversation = {
          id,
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: (await supabase.auth.getUser()).data.user?.id || "",
          isFavorite: false,
        }

        const { error } = await supabase.from("conversations").insert({
          id: newConversation.id,
          title: newConversation.title,
          user_id: newConversation.userId,
          created_at: newConversation.createdAt.toISOString(),
          updated_at: newConversation.updatedAt.toISOString(),
        })

        if (error) throw error

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
          isHomeView: false,
        }))

        return id
      },

      deleteConversation: async (id) => {
        const { error } = await supabase.from("conversations").delete().eq("id", id)
        if (error) throw error

        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
          isHomeView: true,
        }))
      },

      updateConversation: async (id, updates) => {
        const { error } = await supabase
          .from("conversations")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id)

        if (error) throw error

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c,
          ),
        }))
      },

      addMessage: async (conversationId, message) => {
        const { error } = await supabase.from("messages").insert({
          id: message.id,
          conversation_id: conversationId,
          content: message.content,
          type: message.type,
          role: message.role,
          chart_data: message.chartData,
          diagram_data: message.diagramData,
          file_attachment: message.fileAttachment,
          created_at: message.createdAt.toISOString(),
        })

        if (error) throw error

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: new Date(),
                }
              : c,
          ),
        }))
      },

      setCurrentConversationId: (id) => set({ currentConversationId: id }),
      setIsHomeView: (isHome) => set({ isHomeView: isHome }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "conversation-store",
    },
  ),
)
