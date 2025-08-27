"use client"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">GEO ATTENDANCE - Home</h1>
        <p>Welcome to the attendance tracking system!</p>
        <div className="mt-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-card text-card-foreground rounded-lg border p-6">
              <h3 className="font-semibold mb-2">Check In</h3>
              <p className="text-sm text-muted-foreground mb-4">Mark your arrival at the location</p>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                📍 Check In
              </button>
            </div>
            <div className="bg-card text-card-foreground rounded-lg border p-6">
              <h3 className="font-semibold mb-2">Check Out</h3>
              <p className="text-sm text-muted-foreground mb-4">Mark your departure from the location</p>
              <button className="border border-input px-4 py-2 rounded-md">
                📤 Check Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
