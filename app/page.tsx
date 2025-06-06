"use client"

import { MegaMenu } from "@/components/mega-menu"
import { SecondaryNav } from "@/components/secondary-nav"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { MenuInteractionProvider } from "@/components/menu-interaction-context"
import { InteractionLog } from "@/components/interaction-log"
import { UserCaptureOverlay } from "@/components/user-capture-overlay"
import { useEffect, useState } from "react"
import Link from "next/link"
// First, import the ArrowRight icon at the top of the file with the other imports
import { ArrowRight } from "lucide-react"

// Define types for our components
type OtherItem = {
  _id: string
  title: string
  itemType: string
  buttonText?: string
  buttonUrl?: string
  placement?: string
  order?: number
  hidden?: boolean
}

type MainContentProps = {
  menuData: {
    items: any[]
    otherItems: OtherItem[]
  }
  footerData: {
    items: any[]
    otherItems: any[]
    columns: any[]
    policyLinks: any[]
  }
  isLoading: boolean
  error: string | null
  showUserCapture: boolean
  userName: string | null
  handleUserCaptured: (name: string) => void
}

// Create a separate component for the main content that uses the context
function MainContent({
  menuData,
  footerData,
  isLoading,
  error,
  showUserCapture,
  userName,
  handleUserCaptured,
}: MainContentProps) {
  // Now we can safely use the hook inside the provider
  const { addInteraction, showNotification, handleJobBoardClick } = useMenuInteractions()

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

  // Find Job Board button in otherItems
  const jobBoardButton = menuData.otherItems.find((item) => !item.hidden && item.itemType === "jobBoardButton")

  console.log("Job Board Button:", jobBoardButton) // Debug log

  // Filter secondary nav items from otherItems
  const secondaryNavItems = menuData.otherItems.filter(
    (item) => !item.hidden && item.placement === "headerSecondary" && item.itemType === "secondaryNavLink",
  )

  // Filter secondary nav action buttons
  const secondaryNavActionButtons = menuData.otherItems.filter(
    (item) => !item.hidden && item.placement === "headerSecondary" && item.itemType === "actionButton",
  )

  // Then update the JobBoardButton component to include the arrow
  // Find the JobBoardButton component and replace it with this version:

  // Create Job Board button component
  const JobBoardButton = ({ item, className = "", style = {} }) => (
    <Link
      href={item.buttonUrl || "/jobs"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#003087", // Blue background to match other buttons
        color: "#ffffff", // White text
        fontWeight: "bold",
        padding: "0 1.5rem",
        borderRadius: "0.375rem",
        fontSize: "1rem",
        textDecoration: "none",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow
        transition: "background-color 0.2s ease-in-out",
        gap: "0.5rem", // Add gap between text and arrow
        ...style,
      }}
      className={className}
      onClick={(e) => {
        e.preventDefault() // Prevent navigation for testing
        handleJobBoardClick()
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "#ffb612" // Change to yellow
        e.currentTarget.style.color = "#003087" // Change to blue text
        // Update the arrow color and make it bold
        const arrow = e.currentTarget.querySelector("svg")
        if (arrow) {
          arrow.style.stroke = "#003087" // Change arrow to blue
          arrow.style.color = "#003087" // Change arrow to blue
          arrow.style.strokeWidth = "3" // Make arrow bold
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "#003087" // Back to blue
        e.currentTarget.style.color = "#ffffff" // Back to white text
        // Reset the arrow color and weight
        const arrow = e.currentTarget.querySelector("svg")
        if (arrow) {
          arrow.style.stroke = "#ffb612" // Back to yellow
          arrow.style.color = "#ffb612" // Back to yellow
          arrow.style.strokeWidth = "2" // Reset to normal weight
        }
      }}
    >
      <span>{item.buttonText || "Job Board"}</span>
      <ArrowRight size={16} color="#ffb612" strokeWidth={2} /> {/* Yellow arrow with default stroke width */}
    </Link>
  )

  // Check if we have a double-height job board button
  const hasDoubleHeightJobBoard = jobBoardButton && jobBoardButton.placement === "headerDoubleHeight"

  // Debug logs
  console.log("Menu Data:", menuData)
  console.log("Other Items:", menuData.otherItems)
  console.log("Has Double Height Job Board:", hasDoubleHeightJobBoard)

  return (
    <>
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

            {/* Job Board Button - Double Height (only shown when placement is headerDoubleHeight) */}
            {jobBoardButton && jobBoardButton.placement === "headerDoubleHeight" && (
              <div
                style={{
                  position: "absolute",
                  right: "10px", // Match container padding
                  top: 0,
                  height: "100%", // Full header height
                  display: "flex",
                  alignItems: "center",
                  zIndex: 3, // Above other elements
                }}
              >
                <JobBoardButton
                  item={jobBoardButton}
                  style={{
                    height: "calc(100% - 16px)", // Slightly less than full height for visual padding
                    marginRight: "10px", // Space from the right edge
                    marginLeft: "15px", // Added margin to the left side
                    paddingLeft: "20px", // Added padding to the left side
                    paddingRight: "20px", // Added padding to the right side for balance
                  }}
                />
              </div>
            )}

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
                  // Add right padding if double-height button is enabled
                  paddingRight: hasDoubleHeightJobBoard ? "170px" : "0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <SecondaryNav items={secondaryNavItems} otherItems={secondaryNavActionButtons} />

                  {/* Job Board Button in Secondary Nav */}
                  {jobBoardButton && jobBoardButton.placement === "headerSecondary" && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <JobBoardButton
                        item={jobBoardButton}
                        style={{
                          height: "28px", // Match height of other secondary nav items
                          fontSize: "0.805rem", // Smaller font size for secondary nav
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Main Navigation - Fixed height */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between", // Changed to space-between to allow for button on right
                  alignItems: "center",
                  paddingLeft: "140px", // Make space for logo
                  height: "60px", // Fixed height (100px total - 40px secondary nav)
                  // Add right padding if double-height button is enabled
                  paddingRight: hasDoubleHeightJobBoard ? "170px" : "0",
                }}
              >
                {/* Mega menu */}
                <MegaMenu
                  menuItems={menuData.items}
                  otherItems={menuData.otherItems.filter(
                    (item) => !item.hidden && item.placement === "headerMain" && item.itemType !== "jobBoardButton",
                  )}
                />

                {/* Job Board Button in Main Nav */}
                {jobBoardButton && jobBoardButton.placement === "headerMain" && (
                  <div style={{ marginLeft: "2rem" }}>
                    <JobBoardButton
                      item={jobBoardButton}
                      style={{
                        height: "40px", // Match height of other main nav items
                      }}
                    />
                  </div>
                )}
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
    </>
  )
}

// Import this after the component definition to avoid the circular reference
import { useMenuInteractions } from "@/components/menu-interaction-context"

// Update the Home component to handle user session better
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
  const [showUserCapture, setShowUserCapture] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    // Check if user info is already in localStorage
    const storedUserName = localStorage.getItem("megtUserName")
    if (storedUserName) {
      setUserName(storedUserName)
      setShowUserCapture(false)
    } else {
      // If no user name is found, show the capture overlay
      setShowUserCapture(true)
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
        console.log("Fetched menu data:", menuData) // Debug log
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

    // Force a reload to ensure the context provider gets the updated values
    window.location.reload()
  }

  return (
    <MenuInteractionProvider>
      <MainContent
        menuData={menuData}
        footerData={footerData}
        isLoading={isLoading}
        error={error}
        showUserCapture={showUserCapture}
        userName={userName}
        handleUserCaptured={handleUserCaptured}
      />
    </MenuInteractionProvider>
  )
}
