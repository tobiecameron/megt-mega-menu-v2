"use client"

import { MegaMenu } from "@/components/mega-menu"
import { SecondaryNav } from "@/components/secondary-nav"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { MenuInteractionProvider } from "@/components/menu-interaction-context"
import { InteractionLog } from "@/components/interaction-log"
import { UserCaptureOverlay } from "@/components/user-capture-overlay"
import { useEffect, useState } from "react"

export default function Home() {
  const [menuData, setMenuData] = useState({ items: [], otherItems: [] })
  const [footerData, setFooterData] = useState({
    items: [],
    otherItems: [],
    columns: [],
    policyLinks: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUserCapture, setShowUserCapture] = useState(true)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    // Check if user info is already in localStorage
    const storedUserName = localStorage.getItem("megtUserName")
    if (storedUserName) {
      setUserName(storedUserName)
      setShowUserCapture(false)
    }

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch menu data from API route
        const menuResponse = await fetch("/api/menu")
        if (!menuResponse.ok) {
          throw new Error(`Failed to fetch menu data: ${menuResponse.statusText}`)
        }
        const menuData = await menuResponse.json()
        setMenuData(menuData || { items: [], otherItems: [] })

        // Fetch footer data from API route
        const footerResponse = await fetch("/api/footer")
        if (!footerResponse.ok) {
          throw new Error(`Failed to fetch footer data: ${footerResponse.statusText}`)
        }
        const footerData = await footerResponse.json()
        setFooterData(
          footerData || {
            items: [],
            otherItems: [],
            columns: [],
            policyLinks: [],
          },
        )
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle user capture completion
  const handleUserCaptured = (name: string) => {
    setUserName(name)
    setShowUserCapture(false)
  }

  // Overlay opacity (0 to 1, where 1 is fully opaque)
  const overlayOpacity = 0.85
  const initialOverlayOpacity = 0.8

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen flex-col">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  // Filter secondary nav items from otherItems
  const secondaryNavItems = menuData.otherItems.filter(
    (item) => !item.hidden && item.placement === "headerSecondary" && item.itemType === "secondaryNavLink",
  )

  // Filter secondary nav action buttons
  const secondaryNavActionButtons = menuData.otherItems.filter(
    (item) => !item.hidden && item.placement === "headerSecondary" && item.itemType === "actionButton",
  )

  return (
    <MenuInteractionProvider>
      {showUserCapture && <UserCaptureOverlay onUserCaptured={handleUserCaptured} />}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          position: "relative", // For positioning the video background
          paddingBottom: "250px", // Add padding to account for the fixed footer height
        }}
      >
        {/* Video Background with Gradient Fade - 0.6 opacity until 80% down */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -2, // Behind everything
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `linear-gradient(to bottom, 
              rgba(0, 48, 135, ${initialOverlayOpacity}) 0%, 
              rgba(0, 48, 135, ${initialOverlayOpacity}) 80%, 
              rgba(0, 48, 135, ${overlayOpacity}) 100%)`,
              zIndex: 1,
            }}
          />
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top", // Align video to the top
            }}
          >
            <source src="/5_Engineering.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Blue background overlay - separate from gradient */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#003087", // Royal blue
            opacity: overlayOpacity,
            zIndex: -3, // Behind video but visible where video is transparent
          }}
        />

        {/* Header with logo and navigation - Sticky */}
        <header
          style={{
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent white
            position: "sticky",
            top: 0,
            zIndex: 10, // Ensure it's above other content
            height: "100px", // Fixed height for the entire header
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              paddingLeft: "10px",
              paddingRight: "10px",
              position: "relative", // For absolute positioning of logo
              height: "100%", // Take full height of header
            }}
          >
            {/* Logo positioned to span full height */}
            <div
              style={{
                position: "absolute",
                left: "10px", // Match container padding
                top: "50%",
                transform: "translateY(-50%)",
                height: "100%",
                display: "flex",
                alignItems: "center",
                zIndex: 2,
              }}
            >
              <Image
                src="/logo-pos.svg"
                alt="MEGT Logo"
                width={120}
                height={40}
                style={{ height: "4.5rem", width: "auto" }}
              />
            </div>

            {/* Navigation container with fixed heights */}
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              {/* Secondary Navigation - Fixed height */}
              <div
                style={{
                  borderBottom: "1px solid rgba(229, 231, 235, 0.3)", // Lighter border
                  paddingLeft: "140px", // Make space for logo
                  height: "40px", // Fixed height
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <SecondaryNav items={secondaryNavItems} otherItems={secondaryNavActionButtons} />
              </div>

              {/* Main Navigation - Fixed height */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end", // Changed from space-between to flex-end
                  alignItems: "center",
                  paddingLeft: "140px", // Make space for logo
                  height: "60px", // Fixed height (100px total - 40px secondary nav)
                }}
              >
                {/* Mega menu on the right */}
                <MegaMenu
                  menuItems={menuData.items}
                  otherItems={menuData.otherItems.filter((item) => !item.hidden && item.placement === "headerMain")}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main content - Now uses the browser's natural scrolling */}
        <main
          style={{
            flexGrow: 1,
            position: "relative", // Ensure it's above the video
            width: "100%",
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              width: "100%", // Ensure the container takes full width
              margin: "0 auto",
              padding: "10px",
            }}
          >
            <div style={{ width: "100%", margin: "0 auto" }}>
              <InteractionLog />
            </div>
          </div>
        </main>

        {/* Footer - Fixed at the bottom */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 5, // Ensure it's above the background but below the header
          }}
        >
          <Footer
            footerItems={footerData.items}
            otherItems={footerData.otherItems.filter((item) => !item.hidden)}
            columns={footerData.columns}
            policyLinks={footerData.policyLinks}
          />
        </div>
      </div>
    </MenuInteractionProvider>
  )
}

