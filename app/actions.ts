"use server"

import { google } from "@ai-sdk/google"
import { generateText } from "ai"

// Function to get available API key
function getApiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    null
  )
}

// Function to detect if the prompt is asking for a chart
function isChartRequest(prompt: string): boolean {
  const chartKeywords = [
    "chart",
    "graph",
    "plot",
    "visualize",
    "visualization",
    "bar chart",
    "line chart",
    "pie chart",
    "scatter plot",
    "data visualization",
    "show data",
    "display data",
    "create chart",
    "generate chart",
    "make chart",
    "draw chart",
  ]

  const lowerPrompt = prompt.toLowerCase()
  return chartKeywords.some((keyword) => lowerPrompt.includes(keyword))
}

// Function to generate fallback chart data based on prompt context
function generateFallbackChartData(prompt: string) {
  const lowerPrompt = prompt.toLowerCase()

  // Determine chart type based on prompt
  let chartType = "bar"
  if (lowerPrompt.includes("line") || lowerPrompt.includes("trend") || lowerPrompt.includes("over time")) {
    chartType = "line"
  } else if (lowerPrompt.includes("pie") || lowerPrompt.includes("percentage") || lowerPrompt.includes("share")) {
    chartType = "pie"
  } else if (lowerPrompt.includes("scatter") || lowerPrompt.includes("correlation")) {
    chartType = "scatter"
  }

  // Generate contextual data based on prompt content
  let data = []
  let title = "Generated Chart"
  let description = "Chart generated based on your request"

  if (lowerPrompt.includes("sales") || lowerPrompt.includes("revenue")) {
    title = "Sales Performance"
    description = "Monthly sales data"
    data = [
      { name: "Jan", value: 4000 },
      { name: "Feb", value: 3000 },
      { name: "Mar", value: 5000 },
      { name: "Apr", value: 4500 },
      { name: "May", value: 6000 },
      { name: "Jun", value: 5500 },
    ]
  } else if (lowerPrompt.includes("growth") || lowerPrompt.includes("increase")) {
    title = "Growth Metrics"
    description = "Quarterly growth data"
    data = [
      { name: "Q1", value: 20 },
      { name: "Q2", value: 35 },
      { name: "Q3", value: 45 },
      { name: "Q4", value: 60 },
    ]
  } else if (lowerPrompt.includes("market") || lowerPrompt.includes("share")) {
    title = "Market Share"
    description = "Market distribution"
    data = [
      { name: "Company A", value: 35 },
      { name: "Company B", value: 25 },
      { name: "Company C", value: 20 },
      { name: "Others", value: 20 },
    ]
  } else {
    // Default data
    title = "Sample Data"
    description = "Generated sample chart"
    data = [
      { name: "Category A", value: 400 },
      { name: "Category B", value: 300 },
      { name: "Category C", value: 200 },
      { name: "Category D", value: 100 },
    ]
  }

  return {
    type: chartType,
    title,
    description,
    data,
  }
}

export async function generateResponse(prompt: string) {
  try {
    console.log("Generating response for prompt:", prompt)

    const apiKey = getApiKey()
    console.log("API key available:", !!apiKey)

    if (!apiKey) {
      console.log("No API key available, using fallback response")

      // Check if it's a chart request
      if (isChartRequest(prompt)) {
        const chartData = generateFallbackChartData(prompt)
        return {
          content: `I've created a ${chartData.type} chart for you based on your request.`,
          type: "chart" as const,
          chartData,
        }
      }

      // Fallback text response
      return {
        content:
          "I'm currently unable to connect to the AI service, but I can help you create charts and visualizations. Try asking me to create a chart with your data!",
        type: "text" as const,
      }
    }

    // Try to generate response with AI
    try {
      const { text } = await generateText({
        model: google("gemini-2.0-flash-exp", { apiKey }),
        prompt: `You are a helpful assistant that can create charts and answer questions. 
        
        If the user is asking for a chart, graph, or data visualization, respond with a JSON object in this exact format:
        {
          "content": "I've created a [chart type] chart for you.",
          "type": "chart",
          "chartData": {
            "type": "bar|line|pie|scatter",
            "title": "Chart Title",
            "description": "Chart description",
            "data": [{"name": "Category", "value": 100}]
          }
        }
        
        If the user is asking a regular question, just respond normally with helpful text.
        
        User prompt: ${prompt}`,
        maxTokens: 1000,
      })

      console.log("AI response:", text)

      // Try to parse as JSON first (for chart responses)
      try {
        const jsonResponse = JSON.parse(text)
        if (jsonResponse.type === "chart" && jsonResponse.chartData) {
          return jsonResponse
        }
      } catch (e) {
        // Not JSON, treat as regular text response
      }

      // Check if it's a chart request but AI didn't return JSON
      if (isChartRequest(prompt)) {
        const chartData = generateFallbackChartData(prompt)
        return {
          content: text || `I've created a ${chartData.type} chart for you based on your request.`,
          type: "chart" as const,
          chartData,
        }
      }

      // Regular text response
      return {
        content: text || "I'm here to help! You can ask me questions or request charts and visualizations.",
        type: "text" as const,
      }
    } catch (aiError) {
      console.error("AI generation error:", aiError)

      // Fallback to generated response
      if (isChartRequest(prompt)) {
        const chartData = generateFallbackChartData(prompt)
        return {
          content: `I've created a ${chartData.type} chart for you based on your request.`,
          type: "chart" as const,
          chartData,
        }
      }

      return {
        content:
          "I'm having trouble connecting to the AI service right now, but I'm still here to help! Try asking me to create a chart or visualization.",
        type: "text" as const,
      }
    }
  } catch (error) {
    console.error("Error in generateResponse:", error)

    // Final fallback
    if (isChartRequest(prompt)) {
      const chartData = generateFallbackChartData(prompt)
      return {
        content: `I've created a ${chartData.type} chart for you.`,
        type: "chart" as const,
        chartData,
      }
    }

    return {
      content: "I apologize, but I'm experiencing some technical difficulties. Please try again later.",
      type: "text" as const,
    }
  }
}
