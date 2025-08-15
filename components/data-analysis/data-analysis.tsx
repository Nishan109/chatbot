"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataInput } from "./data-input"
import { DataVisualizer } from "./data-visualizer"
import { DataStats } from "./data-stats"
import { motion } from "framer-motion"

export function DataAnalysis() {
  const [data, setData] = useState<any[] | null>(null)

  const handleDataSubmit = (newData: any[]) => {
    setData(newData)
  }

  return (
    <div className="space-y-6">
      <DataInput onDataSubmit={handleDataSubmit} />

      {data && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>View your data analysis and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="visualization">
                <TabsList>
                  <TabsTrigger value="visualization">Visualization</TabsTrigger>
                  <TabsTrigger value="statistics">Statistics</TabsTrigger>
                </TabsList>
                <TabsContent value="visualization">
                  <DataVisualizer data={data} />
                </TabsContent>
                <TabsContent value="statistics">
                  <DataStats data={data} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
