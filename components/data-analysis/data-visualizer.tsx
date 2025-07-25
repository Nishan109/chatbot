"use client"

import { useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface DataVisualizerProps {
  data: any[]
}

export function DataVisualizer({ data }: DataVisualizerProps) {
  const [chartType, setChartType] = useState("bar")
  const [xAxis, setXAxis] = useState<string>("")
  const [yAxis, setYAxis] = useState<string>("")
  const [categoryField, setCategoryField] = useState<string>("")

  // Get all column names from the data
  const columns = useMemo(() => {
    if (!data || data.length === 0) return []
    return Object.keys(data[0] || {})
  }, [data])

  // Set default axes when columns change
  useMemo(() => {
    if (columns.length > 0) {
      // Try to find numeric columns for Y-axis
      const numericColumns = columns.filter((col) => {
        return data.some((row) => typeof row[col] === "number" || !isNaN(Number(row[col])))
      })

      // Try to find non-numeric columns for X-axis
      const nonNumericColumns = columns.filter((col) => !numericColumns.includes(col))

      setXAxis(nonNumericColumns[0] || columns[0])
      setYAxis(numericColumns[0] || columns[1] || columns[0])
      setCategoryField(nonNumericColumns[1] || nonNumericColumns[0] || columns[0])
    }
  }, [columns, data])

  // Prepare data for the chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !xAxis || !yAxis) return []

    // For pie chart, we need to aggregate data
    if (chartType === "pie") {
      const aggregatedData = {}
      data.forEach((item) => {
        const key = String(item[xAxis])
        if (!aggregatedData[key]) {
          aggregatedData[key] = 0
        }
        const value = Number(item[yAxis])
        if (!isNaN(value)) {
          aggregatedData[key] += value
        }
      })
      return Object.entries(aggregatedData).map(([name, value]) => ({ name, value }))
    }

    // For scatter plot
    if (chartType === "scatter") {
      return data.map((item) => ({
        x: Number(item[xAxis]),
        y: Number(item[yAxis]),
        name: item[categoryField] || "",
      }))
    }

    // For bar and line charts
    return data.map((item) => {
      const result = { name: String(item[xAxis]) }

      // If we have a category field, create multiple series
      if (categoryField && categoryField !== xAxis) {
        const categories = [...new Set(data.map((d) => d[categoryField]))]
        categories.forEach((cat) => {
          result[String(cat)] = 0
        })

        const category = item[categoryField]
        if (category) {
          result[String(category)] = Number(item[yAxis])
        }
      } else {
        // Simple single series
        result[yAxis] = Number(item[yAxis])
      }

      return result
    })
  }, [data, xAxis, yAxis, categoryField, chartType])

  // Generate colors for the chart
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F", "#FFBB28", "#FF8042"]

  // Download chart as image
  const downloadChart = () => {
    const svg = document.querySelector(".recharts-wrapper svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")

      // Download the PNG file
      const downloadLink = document.createElement("a")
      downloadLink.download = `chart-${new Date().toISOString()}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  // Render the appropriate chart based on the selected type
  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return <div className="flex justify-center items-center h-[300px]">No data available for visualization</div>
    }

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              {categoryField && categoryField !== xAxis ? (
                [...new Set(data.map((d) => d[categoryField]))].map((category, index) => (
                  <Bar key={String(category)} dataKey={String(category)} fill={COLORS[index % COLORS.length]} />
                ))
              ) : (
                <Bar dataKey={yAxis} fill="#8884d8" />
              )}
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              {categoryField && categoryField !== xAxis ? (
                [...new Set(data.map((d) => d[categoryField]))].map((category, index) => (
                  <Line
                    key={String(category)}
                    type="monotone"
                    dataKey={String(category)}
                    stroke={COLORS[index % COLORS.length]}
                  />
                ))
              ) : (
                <Line type="monotone" dataKey={yAxis} stroke="#8884d8" />
              )}
            </LineChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => Number(value).toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name={xAxis} tick={{ fontSize: 12 }} />
              <YAxis type="number" dataKey="y" name={yAxis} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Legend />
              <Scatter name={`${xAxis} vs ${yAxis}`} data={chartData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Data Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Chart Type</label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">X-Axis / Category</label>
              <Select value={xAxis} onValueChange={setXAxis}>
                <SelectTrigger>
                  <SelectValue placeholder="Select X-Axis" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Y-Axis / Value</label>
              <Select value={yAxis} onValueChange={setYAxis}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Y-Axis" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(chartType === "bar" || chartType === "line") && (
              <div>
                <label className="text-sm font-medium mb-1 block">Series / Group By</label>
                <Select value={categoryField} onValueChange={setCategoryField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={downloadChart}>
              <Download className="h-4 w-4 mr-2" />
              Download Chart
            </Button>
          </div>

          <div className="border rounded-md p-4 bg-background">{renderChart()}</div>
        </div>
      </CardContent>
    </Card>
  )
}
