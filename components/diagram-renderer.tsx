"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  Copy,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Loader2,
  RefreshCcw,
  ImageIcon,
} from "lucide-react"
import mermaid from "mermaid"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { validateDiagramType, preprocessDiagramCode, DiagramError, formatDiagramError } from "@/lib/diagram-utils"
import { toPng } from "html-to-image"

interface DiagramRendererProps {
  code: string
  title?: string
}

export function DiagramRenderer({ code, title }: DiagramRendererProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null) // Updated to store error message
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [retryCount, setRetryCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const diagramId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`)
  const { toast } = useToast()

  const initializeMermaid = useCallback(async () => {
    try {
      await mermaid.initialize({
        theme: theme,
        logLevel: "error",
        securityLevel: "strict",
        startOnLoad: false,
        flowchart: {
          curve: "basis",
          padding: 20,
          useMaxWidth: false,
          htmlLabels: true,
          diagramPadding: 8,
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50,
          width: 150,
          height: 65,
          boxMargin: 10,
          boxTextMargin: 5,
          noteMargin: 10,
          messageMargin: 35,
        },
        themeVariables: {
          darkMode: theme === "dark",
          primaryColor: "#10b981",
          primaryTextColor: "#ffffff",
          primaryBorderColor: "#059669",
          lineColor: "#4b5563",
          secondaryColor: "#3b82f6",
          tertiaryColor: "#6366f1",
        },
      })
      return true
    } catch (error) {
      console.error("Failed to initialize Mermaid:", error)
      setError("Failed to initialize diagram renderer")
      return false
    }
  }, [theme])

  const renderDiagram = useCallback(async () => {
    if (!code?.trim()) {
      setError("No diagram code provided")
      return
    }

    setIsLoading(true)
    setError(null)
    setSvgContent(null)

    try {
      // Validate and preprocess the diagram code
      const processedCode = preprocessDiagramCode(code)
      validateDiagramType(processedCode)

      if (!containerRef.current) {
        throw new Error("Container reference not found")
      }

      containerRef.current.innerHTML = ""

      try {
        const { svg } = await mermaid.render(diagramId.current, processedCode)

        if (!svg) {
          throw new DiagramError("Failed to generate SVG output", "RENDERING")
        }

        const tempContainer = document.createElement("div")
        tempContainer.innerHTML = svg

        const svgElement = tempContainer.querySelector("svg")
        if (svgElement) {
          svgElement.setAttribute("width", "100%")
          svgElement.setAttribute("height", "100%")
          svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet")
          svgElement.style.backgroundColor = "transparent"

          setSvgContent(svgElement.outerHTML)
          containerRef.current.innerHTML = svgElement.outerHTML
          setRetryCount(0)
        } else {
          throw new DiagramError("Failed to find SVG element in rendered output", "RENDERING")
        }
      } catch (renderError: any) {
        if (renderError instanceof Error && renderError.message.includes("Syntax error")) {
          throw new DiagramError("Syntax error in diagram", "SYNTAX", {
            details: renderError.message,
          })
        }
        throw renderError
      }
    } catch (error: any) {
      console.error("Failed to process diagram:", error)
      setError(error instanceof DiagramError ? formatDiagramError(error) : error.message || "Failed to render diagram")

      // Implement retry logic for certain types of errors
      if (retryCount < 3 && error instanceof Error && error.message.includes("timeout")) {
        setRetryCount((prev) => prev + 1)
        setTimeout(() => renderDiagram(), 1000)
      }
    } finally {
      setIsLoading(false)
    }
  }, [code, retryCount])

  useEffect(() => {
    const render = async () => {
      const initialized = await initializeMermaid()
      if (initialized) {
        await renderDiagram()
      }
    }
    render()
  }, [initializeMermaid, renderDiagram])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast({ title: "Copied!", description: "Diagram code copied to clipboard" })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleDownloadSVG = () => {
    if (!svgContent) {
      toast({
        title: "Error",
        description: "No diagram to download",
        variant: "destructive",
      })
      return
    }

    const blob = new Blob([svgContent], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title || "diagram"}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded!",
      description: "SVG file has been downloaded",
    })
  }

  const handleDownloadPNG = async () => {
    if (!containerRef.current) {
      toast({
        title: "Error",
        description: "No diagram to download",
        variant: "destructive",
      })
      return
    }

    try {
      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: theme === "dark" ? "#18181B" : "#ffffff",
        pixelRatio: 2,
      })

      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `${title || "diagram"}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast({
        title: "Downloaded!",
        description: "PNG file has been downloaded",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to download PNG",
        variant: "destructive",
      })
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleRetry = () => {
    setRetryCount(0)
    renderDiagram()
  }

  return (
    <Card className={cn("bg-zinc-900 border-zinc-800 p-4", theme === "light" && "bg-white border-gray-200")}>
      {title && (
        <h3 className={cn("text-lg font-semibold mb-4", theme === "dark" ? "text-white" : "text-gray-900")}>{title}</h3>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-zinc-900/95 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto shadow-2xl backdrop-blur">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-medium">Unable to create diagram</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-4">{error}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
            disabled={isLoading}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className={cn("text-sm", theme === "dark" ? "text-gray-400" : "text-gray-600")}>
            {Math.round(zoom * 100)}%
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((prev) => Math.min(2, prev + 0.1))}
            disabled={isLoading}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handleCopyCode} disabled={isLoading}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadSVG} disabled={isLoading || !svgContent}>
            <Download className="h-4 w-4 mr-2" />
            SVG
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadPNG} disabled={isLoading || !svgContent}>
            <ImageIcon className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Button size="sm" variant="outline" onClick={toggleTheme} disabled={isLoading}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={toggleFullscreen} disabled={isLoading}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "relative rounded-lg p-4 min-h-[400px] transition-colors duration-200",
          theme === "dark" ? "bg-zinc-800/50" : "bg-gray-50",
        )}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg">
            <div className="flex items-center gap-2 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Rendering diagram...</span>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className={cn("mermaid overflow-x-auto transition-opacity duration-200", {
            "opacity-50": isLoading,
          })}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            transition: "transform 0.3s ease",
          }}
        />
      </div>
    </Card>
  )
}
