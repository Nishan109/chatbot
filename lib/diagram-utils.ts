const VALID_DIAGRAM_TYPES = ["flowchart", "sequenceDiagram", "classDiagram", "stateDiagram", "erDiagram"] as const

export type DiagramType = (typeof VALID_DIAGRAM_TYPES)[number]

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

// Helper function to sanitize node IDs
function sanitizeNodeId(id: string): string {
  return id.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "")
}

// Helper function to format node text
function formatNodeText(text: string): string {
  return text.replace(/"/g, '\\"')
}

// Enhanced validation with detailed error messages
export function validateDiagramType(code: string): boolean {
  try {
    if (!code || typeof code !== "string") {
      throw new DiagramError("Invalid or empty diagram code", "VALIDATION")
    }

    const trimmedCode = code.trim().toLowerCase()
    if (!trimmedCode) {
      throw new DiagramError("Empty diagram code", "VALIDATION")
    }

    const firstLine = trimmedCode.split("\n")[0].trim()
    const validTypes = VALID_DIAGRAM_TYPES.map((type) => type.toLowerCase())

    if (!firstLine) {
      throw new DiagramError("Missing diagram type declaration", "SYNTAX", {
        line: 1,
        expected: validTypes.join(" | "),
      })
    }

    const declaredType = validTypes.find((type) => firstLine.startsWith(type))
    if (!declaredType) {
      throw new DiagramError(`Invalid diagram type. Must be one of: ${validTypes.join(", ")}`, "VALIDATION", {
        line: 1,
        expected: validTypes.join(" | "),
        found: firstLine,
      })
    }

    return true
  } catch (error) {
    if (error instanceof DiagramError) {
      throw error
    }
    throw new DiagramError("Failed to validate diagram type", "UNKNOWN", {
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Enhanced preprocessing with better error handling
export function preprocessDiagramCode(code: string): string {
  try {
    if (!code || typeof code !== "string") {
      throw new DiagramError("Invalid or empty diagram code", "VALIDATION")
    }

    let processedCode = code.trim()

    // Remove markdown code block syntax if present
    processedCode = processedCode.replace(/```mermaid\n?/, "").replace(/```\n?/, "")

    // Ensure proper line endings
    processedCode = processedCode.replace(/\r\n/g, "\n")

    // Validate basic structure
    if (!processedCode) {
      throw new DiagramError("Empty diagram code after preprocessing", "VALIDATION")
    }

    const lines = processedCode.split("\n")
    const firstLine = lines[0].trim()

    // Handle flowchart specific processing
    if (firstLine.startsWith("flowchart") || firstLine.startsWith("graph")) {
      const direction = firstLine.includes("TD") ? "TD" : "LR"
      lines[0] = `flowchart ${direction}`

      // Process remaining lines with enhanced error checking
      const processedLines = lines.slice(1).map((line, index) => {
        try {
          line = line.trim()
          if (!line) return line

          // Handle node definitions and connections
          if (line.includes("-->") || line.includes("---")) {
            const parts = line.split(/(-+>|---)/).map((part) => part.trim())
            return parts
              .map((part) => {
                if (part.match(/(-+>|---)/)) return part
                if (!part.startsWith('"') && !part.startsWith("[")) {
                  const sanitizedId = sanitizeNodeId(part)
                  return `${sanitizedId}["${formatNodeText(part)}"]`
                }
                return part
              })
              .join(" ")
          }

          // Handle single node definitions
          if (!line.includes("-->") && !line.includes("---")) {
            const sanitizedId = sanitizeNodeId(line)
            return `${sanitizedId}["${formatNodeText(line)}"]`
          }

          return line
        } catch (error) {
          throw new DiagramError(`Error processing line ${index + 2}`, "SYNTAX", {
            line: index + 2,
            found: line,
          })
        }
      })

      processedCode = [lines[0], ...processedLines].join("\n")
    }

    // Validate sequence diagram syntax
    if (firstLine.startsWith("sequenceDiagram")) {
      lines.slice(1).forEach((line, index) => {
        const trimmedLine = line.trim()
        if (
          trimmedLine &&
          !trimmedLine.match(/^(participant|actor|Note|loop|alt|opt|par|and|else|end|[^-]+->>?[^-]+:)/)
        ) {
          throw new DiagramError(`Invalid sequence diagram syntax at line ${index + 2}`, "SYNTAX", {
            line: index + 2,
            found: trimmedLine,
          })
        }
      })
    }

    // Validate ER diagram syntax
    if (firstLine.startsWith("erDiagram")) {
      lines.slice(1).forEach((line, index) => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.match(/^[A-Za-z_][A-Za-z0-9_]*\s+[{|}]|^[A-Za-z_][A-Za-z0-9_]*\s+--/)) {
          throw new DiagramError(`Invalid ER diagram syntax at line ${index + 2}`, "SYNTAX", {
            line: index + 2,
            found: trimmedLine,
          })
        }
      })
    }

    return processedCode
  } catch (error) {
    if (error instanceof DiagramError) {
      throw error
    }
    throw new DiagramError("Failed to preprocess diagram code", "UNKNOWN", {
      details: error instanceof Error ? error.message : "Unknown error",
    })
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

// Example diagrams with better error handling
export function generateUserRegistrationFlowchart(): string {
  return `flowchart TD
    Start["Start"] --> InputForm["User Input Form"]
    InputForm --> Validation["Validate Input"]
    Validation -->|Valid| CheckEmail["Check Email Exists"]
    Validation -->|Invalid| ShowError["Show Error Message"]
    ShowError --> InputForm
    CheckEmail -->|Exists| ShowEmailError["Show Email Exists Error"]
    ShowEmailError --> InputForm
    CheckEmail -->|New Email| CreateUser["Create User"]
    CreateUser --> SendEmail["Send Verification Email"]
    SendEmail --> Success["Registration Success"]
    Success --> End["End"]
    
    style Start fill:#4ade80,stroke:#22c55e,color:#ffffff
    style End fill:#ef4444,stroke:#dc2626,color:#ffffff
    style Success fill:#22c55e,stroke:#16a34a,color:#ffffff
    style ShowError fill:#f87171,stroke:#ef4444,color:#ffffff
    style ShowEmailError fill:#f87171,stroke:#ef4444,color:#ffffff
    style Validation fill:#60a5fa,stroke:#3b82f6,color:#ffffff
    style CheckEmail fill:#60a5fa,stroke:#3b82f6,color:#ffffff`
}

export function generateSequenceDiagram(): string {
  return `sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant DB as Database
    participant E as Email Service

    U->>F: Fill Registration Form
    F->>F: Validate Input
    F->>A: Submit Registration
    A->>DB: Check Email Exists
    DB-->>A: Email Status
    
    alt Email Exists
        A-->>F: Error Response
        F-->>U: Show Error Message
    else Email Available
        A->>DB: Create User
        DB-->>A: User Created
        A->>E: Send Verification Email
        E-->>A: Email Sent
        A-->>F: Success Response
        F-->>U: Show Success Message
    end`
}
