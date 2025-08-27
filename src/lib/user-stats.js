import { account } from "@/lib/appwrite"
import { databases } from "@/lib/appwrite"
import { DATABASE_ID, COLLECTIONS } from "@/lib/database"

export const userStatsService = {
  // Get accurate user count (only count Auth users, not database entries)
  async getUserStats() {
    try {
      // Method 1: Count only Auth users (recommended)
      // Note: This requires admin privileges to list all users
      // For now, we'll count user_profiles but clarify what it means
      
      const userProfiles = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES
      )
      
      // Get attendance records count
      let attendanceCount = 0
      try {
        const attendance = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.ATTENDANCE_RECORDS
        )
        attendanceCount = attendance.total
      } catch (error) {
        // Attendance collection might not exist yet
        attendanceCount = 0
      }
      
      return {
        // This represents users who have completed their profiles
        registeredUsers: userProfiles.total,
        totalAttendanceRecords: attendanceCount,
        // Add clarification
        note: "Registered users = users with completed profiles"
      }
    } catch (error) {
      console.error("Error getting user stats:", error)
      return {
        registeredUsers: 0,
        totalAttendanceRecords: 0,
        note: "Error loading stats"
      }
    }
  },

  // Alternative: Get both counts separately for clarity
  async getDetailedStats() {
    try {
      const userProfiles = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES
      )
      
      let attendanceCount = 0
      try {
        const attendance = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.ATTENDANCE_RECORDS
        )
        attendanceCount = attendance.total
      } catch (error) {
        attendanceCount = 0
      }
      
      return {
        usersWithProfiles: userProfiles.total, // Clear naming
        attendanceRecords: attendanceCount,
        // Note: We can't easily count total auth users without admin API access
        // But this gives a clear picture of active users
      }
    } catch (error) {
      console.error("Error getting detailed stats:", error)
      throw error
    }
  }
}
