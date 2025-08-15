"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Plus,
  MoreVertical,
  Folder,
  Star,
  Clock,
  Home,
  Loader2,
  Package,
  ArrowLeftRight,
  Database,
} from "lucide-react"
import { useConversationStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { RenameDialog } from "./rename-dialog"
import { DeleteDialog } from "./delete-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Product sections with comparison and data analysis
const productSections = [
  {
    id: "comparison",
    name: "Comparison",
    icon: ArrowLeftRight,
    path: "/comparison",
  },
  {
    id: "data-analysis",
    name: "Data Analysis",
    icon: Database,
    path: "/data-analysis",
  },
]

interface SidebarProps {
  className?: string
  closeMobileNav?: () => void
}

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: [0.2, 0.8, 0.2, 1],
    },
  }),
}

export function Sidebar({ className, closeMobileNav }: SidebarProps) {
  const router = useRouter()
  const [selectedFolder, setSelectedFolder] = useState("My Charts")
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [isProductsExpanded, setIsProductsExpanded] = useState(false)
  const {
    conversations,
    currentConversationId,
    addConversation,
    setCurrentConversationId,
    setIsHomeView,
    updateConversation,
    deleteConversation,
    loadConversations,
    isDeletingFromSidebar,
    isRefreshing,
    isInitialized,
    initializeStore,
  } = useConversationStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        if (!isInitialized) {
          await initializeStore()
        }
        await loadConversations()
      } catch (error) {
        console.error("Failed to initialize:", error)
        toast({
          title: "Error",
          description: "Failed to load conversations. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [initializeStore, isInitialized, loadConversations, toast])

  const handleNewChat = async () => {
    if (!isInitialized) {
      toast({
        title: "Error",
        description: "The application is still initializing. Please try again in a moment.",
        variant: "destructive",
      })
      return
    }

    try {
      const id = await addConversation("New Chart")
      setCurrentConversationId(id)
      setIsHomeView(false)
      router.push(`/chat/${id}`)
      closeMobileNav?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create a new chart. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleConversationClick = (id: string) => {
    setCurrentConversationId(id)
    setIsHomeView(false)
    router.push(`/chat/${id}`)
    closeMobileNav?.()
  }

  const handleHomeClick = () => {
    setIsHomeView(true)
    router.push("/")
    closeMobileNav?.()
  }

  const handleRename = async (newTitle: string) => {
    if (selectedConversation) {
      try {
        await updateConversation(selectedConversation, { title: newTitle })
        setIsRenameDialogOpen(false)
        toast({
          title: "Chart renamed",
          description: "The chart has been renamed successfully.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to rename chart. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDelete = async () => {
    if (selectedConversation) {
      try {
        await deleteConversation(selectedConversation)
        setIsDeleteDialogOpen(false)
        setSelectedConversation(null)
      } catch (error) {
        console.error("Delete error:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete chart",
          variant: "destructive",
        })
        setIsDeleteDialogOpen(false)
        setSelectedConversation(null)
      }
    }
  }

  const filteredConversations =
    conversations?.filter((conv) => {
      if (selectedFolder === "My Charts") return true
      if (selectedFolder === "Favorites") return conv.isFavorite
      if (selectedFolder === "History") return true
      return false
    }) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "w-full md:w-80 bg-zinc-950 text-gray-100 h-full flex flex-col relative",
          (isDeletingFromSidebar || isRefreshing) && "pointer-events-none opacity-50",
          className,
        )}
      >
        {(isDeletingFromSidebar || isRefreshing) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {isDeletingFromSidebar ? "Deleting chart..." : "Refreshing..."}
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className="p-4 space-y-4">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-5 w-5 text-green-400" />
              <div className="font-semibold text-xl gradient-text">Chart Bot</div>
              <div className="text-xs text-gray-400">v2.0</div>
            </motion.div>

            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-zinc-800 transition-all duration-200"
              onClick={handleHomeClick}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>

            {/* Folders Section */}
            <motion.div className="space-y-1">
              <h2 className="px-2 text-lg font-semibold tracking-tight text-gray-200">FOLDERS</h2>
              <div className="space-y-1">
                {["My Charts", "Favorites", "History"].map((folder, i) => (
                  <motion.div key={folder} variants={menuItemVariants} initial="hidden" animate="visible" custom={i}>
                    <Button
                      variant={selectedFolder === folder ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start hover:bg-zinc-800 transition-all duration-200 hover-lift touch-feedback",
                        selectedFolder === folder && "bg-green-500/20 text-green-400 hover:bg-green-500/30",
                      )}
                      onClick={() => setSelectedFolder(folder)}
                    >
                      {folder === "My Charts" && <Folder className="mr-2 h-4 w-4" />}
                      {folder === "Favorites" && <Star className="mr-2 h-4 w-4" />}
                      {folder === "History" && <Clock className="mr-2 h-4 w-4" />}
                      {folder}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Products Section */}
            <motion.div className="space-y-1">
              <h2 className="px-2 text-lg font-semibold tracking-tight text-gray-200">PRODUCTS</h2>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-zinc-800 transition-all duration-200 group"
                onClick={() => setIsProductsExpanded(!isProductsExpanded)}
              >
                <Package className="mr-2 h-4 w-4" />
                Product Features
                <MoreVertical
                  className={cn("ml-auto h-4 w-4 transition-transform", isProductsExpanded && "transform rotate-180")}
                />
              </Button>
              <AnimatePresence>
                {isProductsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pl-4 space-y-1"
                  >
                    {productSections.map((section) => (
                      <Button
                        key={section.id}
                        variant="ghost"
                        className="w-full justify-start text-sm hover:bg-zinc-800 transition-all duration-200"
                        onClick={() => {
                          router.push(section.path)
                          closeMobileNav?.()
                        }}
                      >
                        <section.icon className="mr-2 h-4 w-4" />
                        {section.name}
                      </Button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <ScrollArea className="h-[calc(100vh-350px)] px-1 scrollbar-custom">
              {filteredConversations?.map((conv, i) => (
                <motion.div
                  key={conv.id}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  className="flex items-center group hover-scale touch-feedback"
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start font-normal hover:bg-zinc-800 transition-all duration-200",
                      conv.id === currentConversationId && "bg-green-500/20 text-green-400 hover:bg-green-500/30",
                    )}
                    onClick={() => handleConversationClick(conv.id)}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span className="truncate">{conv.title}</span>
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
                          setSelectedConversation(conv.id)
                          setIsRenameDialogOpen(true)
                        }}
                      >
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedConversation(conv.id)
                          setIsDeleteDialogOpen(true)
                        }}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </ScrollArea>
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="p-4 border-t border-gray-800"
        >
          <Button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium shadow-lg transition-all duration-200 hover-lift touch-feedback"
            onClick={handleNewChat}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chart
          </Button>
        </motion.div>

        <RenameDialog
          isOpen={isRenameDialogOpen}
          onClose={() => setIsRenameDialogOpen(false)}
          onRename={handleRename}
          currentName={
            selectedConversation ? conversations.find((c) => c.id === selectedConversation)?.title || "" : ""
          }
        />

        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedConversation(null)
          }}
          onConfirm={handleDelete}
          itemName={selectedConversation ? conversations.find((c) => c.id === selectedConversation)?.title || "" : ""}
        />
      </motion.div>
    </>
  )
}
