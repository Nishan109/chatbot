"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"
import {
  BarChart3,
  Brain,
  Code2,
  Database,
  GitBranch,
  LineChart,
  PieChart,
  Share2,
  Sparkles,
  Wand2,
} from "lucide-react"
import { useEffect, useState } from "react"

export default function AboutPage() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const features = [
    {
      icon: <Wand2 className="h-6 w-6 text-green-500" />,
      title: "AI-Powered",
      description: "Natural language processing to convert your text into beautiful charts",
    },
    {
      icon: <Brain className="h-6 w-6 text-green-500" />,
      title: "Smart Analysis",
      description: "Intelligent data analysis and pattern recognition",
    },
    {
      icon: <Share2 className="h-6 w-6 text-green-500" />,
      title: "Easy Sharing",
      description: "Share your charts and insights with team members",
    },
    {
      icon: <LineChart className="h-6 w-6 text-green-500" />,
      title: "Multiple Chart Types",
      description: "Support for various chart types including line, bar, and pie charts",
    },
  ]

  const techStack = [
    {
      icon: <Code2 className="h-6 w-6 text-blue-500" />,
      title: "Next.js & React",
      description: "Built with the latest web technologies for optimal performance",
    },
    {
      icon: <Database className="h-6 w-6 text-orange-500" />,
      title: "Supabase",
      description: "Secure and scalable database infrastructure",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-purple-500" />,
      title: "Google Gemini",
      description: "Advanced AI model for natural language processing",
    },
    {
      icon: <GitBranch className="h-6 w-6 text-gray-500" />,
      title: "Open Source",
      description: "Transparent and community-driven development",
    },
  ]

  return (
    <ScrollArea className="h-screen w-full">
      <div className="min-h-screen bg-background relative">
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-4">
              <BarChart3 className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-white">About Chart Bot</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Chart Bot is an AI-powered data visualization tool that helps you create beautiful charts and analyze data
              using natural language.
            </p>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center text-white">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-zinc-900/50 backdrop-blur-sm border-zinc-800 hover:border-green-500/50">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center text-white">Technology Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {techStack.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-zinc-900/50 backdrop-blur-sm border-zinc-800 hover:border-blue-500/50">
                    <div className="mb-4">{tech.icon}</div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{tech.title}</h3>
                    <p className="text-muted-foreground">{tech.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">Get Started Today</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of users who are already creating beautiful charts and gaining insights from their data
              with Chart Bot.
            </p>
            <div className="flex justify-center space-x-4">
              <PieChart className="h-12 w-12 text-green-500 animate-float" />
              <BarChart3 className="h-12 w-12 text-blue-500 animate-float" style={{ animationDelay: "0.2s" }} />
              <LineChart className="h-12 w-12 text-purple-500 animate-float" style={{ animationDelay: "0.4s" }} />
            </div>
          </motion.section>
        </main>

        {/* Scroll to top button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showScrollTop ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={scrollToTop}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </motion.div>

        <Footer />
      </div>
    </ScrollArea>
  )
}
