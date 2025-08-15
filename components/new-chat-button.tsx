"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useConversationStore } from "@/lib/store"
import { AnimatedContainer } from "@/components/animated-container"
import { useRouter } from "next/navigation"

interface NewChatButtonProps {
  onClick: () => void
}

export function NewChatButton({ onClick }: NewChatButtonProps) {
  const router = useRouter()
  const { addConversation, setIsHomeView } = useConversationStore()

  const handleNewChat = () => {
    const id = addConversation("New Conversation")
    setIsHomeView(false)
    router.push(`/chat/${id}`)
    onClick()
  }

  return (
    <AnimatedContainer>
      <Button
        onClick={handleNewChat}
        className="bg-green-500 hover:bg-green-600 text-white font-medium shadow-lg transition-all duration-200"
      >
        <Plus className="mr-2 h-4 w-4" />
        New Chart
      </Button>
    </AnimatedContainer>
  )
}
