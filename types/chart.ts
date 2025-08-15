export type ChartType = "bar" | "line" | "pie" | "radar"

export type ChartTheme = "modern" | "vintage" | "neon" | "forest"

export type ChartAnimation = "default" | "smooth" | "bounce"

export interface ChartData {
  label: string
  value: number
  color?: string
  extraData?: Record<string, any>
}

export interface ChartOptions {
  theme: ChartTheme
  animation: ChartAnimation
  showLegend: boolean
  showGrid: boolean
  showTooltip: boolean
  showValues: boolean
  valueFormat: "number" | "currency" | "percent" | "compact"
  orientation?: "vertical" | "horizontal"
  stacked?: boolean
  curved?: boolean
  gradient?: boolean
  radarShape?: "circle" | "polygon"
  radarFill?: boolean
  radarOpacity?: number
}

export interface ChartDimensions {
  width: number
  height: number
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface ChartResponse {
  type: ChartType
  data: ChartData[]
  options: ChartOptions
  title: string
  description: string
  metadata?: {
    createdAt: Date
    updatedAt: Date
    userId: string
    favorite: boolean
    tags: string[]
  }
}

export type ComparisonType = "side-by-side" | "stacked" | "overlay" | "growth" | "variance"

export interface ComparisonData {
  label: string
  datasets: {
    name: string
    value: number
    color?: string
  }[]
  metadata?: {
    periodStart?: Date
    periodEnd?: Date
    benchmark?: number
    target?: number
    previousPeriod?: number
  }
}

export interface ComparisonOptions extends ChartOptions {
  comparisonType: ComparisonType
  showBenchmark: boolean
  showTarget: boolean
  showGrowthRate: boolean
  showVariance: boolean
  normalizeData: boolean
  periodLabels: {
    current: string
    previous: string
  }
}

export interface ComparisonChartResponse extends ChartResponse {
  comparisonData: ComparisonData[]
  options: ComparisonOptions
  analysis?: {
    totalGrowth: number
    averageGrowth: number
    maxGrowth: number
    minGrowth: number
    variance: {
      vsBenchmark?: number
      vsTarget?: number
      vsPreviousPeriod?: number
    }
  }
}

export interface ScatterDataPoint {
  x: number
  y: number
  z?: number
  label?: string
  category?: string
}

export interface ScatterChartData {
  name: string
  data: ScatterDataPoint[]
  color: string
}
