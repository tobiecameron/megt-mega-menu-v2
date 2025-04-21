"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, ArrowRight } from "lucide-react"
import { useMenuInteractions } from "./menu-interaction-context"

type SubLink = {
  _id: string
  title: string
  slug?: string
  url?: string
  order?: number
  hidden?: boolean
}

type SubList = {
  heading: string
  links: SubLink[]
  hidden?: boolean
}

type AdditionalLink = {
  text: string
  url?: string
  hidden?: boolean
}

type CTAButton = {
  text: string
  url?: string
  hidden?: boolean
}

type MenuLink = {
  _id: string
  title: string
  slug?: string
  url?: string
  order?: number
  hidden?: boolean
}

type MenuList = {
  heading: string
  order?: number
  links: MenuLink[]
  ctaButtons?: CTAButton[]
  subLists?: SubList[]
  additionalLinks?: AdditionalLink[]
  hidden?: boolean
}

type MenuItem = {
  _id: string
  title: string
  slug?: string
  url?: string
  order?: number
  hidden?: boolean
  menuLists?: MenuList[]
}

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

type MegaMenuProps = {
  menuItems: MenuItem[]
  otherItems: OtherItem[]
}

// Threshold for meaningful interaction in milliseconds
const MEANINGFUL_INTERACTION_THRESHOLD = 2000 // 2 seconds

