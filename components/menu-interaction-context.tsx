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
  resetUserSession: () => void
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
    try {
      const storedUserName = localStorage.getItem("megtUserName")
      const storedSessionStart = localStorage.getItem("megtSessionStart")
      const storedSheetName = localStorage.getItem("megtSheetName")

      console.log("Loading from localStorage:", {
        storedUserName,
        storedSessionStart,
        storedSheetName,
      })

      if (storedUserName) setUserName(storedUserName)
      if (storedSessionStart) setSessionStartTime(storedSessionStart)
      if (storedSheetName) setSheetName(storedSheetName)

      // Retry failed logs after a short delay
      setTimeout(() => {
        retryFailedLogs()
      }, 5000)
    } catch (error) {
      console.error("Error loading from localStorage:", error)
    }
  }, [])

  // Update the addInteraction function to handle missing user info better
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

    // Get the latest values from state and localStorage
    const currentUserName = userName || localStorage.getItem("megtUserName")
    const currentSheetName = sheetName || localStorage.getItem("megtSheetName")

    console.log("User info for logging:", { userName: currentUserName, sheetName: currentSheetName })

    // Check for environment variables
    const hasGoogleCredentials = await checkGoogleCredentials()

    // Log to Google Sheets if we have user info and credentials
    if (currentUserName && currentSheetName) {
      if (hasGoogleCredentials) {
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
              userName: currentUserName,
              sheetName: currentSheetName,
              timestamp: timestamp.toISOString(),
            }),
          })

          const data = await response.json()

          if (response.ok) {
            console.log("Successfully logged to Google Sheets:", data)
          } else {
            console.error("Failed to log to Google Sheets:", data)
            // Store failed logs for retry later
            storeFailedLog({ title, url, userName: currentUserName, sheetName: currentSheetName, timestamp })
          }
        } catch (error) {
          console.error("Error logging interaction to Google Sheets:", error)
          // Store failed logs for retry later
          storeFailedLog({ title, url, userName: currentUserName, sheetName: currentSheetName, timestamp })
        }
      } else {
        console.log("Google Sheets credentials not available - storing interaction locally")
        // Store logs locally when Google credentials aren't available
        storeFailedLog({ title, url, userName: currentUserName, sheetName: currentSheetName, timestamp })
      }
    } else {
      console.log("Not logging to Google Sheets - missing user info")
      if (!currentUserName) console.log("userName is missing")
      if (!currentSheetName) console.log("sheetName is missing")

      // Try to recover from localStorage one more time
      const recoveredUserName = localStorage.getItem("megtUserName")
      const recoveredSheetName = localStorage.getItem("megtSheetName")

      if (recoveredUserName && recoveredSheetName) {
        console.log("Attempting recovery with stored values")
        try {
          const response = await fetch("/api/sheets/log-interaction", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              url,
              userName: recoveredUserName,
              sheetName: recoveredSheetName,
              timestamp: timestamp.toISOString(),
            }),
          })

          const data = await response.json()
          console.log("Recovery attempt result:", data)

          // Update state with recovered values
          setUserName(recoveredUserName)
          setSheetName(recoveredSheetName)

          return
        } catch (error) {
          console.error("Recovery attempt failed:", error)
        }
      }

      // If user info is missing and recovery failed, we should prompt the user to enter their name
      localStorage.removeItem("megtUserName")
      localStorage.removeItem("megtSessionStart")
      localStorage.removeItem("megtSheetName")

      // Force a page reload to show the user capture overlay
      window.location.reload()
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
  const handleSetUserName = async (name: string) => {
    if (!name || name.trim() === "") return

    try {
      // Format date for sheet name
      const date = new Date()
      const formattedDate = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
      const formattedTime = `${date.getHours()}:${date.getMinutes()}`
      const calculatedSheetName = `${name} ${formattedDate} ${formattedTime}`.substring(0, 31)

      // Update state
      setUserName(name)
      setSessionStartTime(date.toISOString())
      setSheetName(calculatedSheetName)

      // Store in localStorage
      localStorage.setItem("megtUserName", name)
      localStorage.setItem("megtSessionStart", date.toISOString())
      localStorage.setItem("megtSheetName", calculatedSheetName)

      console.log("User session updated:", {
        name,
        sessionStart: date.toISOString(),
        sheetName: calculatedSheetName,
      })

      // Initialize sheet in Google Sheets
      try {
        const response = await fetch("/api/sheets/init-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: name,
            sessionStartTime: date.toISOString(),
            sheetName: calculatedSheetName,
          }),
        })

        const data = await response.json()
        console.log("Sheet initialization response:", data)
      } catch (error) {
        console.error("Error initializing sheet:", error)
      }
    } catch (error) {
      console.error("Error setting user name:", error)
    }
  }

  const handleJobBoardClick = () => {
    addInteraction("Job Board (clicked)", "/jobs")
    showNotification("Job Board (clicked)")
  }

  // Add these new helper functions to the component
  const checkGoogleCredentials = async () => {
    try {
      const response = await fetch("/api/check-env")
      if (response.ok) {
        const data = await response.json()
        const hasCredentials = data.hasGoogleClientEmail && data.hasGooglePrivateKey

        if (!data.hasGoogleClientEmail) {
          console.log("GOOGLE_CLIENT_EMAIL environment variable is missing")
        }
        if (!data.hasGooglePrivateKey) {
          console.log("GOOGLE_PRIVATE_KEY environment variable is missing")
        }

        return hasCredentials
      }
      return false
    } catch (error) {
      console.error("Error checking Google credentials:", error)
      return false
    }
  }

  const storeFailedLog = (log) => {
    try {
      // Get existing failed logs
      const failedLogsJson = localStorage.getItem("megtFailedLogs")
      const failedLogs = failedLogsJson ? JSON.parse(failedLogsJson) : []

      // Add new failed log
      failedLogs.push({
        ...log,
        timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : log.timestamp,
      })

      // Store back in localStorage
      localStorage.setItem("megtFailedLogs", JSON.stringify(failedLogs))
      console.log("Stored failed log for later retry", log)
    } catch (error) {
      console.error("Error storing failed log:", error)
    }
  }

  // Add a new function to retry failed logs
  const retryFailedLogs = async () => {
    try {
      const failedLogsJson = localStorage.getItem("megtFailedLogs")
      if (!failedLogsJson) return

      const failedLogs = JSON.parse(failedLogsJson)
      if (failedLogs.length === 0) return

      console.log(`Attempting to retry ${failedLogs.length} failed logs`)

      const hasGoogleCredentials = await checkGoogleCredentials()
      if (!hasGoogleCredentials) {
        console.log("Google credentials still not available - skipping retry")
        return
      }

      const successfulRetries = []

      for (const log of failedLogs) {
        try {
          const response = await fetch("/api/sheets/log-interaction", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: log.title,
              url: log.url,
              userName: log.userName,
              sheetName: log.sheetName,
              timestamp: log.timestamp,
            }),
          })

          if (response.ok) {
            successfulRetries.push(log)
            console.log("Successfully retried log:", log)
          }
        } catch (error) {
          console.error("Error retrying log:", error)
        }
      }

      // Remove successful retries from failed logs
      if (successfulRetries.length > 0) {
        const remainingLogs = failedLogs.filter(
          (log) =>
            !successfulRetries.some((success) => success.title === log.title && success.timestamp === log.timestamp),
        )

        localStorage.setItem("megtFailedLogs", JSON.stringify(remainingLogs))
        console.log(`Retried ${successfulRetries.length} logs successfully, ${remainingLogs.length} remaining`)
      }
    } catch (error) {
      console.error("Error in retryFailedLogs:", error)
    }
  }

  // Add resetUserSession function
  const resetUserSession = () => {
    localStorage.removeItem("megtUserName")
    localStorage.removeItem("megtSessionStart")
    localStorage.removeItem("megtSheetName")
    setUserName(null)
    setSessionStartTime(null)
    setSheetName(null)
    console.log("User session reset")

    // Force a page reload to show the user capture overlay
    window.location.reload()
  }

  // Update the context provider value to include resetUserSession
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
        resetUserSession, // Add this to the context
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
