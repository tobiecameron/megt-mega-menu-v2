"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

type UserCaptureOverlayProps = {
  onUserCaptured: (userName: string) => void
}

export function UserCaptureOverlay({ onUserCaptured }: UserCaptureOverlayProps) {
  const [userName, setUserName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Update the handleSubmit function to ensure user data is properly saved
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userName.trim()) return

    setIsSubmitting(true)

    try {
      // First, store the user name in localStorage directly
      localStorage.setItem("megtUserName", userName.trim())

      // Format date for sheet name
      const date = new Date()
      const formattedDate = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
      const formattedTime = `${date.getHours()}:${date.getMinutes()}`
      const calculatedSheetName = `${userName.trim()} ${formattedDate} ${formattedTime}`.substring(0, 31)

      // Store session start time and sheet name in localStorage
      localStorage.setItem("megtSessionStart", date.toISOString())
      localStorage.setItem("megtSheetName", calculatedSheetName)

      console.log("User session data saved to localStorage:", {
        userName: userName.trim(),
        sessionStart: date.toISOString(),
        sheetName: calculatedSheetName,
      })

      // Call the callback to update the parent component
      onUserCaptured(userName.trim())

      // Try to initialize the session in Google Sheets, but don't block on it
      try {
        const response = await fetch("/api/sheets/init-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: userName.trim(),
            sessionStartTime: date.toISOString(),
            sheetName: calculatedSheetName,
          }),
        })

        const data = await response.json()
        console.log("Sheet initialization response:", data)
      } catch (error) {
        console.error("Error initializing sheet, but continuing session:", error)
        // We don't fail the user capture if sheet initialization fails
      }
    } catch (error) {
      console.error("Error initializing session:", error)
      alert("There was an error starting your session. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 48, 135, 0.95)", // Deep blue with opacity
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "2rem",
          width: "90%",
          maxWidth: "500px",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <Image
            src="/logo-pos.svg"
            alt="MEGT Logo"
            width={180}
            height={60}
            style={{ height: "auto", margin: "0 auto" }}
          />
        </div>

        <h2 style={{ color: "#003087", marginBottom: "1.5rem" }}>Welcome to MEGT Mega Menu testing</h2>

        <p style={{ marginBottom: "2rem", color: "#4b5563" }}>
          Please enter your name to begin the session. Your interactions will be recorded for testing purposes.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                fontSize: "1rem",
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !userName.trim()}
            style={{
              backgroundColor: "#003087",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: isSubmitting || !userName.trim() ? "not-allowed" : "pointer",
              opacity: isSubmitting || !userName.trim() ? 0.7 : 1,
            }}
          >
            {isSubmitting ? "Starting Session..." : "Start Session"}
          </button>
        </form>
      </div>
    </div>
  )
}
