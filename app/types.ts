export interface ParsedResponse {
  type: "text" | "chart" | "diagram"
  content?: string
  chartType?: "bar" | "line" | "pie"
  title?: string
  description?: string
  data?: any[]
  diagramType?: string
  code?: string
}
