"use client"

import { Bar, BarChart } from "recharts"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

const sampleData = [
  { name: "Jan", value: 100 },
  { name: "Feb", value: 200 },
  { name: "Mar", value: 150 },
  { name: "Apr", value: 300 },
  { name: "May", value: 250 },
]

export function ChartDisplay() {
  return (
    <Card className="p-6">
      <ChartContainer
        config={{
          value: {
            label: "Value",
            color: "hsl(var(--chart-1))",
          },
        }}
        className="w-full aspect-[16/9]"
      >
        <BarChart data={sampleData}>
          <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
          <ChartTooltip />
        </BarChart>
      </ChartContainer>
    </Card>
  )
}
