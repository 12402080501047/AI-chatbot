"use client"

import * as React from "react"
import { Monitor, Moon, Sun, User, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { theme, setTheme } = useTheme()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium leading-none">Appearance</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className="justify-start gap-2"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className="justify-start gap-2"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                className="justify-start gap-2"
                onClick={() => setTheme("system")}
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium leading-none">Account</h4>
            <div className="rounded-lg border border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Manage Account</p>
                  <p className="text-xs text-muted-foreground">Update your profile information.</p>
                </div>
              </div>
              {/* This would ideally open Clerk's user profile modal, but we'll leave it as a mockup or just a button for now. Clerk provides useClerk().openUserProfile() */}
              <Button variant="outline" size="sm" onClick={() => {
                const clerkBtn = document.querySelector('.clerk-user-button-trigger') as HTMLElement;
                if(clerkBtn) clerkBtn.click();
              }}>
                Manage
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
