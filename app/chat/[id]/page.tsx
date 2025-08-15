"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { Chat } from "@/components/chat"
import { useConversationStore } from "@/lib/store"

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.id as string
  const { setCurrentConversationId, setIsHomeView } = useConversationStore()

  useEffect(() => {
    setCurrentConversationId(conversationId)
    setIsHomeView(false)
  }, [conversationId, setCurrentConversationId, setIsHomeView])

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <Chat isChartCreationMode={false} onExitChartMode={() => {}} />
    </div>
  )
}
