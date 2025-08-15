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

const CardHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center justify-between p-4 rounded-t-lg", className)} {...props}>
    {children}
  </div>
)
CardHeader.displayName = "CardHeader"

const CardTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-lg font-semibold tracking-tight", className)} {...props}>
    {children}
  </h2>
)
CardTitle.displayName = "CardTitle"

const CardDescription = ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm opacity-50", className)} {...props}>
    {children}
  </p>
)
CardDescription.displayName = "CardDescription"

const CardContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4", className)} {...props}>
    {children}
  </div>
)
CardContent.displayName = "CardContent"

const CardFooter = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center p-4 pt-0 rounded-b-lg", className)} {...props}>
    {children}
  </div>
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
