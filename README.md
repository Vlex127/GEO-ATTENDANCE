# GEO ATTENDANCE

A location-based attendance tracking system built with Next.js and Appwrite. Employees can clock in/out only when they are within designated geographic boundaries.

## 🚀 Getting started

### Clone the Project
Clone this repository to your local machine using Git:

`git clone https://github.com/Vlex127/GEO-ATTENDANCE`

## 🛠️ Development Guide
1. **Configure Appwrite**<br/>
   Navigate to `.env` and update the values to match your Appwrite project credentials.
2. **Install dependencies**<br/>
   Run `npm install` to install all dependencies.
3. **Run the app**<br/>
   Start the project by running `npm run dev`.

## 📍 Features
- **Location-based check-in/out**: Employees can only clock in when within designated areas
- **Real-time attendance tracking**: Monitor employee attendance status
- **Geographic boundaries**: Admin can set and manage location boundaries
- **User authentication**: Secure login/logout with Appwrite auth

## 💡 Additional notes
- This project uses Appwrite for backend services including authentication and database
- Geolocation API is used to verify employee location during attendance marking
- Refer to the [Appwrite documentation](https://appwrite.io/docs) for detailed integration guidance.