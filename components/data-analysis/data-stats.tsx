"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BarChart2, TrendingUp, Database, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DataStatsProps {
  analysisData: string | null
  data: any[]
}

export function DataStats({ analysisData, data }: DataStatsProps) {
  // If we have analysis data, render it
  if (analysisData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: analysisData }} />
        </CardContent>
      </Card>
    )
  }

  // If no analysis yet, show basic stats
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Data Available</h3>
            <p className="text-sm text-muted-foreground">Upload or paste data to see statistics and analysis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate basic stats
  const recordCount = data.length
  const columnCount = Object.keys(data[0] || {}).length

  // Get numeric columns
  const columns = Object.keys(data[0] || {})
  const numericColumns = columns.filter((col) => {
    return data.some((row) => {
      const val = row[col]
      return typeof val === "number" || (typeof val === "string" && !isNaN(Number(val)))
    })
  })

  // Calculate stats for numeric columns
  const columnStats = numericColumns
    .map((col) => {
      const values = data
        .map((row) => {
          const val = row[col]
          return typeof val === "number" ? val : Number(val)
        })
        .filter((val) => !isNaN(val))

      if (values.length === 0) return null

      const sum = values.reduce((a, b) => a + b, 0)
      const avg = sum / values.length
      const min = Math.min(...values)
      const max = Math.max(...values)
      const median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)]

      return {
        column: col,
        min,
        max,
        avg,
        median,
        sum,
        count: values.length,
      }
    })
    .filter(Boolean)

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Data Statistics</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/30 p-4 rounded-lg flex items-center">
            <Database className="h-8 w-8 mr-3 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Records</p>
              <p className="text-2xl font-bold">{recordCount}</p>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg flex items-center">
            <BarChart2 className="h-8 w-8 mr-3 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Columns</p>
              <p className="text-2xl font-bold">{columnCount}</p>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg flex items-center">
            <TrendingUp className="h-8 w-8 mr-3 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Numeric Columns</p>
              <p className="text-2xl font-bold">{numericColumns.length}</p>
            </div>
          </div>
        </div>

        {columnStats.length > 0 ? (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Numeric Column Statistics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {columnStats.map((stat) => (
                <div key={stat.column} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{stat.column}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Min</p>
                      <p>{stat.min.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max</p>
                      <p>{stat.max.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Average</p>
                      <p>{stat.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Median</p>
                      <p>{stat.median.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sum</p>
                      <p>{stat.sum.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Count</p>
                      <p>{stat.count.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No numeric columns found for statistical analysis</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 text-sm text-muted-foreground">
          <p>Enter a prompt in the analysis tab to get AI-powered insights about your data.</p>
        </div>
      </CardContent>
    </Card>
  )
}
