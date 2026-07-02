"use client"

import * as React from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/sidebar"
import { Show, SignInButton, UserButton } from "@clerk/nextjs"

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
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

      <div className="flex flex-1 items-center justify-end gap-3">
        <ThemeToggle />
        <Show when="signed-in">
          <UserButton appearance={{
            elements: {
              userButtonAvatarBox: "h-9 w-9 ring-1 ring-border shadow-sm"
            }
          }} />
        </Show>
        <Show when="signed-out">
          <SignInButton>
            <Button size="sm" className="rounded-full shadow-sm">Sign In</Button>
          </SignInButton>
        </Show>
      </div>
    </header>
  )
}
