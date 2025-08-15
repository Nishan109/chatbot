import * as React from "react"

import { cn } from "@/lib/utils"

const Alert = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative w-full rounded-lg border p-4 [&>[role=alert]]:border-muted", className)}
      role="alert"
      {...props}
    >
      {children}
    </div>
  ),
)
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm [&+div]:mt-2", className)} {...props}>
      {children}
    </div>
  ),
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }
