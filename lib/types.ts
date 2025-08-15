export interface DbConversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface DbMessage {
  id: string
  conversation_id: string
  content: string
  type: "text" | "chart" | "diagram"
  role: "user" | "assistant"
  chart_data?: any
  diagram_data?: any
  created_at: string
}
