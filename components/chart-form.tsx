"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function ChartForm() {
  const [request, setRequest] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Here you would call your chart generation logic
      // For now, we'll just simulate it
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Error generating chart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Describe the chart you want to create..."
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        className="min-h-[100px]"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Chart"}
      </Button>
    </form>
  )
}
