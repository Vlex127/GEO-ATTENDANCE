# Appwrite Database Setup Guide

Your application requires a database and collections to be created in your Appwrite project. Follow these steps to set it up:

## 1. Access Appwrite Console
1. Go to [Appwrite Console](https://cloud.appwrite.io/console)
2. Log in and select your project

## 2. Create Database
1. Go to **Databases** in the left sidebar
2. Click **Create Database**
3. Set Database ID: `main` (or update your .env file with a different ID)
4. Set Database Name: `GEO Attendance Main`
5. Click **Create**

## 3. Create User Profiles Collection
1. Inside your database, click **Create Collection**
2. Set Collection ID: `user_profiles`
3. Set Collection Name: `User Profiles`
4. Click **Create**

### Add Attributes to User Profiles Collection:
1. Click on the `user_profiles` collection
2. Go to **Attributes** tab
3. Click **Create Attribute** for each of these:

**Required Attributes (add these first):**
- `userId` (String, Size: 255, Required: ✓)
- `fullName` (String, Size: 255, Required: ✓)  
- `phoneNumber` (String, Size: 50, Required: ✓)
- `matricNumber` (String, Size: 50, Required: ✓)

**Optional Attributes:**
- `department` (String, Size: 255, Required: ✗)
- `level` (String, Size: 50, Required: ✗)

> **Important:** You must add these attributes one by one by clicking "Create Attribute" for each field!

### Set Permissions:
1. Go to **Settings** tab in the collection
2. Set **Read Access**: `Users`
3. Set **Write Access**: `Users`
4. Or set specific permissions as needed for your security requirements

## 4. Create Attendance Records Collection (Optional - for future use)
1. Create another collection with ID: `attendance_records`
2. Add attributes:

| Attribute Key | Type | Size | Required |
|---------------|------|------|----------|
| `userId` | String | 255 | Yes |
| `type` | String | 20 | Yes |
| `timestamp` | String | 255 | Yes |
| `location` | String | 255 | No |
| `latitude` | Float | - | No |
| `longitude` | Float | - | No |
| `createdAt` | String | 255 | Yes |

## 5. Update Environment Variables
Make sure your `.env.local` file contains:
```
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_DATABASE_ID=main
NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES=user_profiles
NEXT_PUBLIC_APPWRITE_COLLECTION_ATTENDANCE=attendance_records
```

## 6. Test the Setup
1. Try signing up for a new account
2. Complete the profile form
3. The data should now be saved successfully

## Common Issues:
- **Database not found**: Make sure the database ID matches your environment variable
- **Collection not found**: Ensure collection IDs match your environment variables
- **Permission denied**: Check collection permissions allow Users to read/write
- **Attribute errors**: Ensure all required attributes are created with correct types

## Need Help?
Check the Appwrite documentation: https://appwrite.io/docs/databases
