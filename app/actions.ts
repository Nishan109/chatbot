"use server"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"

// Chart detection function
function isChartRequest(prompt: string): boolean {
  const chartKeywords = [
    "chart",
    "graph",
    "plot",
    "visualize",
    "visualization",
    "data",
    "bar",
    "line",
    "pie",
    "scatter",
    "histogram",
    "area",
    "bubble",
    "radar",
    "polar",
    "donut",
    "treemap",
    "heatmap",
    "funnel",
    "show",
    "display",
    "create",
    "generate",
    "make",
    "draw",
    "render",
    "build",
    "analyze",
    "compare",
    "trend",
    "distribution",
    "correlation",
    "sales",
    "revenue",
    "profit",
    "growth",
    "performance",
    "metrics",
    "statistics",
    "stats",
    "numbers",
    "values",
    "dataset",
  ]

  const lowerPrompt = prompt.toLowerCase()
  return chartKeywords.some((keyword) => lowerPrompt.includes(keyword))
}

// Generate fallback chart data based on prompt
function generateFallbackChartData(prompt: string) {
  const lowerPrompt = prompt.toLowerCase()

  // Sales/Revenue data
  if (lowerPrompt.includes("sales") || lowerPrompt.includes("revenue")) {
    return {
      type: "bar" as const,
      title: "Monthly Sales Performance",
      description: "Sales data showing monthly performance trends",
      data: [
        { name: "Jan", value: 45000 },
        { name: "Feb", value: 52000 },
        { name: "Mar", value: 48000 },
        { name: "Apr", value: 61000 },
        { name: "May", value: 55000 },
        { name: "Jun", value: 67000 },
      ],
    }
  }

  // Growth/Performance data
  if (lowerPrompt.includes("growth") || lowerPrompt.includes("performance")) {
    return {
      type: "line" as const,
      title: "Growth Performance Over Time",
      description: "Performance metrics showing growth trends",
      data: [
        { name: "Q1", value: 15 },
        { name: "Q2", value: 23 },
        { name: "Q3", value: 18 },
        { name: "Q4", value: 31 },
        { name: "Q5", value: 28 },
        { name: "Q6", value: 35 },
      ],
    }
  }

  // Market share or distribution
  if (lowerPrompt.includes("market") || lowerPrompt.includes("share") || lowerPrompt.includes("pie")) {
    return {
      type: "pie" as const,
      title: "Market Share Distribution",
      description: "Market share breakdown by category",
      data: [
        { name: "Product A", value: 35 },
        { name: "Product B", value: 25 },
        { name: "Product C", value: 20 },
        { name: "Product D", value: 15 },
        { name: "Others", value: 5 },
      ],
    }
  }

  // Default chart data
  return {
    type: "bar" as const,
    title: "Sample Data Visualization",
    description: "Generated chart based on your request",
    data: [
      { name: "Category A", value: 65 },
      { name: "Category B", value: 78 },
      { name: "Category C", value: 52 },
      { name: "Category D", value: 91 },
      { name: "Category E", value: 43 },
    ],
  }
}

// Get available API key
function getApiKey(): string | null {
  // Check for Google/Gemini API keys in different environment variable names
  const possibleKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.GOOGLE_AI_API_KEY,
  ]

  for (const key of possibleKeys) {
    if (key && key.trim()) {
      return key.trim()
    }
  }

  return null
}

export async function generateResponse(prompt: string, chartType?: string) {
  try {
    console.log("Generating response for prompt:", prompt)

    // Check if this is a chart request
    if (isChartRequest(prompt)) {
      console.log("Detected chart request")

      // Get API key
      const apiKey = getApiKey()

      if (apiKey) {
        try {
          // Try to generate chart with AI
          const result = await generateText({
            model: google("gemini-2.0-flash-exp", { apiKey }),
            prompt: `Create a chart based on this request: "${prompt}". 
            
            Respond with a JSON object containing:
            - type: one of "bar", "line", "pie", "radar"
            - title: descriptive title
            - description: brief description
            - data: array of objects with "name" and "value" properties
            
            Make the data realistic and relevant to the request. Only return valid JSON, no other text.`,
            maxTokens: 1000,
          })

          console.log("AI response:", result.text)

          // Try to parse the AI response
          let chartData
          try {
            // Clean the response text
            let cleanedText = result.text.trim()

            // Remove markdown code blocks if present
            if (cleanedText.startsWith("```json")) {
              cleanedText = cleanedText.replace(/```json\n?/, "").replace(/\n?```$/, "")
            } else if (cleanedText.startsWith("```")) {
              cleanedText = cleanedText.replace(/```\n?/, "").replace(/\n?```$/, "")
            }

            // Try to find JSON in the response
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              cleanedText = jsonMatch[0]
            }

            chartData = JSON.parse(cleanedText)
            console.log("Parsed chart data:", chartData)

            // Validate the structure
            if (!chartData.type || !chartData.title || !Array.isArray(chartData.data)) {
              throw new Error("Invalid chart data structure")
            }
          } catch (parseError) {
            console.log("Failed to parse AI response, using fallback data:", parseError)
            chartData = generateFallbackChartData(prompt)
          }

          return {
            type: "chart" as const,
            chartType: chartData.type,
            title: chartData.title,
            description: chartData.description || "Generated chart visualization",
            data: chartData.data,
          }
        } catch (aiError) {
          console.log("AI generation failed, using fallback:", aiError)
          const fallbackData = generateFallbackChartData(prompt)

          return {
            type: "chart" as const,
            chartType: fallbackData.type,
            title: fallbackData.title,
            description: fallbackData.description,
            data: fallbackData.data,
          }
        }
      } else {
        console.log("No API key available, using fallback data")
        const fallbackData = generateFallbackChartData(prompt)

        return {
          type: "chart" as const,
          chartType: fallbackData.type,
          title: fallbackData.title,
          description: fallbackData.description,
          data: fallbackData.data,
        }
      }
    }

    // For non-chart requests, generate text response
    console.log("Generating text response")

    const apiKey = getApiKey()

    if (apiKey) {
      try {
        const result = await generateText({
          model: google("gemini-2.0-flash-exp", { apiKey }),
          prompt: `You are a helpful AI assistant. Respond to this message: "${prompt}"
          
          Keep your response concise and helpful. If the user is asking about data visualization or charts, 
          suggest they use more specific chart-related keywords in their request.`,
          maxTokens: 500,
        })

        return {
          type: "text" as const,
          content: result.text,
        }
      } catch (textError) {
        console.error("Text generation failed:", textError)

        // Fallback text response
        return {
          type: "text" as const,
          content:
            "I understand you're looking for assistance. Could you please provide more details about what you'd like me to help you with? If you're interested in creating charts or visualizations, try using keywords like 'chart', 'graph', or 'visualize' in your request.",
        }
      }
    } else {
      // No API key available, provide helpful fallback
      return {
        type: "text" as const,
        content:
          "I'm a chart and data visualization assistant. To create charts, try prompts like 'create a bar chart of sales data' or 'show me a pie chart of market share'. I can generate various types of visualizations based on your requests.",
      }
    }
  } catch (error) {
    console.error("Error in generateResponse:", error)

    // Ultimate fallback
    return {
      type: "text" as const,
      content:
        "I apologize, but I encountered an error while processing your request. Please try again with a different prompt.",
    }
  }
}
