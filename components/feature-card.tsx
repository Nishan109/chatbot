import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-lg bg-zinc-900 p-6">
      <div className="h-12 w-12 rounded-lg bg-green-900/20 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-green-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
