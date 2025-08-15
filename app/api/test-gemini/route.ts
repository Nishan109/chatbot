import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function GET() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const result = await model.generateContent("Hello, world!")
    const response = await result.response
    const text = response.text()
    return NextResponse.json({ success: true, message: text })
  } catch (error) {
    console.error("Error testing Gemini API:", error)
    return NextResponse.json({ success: false, error: "Failed to connect to Gemini API" }, { status: 500 })
  }
}
