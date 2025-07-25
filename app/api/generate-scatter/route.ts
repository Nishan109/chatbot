import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const systemPrompt = `You are a data visualization expert. Generate scatter plot data based on the user's prompt.
    Format the response as a JSON object with:
    {
      "title": "Plot title",
      "description": "Plot description",
      "xAxisLabel": "X-axis label",
      "yAxisLabel": "Y-axis label",
      "data": [
        {
          "name": "Series name",
          "data": [
            { 
              "x": number, 
              "y": number, 
              "z": number (optional), 
              "label": "string" (optional), 
              "category": "string" (optional) 
            }
          ],
          "color": "string (hex color code)"
        }
      ]
    }
    Generate realistic, coherent data that makes sense for the context.
    Include 15-30 data points per series.
    Use appropriate scales and ranges for the data.
    ONLY return the JSON object, no additional text.`

    const fullPrompt = `${systemPrompt}

    User request: ${prompt}`

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
    return NextResponse.json({ error: "Failed to generate scatter plot data" }, { status: 500 })
  }
}
