"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DataStats } from "./data-stats"
import { DataVisualizer } from "./data-visualizer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DataAnalysisProps {
  data: any[]
}

export function DataAnalysis({ data }: DataAnalysisProps) {
  const [prompt, setPrompt] = useState("")
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      setError("Please enter a question or prompt about your data")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Prepare the data for the API request
      // Make sure we're sending a clean version of the data
      const cleanData = data.map((item) => {
        const cleanItem = {}
        // Convert any complex objects to strings to avoid JSON parsing issues
        Object.keys(item).forEach((key) => {
          if (typeof item[key] === "object" && item[key] !== null) {
            cleanItem[key] = JSON.stringify(item[key])
          } else {
            cleanItem[key] = item[key]
          }
        })
        return cleanItem
      })

      const response = await fetch("/api/analyze-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: cleanData,
          prompt,
        }),
      })

      if (!response.ok) {
        let errorMessage = "Failed to analyze data"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If we can't parse the error as JSON, use the status text
          errorMessage = `Error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setAnalysis(result.analysis)
    } catch (err) {
      console.error("Analysis error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Ask a question about your data (e.g., 'What are the key trends?' or 'How can I improve sales?')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end">
              <Button onClick={handleAnalyze} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Analyze"} {!loading && "→"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="analysis">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
        </TabsList>
        <TabsContent value="analysis" className="mt-4">
          <DataStats analysisData={analysis} data={data} />
        </TabsContent>
        <TabsContent value="visualization" className="mt-4">
          <DataVisualizer data={data} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
