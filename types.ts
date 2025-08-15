export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export type MessageType = "text" | "chart" | "diagram"

export interface Message {
  id: string
  content: string
  type: MessageType
  role: "user" | "assistant"
  createdAt: Date
  chartData?: {
    type: "bar" | "line" | "pie"
    title: string
    description: string
    data: any[]
  }
  diagramData?: {
    type: string
    title: string
    code: string
  }
}
