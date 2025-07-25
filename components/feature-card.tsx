import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-lg p-6 border border-zinc-700 h-full flex flex-col group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-green-700/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors duration-300">
          <Icon className="h-6 w-6 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-zinc-400">{description}</p>
      </div>
    </div>
  )
}
