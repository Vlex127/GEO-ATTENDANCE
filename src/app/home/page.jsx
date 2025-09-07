"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
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
  AlertCircle,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
};

const getCurrentTime = () =>
  new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

export default function HomePage() {
  const { user, isLoading, error, logout } = useAuth();
  const focusRef = useRef(null);

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-800 mx-auto"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
        <motion.div
          className="text-center space-y-4 max-w-md mx-auto p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Connection Error</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to login...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/lasu.png"
                  alt="LASU logo"
                  className="h-10 w-10 rounded-lg shadow-sm"
                  loading="lazy"
                />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-gray-950 animate-pulse" aria-hidden="true"></span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">LASU AMS</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Geo Attendance System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-full">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                <span className="text-sm font-medium truncate max-w-32 text-gray-900 dark:text-white">
                  {user.name || user.email}
                </span>
              </div>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                ref={focusRef}
                className="hover:bg-gray-100 dark:hover:bg-gray-900 border-gray-300 dark:border-gray-700 transition-colors focus:ring-2 focus:ring-primary"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Good {getTimeOfDay()}, {user.name?.split(" ")[0] || "User"}! 👋
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-base">Track your attendance with our location-based system</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-800">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span className="font-mono" aria-live="polite">{getCurrentTime()}</span>
            </div>
          </div>
        </motion.section>

        <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {[
            {
              title: "Today's Status",
              icon: CheckCircle,
              content: (
                <>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">Checked Out</p>
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  >
                    <span className="w-2 h-2 bg-primary rounded-full mr-1 animate-pulse" aria-hidden="true"></span>
                    Ready to check in
                  </Badge>
                </>
              ),
            },
            {
              title: "This Week",
              icon: Calendar,
              content: (
                <>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">4/5 Days</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <motion.div
                        className="bg-primary h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "80%" }}
                        transition={{ duration: 0.5 }}
                      ></motion.div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">80%</span>
                  </div>
                </>
              ),
            },
            {
              title: "Total Hours",
              icon: TrendingUp,
              content: (
                <>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">32.5 hrs</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This week</p>
                </>
              ),
            },
          ].map((card, index) => (
            <motion.div
              key={index}
              className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full -translate-y-12 translate-x-12 opacity-30" aria-hidden="true"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                      <card.icon className="w-4 h-4 text-gray-900 dark:text-white" aria-hidden="true" />
                    </div>
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">{card.content}</CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Quick Actions</h3>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {[
              {
                label: "Check In",
                icon: [LogIn, MapPin],
                description: "Mark your arrival at the location",
                variant: "default",
                className:
                  "bg-primary hover:bg-primary/90 text-white dark:text-gray-900 shadow-lg hover:shadow-xl border-0",
              },
              {
                label: "Check Out",
                icon: [LogOut, MapPin],
                description: "Mark your departure from location",
                variant: "outline",
                className:
                  "border-2 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-900 dark:text-white shadow-md hover:shadow-lg",
              },
            ].map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Button
                  size="lg"
                  variant={action.variant}
                  className={`h-24 flex-col gap-3 relative overflow-hidden group transition-all duration-300 ${action.className}`}
                  aria-label={action.label}
                >
                  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      {action.icon.map((Icon, i) => (
                        <Icon
                          key={i}
                          className={`w-${i === 0 ? "6" : "5"} h-${i === 0 ? "6" : "5"}`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-semibold">{action.label}</span>
                      <span className="text-sm opacity-75 block">{action.description}</span>
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label="View all activities"
            >
              <Activity className="w-4 h-4 mr-2" aria-hidden="true" />
              View All
            </Button>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {[
                { action: "Checked Out", time: "Yesterday at 5:30 PM", status: "success", icon: LogOut },
                { action: "Checked In", time: "Yesterday at 9:00 AM", status: "success", icon: LogIn },
                { action: "Checked Out", time: "2 days ago at 6:15 PM", status: "success", icon: LogOut },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="transition-shadow duration-300 hover:shadow-md border-l-4 border-l-primary bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center">
                            <activity.icon className="w-6 h-6 text-gray-900 dark:text-white" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="font-semibold text-base text-gray-900 dark:text-white">{activity.action}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" aria-hidden="true" />
                              <time dateTime={activity.time}>{activity.time}</time>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle
                            className="w-6 h-6 text-green-600 dark:text-green-400"
                            aria-hidden="true"
                          />
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hidden sm:flex"
                          >
                            Verified
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
