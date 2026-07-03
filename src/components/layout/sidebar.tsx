"use client"

import * as React from "react"
import Link from "next/link"
import { MessageSquarePlus, MessageSquare, Settings, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Show, UserButton } from "@clerk/nextjs"
import { SettingsDialog } from "@/components/settings-dialog"

// Mock history data
const mockChats = [
  { id: 1, title: "How to build a SaaS", date: "Today" },
  { id: 2, title: "React 19 features", date: "Today" },
  { id: 3, title: "Next.js App Router vs Pages", date: "Yesterday" },
  { id: 4, title: "Tailwind CSS tricks", date: "Previous 7 Days" },
  { id: 5, title: "Prisma schema design", date: "Previous 7 Days" },
]

export function Sidebar() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  const filteredChats = mockChats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group chats by date
  const groupedChats = filteredChats.reduce((acc, chat) => {
    if (!acc[chat.date]) acc[chat.date] = []
    acc[chat.date].push(chat)
    return acc
  }, {} as Record<string, typeof mockChats>)

  return (
    <>
      <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
        <div className="flex h-14 shrink-0 items-center justify-between px-4 py-2 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              N
            </div>
            <span>Nova AI</span>
          </Link>
        </div>

        <div className="p-3 space-y-3 shrink-0">
          <Button nativeButton={false} variant="outline" className="w-full justify-start gap-2 bg-sidebar-accent/50 hover:bg-sidebar-accent border-sidebar-border shadow-sm" render={<Link href="/" />}>
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </Button>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-sidebar-foreground/50" />
            <Input 
              placeholder="Search chats..." 
              className="pl-9 bg-sidebar-accent/30 border-sidebar-border h-8 text-xs focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 px-3 overflow-y-auto min-h-0">
          {Object.entries(groupedChats).map(([date, chats]) => (
            <div key={date} className="space-y-1 py-2">
              <p className="px-2 text-xs font-medium text-sidebar-foreground/50 mb-2">{date}</p>
              {chats.map(chat => (
                <Button key={chat.id} variant="ghost" className="w-full justify-start gap-2 font-normal h-9 px-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <MessageSquare className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
                  <span className="truncate">{chat.title}</span>
                </Button>
              ))}
            </div>
          ))}
          {filteredChats.length === 0 && (
            <div className="py-8 text-center text-xs text-sidebar-foreground/50">
              No chats found.
            </div>
          )}
        </div>

        <div className="p-3 border-t border-sidebar-border mt-auto shrink-0 space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 px-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Button>
          <Show when="signed-in">
            <div className="w-full justify-start gap-2 px-2 py-1.5 flex items-center text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors">
              <UserButton appearance={{
                elements: {
                  userButtonAvatarBox: "h-6 w-6 ring-1 ring-border shadow-sm",
                  userButtonBox: "flex-row-reverse w-full justify-between"
                }
              }} showName />
            </div>
          </Show>
        </div>
      </div>
      
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
