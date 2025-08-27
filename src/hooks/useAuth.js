"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { account } from "@/lib/appwrite"
import { userProfileService } from "@/lib/database"

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setError(null)
      const currentUser = await account.get()
      
      // Check if user has completed their profile
      const isProfileComplete = await userProfileService.isProfileComplete(currentUser.$id)
      if (!isProfileComplete) {
        router.push("/complete-profile")
        return
      }
      
      // Set user if profile is complete
      setUser(currentUser)
    } catch (error) {
      console.error("Authentication error:", error)
      
      // Handle specific Appwrite errors
      if (error.code === 401 || 
          error.message?.includes("missing scopes") || 
          error.message?.includes("guests")) {
        
        // Clear any potentially corrupted session
        try {
          await account.deleteSession("current")
        } catch (logoutError) {
          // Session might not exist, ignore error
        }
        
        setError("Session expired. Please log in again.")
        router.push("/login")
      } else {
        setError(error.message || "Authentication failed")
        router.push("/login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await account.deleteSession("current")
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout even if API call fails
      setUser(null)
      router.push("/login")
    }
  }

  const refreshAuth = () => {
    setIsLoading(true)
    checkAuth()
  }

  return {
    user,
    isLoading,
    error,
    logout,
    refreshAuth
  }
}
