"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Send, Upload, FileSpreadsheet, ImageIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useConversationStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabaseClient"
import Papa from "papaparse"
import { FileAttachment } from "./file-attachment"

interface ChatInputProps {
  onSend: (message: string, chartType: string, data?: any) => Promise<void>
  isLoading: boolean
  defaultPrompt?: string
}

export function ChatInput({ onSend, isLoading, defaultPrompt }: ChatInputProps) {
  const [input, setInput] = useState(defaultPrompt || "")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedData, setUploadedData] = useState<any | null>(null)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    type: string
    url?: string
    data?: any
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    const prompt = searchParams.get("prompt")
    const autoSend = searchParams.get("autoSend")

    if (prompt) {
      setInput(decodeURIComponent(prompt))
      if (autoSend === "true") {
        handleSubmit(new Event("submit") as any)
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !uploadedData && !uploadedFile) return
    if (isLoading) return

    try {
      const dataToSend = uploadedFile?.data || uploadedData || { fileUrl: uploadedFile?.url }
      await onSend(input.trim(), "all", dataToSend)
      setInput("")
      setUploadedData(null)
      setUploadedFile(null)
    } catch (error) {
      console.error("Error in handleSubmit:", error)
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setUploadError(null)
      const currentConversationId = useConversationStore.getState().currentConversationId

      if (!currentConversationId) {
        throw new Error("No active conversation")
      }

      toast({
        title: "Uploading file...",
        description: "Please wait while we process your file.",
      })

      const { data, error } = await supabase.storage
        .from("data_files")
        .upload(`${currentConversationId}/${file.name}`, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error("No data returned from upload")
      }

      const { data: urlData, error: urlError } = supabase.storage.from("data_files").getPublicUrl(data.path)

      if (urlError) {
        throw urlError
      }

      const fileUrl = urlData.publicUrl

      // Handle file processing based on type
      if (file.type === "text/csv") {
        const text = await file.text()
        const parsedData = Papa.parse(text, { header: true }).data
        setUploadedFile({
          name: file.name,
          type: "CSV",
          data: parsedData,
        })
      } else if (file.type === "application/json") {
        const text = await file.text()
        const parsedData = JSON.parse(text)
        setUploadedFile({
          name: file.name,
          type: "JSON",
          data: parsedData,
        })
      } else if (file.type.startsWith("image/")) {
        setUploadedFile({
          name: file.name,
          type: file.type.split("/")[1].toUpperCase(),
          url: fileUrl,
        })
      }

      setIsUploadDialogOpen(false)

      toast({
        title: "File uploaded successfully",
        description: "Your file is ready to be used.",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setUploadError(errorMessage)

      toast({
        title: "Error uploading file",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const focusInput = (text?: string) => {
    if (text) {
      setInput(text)
    }
    if (inputRef.current) {
      inputRef.current.focus()
      const length = inputRef.current.value.length
      inputRef.current.setSelectionRange(length, length)
    }
  }

  useEffect(() => {
    if (window) {
      ;(window as any).focusInput = focusInput
    }
  }, []) // Removed focusInput from dependencies

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="border-t border-gray-800 bg-zinc-950 p-4"
    >
      <div className="max-w-[1200px] mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {uploadedFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="px-6"
              >
                <FileAttachment
                  fileName={uploadedFile.name}
                  fileType={uploadedFile.type}
                  onRemove={() => setUploadedFile(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4">
            <div className="flex-1 flex items-center gap-4 bg-zinc-900 rounded-xl px-6 py-4 border border-gray-800">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="border-0 focus-visible:ring-0 bg-transparent text-gray-100 placeholder-gray-500 text-lg py-2"
                placeholder={uploadedFile ? "Ask a question about your file..." : "Type your prompt here..."}
                disabled={isLoading}
              />
              <div className="flex gap-2">
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" disabled={isLoading}>
                      <Upload className="h-5 w-5 text-gray-400" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Data</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div
                        className={cn(
                          "relative rounded-lg border-2 border-dashed p-8 transition-colors",
                          uploadError ? "border-red-500/50" : "border-gray-800 hover:border-gray-700",
                        )}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const file = e.dataTransfer.files[0]
                          if (file) handleFileUpload(file)
                        }}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.json,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file)
                          }}
                          className="absolute inset-0 w-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-4 text-center">
                          <div className="flex justify-center gap-4">
                            <FileSpreadsheet className="h-8 w-8 text-gray-400" />
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="space-y-2">
                            <p>Drag and drop your file here, or click to select</p>
                            <p className="text-sm text-gray-500">Supports CSV, JSON, PNG, and JPG files</p>
                          </div>
                        </div>
                      </div>

                      {uploadError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{uploadError}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button type="button" variant="ghost" size="icon" disabled={isLoading}>
                  <Mic className="h-5 w-5 text-gray-400" />
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              size="icon"
              className="bg-green-500 hover:bg-green-600 text-white shadow-lg w-16 h-16 rounded-xl"
              disabled={isLoading || (!input.trim() && !uploadedFile)}
            >
              <Send className="h-6 w-6" />
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
