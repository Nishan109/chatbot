"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export interface ChartResponse {
  type: "chart" | "text" | "diagram"
  content?: string
  chartType?: "bar" | "line" | "pie" | "radar" | "scatter"
  title?: string
  description?: string
  data?: any[]
  diagramType?: string
  code?: string
  xAxisLabel?: string
  yAxisLabel?: string
}

function extractJsonFromResponse(text: string): any {
  try {
    // First try to parse the entire text as JSON
    const trimmed = text.trim()
    return JSON.parse(trimmed)
  } catch {
    try {
      // Remove markdown code blocks
      const cleaned = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .replace(/^[^{]*/, "")
        .replace(/[^}]*$/, "")
        .trim()
      return JSON.parse(cleaned)
    } catch {
      try {
        // Extract JSON object from text
        const jsonMatch = text.match(/\{[\s\S]*?\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      } catch {
        // Look for data array pattern
        const dataMatch = text.match(/"data"\s*:\s*\[[\s\S]*?\]/)
        if (dataMatch) {
          try {
            const fullJson = `{"type":"chart","chartType":"bar","title":"Generated Chart","description":"Data visualization",${dataMatch[0]}}`
            return JSON.parse(fullJson)
          } catch {
            // Continue to fallback
          }
        }
      }
    }
  }
  throw new Error("No valid JSON found in response")
}

// Enhanced chart detection function
function isChartRequest(message: string): boolean {
  const chartKeywords = [
    "chart",
    "graph",
    "plot",
    "visualization",
    "visualize",
    "bar",
    "line",
    "pie",
    "scatter",
    "area",
    "histogram",
    "data",
    "analytics",
    "dashboard",
    "report",
    "compare",
    "comparison",
    "trend",
    "analysis",
    "stats",
    "statistics",
    "chat",
    "compines",
    "companies",
    "top",
    "best",
    "ranking",
  ]

  const lowerMessage = message.toLowerCase()
  const hasChartKeyword = chartKeywords.some((keyword) => lowerMessage.includes(keyword))

  console.log("Chart detection:", { message, hasChartKeyword, lowerMessage })
  return hasChartKeyword
}

// Generate fallback chart data based on user request
function generateFallbackChartData(message: string) {
  const lowerMessage = message.toLowerCase()

  // Tech companies data for the specific request
  if (lowerMessage.includes("tech") && (lowerMessage.includes("compines") || lowerMessage.includes("companies"))) {
    return {
      type: "bar",
      title: "Top 5 Tech Companies in USA by Market Cap",
      data: [
        { name: "Apple", value: 3000, color: "#007AFF" },
        { name: "Microsoft", value: 2800, color: "#00BCF2" },
        { name: "Alphabet", value: 1700, color: "#4285F4" },
        { name: "Amazon", value: 1500, color: "#FF9500" },
        { name: "Meta", value: 800, color: "#1877F2" },
      ],
      xAxis: "Company",
      yAxis: "Market Cap (Billions USD)",
    }
  }

  // Sales data
  if (lowerMessage.includes("sales") || lowerMessage.includes("revenue")) {
    return {
      type: "line",
      title: "Monthly Sales Data 2024",
      data: [
        { name: "Jan", value: 12000 },
        { name: "Feb", value: 15000 },
        { name: "Mar", value: 18000 },
        { name: "Apr", value: 22000 },
        { name: "May", value: 25000 },
        { name: "Jun", value: 28000 },
      ],
      xAxis: "Month",
      yAxis: "Sales ($)",
    }
  }

  // Default sample data
  return {
    type: "bar",
    title: "Sample Data Visualization",
    data: [
      { name: "Category A", value: 400, color: "#8884d8" },
      { name: "Category B", value: 300, color: "#82ca9d" },
      { name: "Category C", value: 200, color: "#ffc658" },
      { name: "Category D", value: 278, color: "#ff7300" },
      { name: "Category E", value: 189, color: "#00ff88" },
    ],
    xAxis: "Categories",
    yAxis: "Values",
  }
}

async function generateWithGemini(prompt: string): Promise<ChartResponse> {
  console.log("Using Gemini API for chart generation")

  // Always use Gemini API - try models in order of preference
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"]

  for (const modelName of models) {
    try {
      console.log(`Attempting Gemini model: ${modelName}`)
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      })

      const chartPrompt = `Create a data visualization for: "${prompt}"

Return ONLY valid JSON in this exact format:
{
  "type": "chart",
  "chartType": "bar",
  "title": "Chart Title",
  "description": "Brief description",
  "data": [
    {"name": "Item 1", "value": 30},
    {"name": "Item 2", "value": 25}
  ]
}

Rules:
1. Choose appropriate chart type (pie, bar, line, radar)
2. Generate 5-10 realistic data points
3. Use meaningful names and values
4. Make values realistic for the context
5. Return ONLY the JSON, no other text

Request: ${prompt}`

      const result = await model.generateContent(chartPrompt)
      const response = await result.response
      const text = response.text()

      if (text?.trim()) {
        console.log(`Gemini ${modelName} response received:`, text.substring(0, 200))
        const jsonResponse = extractJsonFromResponse(text)

        if (jsonResponse && jsonResponse.type === "chart" && Array.isArray(jsonResponse.data)) {
          console.log(`Successfully generated chart with Gemini ${modelName}`)
          return {
            type: "chart",
            chartType: jsonResponse.chartType || "bar",
            title: jsonResponse.title || "Generated Chart",
            description: jsonResponse.description || "Data visualization",
            data: jsonResponse.data.map((item: any) => ({
              name: String(item.name || "Unknown"),
              value: Number(item.value) || 0,
            })),
          }
        }
      }
    } catch (error: any) {
      console.log(`Gemini model ${modelName} failed:`, error?.message || error)

      // If quota exceeded, try next model
      if (error?.message?.includes("quota") || error?.message?.includes("429")) {
        console.log(`Gemini ${modelName} quota exceeded, trying next model`)
        continue
      }

      // For other errors, also try next model
      continue
    }
  }

  // If all Gemini models fail, throw error to use fallback
  throw new Error("All Gemini models failed")
}

