"use client"

import { useState, useEffect, type TouchEvent } from "react"

interface SwipeInput {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  swipeThreshold?: number
}

export function useSwipe({ onSwipeLeft, onSwipeRight, swipeThreshold = 50 }: SwipeInput) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setTouchEnd(null)
      setTouchStart(e.targetTouches[0].clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX)
    }

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return

      const distance = touchStart - touchEnd
      const isLeftSwipe = distance > swipeThreshold
      const isRightSwipe = distance < -swipeThreshold

      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft()
      }

      if (isRightSwipe && onSwipeRight) {
        onSwipeRight()
      }
    }

    document.addEventListener("touchstart", handleTouchStart as any)
    document.addEventListener("touchmove", handleTouchMove as any)
    document.addEventListener("touchend", handleTouchEnd as any)

    return () => {
      document.removeEventListener("touchstart", handleTouchStart as any)
      document.removeEventListener("touchmove", handleTouchMove as any)
      document.removeEventListener("touchend", handleTouchEnd as any)
    }
  }, [onSwipeLeft, onSwipeRight, swipeThreshold, touchStart, touchEnd])
}
