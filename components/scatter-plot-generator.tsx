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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label as UILabel } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings2, Camera, Loader2, RefreshCcw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { toPng } from "html-to-image"
import { motion, AnimatePresence } from "framer-motion"

interface DataPoint {
  x: number
  y: number
  z?: number
  label?: string
  category?: string
}

interface ScatterPlotData {
  name: string
  data: DataPoint[]
  color: string
}

const EXAMPLE_PROMPTS = [
  "Show correlation between marketing spend and sales revenue for different product categories",
  "Compare employee satisfaction vs years of experience across departments",
  "Plot customer lifetime value against purchase frequency by customer segment",
  "Analyze product price vs rating distribution for different brands",
]

const COLOR_SCHEMES = {
  default: ["#10B981", "#6366F1", "#F59E0B", "#EC4899", "#8B5CF6"],
  neon: ["#22D3EE", "#818CF8", "#34D399", "#FB7185", "#C084FC"],
  warm: ["#F97316", "#F43F5E", "#F59E0B", "#EF4444", "#EC4899"],
  cool: ["#06B6D4", "#3B82F6", "#10B981", "#6366F1", "#8B5CF6"],
}

export function ScatterPlotGenerator() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [plotData, setPlotData] = useState<ScatterPlotData[]>([])
  const [plotConfig, setPlotConfig] = useState({
    title: "",
    xAxisLabel: "",
    yAxisLabel: "",
    showTrendline: true,
    showLabels: false,
    colorScheme: "default",
    bubbleSize: false,
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { toast } = useToast()

  const generatePlotData = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate the scatter plot.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Here you would typically call your AI endpoint
      // For demo, generating sample data
      const response = await fetch("/api/generate-scatter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) throw new Error("Failed to generate data")

      const result = await response.json()
      setPlotData(result.data)
      setPlotConfig({
        ...plotConfig,
        title: result.title,
        xAxisLabel: result.xAxisLabel,
        yAxisLabel: result.yAxisLabel,
      })

      toast({
        title: "Success",
        description: "Scatter plot generated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate scatter plot. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    const element = document.querySelector(".scatter-plot-container")
    if (!element) return

    try {
      const dataUrl = await toPng(element, {
        backgroundColor: "#18181B",
      })

      const link = document.createElement("a")
      link.download = `scatter-plot-${Date.now()}.png`
      link.href = dataUrl
      link.click()

      toast({
        title: "Success",
        description: "Plot downloaded successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download plot",
        variant: "destructive",
      })
    }
  }

  const renderScatterPlot = () => {
    if (!plotData.length) return null

    return (
      <div className="scatter-plot-container">
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 70, left: 70 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" dataKey="x" name={plotConfig.xAxisLabel} stroke="rgba(255,255,255,0.5)">
              <Label value={plotConfig.xAxisLabel} position="bottom" offset={50} fill="rgba(255,255,255,0.7)" />
            </XAxis>
            <YAxis type="number" dataKey="y" name={plotConfig.yAxisLabel} stroke="rgba(255,255,255,0.5)">
              <Label
                value={plotConfig.yAxisLabel}
                angle={-90}
                position="left"
                offset={50}
                fill="rgba(255,255,255,0.7)"
              />
            </YAxis>
            {plotConfig.bubbleSize && <ZAxis type="number" dataKey="z" range={[50, 400]} />}
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const data = payload[0].payload
                return (
                  <div className="bg-zinc-900/95 border border-zinc-800 rounded-lg p-3 shadow-xl backdrop-blur-sm">
                    <p className="font-medium text-white mb-1">{payload[0].name}</p>
                    <p className="text-sm text-zinc-300">
                      {plotConfig.xAxisLabel}: {data.x}
                    </p>
                    <p className="text-sm text-zinc-300">
                      {plotConfig.yAxisLabel}: {data.y}
                    </p>
                    {data.label && <p className="text-sm text-zinc-400 mt-1">{data.label}</p>}
                  </div>
                )
              }}
            />
            <Legend />
            {plotData.map((series, index) => (
              <Scatter
                key={series.name}
                name={series.name}
                data={series.data}
                fill={COLOR_SCHEMES[plotConfig.colorScheme as keyof typeof COLOR_SCHEMES][index]}
                line={plotConfig.showTrendline}
                shape={plotConfig.bubbleSize ? "circle" : "diamond"}
                label={
                  plotConfig.showLabels
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
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">AI Scatter Plot Generator</CardTitle>
        <CardDescription className="text-zinc-400">
          Describe the data you want to visualize and let AI create a scatter plot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <UILabel>Your Prompt</UILabel>
            <Textarea
              placeholder="Describe the data you want to visualize..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] bg-zinc-800/50 border-zinc-700"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((examplePrompt) => (
              <Button
                key={examplePrompt}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(examplePrompt)}
                className="text-xs"
              >
                {examplePrompt}
              </Button>
            ))}
          </div>
          <div className="flex justify-between gap-4">
            <Button onClick={generatePlotData} className="flex-1 bg-green-500 hover:bg-green-600" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Scatter Plot"
              )}
            </Button>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Plot Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <UILabel>Title</UILabel>
                    <Input
                      value={plotConfig.title}
                      onChange={(e) => setPlotConfig({ ...plotConfig, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <UILabel>X-Axis Label</UILabel>
                    <Input
                      value={plotConfig.xAxisLabel}
                      onChange={(e) =>
                        setPlotConfig({
                          ...plotConfig,
                          xAxisLabel: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <UILabel>Y-Axis Label</UILabel>
                    <Input
                      value={plotConfig.yAxisLabel}
                      onChange={(e) =>
                        setPlotConfig({
                          ...plotConfig,
                          yAxisLabel: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <UILabel>Show Trendline</UILabel>
                    <Switch
                      checked={plotConfig.showTrendline}
                      onCheckedChange={(checked) => setPlotConfig({ ...plotConfig, showTrendline: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <UILabel>Show Labels</UILabel>
                    <Switch
                      checked={plotConfig.showLabels}
                      onCheckedChange={(checked) => setPlotConfig({ ...plotConfig, showLabels: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <UILabel>Bubble Size</UILabel>
                    <Switch
                      checked={plotConfig.bubbleSize}
                      onCheckedChange={(checked) => setPlotConfig({ ...plotConfig, bubbleSize: checked })}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <AnimatePresence>
          {plotData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">{plotConfig.title}</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPlotData([])}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Camera className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              {renderScatterPlot()}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
