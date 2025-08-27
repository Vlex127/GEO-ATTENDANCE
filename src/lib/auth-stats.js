import { adminService } from "@/lib/database"

// Simple stats using only Auth (no database needed for user profiles)
export const authStatsService = {
  // Get stats from Auth and admin database
  async getStats() {
    try {
      // Get admin count from database (still needed for admin functionality)
      let adminCount = 0
      try {
        const admins = await adminService.listAdmins()
        adminCount = admins.length
      } catch (error) {
        console.log("Admin collection not set up yet:", error.message)
        adminCount = 0
      }

      return {
        // Note: We can't easily count all Auth users without admin API access
        // For now, we'll show basic stats and add user counting when needed
        totalAdmins: adminCount,
        attendanceRecords: 0, // Will implement when attendance feature is added
        note: "Using simplified Auth-only approach"
      }
    } catch (error) {
      console.error("Error getting auth stats:", error)
      return {
        totalAdmins: 0,
        attendanceRecords: 0,
        note: "Error loading stats"
      }
    }
  }
}
