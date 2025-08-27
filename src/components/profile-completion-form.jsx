"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { userProfileService } from "@/lib/database"
import { account } from "@/lib/appwrite"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function ProfileCompletionForm({
  className,
  ...props
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    matricNumber: "",
    department: "",
    level: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Get current user info
    const getCurrentUser = async () => {
      try {
        const currentUser = await account.get()
        setUser(currentUser)
        // Pre-fill name if available from account
        if (currentUser.name) {
          setFormData(prev => ({ ...prev, fullName: currentUser.name }))
        }
      } catch (error) {
        console.error("Error getting user:", error)
        router.push("/login")
      }
    }
    getCurrentUser()
  }, [router])

  const departments = [
    "Computer Science",
    "Information Technology", 
    "Software Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Business Administration",
    "Accounting",
    "Economics",
    "Mass Communication",
    "English Language",
    "Geography",
    "History",
    "Political Science",
    "Sociology",
    "Psychology",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Medicine",
    "Pharmacy",
    "Law",
    "Education"
  ]

  const levels = [
    "100 Level",
    "200 Level", 
    "300 Level",
    "400 Level",
    "500 Level",
    "600 Level"
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.fullName.trim()) {
      setError("Full name is required")
      return
    }
    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required")
      return
    }
    if (!formData.matricNumber.trim()) {
      setError("Matric number is required")
      return
    }

    // Validate phone number format
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError("Please enter a valid phone number")
      return
    }

    setIsLoading(true)

    try {
      if (!user) {
        throw new Error("User not found")
      }

      // Create user profile in database
      await userProfileService.create(user.$id, formData)
      
      // Redirect to home page
      router.push("/home")
    } catch (error) {
      console.error("Profile completion error:", error)
      if (error.message?.includes("Document with the requested ID already exists")) {
        setError("Profile already exists. Redirecting...")
        setTimeout(() => router.push("/home"), 2000)
      } else {
        setError(error.message || "An error occurred while saving your profile")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Complete Your Profile</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Please provide your details to complete your account setup
        </p>
      </div>
      
      <div className="grid gap-6">
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input 
            id="fullName" 
            type="text" 
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            disabled={isLoading}
            required 
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input 
            id="phoneNumber" 
            type="tel" 
            placeholder="+234 xxx xxx xxxx"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            disabled={isLoading}
            required 
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="matricNumber">Matric Number *</Label>
          <Input 
            id="matricNumber" 
            type="text" 
            placeholder="e.g., 180402001"
            value={formData.matricNumber}
            onChange={(e) => handleInputChange("matricNumber", e.target.value.toUpperCase())}
            disabled={isLoading}
            required 
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="department">Department (Optional)</Label>
          <Select onValueChange={(value) => handleInputChange("department", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="level">Level (Optional)</Label>
          <Select onValueChange={(value) => handleInputChange("level", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving Profile..." : "Complete Profile"}
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        * Required fields
      </div>
    </form>
  );
}
