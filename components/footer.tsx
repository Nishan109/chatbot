import { BarChart3 } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BarChart3 className="h-5 w-5 text-green-500" />
            <span className="font-semibold text-white">Chart Bot</span>
            <span className="text-zinc-500 text-sm ml-2">
              © {new Date().getFullYear()} Chart Bot. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-zinc-400 text-sm">Developed by Nishan Singh</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
