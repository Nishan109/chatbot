import { NextResponse } from "next/server"

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json()

    if (!body.data || !body.prompt) {
      return NextResponse.json({ error: "Missing required fields: data and prompt" }, { status: 400 })
    }

    const { data, prompt } = body

    // Validate data
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "Invalid or empty data array" }, { status: 400 })
    }

    // Check if DeepSeek API key is available
    if (!process.env.DEEPSEEK_API_KEY) {
      console.warn("DEEPSEEK_API_KEY not found, using fallback analysis")
      return NextResponse.json({ analysis: generateFallbackAnalysis(data, prompt) })
    }

    try {
      // Prepare data summary for the AI
      const dataSummary = prepareDataSummary(data)

      // Prepare the request payload
      const payload = {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a data analysis expert. Analyze data and provide clear, concise insights with statistical observations where relevant. Format your response with proper headings and paragraphs.",
          },
          {
            role: "user",
            content: `Analyze this dataset and provide insights:

Data Summary:
${dataSummary}

User Question: ${prompt}

Please structure your analysis with:
1. Data Summary Analysis (as a main heading)
2. Key Observations (as a subheading)
3. Patterns & Trends (as a subheading)
4. Statistical Insights (as a subheading)
5. Recommendations (if applicable) (as a subheading)

Be concise and use bullet points where appropriate.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2048,
        top_p: 1,
        stream: false,
      }

      // Make the API request
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(payload),
      })

      // Check if the response is OK
      if (!response.ok) {
        console.error(`API request failed: ${response.status} ${response.statusText}`)
        // Fallback to local analysis if API fails
        return NextResponse.json({ analysis: generateFallbackAnalysis(data, prompt) })
      }

      // Parse the response
      const result = await response.json()

      // Check if the response has the expected structure
      if (!result.choices?.[0]?.message?.content) {
        console.error("Invalid API response structure")
        return NextResponse.json({ analysis: generateFallbackAnalysis(data, prompt) })
      }

      // Format the analysis with proper HTML structure
      const formattedAnalysis = formatAnalysisWithHTML(result.choices[0].message.content)

      return NextResponse.json({ analysis: formattedAnalysis })
    } catch (apiError) {
      console.error("API call error:", apiError)
      // Fallback to local analysis if API call fails
      return NextResponse.json({ analysis: generateFallbackAnalysis(data, prompt) })
    }
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to analyze data",
      },
      { status: 500 },
    )
  }
}

// Function to generate a fallback analysis when the API is unavailable
function generateFallbackAnalysis(data: any[], prompt: string) {
  try {
    // Get column names
    const columns = Object.keys(data[0] || {})
    const recordCount = data.length
    const columnCount = columns.length

    // Basic statistics for numeric columns
    const numericColumns = columns.filter((col) => {
      return data.some((row) => !isNaN(Number.parseFloat(row[col])))
    })

    let numericStats = ""
    if (numericColumns.length > 0) {
      numericStats = numericColumns
        .map((col) => {
          const values = data.map((row) => Number.parseFloat(row[col])).filter((val) => !isNaN(val))

          if (values.length === 0) return ""

          const sum = values.reduce((a, b) => a + b, 0)
          const avg = sum / values.length
          const min = Math.min(...values)
          const max = Math.max(...values)

          return `<p><strong>${col}:</strong> Min: ${min.toFixed(2)}, Max: ${max.toFixed(2)}, Avg: ${avg.toFixed(2)}</p>`
        })
        .join("\n")
    }

    // Check for missing data
    const missingDataColumns = columns.filter((col) => {
      return data.some((row) => row[col] === null || row[col] === undefined || row[col] === "")
    })

    let missingDataInfo = "No missing data detected."
    if (missingDataColumns.length > 0) {
      missingDataInfo = `Missing data found in columns: ${missingDataColumns.join(", ")}`
    }

    // Generate a basic analysis
    return `
<h2>Data Summary Analysis</h2>

<h3>Key Observations</h3>

<p>Dataset Size: ${recordCount} records with ${columnCount} columns.</p>

<p>Columns: ${columns.join(", ")}</p>

<p>Missing Data: ${missingDataInfo}</p>

<h3>Statistical Insights</h3>

${numericStats}

<h3>Recommendations</h3>

<p>Based on the data provided, here are some general recommendations:</p>
<p>1. Clean any missing data in the dataset</p>
<p>2. Consider normalizing numeric values for better comparison</p>
<p>3. Look for correlations between different columns</p>
<p>4. Consider visualizing the data to identify patterns</p>
`
  } catch (error) {
    console.error("Error generating fallback analysis:", error)
    return `
<h2>Data Summary Analysis</h2>
<p>Unable to generate detailed analysis. Please check your data format and try again.</p>
`
  }
}

// Function to format the analysis with proper HTML
function formatAnalysisWithHTML(text: string) {
  try {
    // Split the text into sections based on headings
    const lines = text.split("\n").filter((line) => line.trim() !== "")

    let formattedHTML = ""
    let currentSection = null

    for (const line of lines) {
      const trimmedLine = line.trim()

      // Check if this is a main heading (usually the first heading)
      if (trimmedLine.match(/^(#\s+|DATA SUMMARY ANALYSIS|Data Summary Analysis)/i)) {
        if (currentSection) {
          formattedHTML += "</div>"
        }
        formattedHTML += `<h2>${trimmedLine.replace(/^#\s+/, "")}</h2>\n<div class="section">`
        currentSection = "main"
      }
      // Check if this is a subheading
      else if (trimmedLine.match(/^(##\s+|KEY OBSERVATIONS|PATTERNS & TRENDS|STATISTICAL INSIGHTS|RECOMMENDATIONS)/i)) {
        formattedHTML += `<h3>${trimmedLine.replace(/^##\s+/, "")}</h3>\n`
      }
      // Otherwise, it's a paragraph or bullet point
      else {
        // Handle bullet points
        if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
          formattedHTML += `<p>${trimmedLine.substring(2)}</p>\n`
        } else {
          formattedHTML += `<p>${trimmedLine}</p>\n`
        }
      }
    }

    if (currentSection) {
      formattedHTML += "</div>"
    }

    return formattedHTML
  } catch (error) {
    console.error("Error formatting analysis:", error)
    return `<h2>Data Analysis</h2><p>An error occurred while formatting the analysis.</p>`
  }
}

// Helper function to prepare data summary
function prepareDataSummary(data: any[]) {
  try {
    // Get column names
    const columns = Object.keys(data[0] || {})

    if (columns.length === 0) {
      return "No columns found in data"
    }

    // Get data types and sample values
    const columnInfo = columns.map((column) => {
      const values = data.map((row) => row[column]).filter((v) => v != null)
      const sampleValues = values.slice(0, 3)
      const type = inferDataType(values)

      // Calculate basic statistics for numeric columns
      let stats = ""
      if (type === "numeric") {
        const numericValues = values.map((v) => Number(v)).filter((v) => !isNaN(v))
        if (numericValues.length > 0) {
          const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
          const min = Math.min(...numericValues)
          const max = Math.max(...numericValues)
          stats = ` (Avg: ${avg.toFixed(2)}, Min: ${min}, Max: ${max})`
        }
      }

      return `${column} (${type}): ${sampleValues.join(", ")}...${stats}`
    })

    // Calculate correlations for numeric columns
    const numericColumns = columns.filter((col) => inferDataType(data.map((row) => row[col])) === "numeric")

    let correlations = ""
    if (numericColumns.length > 1) {
      correlations = "\nCorrelations between numeric columns:\n"
      for (let i = 0; i < numericColumns.length; i++) {
        for (let j = i + 1; j < numericColumns.length; j++) {
          const col1 = numericColumns[i]
          const col2 = numericColumns[j]
          const correlation = calculateCorrelation(
            data.map((row) => Number(row[col1])),
            data.map((row) => Number(row[col2])),
          )
          if (!isNaN(correlation)) {
            correlations += `${col1} vs ${col2}: ${correlation.toFixed(3)}\n`
          }
        }
      }
    }

    const summary = `Dataset Summary:
Number of records: ${data.length}
Number of columns: ${columns.length}

Column Information:
${columnInfo.join("\n")}
${correlations}`

    // Ensure the summary isn't too long for the API
    return summary.slice(0, 30000) // Limit to 30k characters to be safe
  } catch (error) {
    console.error("Error preparing data summary:", error)
    return "Error preparing data summary"
  }
}

function calculateCorrelation(x: number[], y: number[]): number {
  try {
    const n = x.length
    const validPairs = x.map((val, i) => [val, y[i]]).filter(([a, b]) => !isNaN(a) && !isNaN(b))

    if (validPairs.length < 2) return Number.NaN

    const [cleanX, cleanY] = validPairs.reduce(
      ([accX, accY], [x, y]) => [
        [...accX, x],
        [...accY, y],
      ],
      [[] as number[], [] as number[]],
    )

    const sum_x = cleanX.reduce((a, b) => a + b, 0)
    const sum_y = cleanY.reduce((a, b) => a + b, 0)
    const sum_xy = cleanX.reduce((a, b, i) => a + b * cleanY[i], 0)
    const sum_x2 = cleanX.reduce((a, b) => a + b * b, 0)
    const sum_y2 = cleanY.reduce((a, b) => a + b * b, 0)

    const numerator = n * sum_xy - sum_x * sum_y
    const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y))

    return denominator === 0 ? Number.NaN : numerator / denominator
  } catch (error) {
    console.error("Error calculating correlation:", error)
    return Number.NaN
  }
}

function inferDataType(values: any[]): string {
  try {
    const nonNullValues = values.filter((v) => v != null)
    if (nonNullValues.length === 0) return "unknown"

    const sample = nonNullValues[0]

    // Check for numeric values
    if (typeof sample === "number") return "numeric"
    if (!isNaN(Number(sample)) && sample !== "") return "numeric"

    // Check for dates
    if (sample instanceof Date) return "date"
    if (!isNaN(Date.parse(sample))) return "date"

    // Check for booleans
    if (typeof sample === "boolean") return "boolean"
    if (["true", "false"].includes(String(sample).toLowerCase())) return "boolean"

    // Default to text
    return "text"
  } catch (error) {
    console.error("Error inferring data type:", error)
    return "unknown"
  }
}
