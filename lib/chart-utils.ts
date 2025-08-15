import type { ChartTheme } from "@/types/chart"

export const CHART_THEMES = {
  modern: ["#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"],
  vintage: ["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"],
  neon: ["#22d3ee", "#818cf8", "#c084fc", "#e879f9", "#fb7185"],
  forest: ["#059669", "#047857", "#065f46", "#064e3b", "#064e3b"],
} as const

export const CHART_ANIMATIONS = {
  default: {},
  smooth: {
    isAnimationActive: true,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: "ease",
  },
  bounce: {
    isAnimationActive: true,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: "bounce",
  },
} as const

export const generateChartColors = (theme: ChartTheme, count: number) => {
  const colors = CHART_THEMES[theme]
  return Array(count)
    .fill(0)
    .map((_, i) => colors[i % colors.length])
}

export const calculateChartDimensions = (containerWidth: number) => {
  const aspectRatio = 0.6 // height = 60% of width
  return {
    width: containerWidth,
    height: containerWidth * aspectRatio,
    margin: {
      top: 20,
      right: 30,
      bottom: 20,
      left: 30,
    },
  }
}

export const getChartTooltipContent = (
  type: string,
  value: number | undefined,
  format: string,
  extra?: {
    label?: string
    date?: string
    previousValue?: number
    percentage?: number
  },
) => {
  if (!value) return null

  let formattedValue = value
  switch (format) {
    case "currency":
      formattedValue = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value)
      break
    case "percent":
      formattedValue = `${(value * 100).toFixed(1)}%`
      break
    case "compact":
      formattedValue = new Intl.NumberFormat("en-US", {
        notation: "compact",
      }).format(value)
      break
    default:
      formattedValue = value.toLocaleString()
  }

  return (
    <div className="bg-background/95 p-2 rounded-lg border shadow-lg">
      {extra?.label && <div className="font-medium">{extra.label}</div>}
      {extra?.date && <div className="text-sm text-muted-foreground">{extra.date}</div>}
      <div className="font-bold">{formattedValue}</div>
      {extra?.previousValue && (
        <div className="text-sm text-muted-foreground">Previous: {extra.previousValue.toLocaleString()}</div>
      )}
      {extra?.percentage && <div className="text-sm text-muted-foreground">{(extra.percentage * 100).toFixed(1)}%</div>}
    </div>
  )
}

// Add radar chart specific utilities
export const generateRadarData = (data: any[], valueKey: string, nameKey: string) => {
  return data.map((item) => ({
    name: item[nameKey],
    value: item[valueKey],
  }))
}
