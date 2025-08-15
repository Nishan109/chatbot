"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Google AI SDK with your API key
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

function getSystemPrompt(chartType?: string) {
  if (chartType === "scatter") {
    return `You are a chart generation assistant. Generate a scatter plot based on the prompt.
    Return ONLY a JSON object in this format:
    {
      "type": "chart",
      "chartType": "scatter",
      "title": "Chart Title",
      "description": "Chart Description",
      "xAxisLabel": "X-axis label",
      "yAxisLabel": "Y-axis label",
      "data": [
        {
          "name": "Series name",
          "data": [
            { "x": number, "y": number, "label": "string (optional)" }
          ]
        }
      ]
    }
    Include 15-30 realistic data points that show meaningful patterns.`
  }

  return `You are a chart and diagram generation assistant. Return ONLY a JSON object in one of these formats:

  For charts:
  {
    "type": "chart",
    "chartType": "bar" | "line" | "pie" | "radar",
    "title": "Chart Title",
    "description": "Chart Description",
    "data": [{"name": "Label 1", "value": 100}]
  }

  For diagrams:
  {
    "type": "diagram",
    "diagramType": "flowchart",
    "title": "Diagram Title",
    "code": "flowchart TD\\n  A[CPU] --> B[Memory]"
  }

  For text:
  {
    "type": "text",
    "content": "Your text response"
  }

  RULES:
  1. For radar charts, provide 5-8 categories
  2. All values should be between 0-100
  3. Ensure valid JSON format
  4. DO NOT include any text outside the JSON`
}

function sanitizeText(text: string | undefined | null): string {
  if (!text) return ""

  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/\*\*/g, "")
    .replace(/##/g, "")
    .replace(/\n+/g, " ")
    .trim()
}

function parseChartData(text: string | undefined | null, chartType?: string) {
  if (!text) {
    throw new Error("Invalid input: Text is required")
  }

  try {
    // Extract JSON from response
    const trimmedText = text.trim()
    const jsonMatch = trimmedText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error("No valid JSON found in response")
    }

    const parsed = JSON.parse(jsonMatch[0])

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid JSON structure")
    }

    // For scatter plots
    if (chartType === "scatter") {
      if (!parsed.data || !Array.isArray(parsed.data)) {
        throw new Error("Invalid scatter plot data structure")
      }

      return {
        type: "chart",
        chartType: "scatter",
        title: sanitizeText(parsed.title),
        description: sanitizeText(parsed.description),
        xAxisLabel: sanitizeText(parsed.xAxisLabel),
        yAxisLabel: sanitizeText(parsed.yAxisLabel),
        data: parsed.data.map((series: any) => ({
          name: sanitizeText(series.name),
          data: Array.isArray(series.data)
            ? series.data.map((point: any) => ({
                x: Number(point.x) || 0,
                y: Number(point.y) || 0,
                label: point.label ? sanitizeText(point.label) : undefined,
              }))
            : [],
        })),
      }
    }

    // For other chart types
    return {
      type: parsed.type,
      chartType: parsed.chartType,
      title: sanitizeText(parsed.title),
      description: sanitizeText(parsed.description),
      data: Array.isArray(parsed.data)
        ? parsed.data.map((item: any) => ({
            name: sanitizeText(item.name),
            value: Number(item.value) || 0,
          }))
        : [],
      ...(parsed.type === "diagram" && {
        code: parsed.code || "",
      }),
      ...(parsed.type === "text" && {
        content: sanitizeText(parsed.content),
      }),
    }
  } catch (error) {
    console.error("Error parsing response:", error)
    throw new Error(`Failed to parse response: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function generateWithModel(modelName: string, prompt: string) {
  const model = genAI.getGenerativeModel({ model: modelName })
  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

export async function generateResponse(message: string, chartType?: string) {
  if (!message?.trim()) {
    throw new Error("Message is required")
  }

  console.log("Generating response for message:", message, "chartType:", chartType)

  try {
    // Prepare the prompt
    const prompt = `${getSystemPrompt(chartType)}\n\n${message}`

    // Try with gemini-1.5-pro-latest first
    let text: string | undefined
    try {
      text = await generateWithModel("gemini-1.5-pro-latest", prompt)
      console.log("Successfully used gemini-1.5-pro-latest")
    } catch (error) {
      console.log("Falling back to gemini-pro due to error:", error)
      // Fall back to gemini-pro if 1.5 fails
      text = await generateWithModel("gemini-pro", prompt)
      console.log("Successfully used gemini-pro fallback")
    }

    if (!text?.trim()) {
      throw new Error("Empty response received from Gemini")
    }

    console.log("Raw response:", text)

    const parsedResponse = parseChartData(text, chartType)

    if (!parsedResponse.type) {
      throw new Error("Invalid response: missing type")
    }

    switch (parsedResponse.type) {
      case "diagram":
        if (!parsedResponse.diagramType || !parsedResponse.title || !parsedResponse.code) {
          throw new Error("Invalid diagram data: missing required properties")
        }
        return {
          type: "diagram" as const,
          diagramType: parsedResponse.diagramType,
          title: sanitizeText(parsedResponse.title),
          code: parsedResponse.code,
        }

      case "chart":
        if (!parsedResponse.chartType || !parsedResponse.title || !Array.isArray(parsedResponse.data)) {
          throw new Error("Invalid chart data: missing required properties")
        }
        return {
          type: "chart" as const,
          chartType: parsedResponse.chartType,
          title: sanitizeText(parsedResponse.title),
          description: sanitizeText(parsedResponse.description || ""),
          data: parsedResponse.data.map((item: any) => ({
            name: sanitizeText(item.name),
            value: Number(item.value) || 0,
          })),
          ...(parsedResponse.chartType === "scatter" && {
            xAxisLabel: parsedResponse.xAxisLabel,
            yAxisLabel: parsedResponse.yAxisLabel,
          }),
        }

      case "text":
        if (!parsedResponse.content) {
          throw new Error("Invalid text response: missing content")
        }
        return {
          type: "text" as const,
          content: sanitizeText(parsedResponse.content),
        }

      default:
        throw new Error(`Unsupported response type: ${parsedResponse.type}`)
    }
  } catch (error) {
    console.error("Error in generateResponse:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Handle specific Gemini API errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()

      if (
        errorMessage.includes("model not found") ||
        errorMessage.includes("not supported") ||
        errorMessage.includes("unavailable")
      ) {
        throw new Error("The AI service is temporarily unavailable. Please try again in a few minutes.")
      }

      if (errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
        throw new Error("Service quota exceeded. Please try again later.")
      }

      if (errorMessage.includes("permission") || errorMessage.includes("unauthorized")) {
        throw new Error("Authentication error. Please check your API key configuration.")
      }

      if (errorMessage.includes("safety") || errorMessage.includes("blocked")) {
        throw new Error("The request was blocked by safety filters. Please try rephrasing your request.")
      }

      throw error
    }

    // For unexpected errors
    throw new Error("An unexpected error occurred. Please try again later.")
  }
}
