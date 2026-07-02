"use client"

import * as React from "react"
import { Menu, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/sidebar"
import { Show, SignInButton } from "@clerk/nextjs"

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 md:bg-transparent md:border-b-0 md:backdrop-blur-none">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-border/50">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:flex flex-1 items-center gap-2">
        <Button variant="ghost" className="h-8 gap-2 px-2 text-muted-foreground hover:text-foreground font-semibold">
          Nova AI 4.0
          <Sparkles className="h-3 w-3 text-primary" />
        </Button>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Show when="signed-out">
          <SignInButton>
            <Button size="sm" className="rounded-full shadow-sm">Sign In</Button>
          </SignInButton>
        </Show>
      </div>
    </header>
  )
}
