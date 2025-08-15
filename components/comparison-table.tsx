"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ComparisonData {
  feature: string
  [key: string]: string | number
}

interface ComparisonTableProps {
  data: ComparisonData[]
  products: string[]
  title: string
  className?: string
}

export function ComparisonTable({ data, products, title, className }: ComparisonTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sortConfig, setSortConfig] = React.useState<{
    key: string
    direction: "asc" | "desc"
  } | null>(null)

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    return data.filter((row) =>
      Object.values(row).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [data, searchTerm])

  // Sort data based on sort config
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  const requestSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" }
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" }
      }
      return null
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-black/50 border-zinc-800"
          />
        </div>
      </div>

      <div className="rounded-md border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-zinc-900/50">
              <TableHead className="w-[200px] bg-zinc-900/50">
                <Button variant="ghost" onClick={() => requestSort("feature")} className="hover:text-white">
                  Feature
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              {products.map((product) => (
                <TableHead key={product} className="bg-zinc-900/50">
                  <Button variant="ghost" onClick={() => requestSort(product)} className="hover:text-white">
                    {product}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, index) => (
              <TableRow
                key={row.feature}
                className={cn(
                  "hover:bg-zinc-900/50 transition-colors",
                  index % 2 === 0 ? "bg-black/50" : "bg-zinc-950/50",
                )}
              >
                <TableCell className="font-medium">{row.feature}</TableCell>
                {products.map((product) => (
                  <TableCell key={product}>
                    {typeof row[product] === "number" && !isNaN(row[product] as number)
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                        }).format(row[product] as number)
                      : row[product]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  )
}
