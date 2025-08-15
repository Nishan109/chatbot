"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface VisualPromptSliderProps {
  onGenerate: (complexity: number, dataPoints: number) => void
}

export function VisualPromptSlider({ onGenerate }: VisualPromptSliderProps) {
  const [complexity, setComplexity] = useState(50)
  const [dataPoints, setDataPoints] = useState(5)

  const handleGenerate = () => {
    onGenerate(complexity, dataPoints)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Chart Generation Settings</CardTitle>
        <CardDescription>Adjust the sliders to customize your chart</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="complexity" className="text-sm font-medium">
            Complexity: {complexity}%
          </label>
          <Slider
            id="complexity"
            min={0}
            max={100}
            step={1}
            value={[complexity]}
            onValueChange={(value) => setComplexity(value[0])}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="dataPoints" className="text-sm font-medium">
            Data Points: {dataPoints}
          </label>
          <Slider
            id="dataPoints"
            min={3}
            max={20}
            step={1}
            value={[dataPoints]}
            onValueChange={(value) => setDataPoints(value[0])}
          />
        </div>
        <Button onClick={handleGenerate} className="w-full">
          Generate Chart
        </Button>
      </CardContent>
    </Card>
  )
}
