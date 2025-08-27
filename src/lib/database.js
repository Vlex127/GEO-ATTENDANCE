import { databases } from "@/lib/appwrite"
import { ID, Query } from "appwrite"

// Database and Collection IDs - these should match your Appwrite setup
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "main"
export const COLLECTIONS = {
  USER_PROFILES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES || "user_profiles",
  ATTENDANCE_RECORDS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ATTENDANCE || "attendance_records",
  ADMINS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ADMINS || "admins"
}

// User Profile operations
export const userProfileService = {
  // Create a new user profile
  async create(userId, profileData) {
    try {
      // Build document data with only the fields that exist in the collection
      const documentData = {
        userId,
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber,
        matricNumber: profileData.matricNumber
      }

      // Add optional fields only if they have values
      if (profileData.department) {
        documentData.department = profileData.department
      }
      if (profileData.level) {
        documentData.level = profileData.level
      }

      const document = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        userId, // Use userId as document ID
        documentData
      )
      return document
    } catch (error) {
      console.error("Error creating user profile:", error)
      
      // Provide more helpful error messages
      if (error.code === 404) {
        throw new Error("Database or collection not found. Please check your Appwrite setup.")
      }
      if (error.message?.includes("Collection with the requested ID could not be found")) {
        throw new Error("User profiles collection not found. Please create the 'user_profiles' collection in Appwrite.")
      }
      if (error.message?.includes("Database with the requested ID could not be found")) {
        throw new Error("Database not found. Please create a database in your Appwrite project.")
      }
      
      throw error
    }
  },

  // Get user profile by userId
  async get(userId) {
    try {
      const document = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        userId
      )
      return document
    } catch (error) {
      if (error.code === 404) {
        return null // Profile doesn't exist
      }
      console.error("Error getting user profile:", error)
      throw error
    }
  },

  // Update user profile
  async update(userId, profileData) {
    try {
      const document = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        userId,
        {
          ...profileData,
          updatedAt: new Date().toISOString()
        }
      )
      return document
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw error
    }
  },

  // Check if profile exists and is complete
  async isProfileComplete(userId) {
    try {
      const profile = await this.get(userId)
      if (!profile) return false
      
      // Check if required fields are present
      return !!(
        profile.fullName && 
        profile.phoneNumber && 
        profile.matricNumber
      )
    } catch (error) {
      console.error("Error checking profile completion:", error)
      return false
    }
  }
}

// Attendance operations (for future use)
export const attendanceService = {
  // Create attendance record
  async create(userId, attendanceData) {
    try {
      const document = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ATTENDANCE_RECORDS,
        ID.unique(),
        {
          userId,
          type: attendanceData.type, // 'check-in' or 'check-out'
          timestamp: attendanceData.timestamp || new Date().toISOString(),
          location: attendanceData.location || null,
          latitude: attendanceData.latitude || null,
          longitude: attendanceData.longitude || null,
          createdAt: new Date().toISOString()
        }
      )
      return document
    } catch (error) {
      console.error("Error creating attendance record:", error)
      throw error
    }
  },

  // Get user's attendance records
  async getUserAttendance(userId, limit = 50) {
    try {
      const documents = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ATTENDANCE_RECORDS,
        [
          Query.equal("userId", userId),
          Query.orderDesc("timestamp"),
          Query.limit(limit)
        ]
      )
      return documents.documents
    } catch (error) {
      console.error("Error getting attendance records:", error)
      throw error
    }
  }
}

// Admin operations
export const adminService = {
  // Check if user is admin
  async isAdmin(userId) {
    try {
      const document = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.ADMINS,
        userId
      )
      return document ? true : false
    } catch (error) {
      if (error.code === 404) {
        return false // User is not an admin
      }
      console.error("Error checking admin status:", error)
      return false
    }
  },

  // Create admin entry
  async createAdmin(userId, adminData) {
    try {
      const document = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ADMINS,
        userId, // Use userId as document ID
        {
          userId,
          email: adminData.email,
          role: adminData.role || "admin",
          permissions: adminData.permissions || ["read", "write"],
          createdBy: adminData.createdBy || null,
          createdAt: new Date().toISOString()
        }
      )
      return document
    } catch (error) {
      console.error("Error creating admin:", error)
      throw error
    }
  },

  // Get admin details
  async getAdmin(userId) {
    try {
      const document = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.ADMINS,
        userId
      )
      return document
    } catch (error) {
      if (error.code === 404) {
        return null
      }
      console.error("Error getting admin details:", error)
      throw error
    }
  },

  // List all admins
  async listAdmins() {
    try {
      const documents = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ADMINS
      )
      return documents.documents
    } catch (error) {
      console.error("Error listing admins:", error)
      throw error
    }
  }
}
