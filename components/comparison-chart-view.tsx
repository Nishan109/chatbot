"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings2, ImageIcon } from "lucide-react"
import { toPng } from "html-to-image"
import { useToast } from "@/components/ui/use-toast"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface ComparisonData {
  feature: string
  [key: string]: string | number
}

interface ComparisonChartViewProps {
  data: ComparisonData[]
  products: string[]
  title: string
}

const CHART_TYPES = {
  bar: "Bar Chart",
  line: "Line Chart",
  pie: "Pie Chart",
} as const

const COLOR_SCHEMES = {
  default: ["#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"],
  neon: ["#22d3ee", "#818cf8", "#c084fc", "#e879f9", "#fb7185"],
  warm: ["#f59e0b", "#f97316", "#ef4444", "#ec4899", "#8b5cf6"],
  cool: ["#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6"],
} as const

export function ComparisonChartView({ data, products, title }: ComparisonChartViewProps) {
  const [chartType, setChartType] = useState<keyof typeof CHART_TYPES>("bar")
  const [colorScheme, setColorScheme] = useState<keyof typeof COLOR_SCHEMES>("default")
  const [showGrid, setShowGrid] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [showValues, setShowValues] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [legendPosition, setLegendPosition] = useState<"right" | "bottom">("right")
  const chartRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Transform data for charts
  const chartData = data.map((row) => ({
    name: row.feature,
    ...products.reduce(
      (acc, product) => {
        acc[product] = typeof row[product] === "number" ? row[product] : 0
        return acc
      },
      {} as Record<string, number>,
    ),
  }))

  const handleDownloadPNG = async () => {
    if (!chartRef.current) return

    try {
      const dataUrl = await toPng(chartRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#000",
      })

      const link = document.createElement("a")
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-chart.png`
      link.href = dataUrl
      link.click()

      toast({
        title: "Success",
        description: "Chart downloaded as PNG",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to download chart",
        variant: "destructive",
      })
    }
  }

  const renderChart = () => {
    const colors = COLOR_SCHEMES[colorScheme]

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chartData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333" />}
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              {showLegend && (
                <Legend
                  layout={legendPosition === "bottom" ? "horizontal" : "vertical"}
                  verticalAlign={legendPosition === "bottom" ? "bottom" : "middle"}
                  align={legendPosition === "bottom" ? "center" : "right"}
                  wrapperStyle={{ paddingLeft: legendPosition === "right" ? "20px" : "0" }}
                />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid #333",
                  borderRadius: "4px",
                }}
              />
              {products.map((product, index) => (
                <Bar
                  key={product}
                  dataKey={product}
                  fill={colors[index % colors.length]}
                  name={product}
                  label={showValues ? { position: "top" } : false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={chartData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333" />}
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              {showLegend && (
                <Legend
                  layout={legendPosition === "bottom" ? "horizontal" : "vertical"}
                  verticalAlign={legendPosition === "bottom" ? "bottom" : "middle"}
                  align={legendPosition === "bottom" ? "center" : "right"}
                  wrapperStyle={{ paddingLeft: legendPosition === "right" ? "20px" : "0" }}
                />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid #333",
                  borderRadius: "4px",
                }}
              />
              {products.map((product, index) => (
                <Line
                  key={product}
                  type="monotone"
                  dataKey={product}
                  stroke={colors[index % colors.length]}
                  name={product}
                  dot={showValues}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case "pie":
        // Transform data for pie chart
        const pieData = products.map((product, index) => ({
          name: product,
          value: chartData.reduce((sum, row) => sum + (row[product] as number), 0),
          fill: colors[index % colors.length],
        }))

        return (
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={200}
                label={showValues}
              />
              {showLegend && (
                <Legend
                  layout={legendPosition === "bottom" ? "horizontal" : "vertical"}
                  verticalAlign={legendPosition === "bottom" ? "bottom" : "middle"}
                  align={legendPosition === "bottom" ? "center" : "right"}
                  wrapperStyle={{ paddingLeft: legendPosition === "right" ? "20px" : "0" }}
                />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid #333",
                  borderRadius: "4px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
            <Settings2 className="h-4 w-4 mr-2" />
            Customize Chart
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-black/50 backdrop-blur-xl border-zinc-800">
        <div ref={chartRef}>{renderChart()}</div>
      </Card>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chart Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select value={chartType} onValueChange={(value: keyof typeof CHART_TYPES) => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CHART_TYPES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <Select value={colorScheme} onValueChange={(value: keyof typeof COLOR_SCHEMES) => setColorScheme(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(COLOR_SCHEMES).map((scheme) => (
                    <SelectItem key={scheme} value={scheme}>
                      {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Legend Position</Label>
              <Select value={legendPosition} onValueChange={(value: "right" | "bottom") => setLegendPosition(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Grid</Label>
              <Switch checked={showGrid} onCheckedChange={setShowGrid} />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Legend</Label>
              <Switch checked={showLegend} onCheckedChange={setShowLegend} />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Values</Label>
              <Switch checked={showValues} onCheckedChange={setShowValues} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
