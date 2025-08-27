"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { account } from "@/lib/appwrite"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react"
import "../app.css"

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState("pending") // pending, success, error
  const [error, setError] = useState("")
  const [isResending, setIsResending] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }

    // Check if this is a verification callback (with userId and secret)
    const userId = searchParams.get("userId")
    const secret = searchParams.get("secret")
    
    if (userId && secret) {
      handleVerification(userId, secret)
    }
  }, [searchParams])

  const handleVerification = async (userId, secret) => {
    setIsVerifying(true)
    setError("")

    try {
      // Update verification status
      await account.updateVerification(userId, secret)
      
      setVerificationStatus("success")
      
      // Redirect to home after successful verification
      setTimeout(() => {
        router.push("/home")
      }, 3000)
      
    } catch (error) {
      console.error("Verification error:", error)
      setError(error.message || "Failed to verify email")
      setVerificationStatus("error")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError("Email address is required")
      return
    }

    setIsResending(true)
    setError("")

    try {
      // Check if user is already logged in, if not, this will fail
      try {
        const user = await account.get()
        // User is logged in, send verification
        await account.createVerification(`${window.location.origin}/verify-email`)
        setError("Verification email sent! Please check your inbox.")
      } catch (e) {
        // User not logged in, show message to login first
        setError("Please login first to resend the verification email.")
      }
    } catch (error) {
      console.error("Resend error:", error)
      setError(error.message || "Failed to resend verification email")
    } finally {
      setIsResending(false)
    }
  }

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

          {/* Content based on verification status */}
          {isVerifying ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <h1 className="text-2xl font-bold">Verifying Email...</h1>
              <p className="text-muted-foreground">
                Please wait while we verify your email address.
              </p>
            </div>
          ) : verificationStatus === "success" ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-green-600">Email Verified!</h1>
              <p className="text-muted-foreground">
                Your email has been successfully verified. You will be redirected to the home page in a few seconds.
              </p>
              <Button onClick={() => router.push("/home")} className="w-full">
                Continue to Home
              </Button>
            </div>
          ) : verificationStatus === "error" ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-destructive">Verification Failed</h1>
              <p className="text-muted-foreground">
                There was an error verifying your email address. Please try again or contact support.
              </p>
              {error && (
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Button onClick={handleResendVerification} disabled={isResending} className="w-full">
                  {isResending ? "Resending..." : "Resend Verification Email"}
                </Button>
                <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
                  Back to Login
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Mail className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Check Your Email</h1>
              <p className="text-muted-foreground">
                We've sent a verification email to:
              </p>
              <p className="font-semibold text-primary">{email}</p>
              <p className="text-muted-foreground text-sm">
                Please check your inbox and click the verification link to complete your account setup.
              </p>
              
              {error && (
                <div className={`rounded-md p-3 text-sm ${
                  error.includes("sent") ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-destructive/10 text-destructive"
                }`}>
                  {error}
                </div>
              )}

              <div className="space-y-3 pt-4">
                <Button onClick={handleResendVerification} disabled={isResending} variant="outline" className="w-full">
                  {isResending ? "Resending..." : "Resend Verification Email"}
                </Button>
                <Button variant="ghost" onClick={() => router.push("/login")} className="w-full">
                  Back to Login
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground pt-4">
                <p>Didn't receive the email? Check your spam folder or try resending.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
