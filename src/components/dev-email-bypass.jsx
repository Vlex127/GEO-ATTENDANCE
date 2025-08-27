"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { account } from "@/lib/appwrite"
import { useRouter } from "next/navigation"

export function DevEmailBypass({ email }) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleBypassVerification = async () => {
    setIsVerifying(true)
    setError("")

    try {
      // Get current user to check if they exist
      const user = await account.get()
      
      // Since we can't manually verify email in development without SMTP,
      // we'll redirect to login and let them know to contact admin
      setError("Email verification is required but emails aren't configured in development. Please contact your administrator to manually verify your account, or use Google OAuth instead.")
      
    } catch (err) {
      setError("Please login first to check your account status")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800">
      <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
        Development Mode
      </h4>
      <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
        Email services may not be configured in development. Try these alternatives:
      </p>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push("/login")}
          className="w-full"
        >
          Try Google OAuth Login Instead
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBypassVerification}
          disabled={isVerifying}
          className="w-full"
        >
          {isVerifying ? "Checking..." : "Check Account Status"}
        </Button>
      </div>
      {error && (
        <div className="mt-3 text-xs text-orange-600 dark:text-orange-400">
          {error}
        </div>
      )}
    </div>
  )
}
