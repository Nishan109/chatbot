"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import { BarChart3, LineChart, PieChart, TrendingUp, Database, Zap, ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-context"
import { SignIn } from "@/components/sign-in"
import { Loader2 } from "lucide-react"
import { Footer } from "@/components/footer"
import { Testimonial } from "@/components/testimonial"
import { FeatureCard } from "@/components/feature-card"
import { useConversationStore } from "@/lib/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TypingAnimation } from "@/components/typing-animation"
import { ChartPreview } from "@/components/chart-preview"
import { RadarIcon, ScatterChart } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { addConversation } = useConversationStore()
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1])
  const scrollScale = useTransform(scrollYProgress, [0, 0.05], [0.8, 1])
  const [currentChartType, setCurrentChartType] = useState("bar")

  const handleGetStarted = async () => {
    if (user) {
      try {
        const id = await addConversation("New Chart")
        router.push(`/chat/${id}`)
      } catch (error) {
        console.error("Failed to create new conversation:", error)
      }
    } else {
      // Scroll to sign-in section if not logged in
      const signInSection = document.getElementById("sign-in-section")
      if (signInSection) {
        signInSection.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const handleDashboardClick = () => {
    router.push("/dashboard")
  }

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features-section")
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Update chart type based on typing animation
  const updateChartType = (type: string) => {
    setCurrentChartType(type)
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-green-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      <ScrollArea className="h-screen overflow-auto">
        <div className="flex flex-col" ref={containerRef}>
          {/* Hero Section */}
          <section className="relative min-h-screen py-20 md:py-32 flex items-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900 z-0"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,128,0.05),transparent_70%)]"></div>
            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className="text-center lg:text-left"
                >
                  <div className="inline-block px-3 py-1 mb-6 rounded-full bg-green-500/10 border border-green-500/20">
                    <span className="text-green-400 text-sm font-medium">AI-Powered Data Visualization</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Transform Your Data Into <span className="text-green-500">Powerful Insights</span>
                  </h1>
                  <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                    Create beautiful charts, visualize complex data, and gain valuable insights with natural language
                    prompts.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button
                      onClick={handleGetStarted}
                      size="lg"
                      className="bg-green-500 hover:bg-green-600 text-white font-medium px-8 py-6 h-auto text-lg shadow-lg shadow-green-500/20 transition-all duration-300"
                    >
                      Get Started
                    </Button>
                    {user && (
                      <Button
                        onClick={handleDashboardClick}
                        variant="outline"
                        size="lg"
                        className="border-green-500 text-green-500 hover:bg-green-500/10 font-medium px-8 py-6 h-auto text-lg"
                      >
                        Go to Dashboard
                      </Button>
                    )}
                  </div>

                  {/* Typing Animation */}
                  <div className="mt-8 lg:mt-12">
                    <TypingAnimation className="max-w-xl mx-auto lg:mx-0" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="relative"
                >
                  <ChartPreview chartType={currentChartType} className="h-full" />
                </motion.div>
              </div>

              <motion.div
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                onClick={scrollToFeatures}
              >
                <ChevronDown className="h-8 w-8 text-green-500" />
              </motion.div>
            </div>
          </section>

          {/* Interactive Demo Section */}
          <section className="py-24 bg-black relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(0,255,128,0.05),transparent_70%)]"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
              >
                <div className="inline-block px-3 py-1 mb-4 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className="text-green-400 text-sm font-medium">Interactive Demo</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">See It In Action</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                  Experience how easy it is to create beautiful visualizations with natural language prompts.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6 shadow-xl"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">Try These Examples</h3>

                  <div className="space-y-4">
                    {[
                      { text: "Show monthly revenue by product category", type: "bar" },
                      { text: "Track stock prices over the past year", type: "line" },
                      { text: "Display budget allocation by department", type: "pie" },
                      { text: "Create a skills assessment chart", type: "radar" },
                      { text: "Plot price vs. customer ratings", type: "scatter" },
                    ].map((prompt, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer group"
                        onClick={() => setCurrentChartType(prompt.type)}
                      >
                        <div className="mr-3 p-2 rounded-md bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                          {prompt.type === "bar" && <BarChart3 className="h-5 w-5 text-green-500" />}
                          {prompt.type === "line" && <LineChart className="h-5 w-5 text-green-500" />}
                          {prompt.type === "pie" && <PieChart className="h-5 w-5 text-green-500" />}
                          {prompt.type === "radar" && <RadarIcon className="h-5 w-5 text-green-500" />}
                          {prompt.type === "scatter" && <ScatterChart className="h-5 w-5 text-green-500" />}
                        </div>
                        <p className="text-zinc-300 group-hover:text-white transition-colors">{prompt.text}</p>
                        <motion.div
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ scale: 1.1 }}
                        >
                          <ArrowRight className="h-4 w-4 text-green-500" />
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <ChartPreview chartType={currentChartType} className="h-full" />
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features-section" className="py-24 bg-zinc-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
              >
                <div className="inline-block px-3 py-1 mb-4 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className="text-green-400 text-sm font-medium">Features</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Capabilities</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                  Chart Bot combines cutting-edge AI with intuitive design to make data visualization accessible to
                  everyone.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <FeatureCard
                    icon={BarChart3}
                    title="Data Visualization"
                    description="Create beautiful charts from your data with natural language prompts."
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <FeatureCard
                    icon={LineChart}
                    title="Data Analysis"
                    description="Get insights and analysis from your data with AI-powered interpretation."
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <FeatureCard
                    icon={PieChart}
                    title="Comparison Charts"
                    description="Compare multiple datasets with side-by-side visualizations."
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <FeatureCard
                    icon={TrendingUp}
                    title="Trend Detection"
                    description="Automatically identify and highlight trends in your data."
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <FeatureCard
                    icon={Database}
                    title="Data Processing"
                    description="Upload and process CSV, Excel, and other data formats with ease."
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <FeatureCard
                    icon={Zap}
                    title="Real-time Updates"
                    description="See your charts update in real-time as you refine your prompts."
                  />
                </motion.div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-24 bg-black relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,128,0.05),transparent_70%)]"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
              >
                <div className="inline-block px-3 py-1 mb-4 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className="text-green-400 text-sm font-medium">Process</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                  Chart Bot makes data visualization simple with just a few steps.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="bg-zinc-900/70 backdrop-blur-sm rounded-lg p-6 border border-zinc-800 relative"
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/20">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 mt-2">Describe Your Chart</h3>
                  <p className="text-zinc-400">Simply describe the chart you want to create using natural language.</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="bg-zinc-900/70 backdrop-blur-sm rounded-lg p-6 border border-zinc-800 relative"
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/20">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 mt-2">AI Generates Chart</h3>
                  <p className="text-zinc-400">
                    Our AI processes your request and generates the perfect visualization.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="bg-zinc-900/70 backdrop-blur-sm rounded-lg p-6 border border-zinc-800 relative"
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/20">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 mt-2">Customize & Export</h3>
                  <p className="text-zinc-400">Fine-tune your chart and export it in various formats for your needs.</p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-24 bg-zinc-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
              >
                <div className="inline-block px-3 py-1 mb-4 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className="text-green-400 text-sm font-medium">Testimonials</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Users Say</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                  Discover how Chart Bot is transforming data visualization for professionals across industries.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <Testimonial
                    quote="Chart Bot has revolutionized how I present data to my clients. What used to take hours now takes minutes."
                    author="Sarah Johnson"
                    role="Data Analyst"
                    company="TechCorp"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <Testimonial
                    quote="The natural language interface is incredibly intuitive. I can create complex visualizations without any technical knowledge."
                    author="Michael Chen"
                    role="Marketing Director"
                    company="GrowthLabs"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <Testimonial
                    quote="As a teacher, Chart Bot helps me create engaging visual aids for my students. It's been a game-changer for my classroom."
                    author="David Rodriguez"
                    role="Science Educator"
                    company="Westview High"
                  />
                </motion.div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-transparent z-0"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,255,128,0.05),transparent_70%)]"></div>
            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
                className="max-w-3xl mx-auto text-center"
              >
                <div className="inline-block px-3 py-1 mb-4 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className="text-green-400 text-sm font-medium">Get Started</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Data?</h2>
                <p className="text-xl text-zinc-300 mb-8">
                  Join thousands of professionals who are already using Chart Bot to unlock insights from their data.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                  <Button
                    onClick={handleGetStarted}
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white font-medium px-8 py-6 h-auto text-lg group shadow-lg shadow-green-500/20 transition-all duration-300"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    Get Started Now
                    <ArrowRight
                      className={`ml-2 h-5 w-5 transition-transform duration-300 ${isHovered ? "transform translate-x-1" : ""}`}
                    />
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Sign In Section (only shown if user is not logged in) */}
          {!user && (
            <section id="sign-in-section" className="py-24 bg-zinc-900">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="max-w-md mx-auto"
                >
                  <div className="text-center mb-8">
                    <div className="inline-block px-3 py-1 mb-4 rounded-full bg-green-500/10 border border-green-500/20">
                      <span className="text-green-400 text-sm font-medium">Account</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Sign In to Get Started</h2>
                    <p className="text-zinc-400">Create an account or sign in to start creating amazing charts.</p>
                  </div>
                  <SignIn />
                </motion.div>
              </div>
            </section>
          )}

          <Footer />
        </div>
      </ScrollArea>
    </div>
  )
}
