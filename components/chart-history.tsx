"use client"

import { useConversationStore } from "@/lib/store"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Star, Clock, Plus, Loader2, MoreVertical, Trash2 } from "lucide-react"
import { formatDistanceToNow, format, parseISO } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { DeleteDialog } from "./delete-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ChartHistory() {
  const router = useRouter()
  const {
    getChartHistory,
    setCurrentConversationId,
    toggleFavorite,
    addConversation,
    isRefreshing,
    deleteConversation,
  } = useConversationStore()
  const chartHistory = getChartHistory()
  const { toast } = useToast()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedChart, setSelectedChart] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleCreateChart = useCallback(async () => {
    try {
      const id = await addConversation("New Chart")
      setCurrentConversationId(id)
      router.push(`/chat/${id}`)
    } catch (error) {
      console.error("Failed to create chart:", error)
      toast({
        title: "Error",
        description: "Failed to create chart. Please try again.",
        variant: "destructive",
      })
    }
  }, [addConversation, setCurrentConversationId, router, toast])

  const handleChartClick = useCallback(
    (id: string) => {
      setCurrentConversationId(id)
      router.push(`/chat/${id}`)
    },
    [setCurrentConversationId, router],
  )

  const handleDelete = async () => {
    if (selectedChart) {
      try {
        await deleteConversation(selectedChart)
        setIsDeleteDialogOpen(false)
        setSelectedChart(null)
      } catch (error) {
        console.error("Delete error:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete chart",
          variant: "destructive",
        })
        setIsDeleteDialogOpen(false)
        setSelectedChart(null)
      }
    }
  }

  if (isRefreshing) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Refreshing your charts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Chart History</h2>
        <Button variant="outline" size="sm" className="text-zinc-400">
          <Clock className="h-4 w-4 mr-2" />
          View All
        </Button>
      </div>
      <AnimatePresence mode="wait">
        {chartHistory.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-zinc-900/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="h-12 w-12 text-zinc-700 mb-4" />
                <h3 className="text-lg font-medium text-zinc-400">No charts yet</h3>
                <p className="text-sm text-zinc-500 mt-1 max-w-[300px]">
                  Create your first chart to start visualizing your data
                </p>
                <Button variant="outline" className="mt-6" onClick={handleCreateChart}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create a Chart
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="chart-list"
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {chartHistory.map((chart, index) => {
              // Parse the date strings into Date objects
              const updatedAt = typeof chart.updatedAt === "string" ? parseISO(chart.updatedAt) : chart.updatedAt

              return (
                <motion.div
                  key={chart.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <Card className="hover:bg-zinc-900/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{chart.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(chart.id)
                          }}
                          className={chart.isFavorite ? "text-yellow-400" : "text-gray-400"}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedChart(chart.id)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {chart.messages.filter((m) => m.type === "chart").length} charts
                          </span>
                        </div>
                        <div className="flex flex-col items-end text-right">
                          <time className="text-xs text-zinc-500" dateTime={updatedAt.toISOString()}>
                            {format(updatedAt, "MMM d, yyyy")}
                          </time>
                          <span className="text-xs text-zinc-600">
                            {formatDistanceToNow(updatedAt, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <Button variant="link" className="mt-2 p-0" onClick={() => handleChartClick(chart.id)}>
                        View Charts
                      </Button>
                      {chart.previewUrl && (
                        <Image
                          src={chart.previewUrl || "/placeholder.svg"}
                          alt="Chart preview"
                          width={500}
                          height={300}
                        />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedChart(null)
        }}
        onConfirm={handleDelete}
        itemName={selectedChart ? chartHistory.find((c) => c.id === selectedChart)?.title || "" : ""}
      />
    </div>
  )
}
