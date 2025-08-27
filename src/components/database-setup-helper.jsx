"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function DatabaseSetupHelper({ error }) {
  const [showInstructions, setShowInstructions] = useState(false)

  const isDatabaseError = error?.includes("Database") || error?.includes("Collection") || error?.includes("404")

  if (!isDatabaseError) return null

  return (
    <Card className="p-4 mt-4 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
          <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200">
            Database Setup Required
          </h4>
        </div>
        
        <p className="text-sm text-orange-700 dark:text-orange-300">
          Your Appwrite database isn't set up yet. You need to create a database and collections in your Appwrite console.
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-orange-800 border-orange-300 hover:bg-orange-100 dark:text-orange-200 dark:border-orange-700"
        >
          {showInstructions ? "Hide Instructions" : "Show Setup Instructions"}
        </Button>

        {showInstructions && (
          <div className="space-y-3 text-sm text-orange-700 dark:text-orange-300">
            <div className="bg-white dark:bg-gray-900 rounded-md p-3 border border-orange-200 dark:border-orange-800">
              <h5 className="font-medium mb-2">Quick Setup Steps:</h5>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Go to your <a href="https://cloud.appwrite.io/console" target="_blank" rel="noopener noreferrer" className="underline">Appwrite Console</a></li>
                <li>Create a database with ID: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">main</code></li>
                <li>Create a collection with ID: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">user_profiles</code></li>
                <li>Add these attributes to the collection:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                    <li><code>userId</code> (String, 255, Required)</li>
                    <li><code>fullName</code> (String, 255, Required)</li>
                    <li><code>phoneNumber</code> (String, 50, Required)</li>
                    <li><code>matricNumber</code> (String, 50, Required)</li>
                    <li><code>department</code> (String, 255, Optional)</li>
                    <li><code>level</code> (String, 50, Optional)</li>
                    <li><code>createdAt</code> (String, 255, Required)</li>
                    <li><code>updatedAt</code> (String, 255, Required)</li>
                  </ul>
                </li>
                <li>Set collection permissions to allow Users to read/write</li>
              </ol>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://cloud.appwrite.io/console", "_blank")}
                className="text-xs"
              >
                Open Appwrite Console
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/APPWRITE_SETUP.md", "_blank")}
                className="text-xs"
              >
                View Detailed Instructions
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
