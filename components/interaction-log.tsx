"use client"

import { useMenuInteractions } from "./menu-interaction-context"
import { useRouter } from "next/navigation"

export function InteractionLog() {
  const { interactions, userName, sessionStartTime } = useMenuInteractions()
  const router = useRouter()

  // Format the session start time for display
  const formattedStartTime = sessionStartTime
    ? new Date(sessionStartTime).toLocaleString()
    : new Date().toLocaleString()

  // Handle ending the session
  const handleEndSession = () => {
    // Clear user data from localStorage
    localStorage.removeItem("megtUserName")
    localStorage.removeItem("megtSessionStart")
    localStorage.removeItem("megtSheetName")

    // Refresh the page to show the login overlay
    window.location.reload()
  }

  if (interactions.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          borderRadius: "0.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px", // Minimum height instead of fixed height
          width: "100%", // Take full width of container
        }}
      >
        <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.8rem" }}>
          No interactions yet. Click on a menu item to see it logged here.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        width: "100%", // Take full width of container
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#ffb612", margin: 0 }}>
          Interaction Log {userName ? `- ${userName}` : ""}
        </h2>

        {/* End Session button */}
        <button
          onClick={handleEndSession}
          style={{
            backgroundColor: "#003087", // Blue background
            color: "#add8e6", // Light blue text
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "0.375rem",
            padding: "0.35rem 0.75rem",
            fontSize: "0.805rem",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          End Session
        </button>
      </div>

      <p style={{ fontSize: "0.92rem", marginBottom: "1rem", color: "rgba(255, 255, 255, 0.7)" }}>
        Session started: {formattedStartTime}
      </p>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.75rem",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffb612",
                  backgroundColor: "rgba(0, 48, 135, 0.8)", // Semi-transparent blue background
                  fontSize: "0.8rem", // Reduced font size
                }}
              >
                Time
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.75rem",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffb612",
                  backgroundColor: "rgba(0, 48, 135, 0.8)", // Semi-transparent blue background
                  fontSize: "0.8rem", // Reduced font size
                }}
              >
                Link
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.75rem",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffb612",
                  backgroundColor: "rgba(0, 48, 135, 0.8)", // Semi-transparent blue background
                  fontSize: "0.8rem", // Reduced font size
                }}
              >
                URL
              </th>
            </tr>
          </thead>
          <tbody>
            {interactions.map((interaction, index) => (
              <tr key={index}>
                <td
                  style={{
                    padding: "0.75rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "0.8rem", // Reduced font size
                  }}
                >
                  {interaction.timestamp.toLocaleTimeString()}
                </td>
                <td
                  style={{
                    padding: "0.75rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "0.8rem", // Reduced font size
                    fontFamily: "monospace", // Use monospace font to preserve indentation
                    whiteSpace: "pre-wrap", // Preserve whitespace and wrap text
                  }}
                >
                  {interaction.title}
                </td>
                <td
                  style={{
                    padding: "0.75rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "0.8rem", // Reduced font size
                  }}
                >
                  {interaction.url}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

