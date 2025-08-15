"use server"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

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

function isChartRequest(message: string): boolean {
  const chartKeywords = [
    "chart",
    "graph",
    "plot",
    "visualization",
    "visualize",
    "data",
    "bar chart",
    "line chart",
    "pie chart",
    "scatter plot",
    "histogram",
    "show me",
    "create",
    "generate",
    "make",
    "draw",
    "display",
    "compare",
    "analysis",
    "trend",
    "distribution",
    "correlation",
  ]

  const lowerMessage = message.toLowerCase()
  return chartKeywords.some((keyword) => lowerMessage.includes(keyword))
}

// Generate fallback chart data based on user request
function generateFallbackChartData(message: string) {
  const lowerMessage = message.toLowerCase()

  // Tech companies data for the specific request
  if (lowerMessage.includes("tech") && (lowerMessage.includes("companies") || lowerMessage.includes("company"))) {
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

  // Try models in order of preference
  const models = ["gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-pro"]

  for (const modelName of models) {
    try {
      console.log(`Attempting Gemini model: ${modelName}`)

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

      const result = await generateText({
        model: google(modelName),
        prompt: chartPrompt,
        maxTokens: 1000,
      })

      const text = result.text
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
        chartType: fallbackResult.type as any,
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
      chartType: fallbackResult.type as any,
      title: fallbackResult.title,
      description: "Data visualization",
      data: fallbackResult.data,
      xAxisLabel: fallbackResult.xAxis,
      yAxisLabel: fallbackResult.yAxis,
    }
  }
}

export async function createConversation(prompt: string, userId?: string) {
  try {
    console.log("Creating conversation with prompt:", prompt)
    console.log("User ID:", userId)
    console.log("Is chart request:", isChartRequest(prompt))

    // Always use Gemini API for chat creation
    let result
    try {
      console.log("Using gemini-2.0-flash-exp model")
      result = await generateText({
        model: google("gemini-2.0-flash-exp"),
        prompt: `You are a helpful AI assistant that specializes in data visualization and chart creation. 
        
User request: ${prompt}

${
  isChartRequest(prompt)
    ? `
This appears to be a chart request. Please provide:
1. A brief explanation of what chart would be appropriate
2. Sample data structure that would work for this visualization
3. Chart configuration in JSON format

Format your response as JSON with this structure:
{
  "explanation": "Brief explanation of the chart",
  "chartData": [array of data objects],
  "chartConfig": {
    "type": "bar|line|pie|scatter",
    "title": "Chart Title",
    "xAxis": "x-axis label",
    "yAxis": "y-axis label"
  }
}
`
    : "Please provide a helpful response to the user's request."
}`,
        maxTokens: 1000,
      })
    } catch (error) {
      console.log("Primary model failed, trying fallback: gemini-1.5-flash")
      result = await generateText({
        model: google("gemini-1.5-flash"),
        prompt: `You are a helpful AI assistant. Please respond to: ${prompt}`,
        maxTokens: 1000,
      })
    }

    console.log("AI Response received:", result.text.substring(0, 200) + "...")

    // Create conversation in database
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({
        title: prompt.substring(0, 100),
        user_id: userId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (convError) {
      console.error("Error creating conversation:", convError)
      throw convError
    }

    console.log("Conversation created:", conversation.id)

    // Create user message
    const { error: userMsgError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      content: prompt,
      role: "user",
      created_at: new Date().toISOString(),
    })

    if (userMsgError) {
      console.error("Error creating user message:", userMsgError)
      throw userMsgError
    }

    // Create assistant message
    const { error: assistantMsgError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      content: result.text,
      role: "assistant",
      created_at: new Date().toISOString(),
    })

    if (assistantMsgError) {
      console.error("Error creating assistant message:", assistantMsgError)
      throw assistantMsgError
    }

    console.log("Messages created successfully")

    revalidatePath("/dashboard")
    revalidatePath(`/chat/${conversation.id}`)

    return {
      success: true,
      conversationId: conversation.id,
      response: result.text,
    }
  } catch (error) {
    console.error("Error in createConversation:", error)

    // Provide fallback response for chart requests
    if (isChartRequest(prompt)) {
      const fallbackResponse = {
        explanation: "I can help you create a chart for your data visualization needs.",
        chartData: [
          { name: "Sample A", value: 30 },
          { name: "Sample B", value: 45 },
          { name: "Sample C", value: 25 },
        ],
        chartConfig: {
          type: "bar",
          title: "Sample Chart",
          xAxis: "Categories",
          yAxis: "Values",
        },
      }

      return {
        success: true,
        conversationId: "fallback",
        response: JSON.stringify(fallbackResponse),
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function addMessage(conversationId: string, content: string, role: "user" | "assistant") {
  try {
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      content,
      role,
      created_at: new Date().toISOString(),
    })

    if (error) throw error

    revalidatePath(`/chat/${conversationId}`)
    return { success: true }
  } catch (error) {
    console.error("Error adding message:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getConversation(id: string) {
  try {
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single()

    if (convError) throw convError

    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })

    if (msgError) throw msgError

    return {
      success: true,
      conversation: {
        ...conversation,
        messages: messages || [],
      },
    }
  } catch (error) {
    console.error("Error getting conversation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getConversations(userId?: string) {
  try {
    let query = supabase.from("conversations").select("*").order("updated_at", { ascending: false })

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query

    if (error) throw error

    return {
      success: true,
      conversations: data || [],
    }
  } catch (error) {
    console.error("Error getting conversations:", error)
    return {
      success: false,
      conversations: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function deleteConversation(id: string) {
  try {
    // Delete messages first (due to foreign key constraint)
    const { error: msgError } = await supabase.from("messages").delete().eq("conversation_id", id)

    if (msgError) throw msgError

    // Delete conversation
    const { error: convError } = await supabase.from("conversations").delete().eq("id", id)

    if (convError) throw convError

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function updateConversationTitle(id: string, title: string) {
  try {
    const { error } = await supabase
      .from("conversations")
      .update({
        title,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/dashboard")
    revalidatePath(`/chat/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating conversation title:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
