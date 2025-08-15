"use server"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

function isChartRequest(prompt: string): boolean {
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

  const lowerPrompt = prompt.toLowerCase()
  return chartKeywords.some((keyword) => lowerPrompt.includes(keyword))
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
