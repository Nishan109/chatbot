"use client"

import { useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Edit2, FileDown, Settings2, Trash2, MoreVertical, Loader2, ImageIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RenameDialog } from "./rename-dialog"
import { DeleteDialog } from "./delete-dialog"
import { useConversationStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { toPng, toSvg } from "html-to-image"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { inter } from "@/lib/fonts"
import Image from "next/image"

interface ChartCardProps {
  id: string
  conversationId: string
  type: "bar" | "pie" | "line" | "radar"
  title: string
  description: string
  data: any[]
  chartImageUrl?: string // Added chartImageUrl prop
}

// Color schemes
const COLOR_SCHEMES = {
  default: ["#8B5CF6", "#06B6D4", "#F59E0B", "#EF4444", "#10B981", "#6366F1"],
  gradient: ["#C084FC", "#38BDF8", "#FB923C", "#F87171", "#34D399", "#818CF8"],
  pastel: ["#C4B5FD", "#7DD3FC", "#FED7AA", "#FECACA", "#86EFAC", "#A5B4FC"],
  neon: ["#A855F7", "#0EA5E9", "#F97316", "#DC2626", "#059669", "#4F46E5"],
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 5}
        outerRadius={innerRadius - 2}
        fill={fill}
      />
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#fff" className="text-sm font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#fff" className="text-xs">
        {`${value} (${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  )
}

export function ChartCard({ id, conversationId, type, title, description, data, chartImageUrl }: ChartCardProps) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false) // Added state for deleting
  const [activeIndex, setActiveIndex] = useState<number | undefined>()
  const [colorScheme, setColorScheme] = useState<keyof typeof COLOR_SCHEMES>("default")
  const [showPercentage, setShowPercentage] = useState(true)
  const [enableAnimation, setEnableAnimation] = useState(true)
  const [legendPosition, setLegendPosition] = useState<"right" | "bottom">("right")
  const [curveType, setCurveType] = useState<"linear" | "natural" | "step">("linear")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)
  const { updateChartTitle, deleteChart } = useConversationStore()
  const { toast } = useToast()

  const handleRename = async (newTitle: string) => {
    try {
      await updateChartTitle(conversationId, id, newTitle)
      setIsRenameDialogOpen(false)
      toast({
        title: "Success",
        description: "Chart renamed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename chart",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true) // Set isDeleting to true before deleting
    try {
      await deleteChart(conversationId, id)
      setIsDeleteDialogOpen(false)
      setIsDeleting(false) // Set isDeleting to false after successful deletion
      // The page will automatically refresh, so we don't need to update local state or show a toast
    } catch (error) {
      setIsDeleting(false) // Set isDeleting to false after failed deletion
      console.error("Error deleting chart:", error)
      toast({
        title: "Error",
        description: "Failed to delete chart. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (format: "png" | "svg") => {
    if (!chartRef.current) {
      toast({
        title: "Error",
        description: "Unable to download chart. Chart element not found.",
        variant: "destructive",
      })
      return
    }

    setIsDownloading(true)
    try {
      const fileName = `${title.toLowerCase().replace(/\s+/g, "-")}-chart.${format}`
      const chartElement = chartRef.current.querySelector(".recharts-wrapper")

      if (!chartElement) {
        throw new Error("Chart element not found")
      }

      const options = {
        cacheBust: true,
        pixelRatio: 2,
        quality: 1,
        backgroundColor: "#1f1f1f",
        fontFamily: inter.style.fontFamily,
        width: chartElement.clientWidth,
        height: chartElement.clientHeight,
        style: {
          transform: "scale(1)",
        },
        filter: (node: HTMLElement) => {
          const exclusionClasses = ["toastify", "loading"]
          return !exclusionClasses.some((className) => node.className?.includes?.(className))
        },
      }

      let dataUrl: string
      try {
        if (format === "png") {
          dataUrl = await toPng(chartElement, options)
        } else {
          dataUrl = await toSvg(chartElement, {
            ...options,
            embedFonts: true,
            fontEmbedCSS: `
              @font-face {
                font-family: '${inter.style.fontFamily}';
                src: local('${inter.style.fontFamily}');
              }
            `,
          })
        }

        if (!dataUrl) {
          throw new Error("Failed to generate image data")
        }
      } catch (err) {
        throw new Error(
          `Failed to generate ${format.toUpperCase()} file: ${err instanceof Error ? err.message : "Unknown error"}`,
        )
      }

      const link = document.createElement("a")
      link.download = fileName
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Success",
        description: `Chart downloaded as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error("Error downloading chart:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download chart",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const truncateLabel = (label: string, maxLength = 20) => {
    if (!label) return ""
    return label.length > maxLength ? label.slice(0, maxLength - 3) + "..." : label
  }

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={(props) => renderActiveShape({ ...props, name: truncateLabel(props.name) })}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={() => setActiveIndex(undefined)}
            isAnimationActive={enableAnimation}
            label={{
              fill: "#fff",
              fontSize: 12,
              position: "outside",
              offset: 15,
              angle: 45,
              formatter: (value: number) => `${((value / total) * 100).toFixed(1)}%`,
            }}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLOR_SCHEMES[colorScheme][index % COLOR_SCHEMES[colorScheme].length]}
                className="transition-all duration-200 hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f1f1f",
              border: "1px solid #333333",
              borderRadius: "4px",
            }}
            itemStyle={{ color: "#ffffff" }}
          />
          <Legend
            layout={legendPosition === "bottom" ? "horizontal" : "vertical"}
            align={legendPosition === "bottom" ? "center" : "right"}
            verticalAlign={legendPosition === "bottom" ? "bottom" : "middle"}
            wrapperStyle={{
              paddingLeft: legendPosition === "right" ? "20px" : "0",
              paddingTop: legendPosition === "bottom" ? "20px" : "0",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const renderBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data.map((item) => ({ ...item, name: truncateLabel(item.name, 20) }))}
          margin={{
            top: 20,
            right: 30,
            left: 40,
            bottom: 70,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis
            dataKey="name"
            stroke="#ffffff"
            tick={{
              fill: "#ffffff",
              angle: -45,
              textAnchor: "end",
              dominantBaseline: "auto",
              fontSize: 12,
              dy: 8,
              dx: -8,
            }}
            height={80}
            interval={0}
          />
          <YAxis stroke="#ffffff" tick={{ fill: "#ffffff" }} tickFormatter={(value) => `${value}%`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f1f1f",
              border: "1px solid #333333",
              borderRadius: "4px",
            }}
            itemStyle={{ color: "#ffffff" }}
          />
          <Legend
            layout={legendPosition === "bottom" ? "horizontal" : "vertical"}
            align={legendPosition === "bottom" ? "center" : "right"}
            verticalAlign={legendPosition === "bottom" ? "bottom" : "middle"}
            wrapperStyle={{
              paddingLeft: legendPosition === "right" ? "20px" : "0",
              paddingTop: legendPosition === "bottom" ? "20px" : "0",
            }}
          />
          <Bar dataKey="value" isAnimationActive={enableAnimation}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLOR_SCHEMES[colorScheme][index % COLOR_SCHEMES[colorScheme].length]}
                className="transition-all duration-200 hover:opacity-80"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderLineChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data.map((item) => ({ ...item, name: truncateLabel(item.name) }))}
          margin={{
            top: 20,
            right: 30,
            left: 40,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis
            dataKey="name"
            stroke="#ffffff"
            tick={{
              fill: "#ffffff",
              angle: -35,
              textAnchor: "end",
              dominantBaseline: "auto",
              fontSize: 12,
              dy: 8,
              dx: -8,
            }}
            height={60}
            interval={0}
          />
          <YAxis
            stroke="#ffffff"
            tick={{
              fill: "#ffffff",
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f1f1f",
              border: "1px solid #333333",
              borderRadius: "4px",
            }}
            itemStyle={{ color: "#ffffff" }}
          />
          <Legend
            layout={legendPosition === "bottom" ? "horizontal" : "vertical"}
            align={legendPosition === "bottom" ? "center" : "right"}
            verticalAlign={legendPosition === "bottom" ? "bottom" : "middle"}
            wrapperStyle={{
              paddingLeft: legendPosition === "right" ? "20px" : "0",
              paddingTop: legendPosition === "bottom" ? "20px" : "0",
            }}
          />
          <Line
            type={curveType}
            dataKey="value"
            stroke={COLOR_SCHEMES[colorScheme][0]}
            strokeWidth={2}
            dot={{ fill: COLOR_SCHEMES[colorScheme][0], r: 6 }}
            activeDot={{ r: 8 }}
            isAnimationActive={enableAnimation}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const renderRadarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#666" />
          <PolarAngleAxis dataKey="name" stroke="#fff" />
          <PolarRadiusAxis stroke="#fff" />
          <Radar name="Skills" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f1f1f",
              border: "1px solid #333",
              borderRadius: "4px",
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    )
  }

  const renderChart = () => {
    switch (type) {
      case "pie":
        return renderPieChart()
      case "bar":
        return renderBarChart()
      case "line":
        return renderLineChart()
      case "radar":
        return renderRadarChart()
      default:
        return null
    }
  }

  return (
    <>
      <Card className={cn("bg-[#1f1f1f] border-zinc-800 overflow-hidden group", isDeleting && "opacity-50")}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
            <CardDescription className="text-zinc-400">{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chart Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="color-scheme">Color Scheme</Label>
                    <select
                      id="color-scheme"
                      value={colorScheme}
                      onChange={(e) => setColorScheme(e.target.value as keyof typeof COLOR_SCHEMES)}
                      className="bg-zinc-800 text-white rounded-md px-2 py-1"
                    >
                      {Object.keys(COLOR_SCHEMES).map((scheme) => (
                        <option key={scheme} value={scheme}>
                          {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {type === "pie" && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-percentage">Show Percentage Labels</Label>
                      <Switch id="show-percentage" checked={showPercentage} onCheckedChange={setShowPercentage} />
                    </div>
                  )}
                  {type === "line" && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor="curve-type">Curve Type</Label>
                      <select
                        id="curve-type"
                        value={curveType}
                        onChange={(e) => setCurveType(e.target.value as "linear" | "natural" | "step")}
                        className="bg-zinc-800 text-white rounded-md px-2 py-1"
                      >
                        <option value="linear">Linear</option>
                        <option value="natural">Natural</option>
                        <option value="step">Step</option>
                      </select>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable-animation">Enable Animation</Label>
                    <Switch id="enable-animation" checked={enableAnimation} onCheckedChange={setEnableAnimation} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="legend-position">Legend Position</Label>
                    <select
                      id="legend-position"
                      value={legendPosition}
                      onChange={(e) => setLegendPosition(e.target.value as "right" | "bottom")}
                      className="bg-zinc-800 text-white rounded-md px-2 py-1"
                    >
                      <option value="right">Right</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setIsRenameDialogOpen(true)
                    setIsDropdownOpen(false)
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsDeleteDialogOpen(true)
                    setIsDropdownOpen(false)
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload("png")}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Download PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload("svg")}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Download SVG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn("p-6 relative", isDownloading && "opacity-50 cursor-not-allowed")}
            ref={chartRef}
            style={{ backgroundColor: "#1f1f1f" }}
          >
            {renderChart()}
            {isDownloading || isDeleting ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg">
                {isDownloading ? (
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-white">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Deleting...</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          {chartImageUrl && (
            <Image
              src={chartImageUrl || "/placeholder.svg"}
              alt={`${title} chart`}
              width={300}
              height={200}
              layout="responsive"
            />
          )}
        </CardContent>
      </Card>

      <RenameDialog
        isOpen={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        onRename={handleRename}
        currentName={title}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        itemName={title}
      />
    </>
  )
}
