"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComparisonTable } from "./comparison-table"
import {
  Wand2,
  Loader2,
  History,
  PenLine,
  Download,
  Share2,
  Copy,
  Trash2,
  FileDown,
  TableIcon,
  BarChart,
  Grid,
  Settings2,
  Star,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ComparisonData {
  feature: string
  [key: string]: string | number
}

interface SavedComparison {
  id: string
  prompt: string
  data: {
    title: string
    products: string[]
    data: ComparisonData[]
  }
  createdAt: string
}

export function AIComparisonForm() {
  const [loading, setLoading] = React.useState(false)
  const [prompt, setPrompt] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"table" | "chart" | "grid">("table")
  const [autoSave, setAutoSave] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [generatedData, setGeneratedData] = React.useState<{
    title: string
    products: string[]
    data: ComparisonData[]
  } | null>(null)
  const [savedComparisons, setSavedComparisons] = React.useState<SavedComparison[]>([])
  const { toast } = useToast()

  // Refs for scroll handling
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const resultRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll when new content is generated
  React.useEffect(() => {
    if (generatedData && resultRef.current) {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: "smooth",
        block: "nearest",
      }

      // Add a small delay to ensure content is rendered
      setTimeout(() => {
        resultRef.current?.scrollIntoView(scrollOptions)
      }, 100)
    }
  }, [generatedData])

  // Load saved comparisons from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("savedComparisons")
      if (saved) {
        setSavedComparisons(JSON.parse(saved))
      }
    } catch (err) {
      console.error("Error loading saved comparisons:", err)
    }
  }, [])

  const generateComparison = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comparison prompt",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-comparison", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate comparison")
      }

      if (data.error) {
        throw new Error(data.error)
      }

      setGeneratedData(data)

      if (autoSave) {
        // Save to history
        try {
          const newComparison: SavedComparison = {
            id: Date.now().toString(),
            prompt,
            data,
            createdAt: new Date().toISOString(),
          }
          const updatedComparisons = [newComparison, ...savedComparisons].slice(0, 10) // Keep last 10
          setSavedComparisons(updatedComparisons)
          localStorage.setItem("savedComparisons", JSON.stringify(updatedComparisons))
        } catch (err) {
          console.error("Error saving comparison to history:", err)
        }
      }

      toast({
        title: "Success",
        description: "Comparison table generated successfully",
      })
    } catch (error) {
      console.error("Comparison generation error:", error)
      setError(error instanceof Error ? error.message : "Failed to generate comparison. Please try again.")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate comparison. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSavedComparison = (saved: SavedComparison) => {
    setPrompt(saved.prompt)
    setGeneratedData(saved.data)
    setError(null)
  }

  const deleteSavedComparison = (id: string) => {
    try {
      const updatedComparisons = savedComparisons.filter((c) => c.id !== id)
      setSavedComparisons(updatedComparisons)
      localStorage.setItem("savedComparisons", JSON.stringify(updatedComparisons))
      toast({
        title: "Deleted",
        description: "Comparison removed from history",
      })
    } catch (err) {
      console.error("Error deleting comparison:", err)
      toast({
        title: "Error",
        description: "Failed to delete comparison",
        variant: "destructive",
      })
    }
  }

  const exportComparison = () => {
    if (!generatedData) return

    try {
      const jsonString = JSON.stringify(generatedData, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `comparison-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error exporting comparison:", err)
      toast({
        title: "Error",
        description: "Failed to export comparison",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = async () => {
    if (!generatedData) return

    try {
      await navigator.clipboard.writeText(JSON.stringify(generatedData, null, 2))
      toast({
        title: "Copied",
        description: "Comparison data copied to clipboard",
      })
    } catch (err) {
      console.error("Error copying to clipboard:", err)
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-[calc(100vh-12rem)]" ref={scrollAreaRef}>
        <div className="space-y-8 py-6">
          <Card className="bg-black/50 backdrop-blur-xl border-green-500/20">
            <CardHeader>
              <CardTitle className="text-white">Generate Comparison</CardTitle>
              <CardDescription className="text-gray-400">
                Enter your comparison prompt or select from history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ai" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ai" className="data-[state=active]:bg-green-500/20">
                    <Wand2 className="h-4 w-4 mr-2" />
                    AI Generation
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-blue-500/20">
                    <History className="h-4 w-4 mr-2" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="data-[state=active]:bg-purple-500/20">
                    <PenLine className="h-4 w-4 mr-2" />
                    Manual Input
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="prompt">What would you like to compare?</Label>
                      <Textarea
                        id="prompt"
                        placeholder="E.g., Compare the latest iPhone, Samsung Galaxy, and Google Pixel phones"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[100px] resize-y bg-black/50 border-zinc-800 focus:border-green-500/50 transition-colors"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
                      <Label htmlFor="auto-save">Auto-save to history</Label>
                    </div>

                    <Button
                      onClick={generateComparison}
                      className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-500"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Comparison
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <AnimatePresence>
                    {savedComparisons.length > 0 ? (
                      <motion.div layout className="grid gap-4">
                        {savedComparisons.map((saved) => (
                          <motion.div
                            key={saved.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <Card className="bg-black/30 border-zinc-800/50 hover:border-green-500/20 transition-colors">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base">{saved.data.title}</CardTitle>
                                  <Badge variant="secondary" className="bg-zinc-900">
                                    {new Date(saved.createdAt).toLocaleDateString()}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <p className="text-sm text-muted-foreground truncate">{saved.prompt}</p>
                              </CardContent>
                              <CardFooter className="flex justify-between">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => loadSavedComparison(saved)}
                                  className="bg-green-500/20 hover:bg-green-500/30 border-green-500/50"
                                >
                                  Load
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSavedComparison(saved.id)}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                        <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">
                          No saved comparisons yet. Generate some comparisons to see them here.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="manual">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Switch to manual mode to create your own comparison table from scratch.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => (window.location.href = "/comparison/manual")}
                      className="w-full"
                    >
                      <PenLine className="h-4 w-4 mr-2" />
                      Open Manual Editor
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="bg-red-900/50 border-red-500/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait">
            {generatedData && (
              <motion.div
                ref={resultRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onAnimationComplete={() => {
                  // Ensure smooth scroll after animation completes
                  resultRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                  })
                }}
              >
                <Card className="bg-black/50 backdrop-blur-xl border-green-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-white">{generatedData.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-1 rounded-md border border-zinc-800 p-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={viewMode === "table" ? "secondary" : "ghost"}
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setViewMode("table")}
                            >
                              <TableIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Table view</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={viewMode === "chart" ? "secondary" : "ghost"}
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setViewMode("chart")}
                            >
                              <BarChart className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Chart view</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={viewMode === "grid" ? "secondary" : "ghost"}
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setViewMode("grid")}
                            >
                              <Grid className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Grid view</TooltipContent>
                        </Tooltip>
                      </div>

                      <Button variant="outline" size="icon" className="text-yellow-500">
                        <Star className="h-4 w-4" />
                      </Button>

                      <Button variant="outline" size="icon">
                        <Settings2 className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FileDown className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={exportComparison}>
                            <Download className="h-4 w-4 mr-2" />
                            Download JSON
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={copyToClipboard}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy to Clipboard
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {viewMode === "table" && (
                      <ComparisonTable
                        title={generatedData.title}
                        data={generatedData.data}
                        products={generatedData.products}
                      />
                    )}
                    {viewMode === "chart" && (
                      <div className="text-center py-8 text-muted-foreground">Chart view coming soon...</div>
                    )}
                    {viewMode === "grid" && (
                      <div className="text-center py-8 text-muted-foreground">Grid view coming soon...</div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </TooltipProvider>
  )
}
