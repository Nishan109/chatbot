"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  ZAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label as UILabel } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings2, FileImage, Camera } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { toPng } from "html-to-image"
import type { ScatterChartData, ScatterDataPoint } from "@/types/chart"

interface ScatterPlotProps {
  title: string
  description?: string
  data: ScatterChartData[]
  xAxisLabel: string
  yAxisLabel: string
  options?: {
    showTrendline?: boolean
    showLabels?: boolean
    bubbleSize?: boolean
    colorScheme?: "default" | "neon" | "warm" | "cool"
  }
}

const COLOR_SCHEMES = {
  default: ["#10B981", "#6366F1", "#F59E0B", "#EC4899", "#8B5CF6"],
  neon: ["#22D3EE", "#818CF8", "#34D399", "#FB7185", "#C084FC"],
  warm: ["#F97316", "#F43F5E", "#F59E0B", "#EF4444", "#EC4899"],
  cool: ["#06B6D4", "#3B82F6", "#10B981", "#6366F1", "#8B5CF6"],
}

export function ScatterPlot({
  title,
  description,
  data,
  xAxisLabel,
  yAxisLabel,
  options = {
    showTrendline: true,
    showLabels: false,
    bubbleSize: false,
    colorScheme: "default",
  },
}: ScatterPlotProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [plotOptions, setPlotOptions] = useState(options)
  const { toast } = useToast()

  const handleDownload = async (format: "png") => {
    const element = document.querySelector(".scatter-plot-container")
    if (!element) return

    try {
      const dataUrl = await toPng(element, { backgroundColor: "#18181B" })
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

  const renderScatterPlot = () => {
    return (
      <div className="scatter-plot-container">
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 70, left: 70 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" dataKey="x" name={xAxisLabel} stroke="rgba(255,255,255,0.5)">
              <Label value={xAxisLabel} position="bottom" offset={50} fill="rgba(255,255,255,0.7)" />
            </XAxis>
            <YAxis type="number" dataKey="y" name={yAxisLabel} stroke="rgba(255,255,255,0.5)">
              <Label value={yAxisLabel} angle={-90} position="left" offset={50} fill="rgba(255,255,255,0.7)" />
            </YAxis>

            {plotOptions.bubbleSize && <ZAxis type="number" dataKey="z" range={[50, 400]} />}

            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const data = payload[0].payload as ScatterDataPoint
                return (
                  <div className="bg-zinc-900/95 border border-zinc-800 rounded-lg p-3 shadow-xl backdrop-blur-sm">
                    <p className="font-medium text-white mb-1">{payload[0].name}</p>
                    <p className="text-sm text-zinc-300">
                      {xAxisLabel}: {data.x}
                    </p>
                    <p className="text-sm text-zinc-300">
                      {yAxisLabel}: {data.y}
                    </p>
                    {data.label && <p className="text-sm text-zinc-400 mt-1">{data.label}</p>}
                  </div>
                )
              }}
            />
            <Legend />

            {data.map((series, index) => (
              <Scatter
                key={series.name}
                name={series.name}
                data={series.data}
                fill={COLOR_SCHEMES[plotOptions.colorScheme || "default"][index]}
                line={plotOptions.showTrendline}
                shape={plotOptions.bubbleSize ? "circle" : "diamond"}
                label={
                  plotOptions.showLabels
                    ? {
                        dataKey: "label",
                        position: "top",
                        fill: "rgba(255,255,255,0.7)",
                      }
                    : false
                }
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <Card className="w-full bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
          {description && <CardDescription className="text-zinc-400">{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chart Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <UILabel>Show Trendline</UILabel>
                  <Switch
                    checked={plotOptions.showTrendline}
                    onCheckedChange={(checked) => setPlotOptions({ ...plotOptions, showTrendline: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <UILabel>Show Labels</UILabel>
                  <Switch
                    checked={plotOptions.showLabels}
                    onCheckedChange={(checked) => setPlotOptions({ ...plotOptions, showLabels: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <UILabel>Bubble Size</UILabel>
                  <Switch
                    checked={plotOptions.bubbleSize}
                    onCheckedChange={(checked) => setPlotOptions({ ...plotOptions, bubbleSize: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <UILabel>Color Scheme</UILabel>
                  <Select
                    value={plotOptions.colorScheme}
                    onValueChange={(value: "default" | "neon" | "warm" | "cool") =>
                      setPlotOptions({ ...plotOptions, colorScheme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="neon">Neon</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cool">Cool</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="icon" onClick={() => handleDownload("png")}>
            <Camera className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={() => handleDownload("png")}>
            <FileImage className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">{renderScatterPlot()}</CardContent>
    </Card>
  )
}
