"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TableViewProps {
  title: string
  description: string
  headers: string[]
  rows: (string | number)[][]
}

export function TableView({ title, description, headers, rows }: TableViewProps) {
  return (
    <Card className="w-full bg-zinc-900/95 border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-zinc-100">{title}</CardTitle>
        <CardDescription className="text-zinc-400 text-base">{description}</CardDescription>
      </CardHeader>
      <div className="p-6">
        <div className="rounded-md border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  {headers.map((header, index) => (
                    <TableHead
                      key={index}
                      className={cn(
                        "bg-zinc-800/50 text-zinc-100 font-medium h-12 px-4",
                        index === 0 && "w-[80px]", // Rank column
                        index === headers.length - 1 && "min-w-[300px]", // Description column
                      )}
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={cn(
                      "border-zinc-800 transition-colors hover:bg-zinc-800/50",
                      rowIndex % 2 === 0 ? "bg-zinc-900/50" : "bg-zinc-900/30",
                    )}
                  >
                    {row.map((cell, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        className={cn(
                          "px-4 py-4 text-zinc-100",
                          cellIndex === 0 && "font-medium w-[80px]", // Rank column
                          cellIndex === headers.length - 1 && "min-w-[300px]", // Description column
                        )}
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Card>
  )
}
