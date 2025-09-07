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
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-800 mx-auto"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black dark:border-white border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-black dark:text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Connection Error</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <img 
                  src="/lasu.png" 
                  alt="LASU" 
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg shadow-sm" 
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-black dark:bg-white rounded-full border-2 border-white dark:border-black animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-black dark:text-white">
                  LASU AMS
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Geo Attendance System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-full">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium truncate max-w-32 text-black dark:text-white">
                  {user.name || user.email}
                </span>
              </div>
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
                className="hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-900 dark:hover:border-gray-700 transition-colors"
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
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black dark:text-white mb-2">
                Good {getTimeOfDay()}, {user.name?.split(' ')[0] || 'User'}! 👋
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                Track your attendance with our location-based system
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-800">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{getCurrentTime()}</span>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full -translate-y-12 translate-x-12 opacity-30"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-black dark:text-white" />
                </div>
                Today's Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">Checked Out</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-700 text-black dark:text-white">
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full mr-1 animate-pulse"></div>
                    Ready to check in
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full -translate-y-12 translate-x-12 opacity-30"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-black dark:text-white" />
                </div>
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">4/5 Days</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-black dark:bg-white h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-black dark:text-white">80%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full -translate-y-12 translate-x-12 opacity-30"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-black dark:text-white" />
                </div>
                Total Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">32.5 hrs</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">This week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-black dark:text-white">Quick Actions</h3>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            <Button 
              size="lg" 
              className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 text-white dark:text-black border-0 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gray-800 dark:bg-gray-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
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
              className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 border-2 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 group relative overflow-hidden text-black dark:text-white"
            >
              <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
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
            <h3 className="text-xl sm:text-2xl font-semibold text-black dark:text-white">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">
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
                className="transition-all duration-300 hover:shadow-md border-l-4 border-l-black dark:border-l-white bg-white dark:bg-black border border-gray-200 dark:border-gray-800"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center">
                        <activity.icon className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-black dark:text-white">{activity.action}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" />
                      <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-700 text-black dark:text-white hidden sm:flex">
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
