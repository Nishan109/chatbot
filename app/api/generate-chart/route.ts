import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { prompt, chartType } = await req.json()
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    let systemPrompt = ""
    if (chartType === "scatter") {
      systemPrompt = `Generate a scatter plot dataset based on the user's prompt.
      Format as JSON:
      {
        "title": "Chart title",
        "description": "Chart description",
        "data": [
          {
            "temperature": number,
            "sales": number,
            "label": "string"
          }
        ]
      }
      Include 10-15 realistic data points.
      ONLY return the JSON object, no additional text.`
    } else {
      // Handle other chart types...
      systemPrompt = `Generate chart data based on the user's prompt...`
    }

    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }

      const parsedData = JSON.parse(jsonMatch[0])
      return NextResponse.json(parsedData)
    } catch (e) {
      console.error("Parsing error:", e)
      throw new Error("Invalid JSON response from AI")
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to generate chart data" }, { status: 500 })
  }
}
