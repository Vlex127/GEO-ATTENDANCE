import { ThemeProvider } from "@/contexts/theme-context"
import "./app.css"

export const metadata = {
  title: "GEO ATTENDANCE - LASU AMS",
  description: "Location-based attendance tracking system for LASU",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/lasu.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter:opsz,wght@14..32,100..900&family=Poppins:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-background text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
