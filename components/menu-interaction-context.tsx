"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type MenuInteraction = {
  title: string
  url: string
  timestamp: Date
}

type MenuInteractionContextType = {
  interactions: MenuInteraction[]
  addInteraction: (title: string, url: string) => void
  showNotification: (title: string) => void
  currentNotification: string | null
  userName: string | null
  setUserName: (name: string) => void
  sessionStartTime: string | null
  handleJobBoardClick: () => void
}

const MenuInteractionContext = createContext<MenuInteractionContextType | undefined>(undefined)

export function MenuInteractionProvider({ children }: { children: React.ReactNode }) {
  const [interactions, setInteractions] = useState<MenuInteraction[]>([])
  const [currentNotification, setCurrentNotification] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)
  const [sheetName, setSheetName] = useState<string | null>(null)

  // Load user info from localStorage on mount
  useEffect(() => {
    const storedUserName = localStorage.getItem("megtUserName")
    const storedSessionStart = localStorage.getItem("megtSessionStart")
    const storedSheetName = localStorage.getItem("megtSheetName") // Get directly stored sheet name

    console.log("Loading from localStorage:", {
      storedUserName,
      storedSessionStart,
      storedSheetName,
    })

    if (storedUserName) setUserName(storedUserName)
    if (storedSessionStart) setSessionStartTime(storedSessionStart)

    // Prefer directly stored sheet name if available
    if (storedSheetName) {
      setSheetName(storedSheetName)
      console.log("Using stored sheet name:", storedSheetName)
    } else if (storedUserName && storedSessionStart) {
      // Calculate sheet name as fallback
      const date = new Date(storedSessionStart)
      const formattedDate = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
      const formattedTime = `${date.getHours()}:${date.getMinutes()}`
      const calculatedSheetName = `${storedUserName} ${formattedDate} ${formattedTime}`.substring(0, 31)
      setSheetName(calculatedSheetName)
      console.log("Calculated sheet name:", calculatedSheetName)

      // Store the calculated sheet name for consistency
      localStorage.setItem("megtSheetName", calculatedSheetName)
    }
  }, [])

  const addInteraction = async (title: string, url: string) => {
    const timestamp = new Date()
    const newInteraction = {
      title,
      url,
      timestamp,
    }

    // Add new interactions to the beginning of the array (newest first)
    setInteractions((prev) => [newInteraction, ...prev])

    // Debug information
    console.log("Interaction triggered:", { title, url })
    console.log("User info for logging:", { userName, sheetName })

    // Log to Google Sheets if we have user info and the required environment variables
    if (userName && sheetName && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      console.log("Attempting to log to Google Sheets")
      try {
        const response = await fetch("/api/sheets/log-interaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            url,
            userName,
            sheetName,
            timestamp: timestamp.toISOString(),
          }),
        })

        const data = await response.json()

        if (response.ok) {
          console.log("Successfully logged to Google Sheets:", data)
        } else {
          console.error("Failed to log to Google Sheets:", data)
        }
      } catch (error) {
        console.error("Error logging interaction to Google Sheets:", error)
      }
    } else {
      console.log("Skipping Google Sheets logging - missing required info or environment variables")
      if (!userName) console.log("userName is missing")
      if (!sheetName) console.log("sheetName is missing")
      if (!process.env.GOOGLE_CLIENT_EMAIL) console.log("GOOGLE_CLIENT_EMAIL environment variable is missing")
      if (!process.env.GOOGLE_PRIVATE_KEY) console.log("GOOGLE_PRIVATE_KEY environment variable is missing")
    }
  }

  const showNotification = (title: string) => {
    setCurrentNotification(title)

    // Clear notification after 3 seconds (2s display + 1s fade)
    setTimeout(() => {
      setCurrentNotification(null)
    }, 3000)
  }

  // Update user name and session info
  const handleSetUserName = (name: string) => {
    setUserName(name)
    const currentTime = new Date().toISOString()
    setSessionStartTime(currentTime)

    // Calculate sheet name
    const date = new Date(currentTime)
    const formattedDate = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
    const formattedTime = `${date.getHours()}:${date.getMinutes()}`
    const calculatedSheetName = `${name} ${formattedDate} ${formattedTime}`.substring(0, 31)

    // Set and store the sheet name
    setSheetName(calculatedSheetName)
    localStorage.setItem("megtSheetName", calculatedSheetName)
    console.log("New session started with sheet name:", calculatedSheetName)
  }

  const handleJobBoardClick = () => {
    addInteraction("Job Board (clicked)", "/jobs")
    showNotification("Job Board (clicked)")
  }

  return (
    <MenuInteractionContext.Provider
      value={{
        interactions,
        addInteraction,
        showNotification,
        currentNotification,
        userName,
        setUserName: handleSetUserName,
        sessionStartTime,
        handleJobBoardClick,
      }}
    >
      {children}
    </MenuInteractionContext.Provider>
  )
}

export function useMenuInteractions() {
  const context = useContext(MenuInteractionContext)
  if (context === undefined) {
    throw new Error("useMenuInteractions must be used within a MenuInteractionProvider")
  }
  return context
}
