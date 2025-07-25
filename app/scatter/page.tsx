import { ScatterPlot } from "@/components/scatter-plot"

const sampleData = {
  title: "Sales vs Marketing ROI",
  description: "Correlation between marketing spend and sales revenue",
  xAxisLabel: "Marketing Spend ($K)",
  yAxisLabel: "Sales Revenue ($K)",
  data: [
    {
      name: "Q1 2024",
      data: Array.from({ length: 20 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 500 + 200,
        z: Math.random() * 50 + 50,
        label: `Campaign ${i + 1}`,
      })),
      color: "#10B981",
    },
    {
      name: "Q4 2023",
      data: Array.from({ length: 20 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 400 + 150,
        z: Math.random() * 50 + 50,
        label: `Campaign ${i + 1}`,
      })),
      color: "#6366F1",
    },
  ],
}

export default function ScatterPlotPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ScatterPlot
        title={sampleData.title}
        description={sampleData.description}
        data={sampleData.data}
        xAxisLabel={sampleData.xAxisLabel}
        yAxisLabel={sampleData.yAxisLabel}
        options={{
          showTrendline: true,
          showLabels: true,
          bubbleSize: true,
          colorScheme: "default",
        }}
      />
    </div>
  )
}
