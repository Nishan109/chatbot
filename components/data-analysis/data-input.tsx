"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Table, FileSpreadsheet, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import Papa from "papaparse"

interface DataInputProps {
  onDataSubmit: (data: any[]) => void
}

export function DataInput({ onDataSubmit }: DataInputProps) {
  const [inputMethod, setInputMethod] = useState<"paste" | "upload" | "manual">("paste")
  const [rawData, setRawData] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [manualRows, setManualRows] = useState([{ key: "", value: "" }])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.match("text/csv|application/json")) {
      setError("Please upload a CSV or JSON file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        if (file.type === "text/csv") {
          Papa.parse(content, {
            header: true,
            complete: (results) => {
              if (results.errors.length > 0) {
                setError("Error parsing CSV file")
                return
              }
              onDataSubmit(results.data)
            },
          })
        } else {
          const jsonData = JSON.parse(content)
          onDataSubmit(Array.isArray(jsonData) ? jsonData : [jsonData])
        }
        setError(null)
      } catch (err) {
        setError("Error reading file")
      }
    }
    reader.readAsText(file)
  }

  const handlePastedData = () => {
    try {
      if (rawData.trim().startsWith("[") || rawData.trim().startsWith("{")) {
        // Handle JSON
        const jsonData = JSON.parse(rawData)
        onDataSubmit(Array.isArray(jsonData) ? jsonData : [jsonData])
      } else {
        // Handle CSV
        Papa.parse(rawData, {
          header: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setError("Error parsing data")
              return
            }
            onDataSubmit(results.data)
          },
        })
      }
      setError(null)
    } catch (err) {
      setError("Invalid data format. Please check your input.")
    }
  }

  const handleManualSubmit = () => {
    const data = manualRows.reduce(
      (acc, row) => {
        if (row.key && row.value) {
          acc[row.key] = row.value
        }
        return acc
      },
      {} as Record<string, string>,
    )
    onDataSubmit([data])
  }

  const addManualRow = () => {
    setManualRows([...manualRows, { key: "", value: "" }])
  }

  const updateManualRow = (index: number, field: "key" | "value", value: string) => {
    const newRows = [...manualRows]
    newRows[index][field] = value
    setManualRows(newRows)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data Input</CardTitle>
        <CardDescription>Choose how you want to input your data for analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="paste" onValueChange={(v) => setInputMethod(v as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="paste">
              <Table className="w-4 h-4 mr-2" />
              Paste Data
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="manual">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <Label>Paste your CSV or JSON data</Label>
              <Textarea
                placeholder="Paste your data here..."
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                className="min-h-[200px] font-mono"
              />
            </div>
            <Button onClick={handlePastedData} disabled={!rawData.trim()}>
              Analyze Data
            </Button>
          </TabsContent>

          <TabsContent value="upload">
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="data-file">Upload CSV or JSON file</Label>
                <Input id="data-file" type="file" accept=".csv,.json" onChange={handleFileUpload} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-4">
              {manualRows.map((row, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`key-${index}`}>Key</Label>
                    <Input
                      id={`key-${index}`}
                      value={row.key}
                      onChange={(e) => updateManualRow(index, "key", e.target.value)}
                      placeholder="Enter key"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`value-${index}`}>Value</Label>
                    <Input
                      id={`value-${index}`}
                      value={row.value}
                      onChange={(e) => updateManualRow(index, "value", e.target.value)}
                      placeholder="Enter value"
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={addManualRow}>
                  Add Row
                </Button>
                <Button type="button" onClick={handleManualSubmit}>
                  Analyze Data
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
