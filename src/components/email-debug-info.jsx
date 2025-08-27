"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { account } from "@/lib/appwrite"
import { ChevronDown, ChevronUp } from "lucide-react"

export function EmailDebugInfo() {
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const checkAppwriteConfig = async () => {
    setIsLoading(true)
    try {
      // Try to get current session info
      const user = await account.get()
      const info = {
        userId: user.$id,
        email: user.email,
        emailVerification: user.emailVerification,
        name: user.name,
        registration: user.registration,
        status: user.status,
        appwriteEndpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "Not configured",
        appwriteProjectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "Not configured"
      }
      setDebugInfo(JSON.stringify(info, null, 2))
    } catch (error) {
      setDebugInfo(`Error getting user info: ${error.message}\n\nThis might indicate:\n- User not logged in\n- Session expired\n- Appwrite configuration issues`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4 border border-gray-300 dark:border-gray-600 rounded-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDebug(!showDebug)}
        className="w-full justify-between text-xs"
      >
        Debug Information
        {showDebug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      
      {showDebug && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={checkAppwriteConfig}
            disabled={isLoading}
            className="mb-3 w-full"
          >
            {isLoading ? "Checking..." : "Check Appwrite Configuration"}
          </Button>
          
          {debugInfo && (
            <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs font-mono whitespace-pre-wrap overflow-auto max-h-60">
              {debugInfo}
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-1">Common email issues:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Appwrite project email service not configured</li>
              <li>Email domain not verified in Appwrite</li>
              <li>SMTP settings incorrect</li>
              <li>Email in spam/junk folder</li>
              <li>Corporate firewall blocking emails</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
