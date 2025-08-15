"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SavedComparison {
  id: string
  prompt: string
  data: {
    title: string
    products: string[]
    data: any[]
  }
  createdAt: string
}

interface ComparisonHistoryProps {
  onLoadComparison?: (comparison: SavedComparison) => void
}

export function ComparisonHistory({ onLoadComparison }: ComparisonHistoryProps) {
  const [savedComparisons, setSavedComparisons] = React.useState<SavedComparison[]>([])
  const { toast } = useToast()

  // Load saved comparisons from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("savedComparisons")
    if (saved) {
      setSavedComparisons(JSON.parse(saved))
    }
  }, [])

  const deleteSavedComparison = (id: string) => {
    const updatedComparisons = savedComparisons.filter((c) => c.id !== id)
    setSavedComparisons(updatedComparisons)
    localStorage.setItem("savedComparisons", JSON.stringify(updatedComparisons))
    toast({
      title: "Deleted",
      description: "Comparison removed from history",
    })
  }

  return (
    <Card className="bg-black/50 backdrop-blur-xl border-zinc-800/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <History className="h-4 w-4" />
          Recent Comparisons
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <AnimatePresence>
            {savedComparisons.length > 0 ? (
              <motion.div layout className="space-y-3">
                {savedComparisons.map((saved) => (
                  <motion.div
                    key={saved.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="bg-black/30 border-zinc-800/50 hover:border-green-500/20 transition-colors">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium truncate">{saved.data.title}</CardTitle>
                          <Badge variant="secondary" className="bg-zinc-900 text-xs">
                            {new Date(saved.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 pb-2">
                        <p className="text-xs text-muted-foreground line-clamp-2">{saved.prompt}</p>
                      </CardContent>
                      <CardFooter className="p-2 flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onLoadComparison?.(saved)}
                          className="text-xs bg-green-500/20 hover:bg-green-500/30 border-green-500/50"
                        >
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSavedComparison(saved.id)}
                          className="text-xs text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
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
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
