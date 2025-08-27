"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { userProfileService } from "@/lib/database"

export function UserManagementPanel() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUsers, setShowUsers] = useState(false)

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      // This would need a new function to list all user profiles
      // For now, we'll show a placeholder
      setUsers([])
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (showUsers) {
      loadUsers()
    }
  }, [showUsers])

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">User Management</h4>
        <Button 
          variant="outline" 
          onClick={() => setShowUsers(!showUsers)}
          disabled={isLoading}
        >
          {showUsers ? "Hide Users" : "Show All Users"}
        </Button>
      </div>

      {showUsers && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                User Count Explanation
              </h5>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>Active Users:</strong> Users who completed profile setup</p>
              <p><strong>Auth Users:</strong> All users who signed up (including incomplete profiles)</p>
              <p><strong>Why the difference?</strong> Some users sign up but don't complete their profiles</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              📊 Export User Profiles Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              📈 View User Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start">
              🔍 Search Users by Matric Number
            </Button>
            <Button variant="outline" className="w-full justify-start">
              📋 Generate Users Report
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>User list functionality ready for implementation</p>
              <p className="text-xs mt-1">This will show detailed user profiles when implemented</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
