"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function MinimalSetupHelper({ error }) {
  const isAttributeError = error?.includes("Unknown attribute") || error?.includes("createdAt") || error?.includes("updatedAt")

  if (!isAttributeError) return null

  return (
    <Card className="p-4 mt-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
            Missing Collection Attributes
          </h4>
        </div>
        
        <p className="text-sm text-blue-700 dark:text-blue-300">
          You need to add these attributes to your collection. Go to your Appwrite console:
        </p>

        <div className="bg-white dark:bg-gray-900 rounded-md p-3 border border-blue-200 dark:border-blue-800">
          <h5 className="font-medium mb-2 text-xs">Add these attributes to 'user_profiles' collection:</h5>
          <div className="grid gap-1 text-xs font-mono">
            <div className="flex justify-between">
              <span>userId</span>
              <span className="text-gray-500">(String, 255, Required)</span>
            </div>
            <div className="flex justify-between">
              <span>fullName</span>
              <span className="text-gray-500">(String, 255, Required)</span>
            </div>
            <div className="flex justify-between">
              <span>phoneNumber</span>
              <span className="text-gray-500">(String, 50, Required)</span>
            </div>
            <div className="flex justify-between">
              <span>matricNumber</span>
              <span className="text-gray-500">(String, 50, Required)</span>
            </div>
            <div className="flex justify-between">
              <span>department</span>
              <span className="text-gray-500">(String, 255, Optional)</span>
            </div>
            <div className="flex justify-between">
              <span>level</span>
              <span className="text-gray-500">(String, 50, Optional)</span>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open("https://cloud.appwrite.io/console", "_blank")}
          className="text-blue-800 border-blue-300 hover:bg-blue-100 dark:text-blue-200 dark:border-blue-700"
        >
          Open Appwrite Console
        </Button>
      </div>
    </Card>
  )
}
