"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, FileSpreadsheet, LineChart, PieChart, BarChart2, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataInput } from "@/components/data-analysis/data-input"
import { DataAnalysis } from "@/components/data-analysis/data-analysis"
import { DataVisualizer } from "@/components/data-analysis/data-visualizer"
import { DataStats } from "@/components/data-analysis/data-stats"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DataAnalysisPage() {
  const [data, setData] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")

  const handleDataUpload = async (uploadedData: any) => {
    setIsAnalyzing(true)
    setError(null)
    try {
      setData(uploadedData)
      setActiveTab("analysis")
    } catch (err) {
      setError("Failed to process the uploaded data")
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const features = [
    {
      icon: FileSpreadsheet,
      title: "Data Processing",
      description: "Upload and process CSV, Excel, and JSON files",
    },
    {
      icon: LineChart,
      title: "Smart Analysis",
      description: "AI-powered data analysis and insights",
    },
    {
      icon: PieChart,
      title: "Visualizations",
      description: "Create beautiful charts and graphs",
    },
    {
      icon: BarChart2,
      title: "Statistics",
      description: "Comprehensive statistical analysis",
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-black animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,0,0.1),transparent_50%)] animate-pulse-slow" />
      </div>

      {/* Sidebar */}
      <div className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl z-10">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Navigation</h2>
          <nav className="space-y-2">
            {["upload", "stats", "analysis", "visualize"].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "secondary" : "ghost"}
                className={`w-full justify-start capitalize ${
                  activeTab === tab
                    ? "bg-green-500/20 text-white"
                    : "text-white/90 hover:bg-green-500/10 hover:text-white"
                }`}
                onClick={() => setActiveTab(tab)}
                disabled={!data && tab !== "upload"}
              >
                {tab === "upload" && <Upload className="mr-2 h-4 w-4" />}
                {tab === "stats" && <BarChart2 className="mr-2 h-4 w-4" />}
                {tab === "analysis" && <LineChart className="mr-2 h-4 w-4" />}
                {tab === "visualize" && <PieChart className="mr-2 h-4 w-4" />}
                {tab}
              </Button>
            ))}
          </nav>
        </div>

        {/* Feature Cards in Sidebar */}
        <div className="p-6 border-t border-white/10">
          <h3 className="text-sm font-medium mb-4 text-white">Features</h3>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 group">
                <feature.icon className="h-5 w-5 text-green-400 mt-0.5 group-hover:text-green-300 transition-colors" />
                <div>
                  <h4 className="text-sm font-medium text-white group-hover:text-white/90 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-white/70 group-hover:text-white/80 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden backdrop-blur-xl bg-black/40 z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/60 py-4 px-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-white tracking-tight">Data Analysis Dashboard</h1>
              <p className="text-sm text-white/70 mt-1">Analyze • Visualize • Insights</p>
            </div>
            {!data ? (
              <Button
                onClick={() => setActiveTab("upload")}
                className="bg-green-500 hover:bg-green-600 text-black font-medium"
                size="lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-green-500/50 text-white px-3 py-1">
                  <BarChart2 className="w-4 h-4 mr-1" />
                  {data.length} rows
                </Badge>
                <Badge variant="outline" className="border-green-500/50 text-white px-3 py-1">
                  <LineChart className="w-4 h-4 mr-1" />
                  {Object.keys(data[0] || {}).length} columns
                </Badge>
              </div>
            )}
          </div>

          {/* Mobile Tabs */}
          <div className="mt-6 lg:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-black/60 p-1">
                <TabsTrigger
                  value="upload"
                  disabled={isAnalyzing}
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-black text-white"
                >
                  <Upload className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  disabled={!data || isAnalyzing}
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-black text-white"
                >
                  <BarChart2 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="analysis"
                  disabled={!data || isAnalyzing}
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-black text-white"
                >
                  <LineChart className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="visualize"
                  disabled={!data || isAnalyzing}
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-black text-white"
                >
                  <PieChart className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsContent value="upload" className="m-0">
                <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <DataInput onDataSubmit={handleDataUpload} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats" className="m-0">
                <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
                  <CardContent className="p-6 text-white">
                    <DataStats data={data} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="m-0">
                <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
                  <CardContent className="p-6 text-white">
                    <DataAnalysis data={data} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="visualize" className="m-0">
                <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
                  <CardContent className="p-6 text-white">
                    <DataVisualizer data={data} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {error && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <Card className="bg-red-500/10 border-red-500/50">
                  <CardContent className="p-4 text-red-400">{error}</CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-4 px-6 bg-black/60 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="border-green-500/50 text-white">
                CSV
              </Badge>
              <Badge variant="outline" className="border-green-500/50 text-white">
                Excel
              </Badge>
              <Badge variant="outline" className="border-green-500/50 text-white">
                JSON
              </Badge>
            </div>
            <p className="text-sm text-white/70">Powered by AI • Secure Processing</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
