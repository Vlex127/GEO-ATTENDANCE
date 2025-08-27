import { account } from "@/lib/appwrite"

// User Profile operations using Auth preferences instead of database
export const authProfileService = {
  // Save profile data to user preferences
  async updateProfile(profileData) {
    try {
      // Update user preferences with profile data
      const prefs = await account.updatePrefs({
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber,
        matricNumber: profileData.matricNumber,
        department: profileData.department || null,
        level: profileData.level || null,
        profileCompleted: true,
        updatedAt: new Date().toISOString()
      })
      
      // Also update the user's name in their account
      if (profileData.fullName) {
        await account.updateName(profileData.fullName)
      }
      
      return prefs
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  },

  // Get profile data from user preferences
  async getProfile() {
    try {
      const user = await account.get()
      return {
        ...user,
        // Profile data from preferences
        fullName: user.prefs?.fullName || user.name,
        phoneNumber: user.prefs?.phoneNumber,
        matricNumber: user.prefs?.matricNumber,
        department: user.prefs?.department,
        level: user.prefs?.level,
        profileCompleted: user.prefs?.profileCompleted || false
      }
    } catch (error) {
      console.error("Error getting profile:", error)
      throw error
    }
  },

  // Check if profile is complete
  async isProfileComplete() {
    try {
      const user = await account.get()
      const prefs = user.prefs || {}
      
      return !!(
        prefs.profileCompleted && 
        prefs.fullName && 
        prefs.phoneNumber && 
        prefs.matricNumber
      )
    } catch (error) {
      console.error("Error checking profile completion:", error)
      return false
    }
  }
}
