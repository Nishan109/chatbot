"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  AreaChart,
  Area,
  Cell,
} from "recharts"
import { Button } from "@/components/ui/button"
import {
  BarChart2,
  LineChartIcon as LineIcon,
  ScatterChartIcon as ScatterPlot,
  PieChartIcon as PieIcon,
  AreaChartIcon as AreaIcon,
  Settings2,
  AlertCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DataVisualizerProps {
  data: any[]
}

export function DataVisualizer({ data }: DataVisualizerProps) {
  const [chartType, setChartType] = useState<string>("bar")
  const [xAxis, setXAxis] = useState<string>("")
  const [yAxis, setYAxis] = useState<string>("")
  const [showGrid, setShowGrid] = useState(true)
  const [showAnimation, setShowAnimation] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<any[]>([])

  const columns = useMemo(() => {
    try {
      return Object.keys(data[0] || {})
    } catch (err) {
      console.error("Error getting columns:", err)
      return []
    }
  }, [data])

  const numericColumns = useMemo(() => {
    try {
      return columns.filter((col) => {
        return data.some((row) => {
          const val = row[col]
          return typeof val === "number" || (typeof val === "string" && !isNaN(Number(val)))
        })
      })
    } catch (err) {
      console.error("Error getting numeric columns:", err)
      return []
    }
  }, [columns, data])

  // Auto-select first columns when data loads
  useEffect(() => {
    if (columns.length > 0 && !xAxis) {
      setXAxis(columns[0])
    }

    if (numericColumns.length > 0 && !yAxis) {
      setYAxis(numericColumns[0])
    }
  }, [columns, numericColumns, xAxis, yAxis])

  // Process data when axes change
  useEffect(() => {
    if (!xAxis || !yAxis || !data.length) {
      setChartData([])
      return
    }

    try {
      const processed = data
        .map((row) => {
          // Handle numeric conversion safely
          let yValue = row[yAxis]
          if (typeof yValue === "string") {
            yValue = Number(yValue)
          }

          // Skip invalid data points
          if (isNaN(yValue)) {
            return null
          }

          return {
            x: row[xAxis],
            y: yValue,
            name: row[xAxis],
            value: yValue,
            // Add original row for tooltip
            originalData: row,
          }
        })
        .filter((item) => item !== null)

      setChartData(processed)
      setError(null)
    } catch (err) {
      console.error("Error processing chart data:", err)
      setError("Failed to process data for visualization. Please check your data format.")
      setChartData([])
    }
  }, [data, xAxis, yAxis])

  const chartColors = {
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    accent: "hsl(var(--accent))",
    muted: "hsl(var(--muted))",
    background: "hsl(var(--background))",
  }

  // Generate colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

  const renderChart = () => {
    if (!xAxis || !yAxis) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <BarChart2 className="h-12 w-12 mb-4" />
          <p>Select axes to visualize your data</p>
        </div>
      )
    }

    if (chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p>No valid data points to display</p>
          <p className="text-sm mt-2">Ensure your Y-axis contains numeric values</p>
        </div>
      )
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 60 },
    }

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [Number(value).toLocaleString(), yAxis]}
                labelFormatter={(label) => `${xAxis}: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="value"
                name={yAxis}
                fill={chartColors.primary}
                animationDuration={showAnimation ? 1500 : 0}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [Number(value).toLocaleString(), yAxis]}
                labelFormatter={(label) => `${xAxis}: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name={yAxis}
                stroke={chartColors.primary}
                animationDuration={showAnimation ? 1500 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [Number(value).toLocaleString(), yAxis]}
                labelFormatter={(label) => `${xAxis}: ${label}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                name={yAxis}
                fill={chartColors.primary}
                stroke={chartColors.primary}
                animationDuration={showAnimation ? 1500 : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis
                dataKey="x"
                name={xAxis}
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis dataKey="y" name={yAxis} />
              <Tooltip
                formatter={(value, name) => [Number(value).toLocaleString(), name === "y" ? yAxis : xAxis]}
                cursor={{ strokeDasharray: "3 3" }}
              />
              <Legend />
              <Scatter
                name={`${xAxis} vs ${yAxis}`}
                data={chartData}
                fill={chartColors.primary}
                animationDuration={showAnimation ? 1500 : 0}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                animationDuration={showAnimation ? 1500 : 0}
                label={({ name, value }) => `${name}: ${Number(value).toLocaleString()}`}
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

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger>
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">
                  <div className="flex items-center">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Bar Chart
                  </div>
                </SelectItem>
                <SelectItem value="line">
                  <div className="flex items-center">
                    <LineIcon className="mr-2 h-4 w-4" />
                    Line Chart
                  </div>
                </SelectItem>
                <SelectItem value="area">
                  <div className="flex items-center">
                    <AreaIcon className="mr-2 h-4 w-4" />
                    Area Chart
                  </div>
                </SelectItem>
                <SelectItem value="scatter">
                  <div className="flex items-center">
                    <ScatterPlot className="mr-2 h-4 w-4" />
                    Scatter Plot
                  </div>
                </SelectItem>
                <SelectItem value="pie">
                  <div className="flex items-center">
                    <PieIcon className="mr-2 h-4 w-4" />
                    Pie Chart
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={xAxis} onValueChange={setXAxis}>
              <SelectTrigger>
                <SelectValue placeholder="Select X-axis" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yAxis} onValueChange={setYAxis}>
              <SelectTrigger>
                <SelectValue placeholder="Select Y-axis" />
              </SelectTrigger>
              <SelectContent>
                {numericColumns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="w-10 h-10">
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
              <Label htmlFor="show-grid">Show Grid</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="show-animation" checked={showAnimation} onCheckedChange={setShowAnimation} />
              <Label htmlFor="show-animation">Animations</Label>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="p-6 min-h-[400px]">{renderChart()}</Card>
          </motion.div>
        </Card>
      </div>
    </div>
  )
}
