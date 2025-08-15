"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DataAnalysis } from "./data-analysis"
import { Upload, FileText, Table, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Papa from "papaparse"

export function DataInput() {
  const [data, setData] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const processCSV = useCallback((csvText: string) => {
    try {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // Automatically convert numeric values
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            console.error("CSV parsing errors:", results.errors)
            setError(`Error parsing CSV: ${results.errors[0].message}`)
            return
          }

          if (!results.data || results.data.length === 0) {
            setError("No data found in the CSV")
            return
          }

          // Validate data structure
          const firstRow = results.data[0]
          if (!firstRow || typeof firstRow !== "object") {
            setError("Invalid data format. Expected an object with properties.")
            return
          }

          // Process the data to ensure all values are properly formatted
          const processedData = results.data.map((row: any) => {
            const processedRow: Record<string, any> = {}

            // Process each column
            Object.keys(row).forEach((key) => {
              let value = row[key]

              // Skip empty column names
              if (!key.trim()) return

              // Try to convert string numbers to actual numbers
              if (typeof value === "string" && value.trim() !== "") {
                const numValue = Number(value)
                if (!isNaN(numValue)) {
                  value = numValue
                }
              }

              processedRow[key] = value
            })

            return processedRow
          })

          setData(processedData)
          setError(null)
        },
      })
    } catch (err) {
      console.error("Error processing CSV:", err)
      setError(err instanceof Error ? err.message : "Failed to process CSV data")
    }
  }, [])

  const processJSON = useCallback((jsonText: string) => {
    try {
      const parsedData = JSON.parse(jsonText)

      // Check if it's an array
      if (!Array.isArray(parsedData)) {
        // If it's an object with a data property that's an array, use that
        if (parsedData && typeof parsedData === "object" && Array.isArray(parsedData.data)) {
          setData(parsedData.data)
          return
        }

        // If it's a single object, wrap it in an array
        if (parsedData && typeof parsedData === "object") {
          setData([parsedData])
          return
        }

        setError("Invalid JSON format. Expected an array of objects or an object with a data array.")
        return
      }

      // Validate that it's an array of objects
      if (parsedData.length > 0 && typeof parsedData[0] !== "object") {
        setError("Invalid JSON format. Expected an array of objects.")
        return
      }

      setData(parsedData)
      setError(null)
    } catch (err) {
      console.error("Error processing JSON:", err)
      setError(err instanceof Error ? err.message : "Failed to parse JSON data")
    }
  }, [])

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsLoading(true)
      setError(null)

      const file = event.target.files?.[0]
      if (!file) {
        setError("No file selected")
        setIsLoading(false)
        return
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string

          if (!content) {
            setError("Failed to read file content")
            setIsLoading(false)
            return
          }

          // Determine file type and process accordingly
          if (file.name.endsWith(".csv")) {
            processCSV(content)
          } else if (file.name.endsWith(".json")) {
            processJSON(content)
          } else {
            setError("Unsupported file type. Please upload a CSV or JSON file.")
          }
        } catch (err) {
          console.error("Error reading file:", err)
          setError(err instanceof Error ? err.message : "Failed to process file")
        } finally {
          setIsLoading(false)
        }
      }

      reader.onerror = () => {
        setError("Error reading file")
        setIsLoading(false)
      }

      reader.readAsText(file)
    },
    [processCSV, processJSON],
  )

  const handleTextSubmit = useCallback(() => {
    setIsLoading(true)
    setError(null)

    try {
      if (!inputText.trim()) {
        setError("Please enter data")
        setIsLoading(false)
        return
      }

      // Try to determine if it's JSON or CSV
      const trimmedText = inputText.trim()

      // Check if it starts with [ or { for JSON
      if (trimmedText.startsWith("[") || trimmedText.startsWith("{")) {
        processJSON(trimmedText)
      } else {
        // Assume it's CSV
        processCSV(trimmedText)
      }
    } catch (err) {
      console.error("Error processing input:", err)
      setError(err instanceof Error ? err.message : "Failed to process input data")
    } finally {
      setIsLoading(false)
    }
  }, [inputText, processCSV, processJSON])

  const handleSampleData = useCallback(() => {
    setIsLoading(true)
    setError(null)

    try {
      // Sample sales data
      const sampleData = [
        { date: "2023-01", product: "Widget A", sales: 120, revenue: 1200, region: "North" },
        { date: "2023-01", product: "Widget B", sales: 85, revenue: 1020, region: "North" },
        { date: "2023-01", product: "Widget C", sales: 95, revenue: 1425, region: "South" },
        { date: "2023-02", product: "Widget A", sales: 130, revenue: 1300, region: "North" },
        { date: "2023-02", product: "Widget B", sales: 90, revenue: 1080, region: "North" },
        { date: "2023-02", product: "Widget C", sales: 105, revenue: 1575, region: "South" },
        { date: "2023-03", product: "Widget A", sales: 125, revenue: 1250, region: "North" },
        { date: "2023-03", product: "Widget B", sales: 95, revenue: 1140, region: "North" },
        { date: "2023-03", product: "Widget C", sales: 115, revenue: 1725, region: "South" },
        { date: "2023-04", product: "Widget A", sales: 140, revenue: 1400, region: "North" },
        { date: "2023-04", product: "Widget B", sales: 100, revenue: 1200, region: "North" },
        { date: "2023-04", product: "Widget C", sales: 125, revenue: 1875, region: "South" },
      ]

      setData(sampleData)
      setError(null)

      // Convert to CSV for display
      const headers = Object.keys(sampleData[0]).join(",")
      const rows = sampleData.map((row) => Object.values(row).join(",")).join("\n")
      setInputText(`${headers}\n${rows}`)
    } catch (err) {
      console.error("Error loading sample data:", err)
      setError(err instanceof Error ? err.message : "Failed to load sample data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="paste">Paste Data</TabsTrigger>
          <TabsTrigger value="sample">Sample Data</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12">
              <Upload className="h-8 w-8 mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">Upload a CSV or JSON file</p>
              <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload">
                <Button as="span">Select File</Button>
              </label>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="paste" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <p className="text-sm">Paste your CSV or JSON data below</p>
              </div>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your data here..."
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="flex justify-end">
                <Button onClick={handleTextSubmit} disabled={isLoading}>
                  Process Data
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sample" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                <p className="text-sm">Use sample sales data for testing</p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSampleData} disabled={isLoading}>
                  Load Sample Data
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {data.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Data Preview</h3>
            <div className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">{data.length} rows</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{Object.keys(data[0] || {}).length} columns</span>
            </div>
          </div>

          <div className="overflow-auto max-h-[200px] rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {Object.keys(data[0] || {}).map((key) => (
                    <th key={key} className="p-2 text-left font-medium">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b">
                    {Object.values(row).map((value: any, j) => (
                      <td key={j} className="p-2">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length > 5 && (
            <p className="text-xs text-muted-foreground text-center">Showing 5 of {data.length} rows</p>
          )}
        </div>
      )}

      {data.length > 0 && <DataAnalysis data={data} />}
    </div>
  )
}
