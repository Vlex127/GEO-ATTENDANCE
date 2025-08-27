"use client"

import { ProfileCompletionForm } from "@/components/profile-completion-form"
import { ThemeToggle } from "@/components/theme-toggle"
import "../app.css"

export default function CompleteProfilePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card text-card-foreground rounded-lg border p-8 shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <img src="/lasu.png" alt="LASU" className="h-6 w-6" />
              <span className="font-semibold">LASU AMS</span>
            </div>
            <ThemeToggle />
          </div>

          <ProfileCompletionForm />
        </div>
      </div>
    </div>
  )
}