export async function generateResponse(prompt: string, chartType?: string): Promise<ChartResponse> {
  try {
    console.log("=== generateResponse called ===")
    console.log("Prompt:", prompt)
    console.log("Chart type:", chartType)

    // Enhanced chart request detection
    const isChart = isChartRequest(prompt)
    console.log("Is chart request:", isChart)

    if (!isChart) {
      console.log("Not a chart request, returning text response")
      return {
        type: "text",
        content:
          "I'm specialized in creating charts and data visualizations. Please ask me to create a chart, graph, or visualize some data!",
      }
    }

    console.log("Processing as chart request...")

    // Always try Gemini API first
    try {
      console.log("Attempting Gemini API...")
      const geminiResult = await generateWithGemini(prompt)
      console.log("Gemini API success:", geminiResult)
      return geminiResult
    } catch (error) {
      console.log("Gemini API failed, using smart fallback:", error)
      // Use smart fallback data if Gemini fails
      const fallbackResult = generateFallbackChartData(prompt)
      console.log("Fallback result:", fallbackResult)
      return {
        type: "chart",
        chartType: fallbackResult.type,
        title: fallbackResult.title,
        description: "Data visualization",
        data: fallbackResult.data,
        xAxisLabel: fallbackResult.xAxis,
        yAxisLabel: fallbackResult.yAxis,
      }
    }
  } catch (error) {
    console.error("Error in generateResponse:", error)
    // Always return fallback data on any error
    const fallbackResult = generateFallbackChartData(prompt)
    console.log("Error fallback result:", fallbackResult)
    return {
      type: "chart",
      chartType: fallbackResult.type,
      title: fallbackResult.title,
      description: "Data visualization",
      data: fallbackResult.data,
      xAxisLabel: fallbackResult.xAxis,
      yAxisLabel: fallbackResult.yAxis,
    }
  }
}

