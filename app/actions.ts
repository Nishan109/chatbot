"use server"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"

// Chart response interface
export interface ChartResponse {
  success: boolean
  chartData?: {
    type: "bar" | "line" | "pie" | "radar"
    title: string
    description: string
    data: any[]
    xAxisLabel?: string
    yAxisLabel?: string
  }
  message?: string
  error?: string
}

// Function to detect if user wants to create a chart
function isChartRequest(prompt: string): boolean {
  const chartKeywords = [
    "chart",
    "graph",
    "plot",
    "visualize",
    "visualization",
    "data",
    "bar chart",
    "line chart",
    "pie chart",
    "scatter plot",
    "histogram",
    "dashboard",
    "analytics",
    "metrics",
    "trends",
    "compare",
    "comparison",
    "statistics",
    "stats",
    "report",
    "analysis",
    "analyze",
  ]

  const lowerPrompt = prompt.toLowerCase()
  return chartKeywords.some((keyword) => lowerPrompt.includes(keyword))
}

// Generate fallback chart data based on context
function generateFallbackData(prompt: string) {
  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes("sales") || lowerPrompt.includes("revenue")) {
    return {
      type: "bar" as const,
      title: "Monthly Sales Data",
      description: "Sales performance over the last 6 months",
      data: [
        { month: "Jan", sales: 12000 },
        { month: "Feb", sales: 15000 },
        { month: "Mar", sales: 18000 },
        { month: "Apr", sales: 14000 },
        { month: "May", sales: 22000 },
        { month: "Jun", sales: 25000 },
      ],
      xAxisLabel: "Month",
      yAxisLabel: "Sales ($)",
    }
  }

  if (lowerPrompt.includes("user") || lowerPrompt.includes("growth")) {
    return {
      type: "line" as const,
      title: "User Growth",
      description: "Monthly active users over time",
      data: [
        { month: "Jan", users: 1000 },
        { month: "Feb", users: 1200 },
        { month: "Mar", users: 1500 },
        { month: "Apr", users: 1800 },
        { month: "May", users: 2200 },
        { month: "Jun", users: 2800 },
      ],
      xAxisLabel: "Month",
      yAxisLabel: "Active Users",
    }
  }

  // Default fallback
  return {
    type: "bar" as const,
    title: "Sample Data Visualization",
    description: "Example chart based on your request",
    data: [
      { category: "A", value: 30 },
      { category: "B", value: 45 },
      { category: "C", value: 25 },
      { category: "D", value: 60 },
      { category: "E", value: 35 },
    ],
    xAxisLabel: "Category",
    yAxisLabel: "Value",
  }
}

// Extract JSON from AI response
function extractJSON(text: string): any {
  try {
    // Try to parse the entire response as JSON
    return JSON.parse(text)
  } catch {
    // Look for JSON blocks in the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1])
      } catch {
        // Continue to next attempt
      }
    }

    // Look for JSON-like structures
    const jsonStart = text.indexOf("{")
    const jsonEnd = text.lastIndexOf("}")
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      try {
        return JSON.parse(text.slice(jsonStart, jsonEnd + 1))
      } catch {
        // Continue to next attempt
      }
    }

    throw new Error("No valid JSON found in response")
  }
}

export async function generateResponse(prompt: string): Promise<ChartResponse> {
  try {
    console.log("Generating response for prompt:", prompt)

    // Check if this is a chart request
    if (!isChartRequest(prompt)) {
      return {
        success: false,
        message: "This doesn't appear to be a chart request. Please ask for a chart, graph, or data visualization.",
        error: "Not a chart request",
      }
    }

    const chartPrompt = `
You are a data visualization expert. Create a chart based on this request: "${prompt}"

Respond with ONLY a JSON object in this exact format:
{
  "type": "bar|line|pie|radar",
  "title": "Chart Title",
  "description": "Brief description",
  "data": [
    {"category": "value1", "value": number},
    {"category": "value2", "value": number}
  ],
  "xAxisLabel": "X Axis Label",
  "yAxisLabel": "Y Axis Label"
}

Make the data realistic and relevant to the request. Use appropriate chart type for the data.
`

    // Try different Gemini models in order of preference
    const models = [google("gemini-2.0-flash-exp"), google("gemini-1.5-flash"), google("gemini-1.5-pro")]

    let lastError: Error | null = null

    for (const model of models) {
      try {
        console.log(`Trying model: ${model.modelId}`)

        const { text } = await generateText({
          model,
          prompt: chartPrompt,
          maxTokens: 1000,
          temperature: 0.7,
        })

        console.log("AI Response:", text)

        // Extract and parse JSON from response
        const chartData = extractJSON(text)

        // Validate the response structure
        if (!chartData.type || !chartData.title || !chartData.data) {
          throw new Error("Invalid chart data structure")
        }

        console.log("Successfully generated chart data:", chartData)

        return {
          success: true,
          chartData: {
            type: chartData.type,
            title: chartData.title,
            description: chartData.description || "Generated chart",
            data: chartData.data,
            xAxisLabel: chartData.xAxisLabel,
            yAxisLabel: chartData.yAxisLabel,
          },
        }
      } catch (error) {
        console.error(`Error with model ${model.modelId}:`, error)
        lastError = error instanceof Error ? error : new Error(String(error))
        continue
      }
    }

    // If all models failed, use fallback data
    console.log("All AI models failed, using fallback data")
    const fallbackData = generateFallbackData(prompt)

    return {
      success: true,
      chartData: fallbackData,
      message: "Generated using fallback data due to AI service limitations",
    }
  } catch (error) {
    console.error("Error in generateResponse:", error)

    // Return fallback data even on complete failure
    const fallbackData = generateFallbackData(prompt)

    return {
      success: true,
      chartData: fallbackData,
      message: "Generated using fallback data",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Legacy function for backward compatibility
export async function generateChart(prompt: string) {
  return generateResponse(prompt)
}
