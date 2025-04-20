"use client"

import { useMenuInteractions } from "./menu-interaction-context"
import { useEffect, useState } from "react"

export function Notification() {
  const { currentNotification } = useMenuInteractions()
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (currentNotification) {
      setVisible(true)
      setFading(false)

      // Start fading after 2 seconds
      const fadeTimer = setTimeout(() => {
        setFading(true)
      }, 2000)

      return () => clearTimeout(fadeTimer)
    } else {
      setVisible(false)
      setFading(false)
    }
  }, [currentNotification])

  if (!visible) return null

  return (
    <div
      style={{
        position: "fixed",
        bottom: "0",
        left: "0",
        width: "100%",
        backgroundColor: "#003087", // Match footer background
        color: "#ffb612", // Yellow text
        padding: "0.75rem 0",
        fontWeight: "500",
        fontSize: "1rem",
        textAlign: "center",
        transition: "opacity 1s ease-out",
        opacity: fading ? 0 : 1,
        zIndex: 10,
        borderTop: "1px solid rgba(255, 255, 255, 0.2)", // Match the horizontal rule line
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", paddingLeft: "10px", paddingRight: "10px" }}>
        Link clicked: {currentNotification}
      </div>
    </div>
  )
}

