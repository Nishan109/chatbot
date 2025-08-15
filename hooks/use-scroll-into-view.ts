"use client"

import { useEffect, useRef } from "react"

interface UseScrollIntoViewProps {
  enabled?: boolean
  behavior?: ScrollBehavior
  block?: ScrollLogicalPosition
}

export function useScrollIntoView<T extends HTMLElement>({
  enabled = true,
  behavior = "smooth",
  block = "nearest",
}: UseScrollIntoViewProps = {}) {
  const elementRef = useRef<T>(null)

  useEffect(() => {
    if (!enabled || !elementRef.current) return

    const element = elementRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            element.scrollIntoView({ behavior, block })
          }
        })
      },
      {
        root: null,
        threshold: 0.1,
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [enabled, behavior, block])

  return elementRef
}
