"use client"
import { Quote } from "lucide-react"

interface TestimonialProps {
  quote: string
  author: string
  role: string
  company?: string
}

export function Testimonial({ quote, author, role, company }: TestimonialProps) {
  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-lg p-6 border border-zinc-700 h-full flex flex-col relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-green-700/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10 flex-1 flex flex-col">
        <Quote className="h-8 w-8 text-green-500/40 mb-4" />
        <p className="text-zinc-300 mb-6 flex-1">{quote}</p>
        <div className="mt-auto">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-semibold">
              {author.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-white font-medium">{author}</p>
              <p className="text-zinc-400 text-sm">
                {role}
                {company ? `, ${company}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
