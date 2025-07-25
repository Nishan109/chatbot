"use client"

import type { Message } from "@/lib/store"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { toPng } from "html-to-image"
import { useToast } from "@/components/ui/use-toast"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { toast } = useToast()

  const handleDownload = async (format: "png") => {
    const element = document.querySelector(".chart-container")
    if (!element) return

    try {
      const dataUrl = await toPng(element, { backgroundColor: "#18181B" })
      const link = document.createElement("a")
      link.download = `chart.${format}`
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

  const renderChart = () => {
    if (!message.chartData) return null

    switch (message.chartData.type) {
      case "bar":
        return (
          <div className="chart-container w-full max-w-4xl mx-auto bg-zinc-900 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{message.chartData.title}</h3>
                {message.chartData.description && <p className="text-zinc-400 mt-1">{message.chartData.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleDownload("png")}>
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={message.chartData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#fff" tick={{ fill: "#fff" }} tickLine={{ stroke: "#fff" }} />
                <YAxis
                  stroke="#fff"
                  tick={{ fill: "#fff" }}
                  tickLine={{ stroke: "#fff" }}
                  tickFormatter={(value) => `$${value}B`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: number) => [`$${value}B`, "Market Cap"]}
                />
                <Legend wrapperStyle={{ color: "#fff" }} />
                <Bar
                  dataKey="value"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                  label={{
                    position: "top",
                    fill: "#fff",
                    formatter: (value: number) => `$${value}B`,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      // ... other chart types ...
      default:
        return (
          <div className="max-w-4xl mx-auto">
            <p className="text-white">{message.content}</p>
          </div>
        )
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex flex-col gap-4">
        {message.role === "user" ? (
          <div className="flex justify-end">
            <div className="bg-green-500 text-white rounded-lg px-4 py-2 max-w-[80%]">
              <p>{message.content}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-lg px-4 py-2 max-w-[80%] w-full">
              {message.type === "chart" ? renderChart() : <p className="text-white">{message.content}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
