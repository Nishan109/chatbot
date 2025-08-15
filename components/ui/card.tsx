"use client"

import * as React from "react"
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

const CardHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="flex items-center justify-between p-4" {...props}>
    {children}
  </div>
)
CardHeader.displayName = "CardHeader"

const CardTitle = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className="text-lg font-semibold tracking-tight" {...props}>
    {children}
  </h2>
)
CardTitle.displayName = "CardTitle"

const CardDescription = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="text-sm opacity-50" {...props}>
    {children}
  </p>
)
CardDescription.displayName = "CardDescription"

const CardContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="p-4" {...props}>
    {children}
  </div>
)
CardContent.displayName = "CardContent"

const CardFooter = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="flex items-center p-4 pt-0" {...props}>
    {children}
  </div>
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
