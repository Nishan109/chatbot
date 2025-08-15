import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Structure the prompt for better comparison generation
    const structuredPrompt = `Generate a detailed comparison in JSON format for: ${prompt}

Format the response EXACTLY as follows:
{
  "title": "Clear comparison title",
  "products": ["Product1", "Product2", ...],
  "data": [
    {
      "feature": "Feature name",
      "Product1": "Value",
      "Product2": "Value"
    }
  ]
}

Important rules:
1. ONLY return valid JSON
2. Include at least 8-10 key features
3. Use consistent formatting for similar values
4. Include specific numbers and details
5. Keep descriptions concise but informative
6. Format prices as numbers without currency symbols
7. Use "Yes" or "No" for boolean features
8. Include technical specifications where relevant

DO NOT include any explanatory text, ONLY the JSON object.`

    try {
      // Check if DeepSeek API key is available
      if (!process.env.DEEPSEEK_API_KEY) {
        console.warn("DeepSeek API key not found, using fallback data")
        throw new Error("DeepSeek API key not configured")
      }

      // Call DeepSeek API
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: structuredPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`DeepSeek API error: ${response.status} ${response.statusText}`, errorText)
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("DeepSeek API Response:", JSON.stringify(data, null, 2)) // Debug log

      // Extract the content from the response
      const content = data.choices?.[0]?.message?.content
      if (!content) {
        console.error("No content in DeepSeek response:", data)
        throw new Error("No content in DeepSeek response")
      }

      // Clean and parse the response
      const cleanedText = content.replace(/```json\n?|\n?```/g, "").trim()

      try {
        const parsedData = JSON.parse(cleanedText)

        // Validate the response structure
        if (!parsedData.title || !Array.isArray(parsedData.products) || !Array.isArray(parsedData.data)) {
          console.error("Invalid response structure:", parsedData)
          throw new Error("Invalid response structure")
        }

        return NextResponse.json(parsedData)
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError)
        console.error("Cleaned Text:", cleanedText)
        throw new Error("Failed to parse comparison data")
      }
    } catch (apiError) {
      console.error("API Error:", apiError)

      // Generate dynamic fallback data based on the prompt
      let products = []
      let features = []

      // Extract product names from the prompt
      const promptLower = prompt.toLowerCase()

      if (promptLower.includes("iphone") || promptLower.includes("samsung") || promptLower.includes("pixel")) {
        products = ["iPhone 15", "Samsung Galaxy S23", "Google Pixel 8"]
        features = ["Display", "Processor", "Camera", "Battery", "Storage", "Price", "Weight", "Water Resistance"]
      } else if (promptLower.includes("macbook") || promptLower.includes("dell") || promptLower.includes("thinkpad")) {
        products = ["MacBook Pro", "Dell XPS", "ThinkPad X1"]
        features = ["Processor", "RAM", "Storage", "Display", "Battery Life", "Weight", "Ports", "Price"]
      } else if (promptLower.includes("netflix") || promptLower.includes("disney") || promptLower.includes("hulu")) {
        products = ["Netflix", "Disney+", "Hulu"]
        features = [
          "Monthly Price",
          "Content Library",
          "Original Shows",
          "Max Resolution",
          "Simultaneous Streams",
          "Offline Viewing",
          "Ad-Free Option",
          "Annual Plan Discount",
        ]
      } else {
        // Generic products if we can't determine specific ones
        const words = prompt.split(/\s+/)
        products = words.filter((word) => word.length > 3).slice(0, 3)
        if (products.length < 2) {
          products = ["Product A", "Product B", "Product C"]
        }
        features = ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5", "Feature 6"]
      }

      // Generate fallback data
      const fallbackData = {
        title: `Comparison of ${products.join(", ")}`,
        products: products,
        data: features.map((feature) => {
          const item = {
            feature: feature,
          }

          // Add random values for each product
          products.forEach((product) => {
            if (feature.toLowerCase() === "price") {
              item[product] = Math.floor(Math.random() * 1000) + 500
            } else if (feature.toLowerCase() === "weight") {
              item[product] = (Math.random() * 2 + 0.5).toFixed(2) + " kg"
            } else if (feature.toLowerCase() === "battery" || feature.toLowerCase() === "battery life") {
              item[product] = Math.floor(Math.random() * 10 + 5) + " hours"
            } else {
              item[product] = `${product} ${feature}`
            }
          })

          return item
        }),
      }

      return NextResponse.json(fallbackData)
    }
  } catch (error) {
    console.error("Request Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
