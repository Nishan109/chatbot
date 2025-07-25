"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { VisualPromptSlider } from "@/components/visual-prompt-slider"

interface NewChartDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description: string; type: "bar" | "pie" | "line" }) => void
}

export function NewChartDialog({ isOpen, onClose, onSubmit }: NewChartDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"bar" | "pie" | "line">("bar")
  const [useVisualPrompt, setUseVisualPrompt] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSubmit({ title: title.trim(), description: description.trim(), type })
      resetForm()
      onClose()
    }
  }

  const handleVisualPromptGenerate = (complexity: number, dataPoints: number) => {
    const generatedTitle = `Generated ${type.charAt(0).toUpperCase() + type.slice(1)} Chart`
    const generatedDescription = `A ${type} chart with ${dataPoints} data points and ${complexity}% complexity`
    onSubmit({ title: generatedTitle, description: generatedDescription, type })
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setType("bar")
    setUseVisualPrompt(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chart</DialogTitle>
        </DialogHeader>
        {useVisualPrompt ? (
          <VisualPromptSlider onGenerate={handleVisualPromptGenerate} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter chart title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter chart description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Chart Type</Label>
              <Select value={type} onValueChange={(value: "bar" | "pie" | "line") => setType(value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUseVisualPrompt(true)}>
                Use Visual Prompt
              </Button>
              <Button type="submit">Create Chart</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
