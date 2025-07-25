"use client"

import * as React from "react"
import {
  ZoomInIcon,
  ZoomOutIcon,
  CopyIcon,
  DownloadIcon,
  Maximize2Icon,
  Minimize2Icon,
  Loader2Icon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)
Card.displayName = "Card"

const Button = React.forwardRef<React.ElementRef<"button">, React.ComponentPropsWithoutRef<"button">>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md border bg-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
)
Button.displayName = "Button"

const Alert = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 rounded-lg bg-red-500 text-white", className)} {...props}>
      {children}
    </div>
  ),
)
Alert.displayName = "Alert"

const AlertTitle = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className="text-lg font-semibold tracking-tight" {...props}>
    {children}
  </h2>
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="text-sm opacity-50" {...props}>
    {children}
  </p>
)
AlertDescription.displayName = "AlertDescription"

const AlertCircle = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={cn("h-4 w-4", className)}
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 7.586l-2.293-2.293z"
      clipRule="evenodd"
    />
  </svg>
)
AlertCircle.displayName = "AlertCircle"

const ZoomIn = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: number }) => (
  <ZoomInIcon className={cn("h-4 w-4", className)} {...props} />
)
ZoomIn.displayName = "ZoomIn"

const ZoomOut = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: number }) => (
  <ZoomOutIcon className={cn("h-4 w-4", className)} {...props} />
)
ZoomOut.displayName = "ZoomOut"

const Copy = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: number }) => (
  <CopyIcon className={cn("h-4 w-4", className)} {...props} />
)
Copy.displayName = "Copy"

const Download = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: number }) => (
  <DownloadIcon className={cn("h-4 w-4", className)} {...props} />
)
Download.displayName = "Download"

const Maximize2 = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: number }) => (
  <Maximize2Icon className={cn("h-4 w-4", className)} {...props} />
)
Maximize2.displayName = "Maximize2"

const Minimize2 = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: number }) => (
  <Minimize2Icon className={cn("h-4 w-4", className)} {...props} />
)
Minimize2.displayName = "Minimize2"

const Loader2 = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: number }) => (
  <Loader2Icon className={cn("h-4 w-4 animate-spin", className)} {...props} />
)
Loader2.displayName = "Loader2"

export {
  Card,
  Button,
  Alert,
  AlertDescription,
  AlertTitle,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  Loader2,
}
