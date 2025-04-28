"use client"

import { Search, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useMenuInteractions } from "./menu-interaction-context"

type SecondaryNavProps = {
  items?: Array<{
    _id: string
    title: string
    itemType: string
    buttonText?: string
    buttonUrl?: string
    placement?: string
    order?: number
    hidden?: boolean
  }>
  otherItems?: Array<{
    _id: string
    title: string
    itemType: string
    buttonText?: string
    buttonUrl?: string
    placement?: string
    order?: number
    hidden?: boolean
  }>
}

export function SecondaryNav({ items = [], otherItems = [] }: SecondaryNavProps) {
  const { addInteraction, showNotification } = useMenuInteractions()

  const handleItemClick = (label: string, url: string) => {
    addInteraction(`Secondary Nav: ${label}`, url)
    showNotification(label)
  }

  const handleSearchClick = () => {
    addInteraction("Secondary Nav: Search", "/search")
    showNotification("Search")
  }

  const handleActionButtonClick = (text: string, url?: string) => {
    addInteraction(`Action Button: ${text} (clicked)`, url || "#")
    showNotification(`Action Button: ${text} (clicked)`)
  }

  // Render secondary nav items (links)
  const renderNavItems = () => {
    if (items.length === 0) return null

    return items.map((item) => {
      if (item.hidden) return null

      return (
        <button
          key={item._id}
          onClick={() => handleItemClick(item.title, item.buttonUrl || "#")}
          style={{
            backgroundColor: "#ffb612",
            color: "#000000",
            padding: "0.25rem 0.75rem",
            borderRadius: "0.25rem",
            fontWeight: "500",
            fontSize: "0.805rem", // Changed from 0.92rem to 0.805rem
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s ease-in-out",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#003087" // Change from #e6a410 to #003087 (dark blue)
            e.currentTarget.style.color = "#ffffff" // Add white text color
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#ffb612" // Back to original yellow
            e.currentTarget.style.color = "#000000" // Back to original black text
          }}
        >
          {item.title}
        </button>
      )
    })
  }

  // Render action buttons
  const renderActionButtons = () => {
    if (!otherItems || otherItems.length === 0) return null

    return otherItems.map((item) => {
      if (item.itemType === "actionButton") {
        return (
          <Link
            key={item._id}
            href={item.buttonUrl || "#"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.25rem 0.75rem",
              backgroundColor: "#003087", // Blue background
              color: "#ffffff", // White text
              borderRadius: "0.25rem",
              fontWeight: "500",
              fontSize: "0.805rem", // Changed from 0.92rem to 0.805rem
              textDecoration: "none",
              marginLeft: "0.5rem",
            }}
            onMouseEnter={(e) => {
              // Find the arrow icon
              const arrow = e.currentTarget.querySelector("svg")
              if (arrow) {
                arrow.style.strokeWidth = "3" // Make arrow bold
              }
            }}
            onMouseLeave={(e) => {
              // Find the arrow icon
              const arrow = e.currentTarget.querySelector("svg")
              if (arrow) {
                arrow.style.strokeWidth = "2" // Reset to normal weight
              }
            }}
            onClick={(e) => {
              e.preventDefault() // Prevent actual navigation for testing
              handleActionButtonClick(item.buttonText || "Action", item.buttonUrl)
            }}
          >
            <span>{item.buttonText || "Action"}</span>
            <ArrowRight size={14} color="#ffb612" /> {/* Yellow arrow */}
          </Link>
        )
      }
      return null
    })
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "1rem",
        width: "100%", // Take full width of container
        height: "100%", // Take full height of container
      }}
    >
      {renderNavItems()}

      <button
        onClick={handleSearchClick}
        style={{
          backgroundColor: "transparent",
          color: "#003087", // Changed from yellow to deep blue
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.25rem",
          borderRadius: "0.25rem",
          border: "none",
          cursor: "pointer",
          transition: "color 0.2s ease-in-out",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.color = "#002266" // Darker blue on hover
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = "#003087"
        }}
        aria-label="Search"
      >
        <Search size={18} />
      </button>

      {/* Action buttons */}
      {renderActionButtons()}
    </div>
  )
}
