"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createGradient = (ctx: CanvasRenderingContext2D) => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "rgba(0, 0, 0, 1)")
      gradient.addColorStop(0.5, "rgba(0, 100, 0, 0.5)")
      gradient.addColorStop(1, "rgba(144, 238, 144, 0.2)")
      return gradient
    }

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const gradient = createGradient(ctx)
      ctx.fillStyle = gradient

      // Create a wavy pattern
      for (let i = 0; i < canvas.width; i += 20) {
        const y = Math.sin((i + time) * 0.02) * 20 + canvas.height / 2
        ctx.beginPath()
        ctx.moveTo(i, canvas.height)
        ctx.lineTo(i, y)
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    animate(0)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />
}
