"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { account } from "@/lib/appwrite"

export function AuthGuard({ children, redirectTo = "/home", requireAuth = false }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      await account.get()
      setIsAuthenticated(true)
      
      // If user is authenticated but shouldn't be (like on login/signup page)
      if (!requireAuth) {
        router.push(redirectTo)
        return
      }
    } catch (error) {
      setIsAuthenticated(false)
      
      // If user is not authenticated but should be
      if (requireAuth) {
        router.push("/login")
        return
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // For login/signup pages: only show if not authenticated
  if (!requireAuth && isAuthenticated) {
    return null // Will redirect to home
  }

  // For protected pages: only show if authenticated
  if (requireAuth && !isAuthenticated) {
    return null // Will redirect to login
  }

  return children
}
