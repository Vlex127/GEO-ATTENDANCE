"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/useAuth"
import { 
  Clock, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  LogIn, 
  LogOut, 
  User,
  Activity,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export default function HomePage() {
  const { user, isLoading, error, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-gray-700 mx-auto"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Connection Error</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <img 
                  src="/lasu.png" 
                  alt="LASU" 
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg shadow-sm" 
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  LASU AMS
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Geo Attendance System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate max-w-32">
                  {user.name || user.email}
                </span>
              </div>
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                Good {getTimeOfDay()}, {user.name?.split(' ')[0] || 'User'}! 👋
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Track your attendance with our location-based system
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-full border">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{getCurrentTime()}</span>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                Today's Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">Checked Out</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Ready to check in
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">4/5 Days</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">80%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                Total Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">32.5 hrs</p>
                <p className="text-sm text-muted-foreground">This week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Quick Actions</h3>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            <Button 
              size="lg" 
              className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white border-0 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-center">
                  <span className="text-base sm:text-lg font-semibold">Check In</span>
                  <span className="text-xs sm:text-sm opacity-90 block">Mark your arrival at the location</span>
                </div>
              </div>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 border-2 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-center">
                  <span className="text-base sm:text-lg font-semibold">Check Out</span>
                  <span className="text-xs sm:text-sm opacity-75 block">Mark your departure from location</span>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-semibold">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Activity className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {[
              { action: "Checked Out", time: "Yesterday at 5:30 PM", status: "success", icon: LogOut },
              { action: "Checked In", time: "Yesterday at 9:00 AM", status: "success", icon: LogIn },
              { action: "Checked Out", time: "2 days ago at 6:15 PM", status: "success", icon: LogOut },
            ].map((activity, index) => (
              <Card 
                key={index} 
                className="transition-all duration-300 hover:shadow-md border-l-4 border-l-green-500 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <activity.icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base">{activity.action}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                      <Badge variant="outline" className="text-xs border-green-200 text-green-700 dark:border-green-800 dark:text-green-300 hidden sm:flex">
                        Verified
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper functions
function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return "Morning"
  if (hour < 17) return "Afternoon"
  return "Evening"
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
}
