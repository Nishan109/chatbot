"use client"

import { useState, useEffect, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { Chat } from "@/components/chat"
import { SearchUploadBar } from "@/components/search-upload-bar"
import { Features } from "@/components/features"
import { ExamplePrompts } from "@/components/example-prompts"
import { ChartHistory } from "@/components/chart-history"
import { useConversationStore } from "@/lib/store"
import { useAuth } from "@/components/auth-context"
import { SignIn } from "@/components/sign-in"
import { Loader2, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AnimatedContainer } from "@/components/animated-container"
import { useToast } from "@/components/ui/use-toast"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"
import { LoadingOverlay } from "@/components/loading-overlay"

export default function Dashboard() {
  const [isChartCreationMode, setIsChartCreationMode] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState("")
  const {
    isHomeView,
    setIsHomeView,
    error: storeError,
    loadConversations,
    addConversation,
    isRefreshing,
  } = useConversationStore()
  const { user, loading: authLoading, error: authError } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    const initializeData = async () => {
      if (user && mounted) {
        setLoading(true)
        try {
          await loadConversations() // Just load conversations directly
        } catch (error) {
          console.error("Failed to load conversations:", error)
          if (mounted) {
            setError(error instanceof Error ? error.message : "Failed to load conversations. Please try again later.")
          }
        } finally {
          if (mounted) {
            setLoading(false)
          }
        }
      }
    }

    initializeData()

    return () => {
      mounted = false
    }
  }, [user, loadConversations])

  useEffect(() => {
    setError(storeError || authError)
  }, [storeError, authError])

  // Add cleanup effect for scroll position
  useEffect(() => {
    const cleanup = () => {
      window.scrollTo(0, 0)
    }
    return cleanup
  }, [])

  const handleSearch = useCallback((query: string) => {
    console.log("Searching for:", query)
  }, [])

  const handleDataUpload = useCallback((data: any) => {
    console.log("Data uploaded:", data)
  }, [])

  const handleNewChart = useCallback(async () => {
    try {
      const id = await addConversation("New Chart")
      setIsHomeView(false)
      router.push(`/chat/${id}`)
    } catch (error) {
      console.error("Failed to create new conversation:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create a new chart. Please try again.",
        variant: "destructive",
      })
    }
  }, [addConversation, setIsHomeView, router, toast])

  const handlePromptSelect = (prompt: string) => {
    // Use the globally exposed focusInput method
    if (window && (window as any).focusInput) {
      ;(window as any).focusInput(prompt)
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <SignIn />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden md:block w-64 bg-zinc-900" />
      <div className="flex flex-col w-full">
        <div className="flex-shrink-0 p-4 border-b border-zinc-800">
          <SearchUploadBar onSearch={handleSearch} onDataUpload={handleDataUpload} />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto" key={isHomeView ? "home" : "chat"}>
            {error && (
              <Alert variant="destructive" className="m-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Loading your charts...</p>
                </div>
              </div>
            ) : isHomeView ? (
              <motion.div
                className="min-h-[calc(100vh-13rem)] p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="home-view"
              >
                <AnimatedContainer>
                  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-8">
                      <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-white">Welcome to Chart Bot</h1>
                        <p className="text-zinc-400 max-w-[600px]">
                          Create beautiful charts, diagrams, and analyze data with natural language.
                        </p>
                      </div>
                      <Button
                        onClick={handleNewChart}
                        className="bg-green-500 hover:bg-green-600 text-white font-medium shadow-lg transition-all duration-200"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        New Chart
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-8">
                        <Features />
                        <ExamplePrompts onPromptSelect={handlePromptSelect} isComparison={false} />
                      </div>
                      <div>
                        <ChartHistory />
                      </div>
                    </div>
                  </div>
                </AnimatedContainer>
              </motion.div>
            ) : (
              <motion.div key="chat-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Chat isChartCreationMode={isChartCreationMode} onExitChartMode={() => setIsChartCreationMode(false)} />
              </motion.div>
            )}
          </div>

          <div className="flex-shrink-0">
            <Footer />
          </div>
        </div>
      </div>
      {isRefreshing && <LoadingOverlay />}
    </div>
  )
}
