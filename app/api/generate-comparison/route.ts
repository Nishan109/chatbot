import { type NextRequest, NextResponse } from "next/server"

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

// Google Gemini API configuration
import { GoogleGenerativeAI } from "@google/generative-ai"
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log("Generating comparison for:", prompt)

    // Enhanced prompt for better comparison generation
    const enhancedPrompt = `
Create a detailed comparison analysis for: "${prompt}"

Generate a comprehensive comparison with the following structure:
1. A comparison table with at least 5-8 relevant criteria
2. Detailed analysis of each item being compared
3. Pros and cons for each option
4. A final recommendation

Please provide the response in JSON format with this structure:
{
  "title": "Comparison Title",
  "description": "Brief description of what's being compared",
  "items": ["Item 1", "Item 2", "Item 3"],
  "criteria": [
    {
      "name": "Criterion Name",
      "item1": "Rating/Description",
      "item2": "Rating/Description", 
      "item3": "Rating/Description"
    }
  ],
  "analysis": {
    "item1": {
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1", "Con 2"],
      "score": 85
    }
  },
  "recommendation": "Final recommendation text"
}

Make sure to include realistic and accurate information. If comparing products, include pricing, features, performance, etc.
`

    let result = null
    let apiUsed = "none"

    // Try DeepSeek API first
    if (DEEPSEEK_API_KEY) {
      try {
        console.log("Trying DeepSeek API...")
        const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "user",
                content: enhancedPrompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        })

        if (deepseekResponse.ok) {
          const deepseekData = await deepseekResponse.json()
          const content = deepseekData.choices?.[0]?.message?.content

          if (content) {
            try {
              // Try to parse JSON from the response
              const cleanedContent = content
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim()
              const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/)

              if (jsonMatch) {
                result = JSON.parse(jsonMatch[0])
                apiUsed = "deepseek"
                console.log("Successfully used DeepSeek API")
              }
            } catch (parseError) {
              console.error("Failed to parse DeepSeek response:", parseError)
            }
          }
        } else {
          console.error("DeepSeek API error:", deepseekResponse.status, deepseekResponse.statusText)
        }
      } catch (error) {
        console.error("DeepSeek API request failed:", error)
      }
    }

    // Try Google Gemini API if DeepSeek failed
    if (!result && process.env.GOOGLE_API_KEY) {
      const models = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"]

      for (const modelName of models) {
        try {
          console.log(`Trying Google Gemini API with model: ${modelName}`)
          const model = genAI.getGenerativeModel({ model: modelName })
          const geminiResult = await model.generateContent(enhancedPrompt)
          const response = await geminiResult.response
          const text = response.text()

          if (text) {
            try {
              const cleanedText = text
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim()
              const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)

              if (jsonMatch) {
                result = JSON.parse(jsonMatch[0])
                apiUsed = `google-${modelName}`
                console.log(`Successfully used Google Gemini API with model: ${modelName}`)
                break
              }
            } catch (parseError) {
              console.error(`Failed to parse Google response from ${modelName}:`, parseError)
              continue
            }
          }
        } catch (error) {
          console.error(`Google Gemini API error with ${modelName}:`, error)
          continue
        }
      }
    }

    // Fallback to structured template if all APIs failed
    if (!result) {
      console.log("All APIs failed, using fallback data")
      result = generateFallbackComparison(prompt)
      apiUsed = "fallback"
    }

    // Ensure the result has the required structure
    if (!result.title || !result.items || !Array.isArray(result.items)) {
      result = generateFallbackComparison(prompt)
      apiUsed = "fallback-structured"
    }

    return NextResponse.json({
      ...result,
      apiUsed,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in comparison generation:", error)
    return NextResponse.json(
      {
        error: "Failed to generate comparison",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function generateFallbackComparison(prompt: string) {
  // Generate a basic comparison structure based on the prompt
  const isProductComparison = prompt.toLowerCase().includes("vs") || prompt.toLowerCase().includes("compare")

  if (prompt.toLowerCase().includes("iphone") || prompt.toLowerCase().includes("phone")) {
    return {
      title: "Smartphone Comparison",
      description: "Comparison of popular smartphone models",
      items: ["iPhone 15 Pro", "Samsung Galaxy S24", "Google Pixel 8"],
      criteria: [
        {
          name: "Price",
          "iPhone 15 Pro": "$999",
          "Samsung Galaxy S24": "$799",
          "Google Pixel 8": "$699",
        },
        {
          name: "Display",
          "iPhone 15 Pro": '6.1" Super Retina XDR',
          "Samsung Galaxy S24": '6.2" Dynamic AMOLED',
          "Google Pixel 8": '6.2" OLED',
        },
        {
          name: "Camera",
          "iPhone 15 Pro": "48MP Triple Camera",
          "Samsung Galaxy S24": "50MP Triple Camera",
          "Google Pixel 8": "50MP Dual Camera",
        },
        {
          name: "Battery Life",
          "iPhone 15 Pro": "Up to 23 hours",
          "Samsung Galaxy S24": "Up to 22 hours",
          "Google Pixel 8": "Up to 24 hours",
        },
        {
          name: "Storage",
          "iPhone 15 Pro": "128GB - 1TB",
          "Samsung Galaxy S24": "128GB - 512GB",
          "Google Pixel 8": "128GB - 256GB",
        },
      ],
      analysis: {
        "iPhone 15 Pro": {
          pros: ["Premium build quality", "Excellent camera system", "Long software support"],
          cons: ["Higher price", "Limited customization"],
          score: 88,
        },
        "Samsung Galaxy S24": {
          pros: ["Great display", "Versatile features", "Good value"],
          cons: ["Bloatware", "Shorter software support"],
          score: 85,
        },
        "Google Pixel 8": {
          pros: ["Best AI features", "Clean Android", "Great camera AI"],
          cons: ["Limited availability", "Average build quality"],
          score: 82,
        },
      },
      recommendation:
        "For premium users who want the best overall experience, iPhone 15 Pro is recommended. For value-conscious buyers, Samsung Galaxy S24 offers great features at a lower price. Google Pixel 8 is ideal for photography enthusiasts and pure Android lovers.",
    }
  }

  // Default fallback
  return {
    title: "Comparison Analysis",
    description: "Generated comparison based on your request",
    items: ["Option A", "Option B", "Option C"],
    criteria: [
      {
        name: "Performance",
        "Option A": "Excellent",
        "Option B": "Good",
        "Option C": "Average",
      },
      {
        name: "Price",
        "Option A": "High",
        "Option B": "Medium",
        "Option C": "Low",
      },
      {
        name: "Features",
        "Option A": "Comprehensive",
        "Option B": "Standard",
        "Option C": "Basic",
      },
      {
        name: "User Experience",
        "Option A": "Premium",
        "Option B": "Good",
        "Option C": "Acceptable",
      },
    ],
    analysis: {
      "Option A": {
        pros: ["High quality", "Advanced features", "Great support"],
        cons: ["Expensive", "Complex setup"],
        score: 85,
      },
      "Option B": {
        pros: ["Good balance", "Reasonable price", "Easy to use"],
        cons: ["Limited features", "Average quality"],
        score: 75,
      },
      "Option C": {
        pros: ["Affordable", "Simple", "Quick setup"],
        cons: ["Basic features", "Lower quality"],
        score: 65,
      },
    },
    recommendation:
      "Choose Option A for premium needs, Option B for balanced requirements, or Option C for budget-conscious decisions.",
  }
}
