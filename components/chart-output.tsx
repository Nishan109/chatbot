"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Settings2, FileImage, Camera, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { toPng, toSvg } from "html-to-image"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DataPoint {
  metric: string
  [key: string]: string | number
}

interface ChartSeries {
  name: string
  dataKey: string
  color: string
  description?: string
}

interface ChartOutputProps {
  title?: string
  description?: string
  data?: DataPoint[]
  series?: ChartSeries[]
  maxValue?: number
}

interface ColorSettings {
  [key: string]: string
}

export function ChartOutput({
  title = "Skill Proficiency",
  description = "A radar chart showcasing proficiency in various skills",
  data: propData,
  series: propSeries,
  maxValue = 10,
}: ChartOutputProps) {
  const [gridType, setGridType] = useState<"polygon" | "circle">("polygon")
  const [showDots, setShowDots] = useState(true)
  const [fillOpacity, setFillOpacity] = useState(0.3)
  const [enableAnimation, setEnableAnimation] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const { toast } = useToast()

  // Add state for custom colors
  const [customColors, setCustomColors] = useState<ColorSettings>({
    current: "#10B981",
    target: "#6366F1",
    industry: "#F59E0B",
  })

  // Enhanced default data with better spacing
  const defaultData: DataPoint[] = useMemo(
    () => [
      { metric: "Communication", current: 8.5, target: 9.0, industry: 7.5 },
      { metric: "Problem Solving", current: 7.8, target: 8.5, industry: 7.0 },
      { metric: "Technical Skills", current: 6.5, target: 7.5, industry: 7.2 },
      { metric: "Management", current: 8.2, target: 8.0, industry: 7.8 },
      { metric: "Leadership", current: 7.9, target: 8.8, industry: 7.4 },
      { metric: "Creativity", current: 7.5, target: 8.0, industry: 7.0 },
      { metric: "Teamwork", current: 8.3, target: 9.0, industry: 7.6 },
    ],
    [],
  )

  const defaultSeries: ChartSeries[] = useMemo(
    () => [
      {
        name: "Current Performance",
        dataKey: "current",
        color: customColors.current,
        description: "Our current performance metrics",
      },
      {
        name: "Target Goals",
        dataKey: "target",
        color: customColors.target,
        description: "Our target performance goals",
      },
      {
        name: "Industry Average",
        dataKey: "industry",
        color: customColors.industry,
        description: "Average performance in the industry",
      },
    ],
    [customColors],
  )

  const chartData = propData || defaultData
  const chartSeries = propSeries || defaultSeries

  const handleColorChange = (seriesKey: string, color: string) => {
    setCustomColors((prev) => ({
      ...prev,
      [seriesKey]: color,
    }))
  }

  const handleDownload = async (format: "png" | "svg") => {
    const element = document.querySelector(".radar-chart-container")
    if (!element) return

    try {
      const dataUrl =
        format === "png"
          ? await toPng(element, { backgroundColor: "#18181B" })
          : await toSvg(element, { backgroundColor: "#18181B" })

      const link = document.createElement("a")
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.${format}`
      link.href = dataUrl
      link.click()

      toast({
        title: "Success",
        description: `Chart downloaded as ${format.toUpperCase()}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download chart",
        variant: "destructive",
      })
    }
  }

  const formatValue = (value: number) => (Number.isInteger(value) ? value.toString() : value.toFixed(1))

  const renderRadarChart = () => {
    return (
      <div className="radar-chart-container">
        <ResponsiveContainer width="100%" height={500}>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" gridType={gridType} />

            <PolarAngleAxis
              dataKey="metric"
              tick={{
                fill: "#fff",
                fontSize: 12,
                fontWeight: 500,
                dy: 3,
              }}
              stroke="rgba(255, 255, 255, 0.2)"
              tickLine={false}
              // Add more space around the chart for labels
              radius={140}
              // Adjust label positioning
              ticks={chartData.map((_, index) => ({
                value: index,
                angle: (360 / chartData.length) * index,
              }))}
            />

            <PolarRadiusAxis
              angle={45}
              domain={[0, maxValue]}
              tick={{
                fill: "rgba(255, 255, 255, 0.6)",
                fontSize: 12,
              }}
              stroke="rgba(255, 255, 255, 0.1)"
              tickCount={5}
              tickFormatter={formatValue}
            />

            {chartSeries.map((series) => (
              <Radar
                key={series.dataKey}
                name={series.name}
                dataKey={series.dataKey}
                stroke={series.color}
                fill={series.color}
                fillOpacity={fillOpacity}
                strokeWidth={2}
                dot={
                  showDots
                    ? {
                        fill: series.color,
                        stroke: "#fff",
                        strokeWidth: 2,
                        r: 4,
                      }
                    : false
                }
                activeDot={{
                  r: 8,
                  fill: "#fff",
                  stroke: series.color,
                  strokeWidth: 2,
                }}
                isAnimationActive={enableAnimation}
              />
            ))}

            <Tooltip
              content={({ payload, label }) => {
                if (!payload || !payload[0]) return null
                return (
                  <div className="bg-zinc-900/95 border border-zinc-800 rounded-lg p-4 shadow-xl backdrop-blur-sm">
                    <p className="text-white font-medium mb-3">{label}</p>
                    <div className="space-y-2">
                      {payload.map((entry: any) => (
                        <div key={entry.dataKey} className="flex items-center justify-between gap-6">
                          <span style={{ color: entry.stroke }} className="font-medium">
                            {entry.name}:
                          </span>
                          <span className="text-white font-medium">{formatValue(entry.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }}
            />

            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontFamily: "inherit",
              }}
              content={({ payload }) => (
                <div className="flex flex-wrap justify-center gap-6 pt-4">
                  {payload?.map((entry: any, index) => (
                    <TooltipProvider key={`legend-${index}`}>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-zinc-300 font-medium">{entry.value}</span>
                            <Info className="h-4 w-4 text-zinc-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{chartSeries[index].description}</p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  ))}
                </div>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <Card className="w-full bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
          <CardDescription className="text-zinc-400">{description}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh]">
              <DialogHeader>
                <DialogTitle>Chart Settings</DialogTitle>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                </TabsList>
                <ScrollArea className="h-[400px] mt-4">
                  <TabsContent value="general" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Grid Type</Label>
                      <Select value={gridType} onValueChange={(value: "polygon" | "circle") => setGridType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="polygon">Polygon</SelectItem>
                          <SelectItem value="circle">Circle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Show Data Points</Label>
                      <Switch checked={showDots} onCheckedChange={setShowDots} />
                    </div>

                    <div className="space-y-2">
                      <Label>Fill Opacity ({Math.round(fillOpacity * 100)}%)</Label>
                      <Slider
                        value={[fillOpacity]}
                        onValueChange={([value]) => setFillOpacity(value)}
                        min={0}
                        max={1}
                        step={0.1}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Enable Animation</Label>
                      <Switch checked={enableAnimation} onCheckedChange={setEnableAnimation} />
                    </div>
                  </TabsContent>

                  <TabsContent value="colors" className="space-y-4">
                    <div className="space-y-4">
                      {defaultSeries.map((series) => (
                        <div key={series.dataKey} className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: customColors[series.dataKey] }}
                            />
                            {series.name}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={customColors[series.dataKey]}
                              onChange={(e) => handleColorChange(series.dataKey, e.target.value)}
                              className="w-12 h-8 p-0 border-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
                            />
                            <Input
                              type="text"
                              value={customColors[series.dataKey]}
                              onChange={(e) => handleColorChange(series.dataKey, e.target.value)}
                              className="font-mono"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="icon" onClick={() => handleDownload("png")}>
            <Camera className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={() => handleDownload("svg")}>
            <FileImage className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">{renderRadarChart()}</CardContent>
    </Card>
  )
}
