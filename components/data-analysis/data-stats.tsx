"use client"

import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataStatsProps {
  data: any[]
}

export function DataStats({ data }: DataStatsProps) {
  const stats = useMemo(() => {
    const numericColumns = Object.keys(data[0]).filter((key) =>
      data.every((row) => !isNaN(Number.parseFloat(row[key]))),
    )

    return numericColumns.map((column) => {
      const values = data.map((row) => Number.parseFloat(row[column]))
      const sum = values.reduce((a, b) => a + b, 0)
      const mean = sum / values.length
      const sortedValues = [...values].sort((a, b) => a - b)
      const median = sortedValues[Math.floor(values.length / 2)]
      const min = Math.min(...values)
      const max = Math.max(...values)
      const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
      const stdDev = Math.sqrt(variance)

      return {
        column,
        count: values.length,
        sum,
        mean,
        median,
        min,
        max,
        stdDev,
      }
    })
  }, [data])

  if (!stats.length) {
    return <div className="text-center py-4">No numeric data available for analysis</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Column</TableHead>
            <TableHead>Count</TableHead>
            <TableHead>Sum</TableHead>
            <TableHead>Mean</TableHead>
            <TableHead>Median</TableHead>
            <TableHead>Min</TableHead>
            <TableHead>Max</TableHead>
            <TableHead>Std Dev</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat) => (
            <TableRow key={stat.column}>
              <TableCell className="font-medium">{stat.column}</TableCell>
              <TableCell>{stat.count}</TableCell>
              <TableCell>{stat.sum.toFixed(2)}</TableCell>
              <TableCell>{stat.mean.toFixed(2)}</TableCell>
              <TableCell>{stat.median.toFixed(2)}</TableCell>
              <TableCell>{stat.min.toFixed(2)}</TableCell>
              <TableCell>{stat.max.toFixed(2)}</TableCell>
              <TableCell>{stat.stdDev.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
