"use client"

import { useState, useEffect, useRef } from "react"
import { Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Download, Share2, Star, Settings2, Maximize2, Minimize2, RefreshCcw, ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toPng, toSvg } from "html-to-image"
import type { ChartResponse, ChartOptions, ChartTheme } from "@/types/chart"
import {
  CHART_THEMES,
  CHART_ANIMATIONS,
  generateChartColors,
  calculateChartDimensions,
  getChartTooltipContent,
} from "@/lib/chart-utils"
import { cn } from "@/lib/utils"

interface EnhancedChartProps {
  response: ChartResponse
  onUpdate?: (options: Partial<ChartOptions>) => void
  onFavorite?: () => void
  onShare?: () => void
  className?: string
}

export function EnhancedChart({ response, onUpdate, onFavorite, onShare, className }: EnhancedChartProps) {
  const [options, setOptions] = useState<ChartOptions>(response.options)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [dimensions, setDimensions] = useState(calculateChartDimensions(800))
  const chartRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update dimensions on container resize
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions(calculateChartDimensions(entries[0].contentRect.width))
      }
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleOptionChange = (key: keyof ChartOptions, value: any) => {
    const newOptions = { ...options, [key]: value }
    setOptions(newOptions)
    onUpdate?.(newOptions)
  }

  const handleDownload = async (format: "png" | "svg") => {
    if (!chartRef.current) return

    try {
      const dataUrl =
        format === "png"
          ? await toPng(chartRef.current, {
              quality: 1,
              pixelRatio: 2,
              backgroundColor: "transparent",
            })
          : await toSvg(chartRef.current, {
              quality: 1,
              pixelRatio: 2,
              backgroundColor: "transparent",
            })

      const link = document.createElement("a")
      link.download = `chart-${Date.now()}.${format}`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Error downloading chart:", error)
    }
  }

  const renderChart = () => {
    const { type, data } = response
    const { theme, animation, showGrid, showLegend, showTooltip, gradient } = options
    const colors = generateChartColors(theme as ChartTheme, data.length)

    const commonProps = {
      data,
      margin: dimensions.margin,
      className: "transition-all duration-300",
    }

    switch (type) {
      case "bar":
        return (
          <Bar {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="label" />
            <YAxis />
            {showTooltip && (
              <Tooltip
                content={({ payload, label }) =>
                  getChartTooltipContent(type, payload?.[0]?.value, options.valueFormat, { label })
                }
              />
            )}
            {showLegend && <Legend />}
            <Bar
              dataKey="value"
              fill={colors[0]}
              {...CHART_ANIMATIONS[animation]}
              {...(gradient && { fill: `url(#${type}Gradient)` })}
            />
          </Bar>
        )

      case "line":
        return (
          <Line {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="label" />
            <YAxis />
            {showTooltip && (
              <Tooltip
                content={({ payload, label }) =>
                  getChartTooltipContent(type, payload?.[0]?.value, options.valueFormat, {
                    date: label,
                    previousValue: payload?.[0]?.payload?.previousValue,
                  })
                }
              />
            )}
            {showLegend && <Legend />}
            <Line
              type={options.curved ? "monotone" : "linear"}
              dataKey="value"
              stroke={colors[0]}
              {...CHART_ANIMATIONS[animation]}
              {...(gradient && { stroke: `url(#${type}Gradient)` })}
            />
          </Line>
        )

      case "pie":
        return (
          <Pie {...commonProps}>
            {showTooltip && (
              <Tooltip
                content={({ payload }) =>
                  getChartTooltipContent(type, payload?.[0]?.value, options.valueFormat, {
                    label: payload?.[0]?.name,
                    percentage: payload?.[0]?.percent,
                  })
                }
              />
            )}
            {showLegend && <Legend />}
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              {...CHART_ANIMATIONS[animation]}
              label={options.showValues}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </Pie>
        )

      // Add cases for other chart types...

      default:
        return null
    }
  }

  return (
    <Card className={className} ref={containerRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{response.title}</CardTitle>
            <CardDescription>{response.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onFavorite}>
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div
          ref={chartRef}
          className={cn("transition-all duration-300", isFullscreen ? "fixed inset-0 z-50 bg-background" : "relative")}
        >
          <ResponsiveContainer width="100%" height={isFullscreen ? "100vh" : 400}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleDownload("png")}>
            <ImageIcon className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload("svg")}>
            <Download className="h-4 w-4 mr-2" />
            SVG
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => handleOptionChange("theme", "modern")}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </CardFooter>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chart Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <Select value={options.theme} onValueChange={(value) => handleOptionChange("theme", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CHART_THEMES).map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Animation</label>
              <Select value={options.animation} onValueChange={(value) => handleOptionChange("animation", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CHART_ANIMATIONS).map((animation) => (
                    <SelectItem key={animation} value={animation}>
                      {animation.charAt(0).toUpperCase() + animation.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Legend</label>
              <Switch
                checked={options.showLegend}
                onCheckedChange={(checked) => handleOptionChange("showLegend", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Grid</label>
              <Switch
                checked={options.showGrid}
                onCheckedChange={(checked) => handleOptionChange("showGrid", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Tooltip</label>
              <Switch
                checked={options.showTooltip}
                onCheckedChange={(checked) => handleOptionChange("showTooltip", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Values</label>
              <Switch
                checked={options.showValues}
                onCheckedChange={(checked) => handleOptionChange("showValues", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Use Gradient</label>
              <Switch
                checked={options.gradient}
                onCheckedChange={(checked) => handleOptionChange("gradient", checked)}
              />
            </div>

            {response.type === "line" && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Curved Line</label>
                <Switch checked={options.curved} onCheckedChange={(checked) => handleOptionChange("curved", checked)} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
