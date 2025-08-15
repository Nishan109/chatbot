"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ChartCard } from "@/components/chart-card"
import { NewChartDialog } from "@/components/new-chart-dialog"
import { useConversationStore } from "@/lib/store"
import { nanoid } from "nanoid"
import { VisualPromptSlider } from "@/components/visual-prompt-slider"

interface ChartListProps {
  conversationId: string
}

export function ChartList({ conversationId }: ChartListProps) {
  const [isNewChartDialogOpen, setIsNewChartDialogOpen] = useState(false)
  const [showVisualPrompt, setShowVisualPrompt] = useState(false)
  const { conversations, addMessage } = useConversationStore()

  const conversation = conversations.find((c) => c.id === conversationId)
  const charts = conversation?.messages.filter((m) => m.type === "chart") || []

  const handleNewChart = (data: { title: string; description: string; type: "bar" | "pie" | "line" }) => {
    const sampleData = [
      { name: "Category A", value: 400 },
      { name: "Category B", value: 300 },
      { name: "Category C", value: 200 },
      { name: "Category D", value: 100 },
    ]

    addMessage(conversationId, {
      id: nanoid(),
      content: `Here's your ${data.type} chart:`,
      type: "chart",
      role: "assistant",
      createdAt: new Date(),
      chartData: {
        type: data.type,
        title: data.title,
        description: data.description,
        data: sampleData,
      },
    })
  }

  const handleVisualPromptGenerate = (complexity: number, dataPoints: number) => {
    // Generate chart data based on complexity and dataPoints
    const data = Array.from({ length: dataPoints }, (_, i) => ({
      name: `Category ${String.fromCharCode(65 + i)}`,
      value: Math.floor(Math.random() * (complexity + 1) * 10),
    }))

    const chartTypes = ["bar", "pie", "line"] as const
    const randomType = chartTypes[Math.floor(Math.random() * chartTypes.length)]

    addMessage(conversationId, {
      id: nanoid(),
      content: `Here's your ${randomType} chart:`,
      type: "chart",
      role: "assistant",
      createdAt: new Date(),
      chartData: {
        type: randomType,
        title: `Generated ${randomType.charAt(0).toUpperCase() + randomType.slice(1)} Chart`,
        description: `A ${randomType} chart with ${dataPoints} data points and ${complexity}% complexity`,
        data,
      },
    })

    setShowVisualPrompt(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Charts</h2>
        <Button onClick={() => setShowVisualPrompt(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Chart
        </Button>
      </div>

      {showVisualPrompt && <VisualPromptSlider onGenerate={handleVisualPromptGenerate} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charts.map(
          (chart) =>
            chart.chartData && (
              <ChartCard
                key={chart.id}
                id={chart.id}
                conversationId={conversationId}
                type={chart.chartData.type}
                title={chart.chartData.title}
                description={chart.chartData.description}
                data={chart.chartData.data}
              />
            ),
        )}
      </div>

      <NewChartDialog
        isOpen={isNewChartDialogOpen}
        onClose={() => setIsNewChartDialogOpen(false)}
        onSubmit={handleNewChart}
      />
    </div>
  )
}
