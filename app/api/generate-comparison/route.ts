import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const systemPrompt = `You are a comparison table generator. Generate detailed, accurate comparison data in JSON format.
    Format the response as a JSON object with:
    {
      "title": "Descriptive title",
      "products": ["Product1", "Product2", ...],
      "data": [
        {
          "feature": "Feature name",
          "Product1": "Value",
          "Product2": "Value",
          ...
        },
        ...
      ]
    }
    Include relevant features and accurate data. Format numbers consistently.
    ONLY return the JSON object, no additional text or explanation.`

    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`

    // Generate content
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    try {
      // Extract JSON from the response
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
    return NextResponse.json({ error: "Failed to generate comparison" }, { status: 500 })
  }
}
