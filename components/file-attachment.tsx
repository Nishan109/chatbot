"use client"

import { FileIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface FileAttachmentProps {
  fileName: string
  fileType: string
  onRemove: () => void
}

export function FileAttachment({ fileName, fileType, onRemove }: FileAttachmentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-2 pr-3"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-8 h-8 rounded bg-zinc-700/50 flex items-center justify-center">
          <FileIcon className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="truncate">
          <p className="text-sm font-medium text-zinc-200 truncate">{fileName}</p>
          <p className="text-xs text-zinc-500 uppercase">{fileType}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-300" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}
