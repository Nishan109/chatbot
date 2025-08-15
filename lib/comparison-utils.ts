import type React from "react"
import type { ComparisonData, ComparisonType } from "@/types/chart"
import { cn } from "@/lib/utils"

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function calculateVariance(actual: number, target: number): number {
  return ((actual - target) / target) * 100
}

export function normalizeData(data: number[]): number[] {
  const max = Math.max(...data)
  return data.map((value) => (value / max) * 100)
}

export function aggregateByPeriod(data: ComparisonData[], period: "day" | "week" | "month" | "year"): ComparisonData[] {
  // Group data by period and sum values
  const aggregated = new Map<string, ComparisonData>()

  data.forEach((item) => {
    const date = new Date(item.metadata?.periodStart || "")
    let periodKey: string

    switch (period) {
      case "day":
        periodKey = date.toISOString().split("T")[0]
        break
      case "week":
        const weekNumber = Math.ceil((date.getDate() + date.getDay()) / 7)
        periodKey = `${date.getFullYear()}-W${weekNumber}`
        break
      case "month":
        periodKey = `${date.getFullYear()}-${date.getMonth() + 1}`
        break
      case "year":
        periodKey = date.getFullYear().toString()
        break
    }

    if (!aggregated.has(periodKey)) {
      aggregated.set(periodKey, {
        label: periodKey,
        datasets: item.datasets.map((ds) => ({ ...ds, value: 0 })),
      })
    }

    const existing = aggregated.get(periodKey)!
    existing.datasets.forEach((ds, i) => {
      ds.value += item.datasets[i].value
    })
  })

  return Array.from(aggregated.values())
}

export function calculateMovingAverage(data: number[], window: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(Number.NaN)
      continue
    }
    const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0)
    result.push(sum / window)
  }
  return result
}

export function formatComparisonValue(value: number, type: ComparisonType, format = "number"): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: type === "growth" || type === "variance" ? "percent" : format === "currency" ? "currency" : "decimal",
    currency: "USD",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })

  const formattedValue = formatter.format(type === "growth" || type === "variance" ? value / 100 : value)

  if (type === "growth" || type === "variance") {
    return `${value >= 0 ? "+" : ""}${formattedValue}`
  }

  return formattedValue
}

export function generateComparisonColors(datasets: number): string[] {
  const baseColors = [
    { light: "#60a5fa", dark: "#3b82f6" }, // Blue
    { light: "#34d399", dark: "#059669" }, // Green
    { light: "#f472b6", dark: "#db2777" }, // Pink
    { light: "#a78bfa", dark: "#7c3aed" }, // Purple
    { light: "#fbbf24", dark: "#d97706" }, // Yellow
  ]

  const colors: string[] = []
  for (let i = 0; i < datasets; i++) {
    const colorSet = baseColors[i % baseColors.length]
    colors.push(colorSet.dark)
  }
  return colors
}

export function getComparisonTooltipContent(
  type: ComparisonType,
  datasets: { name: string; value: number }[],
  format: string,
  metadata?: {
    benchmark?: number
    target?: number
    previousPeriod?: number
  },
): React.ReactNode {
  return (
    <div className="p-3 bg-background/95 border rounded-lg shadow-lg space-y-2">
      {datasets.map((dataset, index) => (
        <div key={index} className="flex justify-between gap-4">
          <span className="text-sm font-medium">{dataset.name}:</span>
          <span className="text-sm text-muted-foreground">{formatComparisonValue(dataset.value, type, format)}</span>
        </div>
      ))}

      {metadata?.benchmark && (
        <div className="flex justify-between gap-4 border-t pt-2">
          <span className="text-sm font-medium">Benchmark:</span>
          <span className="text-sm text-muted-foreground">
            {formatComparisonValue(metadata.benchmark, "side-by-side", format)}
          </span>
        </div>
      )}

      {metadata?.target && (
        <div className="flex justify-between gap-4">
          <span className="text-sm font-medium">Target:</span>
          <span className="text-sm text-muted-foreground">
            {formatComparisonValue(metadata.target, "side-by-side", format)}
          </span>
        </div>
      )}

      {metadata?.previousPeriod && (
        <div className="flex justify-between gap-4">
          <span className="text-sm font-medium">vs Previous:</span>
          <span
            className={cn("text-sm", datasets[0].value > metadata.previousPeriod ? "text-green-500" : "text-red-500")}
          >
            {formatComparisonValue(calculateGrowthRate(datasets[0].value, metadata.previousPeriod), "growth")}
          </span>
        </div>
      )}
    </div>
  )
}
