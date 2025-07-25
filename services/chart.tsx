import { useChatStore } from "@/lib/store"

export const deleteChart = (conversationId: string, messageId: string) => {
  useChatStore.getState().deleteChart(conversationId, messageId)
}
