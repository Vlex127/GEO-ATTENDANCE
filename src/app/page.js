"use client";
import React, { useState, useEffect } from "react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import "./app.css";
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  return (
    <button
  onClick={toggleTheme}
  className="fixed top-4 right-4 z-50 rounded-lg p-2 shadow-lg hover:shadow-xl transition-all bg-transparent"
  aria-label="Toggle theme"
>
  {isDark ? (
    <img src="/dark.svg" alt="Dark theme" className="h-5 w-5" />
  ) : (
    <img src="/light.svg" alt="Light theme" className="h-5 w-5" />
  )}
</button>
  );
}

export default function BackgroundRippleEffectDemo() {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-start justify-start overflow-hidden">
      <ThemeToggle />
      <BackgroundRippleEffect />
      <div className="mt-60 w-full">
        <h2
          className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-neutral-800 md:text-4xl lg:text-7xl dark:text-neutral-100">
          LASU ATTENDANCE MANAGEMENT SYSTEM
        </h2>
        <p
          className="relative z-10 mx-auto mt-4 max-w-xl text-center text-neutral-800 dark:text-neutral-500">
          An comprehensive attendance management system designed to streamline and enhance the
          process of tracking and managing attendance records efficiently.
        </p>
        
        <div className="relative z-10 mx-auto mt-8 flex max-w-md justify-center gap-4">
                  <a
  href="/login"
  className="rounded-md border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
>
  Login
</a>
            
          <a 
            href="/signup"
            className="rounded-md border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
}
