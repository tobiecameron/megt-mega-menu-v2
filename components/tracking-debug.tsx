"use client"

import { useState, useEffect } from "react"

// Create a safe version that doesn't use the hook directly
export function TrackingDebug() {
  const [showDebug, setShowDebug] = useState(false)
  const [envVars, setEnvVars] = useState(null)
  const [failedLogs, setFailedLogs] = useState([])
  const [isRetrying, setIsRetrying] = useState(false)
  const [localInteractions, setLocalInteractions] = useState([])

  // Check if we're in a client component
  useEffect(() => {
    // Load environment variables
    const checkEnvVars = async () => {
      try {
        const response = await fetch("/api/check-env")
        if (response.ok) {
          const data = await response.json()
          setEnvVars(data)
        }
      } catch (error) {
        console.error("Error checking environment variables:", error)
      }
    }

    // Load failed logs
    const loadFailedLogs = () => {
      try {
        const failedLogsJson = localStorage.getItem("megtFailedLogs")
        if (failedLogsJson) {
          const logs = JSON.parse(failedLogsJson)
          setFailedLogs(logs)
        }
      } catch (error) {
        console.error("Error loading failed logs:", error)
      }
    }

    // Load local interactions
    const loadLocalInteractions = () => {
      try {
        const localInteractionsJson = localStorage.getItem("megtLocalInteractions")
        if (localInteractionsJson) {
          const interactions = JSON.parse(localInteractionsJson)
          setLocalInteractions(interactions)
        }
      } catch (error) {
        console.error("Error loading local interactions:", error)
      }
    }

    if (showDebug) {
      checkEnvVars()
      loadFailedLogs()
      loadLocalInteractions()

      // Refresh data every 10 seconds
      const interval = setInterval(() => {
        checkEnvVars()
        loadFailedLogs()
        loadLocalInteractions()
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [showDebug])

  // Function to clear failed logs
  const handleClearFailedLogs = () => {
    if (confirm("Are you sure you want to clear all failed logs? This cannot be undone.")) {
      localStorage.removeItem("megtFailedLogs")
      setFailedLogs([])
    }
  }

  // Function to clear local interactions
  const handleClearLocalInteractions = () => {
    if (confirm("Are you sure you want to clear all local interactions? This cannot be undone.")) {
      localStorage.removeItem("megtLocalInteractions")
      setLocalInteractions([])
    }
  }

  // Function to export local interactions as CSV
  const handleExportCSV = () => {
    try {
      // Create a CSV string
      let csv = "Timestamp,User,Interaction,URL\n"
      localInteractions.forEach((interaction) => {
        csv += `"${new Date(interaction.timestamp).toLocaleString()}","${interaction.userName || "Unknown"}","${interaction.title}","${interaction.url}"\n`
      })

      // Create a download link
      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.setAttribute("hidden", "")
      a.setAttribute("href", url)
      a.setAttribute("download", `interactions-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting CSV:", error)
      alert("Error exporting CSV")
    }
  }

  // Function to reset user session
  const handleResetUserSession = () => {
    localStorage.removeItem("megtUserName")
    localStorage.removeItem("megtSessionStart")
    localStorage.removeItem("megtSheetName")
    alert("User session reset. The page will now reload.")
    window.location.reload()
  }

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(true)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Debug Tracking
        </button>
      </div>
    )
  }

  // Get user info from localStorage directly
  const userName = localStorage.getItem("megtUserName") || "Not set"
  const sessionStartTime = localStorage.getItem("megtSessionStart")
  const formattedSessionTime = sessionStartTime ? new Date(sessionStartTime).toLocaleString() : "Not set"

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border border-gray-300 w-96 max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Tracking Debug</h3>
        <button onClick={() => setShowDebug(false)} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <h4 className="font-semibold">User Session</h4>
          <p>User Name: {userName}</p>
          <p>Session Start: {formattedSessionTime}</p>
        </div>

        <div>
          <h4 className="font-semibold">Environment Variables</h4>
          {envVars ? (
            <>
              <p>GOOGLE_CLIENT_EMAIL: {envVars.hasGoogleClientEmail ? "✅ Set" : "❌ Missing"}</p>
              {envVars.hasGoogleClientEmail && envVars.clientEmailPrefix && (
                <p className="text-xs text-gray-500">Prefix: {envVars.clientEmailPrefix}...</p>
              )}
              <p>GOOGLE_PRIVATE_KEY: {envVars.hasGooglePrivateKey ? "✅ Set" : "❌ Missing"}</p>
              {envVars.hasGooglePrivateKey && envVars.privateKeyFormat && (
                <p className="text-xs text-gray-500">Format: {envVars.privateKeyFormat}</p>
              )}
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div>
          <h4 className="font-semibold">Failed Logs ({failedLogs.length})</h4>
          {failedLogs.length > 0 ? (
            <>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2 mb-2">
                <ul className="list-disc pl-5">
                  {failedLogs.map((log, index) => (
                    <li key={index} className="text-xs mb-1">
                      {new Date(log.timestamp).toLocaleTimeString()} - {log.title}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleClearFailedLogs}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs flex-1"
                >
                  Clear All
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">No failed logs</p>
          )}
        </div>

        {/* Local Interactions Section */}
        <div>
          <h4 className="font-semibold">Local Interactions ({localInteractions.length})</h4>
          {localInteractions.length > 0 ? (
            <>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2 mb-2">
                <ul className="list-disc pl-5">
                  {localInteractions.slice(0, 10).map((interaction, index) => (
                    <li key={index} className="text-xs mb-1">
                      {new Date(interaction.timestamp).toLocaleTimeString()} - {interaction.title}
                    </li>
                  ))}
                  {localInteractions.length > 10 && (
                    <li className="text-xs text-gray-500">...and {localInteractions.length - 10} more</li>
                  )}
                </ul>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleClearLocalInteractions}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs flex-1"
                >
                  Clear Local Interactions
                </button>
                <button
                  onClick={handleExportCSV}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-xs flex-1"
                >
                  Export CSV
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">No local interactions</p>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Actions</h4>

          <button
            onClick={handleResetUserSession}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs w-full"
          >
            Reset User Session
          </button>

          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-xs w-full"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}
