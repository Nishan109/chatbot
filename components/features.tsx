import { BarChart3, LineChart } from "lucide-react"
import { FeatureCard } from "./feature-card"

export function Features() {
  const features = [
    {
      icon: BarChart3,
      title: "Data Visualization",
      description: "Create beautiful charts from your data with natural language.",
    },
    {
      icon: LineChart,
      title: "Data Analysis",
      description: "Get insights and analysis from your data.",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
      {features.map((feature) => (
        <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} />
      ))}
    </div>
  )
}
