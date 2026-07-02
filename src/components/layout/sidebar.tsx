import Link from "next/link"
import { MessageSquarePlus, MessageSquare, Settings, User } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center justify-between px-4 py-2 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
            N
          </div>
          <span>Nova AI</span>
        </Link>
      </div>

      <div className="p-3">
        <Button variant="outline" className="w-full justify-start gap-2 bg-sidebar-accent/50 hover:bg-sidebar-accent border-sidebar-border shadow-sm" render={<Link href="/" />}>
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 px-3 overflow-y-auto">
        <div className="space-y-1 py-2">
          <p className="px-2 text-xs font-medium text-sidebar-foreground/50 mb-2">Today</p>
          <Button variant="ghost" className="w-full justify-start gap-2 font-normal h-9 px-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <MessageSquare className="h-4 w-4 text-sidebar-foreground/50" />
            <span className="truncate">How to build a SaaS</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 font-normal h-9 px-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <MessageSquare className="h-4 w-4 text-sidebar-foreground/50" />
            <span className="truncate">React 19 features</span>
          </Button>
        </div>
      </div>

      <div className="p-3 border-t border-sidebar-border mt-auto">
        <Button variant="ghost" className="w-full justify-start gap-2 px-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  )
}
