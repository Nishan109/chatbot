"use client"

import { Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useConversationStore } from "@/lib/store"
import { useState } from "react"

export function LoadingOverlay() {
  const { isDeletingFromSidebar, isRefreshing, isLoading } = useConversationStore()

  // Add error state handling
  const [error, setError] = useState<string | null>(null)

  // Only show if any loading state is active and there's no error
  if ((!isDeletingFromSidebar && !isRefreshing && !isLoading) || error) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4 bg-card p-6 rounded-lg shadow-lg"
      >
        {error ? (
          <>
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-lg font-medium text-destructive">{error}</p>
          </>
        ) : (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-medium text-foreground">
              {isDeletingFromSidebar
                ? "Deleting chart..."
                : isRefreshing
                  ? "Refreshing your charts..."
                  : "Loading your charts..."}
            </p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
