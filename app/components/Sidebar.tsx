"\"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Folder, Plus, Search, MessagesSquare } from "lucide-react"

export default function Sidebar() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  const folders = [
    { id: "work", name: "Work chats" },
    { id: "life", name: "Life chats" },
    { id: "projects", name: "Projects chats" },
    { id: "clients", name: "Clients chats" },
  ]

  const chats = [
    { id: "trip", name: "Plan a 3-day trip", description: "A 3-day trip to see the northern lights in Norway" },
    {
      id: "loyalty",
      name: "Ideas for a customer loyalty program",
      description: "Here are some ideas for a customer loyalty...",
    },
    { id: "pack", name: "Help me pack", description: "Here are some gift ideas for your fishing-loving..." },
  ]

  return (
    <div className="w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Chats</h2>
            <Button variant="ghost" size="icon">
              <span className="sr-only">Settings</span>
              <MessagesSquare className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-8" />
          </div>
        </div>
        <div className="px-3">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Folders</h2>
          <div className="space-y-1">
            {folders.map((folder) => (
              <Button key={folder.id} variant="ghost" className="w-full justify-start">
                <Folder className="mr-2 h-4 w-4" />
                {folder.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="px-3">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Chats</h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1">
              {chats.map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  className={cn("w-full justify-start font-normal", selectedChat === chat.id && "bg-accent")}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="flex flex-col items-start">
                    <span>{chat.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{chat.description}</span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="mt-auto p-4">
        <Button className="w-full bg-green-500 hover:bg-green-600">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
    </div>
  )
}
