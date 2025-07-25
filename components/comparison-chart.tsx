"use client"

import { useState, useRef } from "react"
import {
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Share2, Star, Settings2, Maximize2, Minimize2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { ComparisonChartResponse, ComparisonType, ComparisonOptions } from "@/types/chart"
import {
  calculateGrowthRate,
  normalizeData,
  formatComparisonValue,
  generateComparisonColors,
  getComparisonTooltipContent,
} from "@/lib/comparison-utils"
import { cn } from "@/lib/utils"

interface ComparisonChartProps {
  response: ComparisonChartResponse
  onUpdate?: (options: Partial<ComparisonOptions>) => void
  onFavorite?: () => void
  onShare?: () => void
  className?: string
}

export function ComparisonChart({ response, onUpdate, onFavorite, onShare, className }: ComparisonChartProps) {
  const [options, setOptions] = useState(response.options)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ComparisonType>("side-by-side")
  const chartRef = useRef<HTMLDivElement>(null)

  const handleOptionChange = (key: keyof ComparisonOptions, value: any) => {
    const newOptions = { ...options, [key]: value }
    setOptions(newOptions)
    onUpdate?.(newOptions)
  }

  const renderChart = () => {
    const { comparisonData, analysis } = response
    const { showBenchmark, showTarget, showGrowthRate, showVariance, normalizeData: shouldNormalize } = options
    const colors = generateComparisonColors(comparisonData[0]?.datasets.length || 0)

    const processedData = comparisonData.map((item) => ({
      label: item.label,
      ...item.datasets.reduce(
        (acc, ds) => ({
          ...acc,
          [ds.name]: shouldNormalize ? normalizeData([ds.value])[0] : ds.value,
          [`${ds.name}Growth`]: item.metadata?.previousPeriod
            ? calculateGrowthRate(ds.value, item.metadata.previousPeriod)
            : 0,
        }),
        {},
      ),
      benchmark: item.metadata?.benchmark,
      target: item.metadata?.target,
    }))

    const renderContent = () => {
      switch (activeTab) {
        case "side-by-side":
          return (
            <ComposedChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) =>
                  getComparisonTooltipContent(
                    activeTab,
                    payload?.map((p) => ({
                      name: p.dataKey as string,
                      value: p.value as number,
                    })) || [],
                    options.valueFormat,
                    {
                      benchmark: payload?.[0]?.payload?.benchmark,
                      target: payload?.[0]?.payload?.target,
                    },
                  )
                }
              />
              <Legend />
              {comparisonData[0]?.datasets.map((ds, index) => (
                <Bar key={ds.name} dataKey={ds.name} fill={colors[index]} name={ds.name} />
              ))}
              {showBenchmark && (
                <ReferenceLine
                  y={processedData[0]?.benchmark}
                  stroke="#fbbf24"
                  strokeDasharray="3 3"
                  label="Benchmark"
                />
              )}
              {showTarget && (
                <ReferenceLine y={processedData[0]?.target} stroke="#34d399" strokeDasharray="3 3" label="Target" />
              )}
            </ComposedChart>
          )

        case "overlay":
          return (
            <ComposedChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) =>
                  getComparisonTooltipContent(
                    activeTab,
                    payload?.map((p) => ({
                      name: p.dataKey as string,
                      value: p.value as number,
                    })) || [],
                    options.valueFormat,
                  )
                }
              />
              <Legend />
              {comparisonData[0]?.datasets.map((ds, index) => (
                <Line
                  key={ds.name}
                  type="monotone"
                  dataKey={ds.name}
                  stroke={colors[index]}
                  name={ds.name}
                  dot={{ fill: colors[index] }}
                />
              ))}
            </ComposedChart>
          )

        case "growth":
          return (
            <ComposedChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip
                content={({ payload, label }) =>
                  getComparisonTooltipContent(
                    activeTab,
                    payload?.map((p) => ({
                      name: p.dataKey as string,
                      value: p.value as number,
                    })) || [],
                    options.valueFormat,
                  )
                }
              />
              <Legend />
              {comparisonData[0]?.datasets.map((ds, index) => (
                <Bar
                  key={`${ds.name}Growth`}
                  dataKey={`${ds.name}Growth`}
                  fill={colors[index]}
                  name={`${ds.name} Growth`}
                />
              ))}
              <ReferenceLine y={0} stroke="#666" />
            </ComposedChart>
          )

        default:
          return null
      }
    }

    return (
      <div className="relative">
        <ResponsiveContainer width="100%" height={400}>
          {renderContent()}
        </ResponsiveContainer>

        {analysis && (
          <div className="absolute top-0 right-0 p-4 space-y-2">
            <Badge variant="outline" className="bg-background/95">
              Total Growth: {formatComparisonValue(analysis.totalGrowth, "growth")}
            </Badge>
            <Badge variant="outline" className="bg-background/95">
              Avg Growth: {formatComparisonValue(analysis.averageGrowth, "growth")}
            </Badge>
            {analysis.variance.vsBenchmark && (
              <Badge variant="outline" className="bg-background/95">
                vs Benchmark: {formatComparisonValue(analysis.variance.vsBenchmark, "variance")}
              </Badge>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
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

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ComparisonType)} className="mt-4">
          <TabsList>
            <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
            <TabsTrigger value="overlay">Overlay</TabsTrigger>
            <TabsTrigger value="growth">Growth Rate</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <div
          ref={chartRef}
          className={cn(
            "transition-all duration-300",
            isFullscreen ? "fixed inset-0 z-50 bg-background p-8" : "relative",
          )}
        >
          {renderChart()}
        </div>
      </CardContent>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comparison Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Benchmark</label>
              <Switch
                checked={options.showBenchmark}
                onCheckedChange={(checked) => handleOptionChange("showBenchmark", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Target</label>
              <Switch
                checked={options.showTarget}
                onCheckedChange={(checked) => handleOptionChange("showTarget", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Growth Rate</label>
              <Switch
                checked={options.showGrowthRate}
                onCheckedChange={(checked) => handleOptionChange("showGrowthRate", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Variance</label>
              <Switch
                checked={options.showVariance}
                onCheckedChange={(checked) => handleOptionChange("showVariance", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Normalize Data</label>
              <Switch
                checked={options.normalizeData}
                onCheckedChange={(checked) => handleOptionChange("normalizeData", checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Current Period Label</label>
              <input
                type="text"
                value={options.periodLabels.current}
                onChange={(e) =>
                  handleOptionChange("periodLabels", {
                    ...options.periodLabels,
                    current: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Previous Period Label</label>
              <input
                type="text"
                value={options.periodLabels.previous}
                onChange={(e) =>
                  handleOptionChange("periodLabels", {
                    ...options.periodLabels,
                    previous: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