export function MegaMenu({ menuItems, otherItems }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [trianglePosition, setTrianglePosition] = useState(0)
  const [animationKey, setAnimationKey] = useState(0) // Add key for forcing animation reset
  const [isHoveringActiveItem, setIsHoveringActiveItem] = useState(false)
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLUListElement>(null)
  const menuItemRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const firstItemRef = useRef<HTMLLIElement | null>(null)
  const lastItemRef = useRef<HTMLLIElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const meaningfulInteractionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const menuOpenTimeRef = useRef<number | null>(null)
  const { addInteraction, showNotification } = useMenuInteractions()

  // Default minimum width for the mega menu
  const DEFAULT_MIN_WIDTH = 600

  // Ensure menuItems exists and is an array
  const items = useMemo(() => menuItems?.filter((item) => !item.hidden) || [], [menuItems])

  // Get the active menu item and its menu lists
  const activeMenuItem = useMemo(
    () => (activeMenu ? items.find((item) => item._id === activeMenu) : null),
    [activeMenu, items],
  )

  const activeMenuLists = useMemo(
    () => activeMenuItem?.menuLists?.filter((list) => !list.hidden) || [],
    [activeMenuItem],
  )

  // Calculate menu dimensions - memoized to prevent recalculation on every render
  const menuDimensions = useMemo(() => {
    if (!firstItemRef.current || !lastItemRef.current || !navRef.current) {
      return { width: 0, left: 0 }
    }

    const firstItemRect = firstItemRef.current.getBoundingClientRect()
    const lastItemRect = lastItemRef.current.getBoundingClientRect()
    const navRect = navRef.current.getBoundingClientRect()

    // Calculate width from first item to last item
    const width = lastItemRect.right - firstItemRect.left

    // Calculate left position relative to nav
    const left = firstItemRect.left - navRect.left

    return { width, left }
  }, [])

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      // Force re-render to recalculate dimensions
      setAnimationKey((prev) => prev + 1)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Pre-calculate menu widths for each menu item - only run once
  const menuWidths = useMemo(() => {
    const widths: { [key: string]: number } = {}

    // Skip calculation if we're in SSR
    if (typeof document === "undefined") return widths

    // Create a hidden div to measure content
    const measureDiv = document.createElement("div")
    measureDiv.style.position = "absolute"
    measureDiv.style.visibility = "hidden"
    measureDiv.style.display = "block"
    measureDiv.style.width = "auto"
    document.body.appendChild(measureDiv)

    // Calculate width for each menu item with lists
    items.forEach((item) => {
      if (!item.menuLists || item.menuLists.length === 0) return

      const visibleLists = item.menuLists.filter((list) => !list.hidden)
      if (visibleLists.length === 0) return

      // Create a grid container similar to our actual menu
      measureDiv.innerHTML = ""
      measureDiv.style.display = "grid"
      measureDiv.style.gridTemplateColumns =
        visibleLists.length === 1 ? "1fr" : visibleLists.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr"
      measureDiv.style.gap = "1.5rem"
      measureDiv.style.padding = "1rem"

      // Add content for each list
      visibleLists.forEach((list) => {
        const listDiv = document.createElement("div")
        listDiv.style.display = "flex"
        listDiv.style.flexDirection = "column"

        // Add heading
        const heading = document.createElement("h3")
        heading.textContent = list.heading
        listDiv.appendChild(heading)

        // Add links
        if (list.links && list.links.length > 0) {
          const ul = document.createElement("ul")
          list.links
            .filter((link) => !link.hidden)
            .forEach((link) => {
              const li = document.createElement("li")
              const a = document.createElement("a")
              a.textContent = link.title
              li.appendChild(a)
              ul.appendChild(li)
            })
          listDiv.appendChild(ul)
        }

        // Add to measure div
        measureDiv.appendChild(listDiv)
      })

      // Measure the width
      const width = measureDiv.offsetWidth
      widths[item._id] = Math.max(width, DEFAULT_MIN_WIDTH)
    })

    // Clean up
    document.body.removeChild(measureDiv)

    return widths
  }, [items])

  // Calculate final position - memoized to prevent recalculation on every render
  const finalPosition = useMemo(() => {
    if (!activeMenu) return { width: 0, left: 0 }

    // Get the width for this menu (or use default)
    const contentWidth = menuWidths[activeMenu] || DEFAULT_MIN_WIDTH

    // Use the larger of nav width or content width
    const width = Math.max(menuDimensions.width, contentWidth)

    // Fixed right alignment
    return { width, left: 0 }
  }, [activeMenu, menuDimensions.width, menuWidths])

  // Calculate triangle position - only when needed
  const calculateTrianglePosition = useCallback(() => {
    if (!activeMenu || !navRef.current) return 0

    const menuItemButton = menuItemRefs.current[activeMenu]

    if (!menuItemButton) return 0

    // Get the button's position
    const buttonRect = menuItemButton.getBoundingClientRect()
    const navRect = navRef.current.getBoundingClientRect()

    // Calculate the center of the button relative to the nav
    const buttonCenter = buttonRect.left + buttonRect.width / 2

    // Calculate the position from the left edge of the dropdown
    return buttonCenter - navRect.left
  }, [activeMenu])

  // Update triangle position when active menu changes
  useEffect(() => {
    if (!activeMenu) return

    // Use a timeout to ensure the dropdown is fully rendered
    const timer = setTimeout(() => {
      setTrianglePosition(calculateTrianglePosition())
    }, 50)

    return () => clearTimeout(timer)
  }, [activeMenu, calculateTrianglePosition])

  // Start tracking meaningful interaction when menu opens
  useEffect(() => {
    // When a menu becomes active, start the timer
    if (activeMenu) {
      // Record the time when the menu was opened
      menuOpenTimeRef.current = Date.now()

      // Clear any existing timer
      if (meaningfulInteractionTimerRef.current) {
        clearTimeout(meaningfulInteractionTimerRef.current)
      }

      // Set a new timer for meaningful interaction
      meaningfulInteractionTimerRef.current = setTimeout(() => {
        // Find the active menu item
        const activeItem = items.find((item) => item._id === activeMenu)
        if (activeItem) {
          // Log the interaction as meaningful after threshold is reached
          addInteraction(`${activeItem.title} (meaningful open)`, `#${activeItem._id}`)
        }
      }, MEANINGFUL_INTERACTION_THRESHOLD)
    } else {
      // Menu closed, clear the timer
      if (meaningfulInteractionTimerRef.current) {
        clearTimeout(meaningfulInteractionTimerRef.current)
        meaningfulInteractionTimerRef.current = null
      }
      menuOpenTimeRef.current = null
    }

    // Clean up on unmount
    return () => {
      if (meaningfulInteractionTimerRef.current) {
        clearTimeout(meaningfulInteractionTimerRef.current)
      }
    }
  }, [activeMenu, items, addInteraction])

  // Effect to handle menu closing based on hover states
  useEffect(() => {
    if (!activeMenu) return

    // If neither the dropdown nor the active menu item is being hovered, close the menu
    if (!isHoveringDropdown && !isHoveringActiveItem) {
      const timer = setTimeout(() => {
        // Find the active menu item to log its title
        const activeItem = items.find((item) => item._id === activeMenu)
        if (activeItem) {
          // Calculate how long the menu was open
          const openDuration = menuOpenTimeRef.current ? Date.now() - menuOpenTimeRef.current : 0

          // Only log the close interaction if it was open for a meaningful amount of time
          if (openDuration >= MEANINGFUL_INTERACTION_THRESHOLD) {
            // Log the interaction when closing by mouse leave
            addInteraction(
              `${activeItem.title} (closed by mouse leave after ${Math.round(openDuration / 1000)}s)`,
              `#${activeItem._id}`,
            )
          }
        }
        setActiveMenu(null)
      }, 100) // Small delay to prevent flickering during transition between elements

      return () => clearTimeout(timer)
    }
  }, [isHoveringDropdown, isHoveringActiveItem, activeMenu, items, addInteraction])

  const handleMenuClick = useCallback(
    (id: string, title: string, hasChildren: boolean) => {
      // Check if we're closing an already open menu
      const isClosing = activeMenu === id

      // If this menu item has no children but there's an active menu, close it first
      if (!hasChildren && activeMenu !== null) {
        // Find the active menu item to log its title
        const activeItem = items.find((item) => item._id === activeMenu)
        if (activeItem) {
          // Calculate how long the menu was open
          const openDuration = menuOpenTimeRef.current ? Date.now() - menuOpenTimeRef.current : 0

          // Only log the close interaction if it was open for a meaningful amount of time
          if (openDuration >= MEANINGFUL_INTERACTION_THRESHOLD) {
            // Log the interaction when closing by clicking another menu item
            addInteraction(
              `${activeItem.title} (closed by clicking another menu item after ${Math.round(openDuration / 1000)}s)`,
              `#${activeItem._id}`,
            )
          }
        }

        // Close the active menu
        setActiveMenu(null)
      }

      // Log the top-level menu interaction with appropriate state indicator
      if (hasChildren) {
        // Only use opened/closed terminology for items with children
        if (isClosing) {
          // Calculate how long the menu was open
          const openDuration = menuOpenTimeRef.current ? Date.now() - menuOpenTimeRef.current : 0

          // Only log the close interaction if it was open for a meaningful amount of time
          if (openDuration >= MEANINGFUL_INTERACTION_THRESHOLD) {
            addInteraction(`${title} (closed after ${Math.round(openDuration / 1000)}s)`, `#${id}`)
            showNotification(`${title} (closed)`)
          }
          setActiveMenu(null)
        } else {
          // If we're switching between menus, close the current one first
          if (activeMenu !== null) {
            // Find the active menu item to log its title
            const activeItem = items.find((item) => item._id === activeMenu)
            if (activeItem) {
              // Calculate how long the menu was open
              const openDuration = menuOpenTimeRef.current ? Date.now() - menuOpenTimeRef.current : 0

              // Only log the close interaction if it was open for a meaningful amount of time
              if (openDuration >= MEANINGFUL_INTERACTION_THRESHOLD) {
                // Log the interaction when closing by clicking another menu item
                addInteraction(
                  `${activeItem.title} (closed by switching to ${title} after ${Math.round(openDuration / 1000)}s)`,
                  `#${activeItem._id}`,
                )
              }
            }

            setActiveMenu(null)
            // Small delay to ensure the previous menu is closed before opening the new one
            setTimeout(() => {
              setAnimationKey((prev) => prev + 1) // Increment key to force animation reset
              setActiveMenu(id)
            }, 10)
          } else {
            // Just opening a new menu
            setAnimationKey((prev) => prev + 1) // Increment key to force animation reset
            setActiveMenu(id)
          }

          // For click opens, we log immediately (not waiting for the threshold)
          // since a click is already a deliberate action
          addInteraction(`${title} (opened by clicking)`, `#${id}`)
          showNotification(`${title} (opened by clicking)`)
        }
      } else {
        // For items without children, just show "clicked"
        addInteraction(`${title} (clicked)`, `#${id}`)
        showNotification(`${title} (clicked)`)
      }
    },
    [activeMenu, items, addInteraction, showNotification],
  )

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Find the active menu item to log its title
        const activeItem = items.find((item) => item._id === activeMenu)
        if (activeItem) {
          // Calculate how long the menu was open
          const openDuration = menuOpenTimeRef.current ? Date.now() - menuOpenTimeRef.current : 0

          // Only log the close interaction if it was open for a meaningful amount of time
          if (openDuration >= MEANINGFUL_INTERACTION_THRESHOLD) {
            // Log the interaction when closing by clicking outside
            addInteraction(
              `${activeItem.title} (closed by clicking outside after ${Math.round(openDuration / 1000)}s)`,
              `#${activeItem._id}`,
            )
            showNotification(`${activeItem.title} (closed by clicking outside)`)
          }
        }

        // Close the menu
        setActiveMenu(null)
      }
    }

    // Add event listener when a menu is active
    if (activeMenu !== null) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    // Clean up event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeMenu, items, addInteraction, showNotification])

  // Update the handleLinkClick function to include parent menu information
  const handleLinkClick = useCallback(
    (title: string, url?: string, parentTitle?: string, listHeading?: string) => {
      // Format the title with hierarchical information
      let formattedTitle = title

      if (parentTitle && listHeading) {
        // Format as: "Parent > List Heading > Link Title"
        formattedTitle = `${parentTitle} > ${listHeading} > ${title}`
      } else if (parentTitle) {
        // Format as: "Parent > Link Title"
        formattedTitle = `${parentTitle} > ${title}`
      }

      addInteraction(formattedTitle, url || "#")
      showNotification(formattedTitle)
      setActiveMenu(null)
    },
    [addInteraction, showNotification],
  )

  // Handle action button click
  const handleActionButtonClick = useCallback(
    (text: string, url?: string) => {
      addInteraction(`Action Button: ${text} (clicked)`, url || "#")
      showNotification(`Action Button: ${text} (clicked)`)
    },
    [addInteraction, showNotification],
  )

  // Render action buttons - memoized to prevent recreation on every render
  const actionButtons = useMemo(() => {
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
              padding: "0.5rem 1rem",
              backgroundColor: "#003087", // Blue background
              color: "#ffffff", // White text
              borderRadius: "0.375rem",
              fontWeight: "500",
              fontSize: "0.85rem",
              textDecoration: "none",
              marginLeft: "1rem",
            }}
            onClick={(e) => {
              e.preventDefault() // Prevent actual navigation for testing
              handleActionButtonClick(item.buttonText || "Action", item.buttonUrl)
            }}
          >
            <span>{item.buttonText || "Action"}</span>
            <ArrowRight size={16} color="#ffb612" /> {/* Yellow arrow */}
          </Link>
        )
      }
      return null
    })
  }, [otherItems, handleActionButtonClick])

  return (
    <nav style={{ position: "relative", width: "100%", overflow: "visible" }} ref={menuRef}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", position: "relative" }}>
        <ul
          ref={navRef}
          style={{
            display: "flex",
            gap: "2rem", // Reduced from 2.5rem by 20%
            listStyle: "none", // Remove bullet points
            padding: 0,
            margin: 0,
            justifyContent: "flex-end", // Align items to the right
            position: "relative", // Important for absolute positioning of dropdown
          }}
        >
          {/* Use items in their original order (sorted by order field in the query) */}
          {items.map((item, index) => {
            // Ensure menuLists exists and is an array
            const menuLists = item.menuLists?.filter((list) => !list.hidden) || []
            const hasMenuLists = menuLists.length > 0
            const isFirstItem = index === 0
            const isLastItem = index === items.length - 1
            const isActive = activeMenu === item._id

            return (
              <li
                key={item._id}
                style={{ position: "relative" }}
                ref={isFirstItem ? firstItemRef : isLastItem ? lastItemRef : null}
              >
                <button
                  ref={(el) => (menuItemRefs.current[item._id] = el)}
                  onClick={() => handleMenuClick(item._id, item.title, hasMenuLists)}
                  onMouseEnter={() => {
                    // Set hovering state for the active menu item
                    if (isActive) {
                      setIsHoveringActiveItem(true)
                    }
                    // Open menu on hover if it has children
                    else if (hasMenuLists) {
                      setActiveMenu(item._id)
                      setAnimationKey((prev) => prev + 1)
                      setIsHoveringActiveItem(true)

                      // We don't log hover opens immediately anymore
                      // The meaningful interaction timer will handle this after the threshold
                    }
                  }}
                  onMouseLeave={() => {
                    // Clear hovering state
                    setIsHoveringActiveItem(false)
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.5rem 0",
                    fontWeight: "700", // Changed from 500 to 700 to make it bold
                    fontSize: "0.9rem", // Main nav font size
                    color: activeMenu === item._id ? "#003087" : "#1f2937", // Changed from "#3b82f6" to "#003087" for active state
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  aria-expanded={activeMenu === item._id}
                  aria-haspopup={hasMenuLists ? "true" : "false"}
                >
                  <span>{item.title}</span>
                  {hasMenuLists && (
                    <ChevronDown
                      size={18}
                      style={{
                        transform: activeMenu === item._id ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  )}
                </button>
              </li>
            )
          })}

          {/* Mega menu dropdown positioned relative to the navigation */}
          {activeMenu && activeMenuLists.length > 0 && (
            <div
              key={`dropdown-${activeMenu}-${animationKey}`}
              ref={dropdownRef}
              onMouseEnter={() => setIsHoveringDropdown(true)}
              onMouseLeave={() => setIsHoveringDropdown(false)}
              style={{
                position: "absolute",
                left: 0, // Align to left edge of nav
                top: "100%",
                zIndex: 10,
                marginTop: "calc(0.75rem + 11px)",
                width: "100%", // Full width of nav
                maxWidth: "100%", // Ensure it doesn't exceed nav width
                backgroundColor: "#ffffff",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                borderRadius: "0.375rem",
                border: "1px solid #e5e7eb",
                padding: "1rem",
                animation: "megaMenuSlideDown 0.3s ease-out forwards",
                opacity: 0,
                transform: "translateY(-10px)",
                boxSizing: "border-box", // Add this to include padding in width calculation
              }}
              role="menu"
            >
              {/* Triangle indicator pointing to parent item */}
              <div
                key={`triangle-${activeMenu}-${animationKey}`}
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: trianglePosition, // Change from right to left
                  marginLeft: "-8px", // Change from marginRight to marginLeft
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "8px solid white",
                  animation: "triangleFadeIn 0.3s ease-out forwards",
                  opacity: 0,
                }}
              />

              {/* Multi-column layout based on number of lists */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    activeMenuLists.length === 1 ? "1fr" : activeMenuLists.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr",
                  gap: "1.5rem",
                }}
              >
                {/* Map through all menu lists in their original order */}
                {activeMenuLists.map((list, index) => (
                  <div key={index} style={{ display: "flex", flexDirection: "column" }}>
                    <h3
                      style={{
                        fontWeight: "bold",
                        marginBottom: "0.5rem",
                        color: "#003087", // Changed from "#3b82f6" to match footer blue
                        paddingBottom: "0.25rem",
                        fontSize: "1.0rem",
                      }}
                    >
                      {list.heading}
                    </h3>

                    {/* Menu links - use them in their original order from Sanity */}
                    {list.links && list.links.length > 0 && (
                      <ul
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.875rem",
                          marginBottom: "1rem",
                          listStyle: "none", // Remove bullet points
                          padding: 0,
                        }}
                      >
                        {list.links
                          .filter((link) => !link.hidden)
                          .map((link) => (
                            <li key={link._id}>
                              <Link
                                href={link.url || "/"}
                                style={{
                                  color: "#6b7280",
                                  whiteSpace: "nowrap",
                                  textDecoration: "none",
                                  fontSize: "0.88rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                }}
                                onClick={(e) => {
                                  e.preventDefault() // Prevent actual navigation for testing
                                  handleLinkClick(link.title, link.url || "/", activeMenuItem?.title, list.heading) // Pass parent title and list heading
                                }}
                                role="menuitem"
                              >
                                <span>{link.title}</span>
                                <ChevronRight size={12} style={{ flexShrink: 0 }} />
                              </Link>
                            </li>
                          ))}
                      </ul>
                    )}

                    {/* CTA Buttons - Render for each column */}
                    {list.ctaButtons && list.ctaButtons.length > 0 && (
                      <div
                        style={{
                          marginTop: "15px", // Changed from 0 to 15px
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          marginBottom:
                            (list.subLists && list.subLists.length > 0) ||
                            (list.additionalLinks && list.additionalLinks.length > 0)
                              ? "1rem"
                              : 0,
                        }}
                      >
                        {/* Use the buttons in the order they appear in the array */}
                        {list.ctaButtons
                          .filter((button) => !button.hidden)
                          .map((button, buttonIndex) => (
                            <Link
                              key={buttonIndex}
                              href={button.url || "#"}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0.5rem 1rem",
                                borderRadius: "0.375rem",
                                fontWeight: "500",
                                color: "#000000",
                                backgroundColor: "#ffb612",
                                transition: "background-color 0.2s ease-in-out",
                                textDecoration: "none",
                                fontSize: "0.98rem", // Added reduced font size
                                width: "70%", // Set width to 70% of available space
                                marginLeft: "0", // Align to the left
                              }}
                              onClick={(e) => {
                                e.preventDefault() // Prevent actual navigation for testing
                                handleLinkClick(button.text, button.url || "#", activeMenuItem?.title, list.heading) // Pass parent title and list heading
                              }}
                            >
                              <span>{button.text || "Learn More"}</span>
                              <ChevronRight size={16} style={{ flexShrink: 0 }} />
                            </Link>
                          ))}
                      </div>
                    )}

                    {/* Multiple Sub Lists - Only render if subLists exists and has items */}
                    {list.subLists && list.subLists.length > 0 && (
                      <div style={{ marginTop: "1rem" }}>
                        {/* Use the subLists in the order they appear in the array */}
                        {list.subLists
                          .filter((subList) => !subList.hidden)
                          .map((subList, subListIndex) => (
                            <div
                              key={subListIndex}
                              style={{
                                marginBottom:
                                  subListIndex < list.subLists!.filter((sl) => !sl.hidden).length - 1 ? "1rem" : 0,
                                borderTop: subListIndex === 0 ? "1px solid rgba(229, 231, 235, 0.5)" : "none", // Light separator for first sub-list
                                paddingTop: subListIndex === 0 ? "0.75rem" : 0,
                              }}
                            >
                              <h4
                                style={{
                                  fontWeight: "bold",
                                  marginBottom: "0.5rem",
                                  color: "#003087", // Match the main heading color
                                  paddingBottom: "0.25rem",
                                  fontSize: "0.9rem", // Slightly smaller than main heading
                                }}
                              >
                                {subList.heading}
                              </h4>
                              <ul
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.75rem",
                                  listStyle: "none", // Remove bullet points
                                  padding: 0,
                                }}
                              >
                                {/* Use the links in the order they appear in the array */}
                                {subList.links
                                  .filter((link) => !link.hidden)
                                  .map((link) => (
                                    <li key={link._id}>
                                      <Link
                                        href={link.url || "#"}
                                        style={{
                                          color: "#6b7280",
                                          whiteSpace: "nowrap",
                                          textDecoration: "none",
                                          fontSize: "0.92rem", // Slightly smaller than main links
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "0.25rem",
                                        }}
                                        onClick={(e) => {
                                          e.preventDefault() // Prevent actual navigation for testing
                                          handleLinkClick(
                                            link.title,
                                            link.url || "#",
                                            activeMenuItem?.title,
                                            subList.heading,
                                          ) // Pass parent title and sub-list heading
                                        }}
                                        role="menuitem"
                                      >
                                        <span>{link.title}</span>
                                        <ChevronRight size={12} style={{ flexShrink: 0 }} />
                                      </Link>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Additional Links - Only render if additionalLinks exists and has items */}
                    {list.additionalLinks && list.additionalLinks.length > 0 && (
                      <div
                        style={{
                          marginTop: "31px", // Increased from 1rem (16px) to 31px (1rem + 15px)
                          borderTop: "1px solid rgba(229, 231, 235, 0.5)", // Always add a separator
                          paddingTop: "0.75rem",
                        }}
                      >
                        <ul
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                            listStyle: "none", // Remove bullet points
                            padding: 0,
                          }}
                        >
                          {/* Use the additionalLinks in the order they appear in the array */}
                          {list.additionalLinks
                            .filter((link) => !link.hidden)
                            .map((link, linkIndex) => (
                              <li key={linkIndex}>
                                <Link
                                  href={link.url || "#"}
                                  style={{
                                    color: "#6b7280",
                                    whiteSpace: "nowrap",
                                    textDecoration: "none",
                                    fontSize: "0.85rem", // Slightly smaller than main links
                                    fontWeight: "bold", // Make the text bold
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault() // Prevent actual navigation for testing
                                    handleLinkClick(link.text, link.url || "#", activeMenuItem?.title, list.heading) // Pass parent title and list heading
                                  }}
                                  role="menuitem"
                                >
                                  <span>{link.text}</span>
                                  <ChevronRight size={12} style={{ flexShrink: 0 }} />
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </ul>

        {/* Action buttons */}
        {actionButtons}
      </div>
    </nav>
  )
}
