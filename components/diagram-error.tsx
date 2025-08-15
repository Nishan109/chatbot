"\"use client"

// Enhanced error class for diagram-specific errors
export class DiagramError extends Error {
  constructor(
    message: string,
    public readonly type: "SYNTAX" | "VALIDATION" | "RENDERING" | "UNKNOWN",
    public readonly details?: {
      line?: number
      position?: number
      expected?: string
      found?: string
    },
  ) {
    super(message)
    this.name = "DiagramError"
  }
}

// Helper function to format error messages
export function formatDiagramError(error: DiagramError): string {
  let message = `${error.type}: ${error.message}`

  if (error.details) {
    if (error.details.line) {
      message += `\nLine: ${error.details.line}`
    }
    if (error.details.position) {
      message += `\nPosition: ${error.details.position}`
    }
    if (error.details.expected) {
      message += `\nExpected: ${error.details.expected}`
    }
    if (error.details.found) {
      message += `\nFound: ${error.details.found}`
    }
  }

  return message
}

export function parseMermaidError(error: any): string {
  if (error.message) {
    return error.message
  } else if (error.cause && error.cause.message) {
    return error.cause.message
  } else if (typeof error === "string") {
    return error
  } else {
    return "An unknown error occurred while rendering the diagram."
  }
}