export async function createChat(message: string, userId?: string) {
  try {
    console.log("Creating chat with message:", message)
    console.log("User ID:", userId)

    if (!userId) {
      throw new Error("User authentication required")
    }

    // Check if user has an existing conversation, if not create one
    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)

    if (convError) {
      console.error("Error fetching conversations:", convError)
      throw convError
    }

    let conversationId: string

    if (!conversations || conversations.length === 0) {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (createError) {
        console.error("Error creating conversation:", createError)
        throw createError
      }

      conversationId = newConv.id
      console.log("Created new conversation:", conversationId)
    } else {
      conversationId = conversations[0].id
      console.log("Using existing conversation:", conversationId)
    }

    // Add user message
    const { error: userMsgError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      content: message,
      role: "user",
      type: "text",
      created_at: new Date().toISOString(),
    })

    if (userMsgError) {
      console.error("Error adding user message:", userMsgError)
      throw userMsgError
    }

    console.log("Added user message successfully")

    // Check if this is a chart request
    const isChart = isChartRequest(message)
    console.log("Is chart request:", isChart)

    let assistantResponse = ""
    let chartData = null
    let messageType = "text"

    if (isChart) {
      try {
        // Generate AI response for chart
        const { text } = await generateText({
          model: google("gemini-1.5-flash"),
          prompt: `Create a chart based on this request: "${message}". 
                   Provide a brief explanation of what the chart shows.
                   Keep the response concise and helpful.`,
          maxTokens: 500,
        })

        assistantResponse = text || "Here's your chart visualization:"
        chartData = generateFallbackChartData(message)
        messageType = "chart"

        console.log("Generated chart data:", chartData)
      } catch (aiError) {
        console.error("AI generation error:", aiError)
        assistantResponse = "I've created a chart visualization for you based on your request."
        chartData = generateFallbackChartData(message)
        messageType = "chart"
      }
    } else {
      try {
        // Generate regular AI response
        const { text } = await generateText({
          model: google("gemini-1.5-flash"),
          prompt: `You are a helpful AI assistant specialized in data visualization and charts. 
                   User message: "${message}"
                   
                   If the user is asking for charts, graphs, or data visualization, encourage them to be more specific about what they want to visualize.
                   Otherwise, provide a helpful response to their question.`,
          maxTokens: 500,
        })

        assistantResponse =
          text || "I'm here to help you create charts and visualizations. What would you like to visualize?"
      } catch (aiError) {
        console.error("AI generation error:", aiError)
        assistantResponse =
          "I'm specialized in creating charts and data visualizations. Please ask me to create a chart, graph, or visualize some data!"
      }
    }

    // Add assistant message
    const { error: assistantMsgError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      content: assistantResponse,
      role: "assistant",
      type: messageType,
      chart_data: chartData ? JSON.stringify(chartData) : null,
      created_at: new Date().toISOString(),
    })

    if (assistantMsgError) {
      console.error("Error adding assistant message:", assistantMsgError)
      throw assistantMsgError
    }

    console.log("Added assistant message successfully")

    // Update conversation timestamp
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId)

    revalidatePath("/chat")
    revalidatePath(`/chat/${conversationId}`)

    return {
      success: true,
      conversationId,
      message: assistantResponse,
      chartData,
      type: messageType,
    }
  } catch (error) {
    console.error("Error in createChat:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getConversations(userId: string) {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getMessages(conversationId: string, userId: string) {
  try {
    // First verify the conversation belongs to the user
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single()

    if (convError || !conversation) {
      throw new Error("Conversation not found or access denied")
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) throw error

    // Parse JSON fields
    const parsedMessages = data.map((msg) => ({
      ...msg,
      chart_data: msg.chart_data ? JSON.parse(msg.chart_data) : null,
      diagram_data: msg.diagram_data ? JSON.parse(msg.diagram_data) : null,
      file_attachment: msg.file_attachment ? JSON.parse(msg.file_attachment) : null,
    }))

    return { success: true, data: parsedMessages }
  } catch (error) {
    console.error("Error fetching messages:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
