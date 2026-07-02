"use client"

import * as React from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/sidebar"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-border/50">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <ThemeToggle />
        <SignedIn>
          <UserButton appearance={{
            elements: {
              userButtonAvatarBox: "h-9 w-9 ring-1 ring-border shadow-sm"
            }
          }} />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button size="sm" className="rounded-full shadow-sm">Sign In</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  )
}
