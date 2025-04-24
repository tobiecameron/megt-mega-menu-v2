"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, ChevronRight, ArrowRight } from "lucide-react"
import { useMenuInteractions } from "./menu-interaction-context"
import { PortableText } from "@portabletext/react"

type SubLink = {
  _id: string
  title: string
  slug?: string
  url?: string
  order?: number
  hidden?: boolean
  image?: string
  imageWidth?: number
  imageHeight?: number
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
  group?: string // For legacy support
}

type CTAButtonGroup = {
  heading: string
  buttons: {
    text: string
    url?: string
    hidden?: boolean
  }[]
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

type PrimaryButton = {
  text: string
  url?: string // Changed from required to optional
  hidden?: boolean
}

type SectionButton = {
  text: string
  url?: string
  hidden?: boolean
}

// Update the MenuList type to include the new fields
type MenuList = {
  heading: string
  contentHeading?: string
  order?: number
  links: MenuLink[]
  hasCustomContent?: boolean
  customContent?: any
  primaryButton?: PrimaryButton
  ctaButtons?: CTAButton[] // Legacy support
  ctaButtonGroups?: CTAButtonGroup[] // New structure
  additionalLinks?: AdditionalLink[]
  hidden?: boolean
  subLists?: SubList[]
  additionalLinkSections?: {
    sectionHeading: string
    position?: string
    hidden?: boolean
    links: MenuLink[]
    sectionButton?: SectionButton
    sectionContentHeading?: string
    subSections?: {
      heading: string
      hidden?: boolean
      links: MenuLink[]
      url?: string // Add url to subsection
    }[]
  }[]
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [trianglePosition, setTrianglePosition] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)
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

  // Get the active category's content
  const activeCategoryContent = useMemo(() => {
    if (!activeCategory || !activeMenuLists.length) return null
    return activeMenuLists.find((list) => list.heading === activeCategory) || activeMenuLists[0]
  }, [activeCategory, activeMenuLists])

  // Calculate menu dimensions
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

  // Calculate triangle position
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
        setActiveCategory(null)
      }, 100) // Small delay to prevent flickering during transition between elements

      return () => clearTimeout(timer)
    }
  }, [isHoveringDropdown, isHoveringActiveItem, activeMenu, items, addInteraction])

  // Set initial active category when menu opens
  useEffect(() => {
    if (activeMenu && activeMenuLists.length > 0 && !activeCategory) {
      setActiveCategory(activeMenuLists[0].heading)
    }
  }, [activeMenu, activeMenuLists, activeCategory])

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
        setActiveCategory(null)
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
          setActiveCategory(null)
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
            setActiveCategory(null)
            // Small delay to ensure the previous menu is closed before opening the new one
            setTimeout(() => {
              setAnimationKey((prev) => prev + 1) // Increment key to force animation reset
              setActiveMenu(id)
              // Set the first category as active by default
              if (items.find((item) => item._id === id)?.menuLists?.length) {
                const firstCategory = items.find((item) => item._id === id)?.menuLists?.[0]?.heading
                if (firstCategory) setActiveCategory(firstCategory)
              }
            }, 10)
          } else {
            // Just opening a new menu
            setAnimationKey((prev) => prev + 1) // Increment key to force animation reset
            setActiveMenu(id)
            // Set the first category as active by default
            if (items.find((item) => item._id === id)?.menuLists?.length) {
              const firstCategory = items.find((item) => item._id === id)?.menuLists?.[0]?.heading
              if (firstCategory) setActiveCategory(firstCategory)
            }
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

  // Handle category click
  const handleCategoryClick = useCallback(
    (category: string) => {
      setActiveCategory(category)
      addInteraction(`Category: ${category} (selected)`, `#category-${category}`)
    },
    [addInteraction],
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
        setActiveCategory(null)
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
      setActiveCategory(null)
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

  // Handle primary button click
  const handlePrimaryButtonClick = useCallback(
    (text: string, url: string, parentTitle?: string, listHeading?: string) => {
      // Format the title with hierarchical information
      let formattedTitle = `Primary Button: ${text}`

      if (parentTitle && listHeading) {
        // Format as: "Primary Button: Parent > List Heading > Text"
        formattedTitle = `Primary Button: ${parentTitle} > ${listHeading} > ${text}`
      } else if (parentTitle) {
        // Format as: "Primary Button: Parent > Text"
        formattedTitle = `Primary Button: ${parentTitle} > ${text}`
      }

      addInteraction(formattedTitle, url)
      showNotification(formattedTitle)
      setActiveMenu(null)
      setActiveCategory(null)
    },
    [addInteraction, showNotification],
  )

  // Handle section button click
  const handleSectionButtonClick = useCallback(
    (text: string, url: string, parentTitle?: string, sectionHeading?: string) => {
      // Format the title with hierarchical information
      let formattedTitle = `Section Button: ${text}`

      if (parentTitle && sectionHeading) {
        // Format as: "Section Button: Parent > Section Heading > Text"
        formattedTitle = `Section Button: ${parentTitle} > ${sectionHeading} > ${text}`
      } else if (parentTitle) {
        // Format as: "Section Button: Parent > Text"
        formattedTitle = `Section Button: ${parentTitle} > ${text}`
      }

      addInteraction(formattedTitle, url)
      showNotification(formattedTitle)
      setActiveMenu(null)
      setActiveCategory(null)
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

  // Function to render CTA button groups
  const renderCtaButtonGroups = () => {
    if (!activeCategoryContent) return null

    // Debug logging
    console.log("CTA Content:", {
      ctaButtonGroups: activeCategoryContent.ctaButtonGroups,
      ctaButtons: activeCategoryContent.ctaButtons,
      heading: activeCategoryContent.heading,
    })

    // First check if we have the new button groups structure
    if (activeCategoryContent.ctaButtonGroups && activeCategoryContent.ctaButtonGroups.length > 0) {
      return activeCategoryContent.ctaButtonGroups
        .filter((group) => !group.hidden)
        .map((group, index) => (
          <div key={`group-${index}`} style={{ marginBottom: "1rem" }}>
            <h4
              style={{
                fontWeight: "600",
                marginTop: "0.5rem",
                marginBottom: "0.75rem",
                padding: "0.5rem 0",
                color: "#4b5563",
                fontSize: "0.85rem",
              }}
            >
              {group.heading}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {group.buttons
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
                      fontSize: "0.75rem",
                      width: "calc(100% - 25px)", // Make buttons 25px less wide (increased from 15px)
                    }}
                    onClick={(e) => {
                      e.preventDefault() // Prevent actual navigation for testing
                      handleLinkClick(
                        button.text,
                        button.url || "#",
                        activeMenuItem?.title,
                        activeCategoryContent.heading,
                      )
                    }}
                  >
                    <span>{button.text}</span>
                    <ChevronRight size={16} style={{ flexShrink: 0 }} />
                  </Link>
                ))}
            </div>
          </div>
        ))
    }

    // Fall back to legacy structure if new structure is not available
    if (activeCategoryContent.ctaButtons && activeCategoryContent.ctaButtons.length > 0) {
      // Get all unique groups
      const groups = Array.from(
        new Set(
          activeCategoryContent.ctaButtons
            .filter((button) => !button.hidden)
            .map((button) => button.group || "default"),
        ),
      )

      return groups.map((group) => (
        <div key={group} style={{ marginBottom: "1rem" }}>
          <h4
            style={{
              fontWeight: "600",
              marginTop: "0.5rem",
              marginBottom: "0.75rem",
              padding: "0.5rem 0",
              color: "#4b5563",
              fontSize: "0.85rem",
            }}
          >
            {group === "default" ? "Actions" : group}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {activeCategoryContent.ctaButtons
              .filter((button) => !button.hidden && (button.group || "default") === group)
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
                    fontSize: "0.75rem",
                    width: "calc(100% - 25px)", // Make buttons 25px less wide (increased from 15px)
                  }}
                  onClick={(e) => {
                    e.preventDefault() // Prevent actual navigation for testing
                    handleLinkClick(
                      button.text,
                      button.url || "#",
                      activeMenuItem?.title,
                      activeCategoryContent.heading,
                    )
                  }}
                >
                  <span>{button.text}</span>
                  <ChevronRight size={16} style={{ flexShrink: 0 }} />
                </Link>
              ))}
          </div>
        </div>
      ))
    }

    return null
  }

  // Function to render additional link sections
  const renderAdditionalLinkSections = () => {
    if (
      !activeCategoryContent ||
      !activeCategoryContent.additionalLinkSections ||
      activeCategoryContent.additionalLinkSections.length === 0
    ) {
      return null
    }

    // Filter sections by position
    const belowSections = activeCategoryContent.additionalLinkSections.filter(
      (section) => !section.hidden && (!section.position || section.position === "below"),
    )

    if (belowSections.length === 0) return null

    return (
      <>
        {belowSections.map((section, sectionIndex) => (
          <div key={`section-${sectionIndex}`} style={{ marginBottom: "1.5rem" }}>
            <h4
              style={{
                fontWeight: "bold",
                marginTop: "0.5rem",
                marginBottom: "1rem",
                padding: "0.5rem 0",
                color: "#003087",
                fontSize: "1.0rem",
              }}
            >
              {section.sectionHeading}
            </h4>

            {/* Non-clickable section heading if provided */}
            {section.sectionContentHeading && (
              <h5
                style={{
                  fontWeight: "600",
                  marginTop: "0.5rem",
                  marginBottom: "0.75rem",
                  padding: "0.5rem 0",
                  color: "#4b5563",
                  fontSize: "0.95rem",
                }}
              >
                {section.sectionContentHeading}
              </h5>
            )}

            {section.links && section.links.length > 0 && (
              <ul
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "0.75rem 2rem",
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                {section.links
                  .filter((link) => !link.hidden)
                  .map((link) => (
                    <li key={link._id}>
                      <Link
                        href={link.url || "/"}
                        style={{
                          color: "#6b7280",
                          textDecoration: "none",
                          fontSize: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                        onClick={(e) => {
                          e.preventDefault() // Prevent actual navigation for testing
                          handleLinkClick(link.title, link.url || "/", activeMenuItem?.title, section.sectionHeading)
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

            {/* Section Button - now optional */}
            {section.sectionButton && !section.sectionButton.hidden && section.sectionButton.text && (
              <div style={{ marginTop: "1rem" }}>
                <Link
                  href={section.sectionButton.url || "#"}
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
                    fontSize: "0.75rem",
                    width: "fit-content", // Only as wide as needed
                    minWidth: "150px", // Minimum width
                  }}
                  onClick={(e) => {
                    e.preventDefault() // Prevent actual navigation for testing
                    handleSectionButtonClick(
                      section.sectionButton.text,
                      section.sectionButton.url || "#",
                      activeMenuItem?.title,
                      section.sectionHeading,
                    )
                  }}
                >
                  <span>{section.sectionButton.text}</span>
                  <ChevronRight size={16} style={{ flexShrink: 0 }} />
                </Link>
              </div>
            )}

            {/* Additional sub-sections within this section */}
            {section.subSections && section.subSections.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                {section.subSections
                  .filter((subSection) => !subSection.hidden)
                  .map((subSection, subSectionIndex) => (
                    <div key={`sub-section-${subSectionIndex}`} style={{ marginBottom: "1.5rem" }}>
                      {/* If there are no links and there's a URL, make the heading a link */}
                      {!subSection.links || subSection.links.length === 0 ? (
                        <Link
                          href={subSection.url || "#"}
                          style={{
                            color: "#4b5563",
                            textDecoration: "none",
                            fontSize: "0.95rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            marginTop: "0.5rem",
                            marginBottom: "0.375rem", // Reduced from 0.75rem to 0.375rem (half)
                            padding: "0.25rem 0 0.25rem 0", // Reduced from 0.5rem to 0.25rem (half)
                          }}
                          onClick={(e) => {
                            e.preventDefault()
                            handleLinkClick(
                              subSection.heading,
                              subSection.url || "#",
                              activeMenuItem?.title,
                              section.sectionHeading,
                            )
                          }}
                          role="menuitem"
                        >
                          <span>{subSection.heading}</span>
                          <ChevronRight size={14} style={{ flexShrink: 0 }} />
                        </Link>
                      ) : (
                        <h5
                          style={{
                            fontWeight: "600",
                            marginTop: "0.5rem",
                            marginBottom: "0.375rem", // Reduced from 0.75rem to 0.375rem (half)
                            padding: "0.25rem 0", // Reduced from 0.5rem to 0.25rem (half)
                            color: "#4b5563",
                            fontSize: "0.95rem",
                          }}
                        >
                          {subSection.heading}
                        </h5>
                      )}
                      {subSection.links && subSection.links.length > 0 && (
                        <ul
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "0.75rem 2rem",
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                          }}
                        >
                          {subSection.links
                            .filter((link) => !link.hidden)
                            .map((link, linkIndex) => (
                              <li key={`sub-link-${linkIndex}`}>
                                <Link
                                  href={link.url || "#"}
                                  style={{
                                    color: "#6b7280",
                                    textDecoration: "none",
                                    fontSize: "0.75rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleLinkClick(
                                      link.title,
                                      link.url || "#",
                                      activeMenuItem?.title,
                                      `${section.sectionHeading} > ${subSection.heading}`,
                                    )
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
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </>
    )
  }

  // Function to render right-side additional link sections
  const renderRightSideAdditionalLinkSections = () => {
    if (
      !activeCategoryContent ||
      !activeCategoryContent.additionalLinkSections ||
      activeCategoryContent.additionalLinkSections.length === 0
    ) {
      return null
    }

    // Filter sections by position
    const rightSections = activeCategoryContent.additionalLinkSections.filter(
      (section) => !section.hidden && section.position === "right",
    )

    if (rightSections.length === 0) return null

    // Calculate equal widths for all sections, but make content sections slightly wider than CTA section
    const sectionCount = rightSections.length
    const hasCTAButtons =
      activeCategoryContent?.ctaButtons?.length > 0 || activeCategoryContent?.ctaButtonGroups?.length > 0

    // If there are CTA buttons, they take up space too
    const totalSections = hasCTAButtons ? sectionCount + 1 : sectionCount

    // Calculate equal percentage width for all sections
    const widthPercentage = `${Math.floor(100 / totalSections)}%`

    return (
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          marginLeft: "1.5rem",
          paddingLeft: "1.5rem",
          borderLeft:
            activeCategoryContent?.ctaButtons?.length > 0 || activeCategoryContent?.ctaButtonGroups?.length > 0
              ? "1px solid #e5e7eb"
              : "none",
          flexGrow: 1, // Take remaining space
          justifyContent: "space-between", // Distribute sections evenly
        }}
      >
        {rightSections.map((section, sectionIndex) => (
          <div
            key={`right-section-${sectionIndex}`}
            style={{
              width: widthPercentage,
              marginBottom: "1rem",
            }}
          >
            <h4
              style={{
                fontWeight: "bold",
                marginTop: "0.5rem",
                marginBottom: "1rem",
                padding: "0.5rem 0",
                color: "#003087",
                fontSize: "1.0rem",
              }}
            >
              {section.sectionHeading}
            </h4>

            {/* Non-clickable section heading if provided */}
            {section.sectionContentHeading && (
              <h5
                style={{
                  fontWeight: "600",
                  marginTop: "0.5rem",
                  marginBottom: "0.75rem",
                  padding: "0.5rem 0",
                  color: "#4b5563",
                  fontSize: "0.95rem",
                }}
              >
                {section.sectionContentHeading}
              </h5>
            )}

            {section.links && section.links.length > 0 && (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {section.links
                  .filter((link) => !link.hidden)
                  .map((link) => (
                    <li key={link._id}>
                      <Link
                        href={link.url || "#"}
                        style={{
                          color: "#6b7280",
                          textDecoration: "none",
                          fontSize: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                        onClick={(e) => {
                          e.preventDefault() // Prevent actual navigation for testing
                          handleLinkClick(link.title, link.url || "#", activeMenuItem?.title, section.sectionHeading)
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

            {/* Section Button - now optional */}
            {section.sectionButton && !section.sectionButton.hidden && section.sectionButton.text && (
              <div style={{ marginTop: "1rem" }}>
                <Link
                  href={section.sectionButton.url || "#"}
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
                    fontSize: "0.75rem",
                    width: "fit-content", // Only as wide as needed
                    minWidth: "150px", // Minimum width
                  }}
                  onClick={(e) => {
                    e.preventDefault() // Prevent actual navigation for testing
                    handleSectionButtonClick(
                      section.sectionButton.text,
                      section.sectionButton.url || "#",
                      activeMenuItem?.title,
                      section.sectionHeading,
                    )
                  }}
                >
                  <span>{section.sectionButton.text}</span>
                  <ChevronRight size={16} style={{ flexShrink: 0 }} />
                </Link>
              </div>
            )}

            {/* Additional sub-sections within this section */}
            {section.subSections && section.subSections.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                {section.subSections
                  .filter((subSection) => !subSection.hidden)
                  .map((subSection, subSectionIndex) => (
                    <div key={`sub-section-${subSectionIndex}`} style={{ marginBottom: "1.5rem" }}>
                      {/* If there are no links and there's a URL, make the heading a link */}
                      {!subSection.links || subSection.links.length === 0 ? (
                        <Link
                          href={subSection.url || "#"}
                          style={{
                            color: "#4b5563",
                            textDecoration: "none",
                            fontSize: "0.95rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            marginTop: "0.5rem",
                            marginBottom: "0.375rem", // Reduced from 0.75rem to 0.375rem (half)
                            padding: "0.25rem 0 0.25rem 0", // Reduced from 0.5rem to 0.25rem (half)
                          }}
                          onClick={(e) => {
                            e.preventDefault()
                            handleLinkClick(
                              subSection.heading,
                              subSection.url || "#",
                              activeMenuItem?.title,
                              section.sectionHeading,
                            )
                          }}
                          role="menuitem"
                        >
                          <span>{subSection.heading}</span>
                          <ChevronRight size={14} style={{ flexShrink: 0 }} />
                        </Link>
                      ) : (
                        <h5
                          style={{
                            fontWeight: "600",
                            marginTop: "0.5rem",
                            marginBottom: "0.375rem", // Reduced from 0.75rem to 0.375rem (half)
                            padding: "0.25rem 0", // Reduced from 0.5rem to 0.25rem (half)
                            color: "#4b5563",
                            fontSize: "0.95rem",
                          }}
                        >
                          {subSection.heading}
                        </h5>
                      )}
                      {subSection.links && subSection.links.length > 0 && (
                        <ul
                          style={{
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                          }}
                        >
                          {subSection.links
                            .filter((link) => !link.hidden)
                            .map((link, linkIndex) => (
                              <li key={`sub-link-${linkIndex}`}>
                                <Link
                                  href={link.url || "#"}
                                  style={{
                                    color: "#6b7280",
                                    textDecoration: "none",
                                    fontSize: "0.75rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleLinkClick(
                                      link.title,
                                      link.url || "#",
                                      activeMenuItem?.title,
                                      `${section.sectionHeading} > ${subSection.heading}`,
                                    )
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
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Function to render custom content
  const renderCustomContent = () => {
    if (!activeCategoryContent || !activeCategoryContent.hasCustomContent || !activeCategoryContent.customContent) {
      return null
    }

    return (
      <div style={{ marginBottom: "1.5rem" }}>
        <PortableText value={activeCategoryContent.customContent} />
      </div>
    )
  }

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

                      // Set the first category as active by default
                      if (menuLists.length > 0) {
                        setActiveCategory(menuLists[0].heading)
                      }
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
                left: 0, // Keep aligned to left edge of nav
                top: "100%",
                zIndex: 10,
                marginTop: "calc(0.75rem + 11px)",
                width: "calc(100% + 180px)", // Increased from 140px to 180px to match the right edge of the Job Board button
                maxWidth: "none", // Remove max-width constraint
                backgroundColor: "#ffffff",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                borderRadius: "0.375rem",
                border: "1px solid #e5e7eb",
                padding: "1rem",
                animation: "megaMenuSlideDown 0.3s ease-out forwards",
                opacity: 0,
                transform: "translateY(-10px)",
                boxSizing: "border-box", // Include padding in width calculation
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

              {/* Two-panel layout */}
              <div
                style={{
                  display: "flex",
                  width: "100%",
                }}
              >
                {/* Left panel - Category links */}
                <div
                  style={{
                    width: "220px",
                    borderRight: "1px solid #e5e7eb",
                    paddingRight: "1rem",
                  }}
                >
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {activeMenuLists.map((list) => (
                      <li key={list.heading} style={{ marginBottom: "0.5rem" }}>
                        <button
                          onClick={() => handleCategoryClick(list.heading)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            padding: "0.5rem",
                            textAlign: "left",
                            border: "none",
                            borderRadius: "0.25rem",
                            background: activeCategory === list.heading ? "#f3f4f6" : "transparent",
                            color: activeCategory === list.heading ? "#003087" : "#4b5563",
                            fontWeight: activeCategory === list.heading ? "600" : "normal",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                          }}
                        >
                          <span>{list.heading}</span>
                          <ChevronRight size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right panel - Content area */}
                <div
                  style={{
                    flex: 1,
                    paddingLeft: "1.5rem",
                    paddingRight: "1rem", // Add right padding
                    display: "flex",
                  }}
                >
                  {/* Main content area */}
                  <div
                    style={{
                      // Calculate width based on total number of sections for equal distribution
                      // Reduce width by 10% to make more room for other sections
                      width: (() => {
                        // Count the number of right-side sections
                        const rightSectionCount =
                          activeCategoryContent?.additionalLinkSections?.filter(
                            (section) => !section.hidden && section.position === "right",
                          )?.length || 0

                        // Count total sections (main content + right sections)
                        const totalSections = rightSectionCount + 1

                        // Return percentage width with 10% reduction
                        return `${Math.floor((100 / totalSections) * 0.9)}%`
                      })(),
                      paddingRight: "1.5rem",
                    }}
                  >
                    {activeCategoryContent && (
                      <>
                        {/* Non-clickable heading - now uses contentHeading if available */}
                        <h3
                          style={{
                            fontWeight: "bold",
                            marginTop: "0.5rem",
                            marginBottom: "1rem",
                            padding: "0.5rem 0",
                            color: "#003087",
                            fontSize: "1.0rem",
                          }}
                        >
                          {activeCategoryContent.contentHeading ||
                            `Learn about ${activeCategoryContent.heading.toLowerCase()}`}
                        </h3>

                        {/* Custom Content */}
                        {renderCustomContent()}

                        {/* Links */}
                        {activeCategoryContent.links && activeCategoryContent.links.length > 0 && (
                          <ul
                            style={{
                              display: "grid",
                              // Change from 2 columns to 1 column when there are RHS additional link sections
                              gridTemplateColumns: activeCategoryContent?.additionalLinkSections?.some(
                                (section) => !section.hidden && section.position === "right",
                              )
                                ? "1fr" // Single column when RHS sections exist
                                : "repeat(2, 1fr)", // Otherwise use 2 columns
                              gap: "0.75rem 2rem",
                              listStyle: "none",
                              padding: 0,
                              margin: 0,
                              marginBottom: "1.5rem",
                            }}
                          >
                            {activeCategoryContent.links
                              .filter((link) => !link.hidden)
                              .map((link) => (
                                <li key={link._id}>
                                  <Link
                                    href={link.url || "/"}
                                    style={{
                                      color: "#6b7280",
                                      textDecoration: "none",
                                      fontSize: "0.75rem",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.25rem",
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault() // Prevent actual navigation for testing
                                      handleLinkClick(
                                        link.title,
                                        link.url || "/",
                                        activeMenuItem?.title,
                                        activeCategoryContent.heading,
                                      )
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

                        {/* Primary Button - displayed below the links */}
                        {activeCategoryContent.primaryButton && !activeCategoryContent.primaryButton.hidden && (
                          <div style={{ marginBottom: "1.5rem" }}>
                            <Link
                              href={activeCategoryContent.primaryButton.url || "#"}
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
                                fontSize: "0.75rem",
                                width: "fit-content", // Only as wide as needed
                                minWidth: "150px", // Minimum width
                              }}
                              onClick={(e) => {
                                e.preventDefault() // Prevent actual navigation for testing
                                handlePrimaryButtonClick(
                                  activeCategoryContent.primaryButton.text,
                                  activeCategoryContent.primaryButton.url || "#",
                                  activeMenuItem?.title,
                                  activeCategoryContent.heading,
                                )
                              }}
                            >
                              <span>{activeCategoryContent.primaryButton.text}</span>
                              <ChevronRight size={16} style={{ flexShrink: 0 }} />
                            </Link>
                          </div>
                        )}

                        {/* Additional Link Sections - new feature */}
                        {renderAdditionalLinkSections()}

                        {/* Information Resources section - using subLists */}
                        {activeCategoryContent.subLists && activeCategoryContent.subLists.length > 0 && (
                          <div style={{ marginTop: "1.5rem" }}>
                            {activeCategoryContent.subLists
                              .filter((subList) => !subList.hidden)
                              .map((subList, subListIndex) => (
                                <div key={`sublist-${subListIndex}`} style={{ marginBottom: "1.5rem" }}>
                                  <h4
                                    style={{
                                      fontWeight: "600",
                                      marginTop: "0.5rem",
                                      marginBottom: "0.75rem",
                                      padding: "0.5rem 0",
                                      color: "#4b5563",
                                      fontSize: "0.95rem",
                                    }}
                                  >
                                    {subList.heading}
                                  </h4>

                                  {subList.links && subList.links.length > 0 && (
                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gap: "1rem",
                                      }}
                                    >
                                      {subList.links
                                        .filter((link) => !link.hidden)
                                        .map((link) => (
                                          <Link
                                            key={link._id}
                                            href={link.url || "#"}
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "0.75rem",
                                              padding: "0.5rem",
                                              borderRadius: "0.25rem",
                                              backgroundColor: "#f9fafb",
                                              textDecoration: "none",
                                              width: "70%", // Make the link 30% less wide
                                            }}
                                            onClick={(e) => {
                                              e.preventDefault() // Prevent actual navigation for testing
                                              handleLinkClick(
                                                link.title,
                                                link.url || "#",
                                                activeMenuItem?.title,
                                                subList.heading,
                                              )
                                            }}
                                          >
                                            {/* Only show image if it exists */}
                                            {link.image && (
                                              <div style={{ flexShrink: 0 }}>
                                                <Image
                                                  src={link.image || "/placeholder.svg"}
                                                  alt={link.title}
                                                  width={link.imageWidth || 72}
                                                  height={link.imageHeight || 56}
                                                  style={{ borderRadius: "0.25rem", objectFit: "cover" }}
                                                />
                                              </div>
                                            )}
                                            <span
                                              style={{
                                                fontSize: "0.75rem",
                                                fontWeight: "500",
                                                color: "#4b5563",
                                              }}
                                            >
                                              {link.title}
                                            </span>
                                          </Link>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Right side content area - flexible layout for CTA buttons and right-positioned additional link sections */}
                  <div
                    style={{
                      display: "flex",
                      flexGrow: 1,
                    }}
                  >
                    {/* CTA buttons */}
                    {(activeCategoryContent?.ctaButtons?.length > 0 ||
                      activeCategoryContent?.ctaButtonGroups?.length > 0) && (
                      <div
                        style={{
                          width: (() => {
                            // Count the number of right-side sections
                            const rightSectionCount =
                              activeCategoryContent?.additionalLinkSections?.filter(
                                (section) => !section.hidden && section.position === "right",
                              )?.length || 0

                            // Count total sections (CTA buttons + right sections)
                            const totalSections = rightSectionCount + 1

                            // Return percentage width, making CTA section narrower (75% of equal distribution)
                            return `${Math.floor((100 / totalSections) * 0.75)}%`
                          })(),
                          flexShrink: 0, // Prevent shrinking
                          marginLeft: "1.5rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "1rem",
                          paddingLeft: "1.5rem",
                          borderLeft: "1px solid #e5e7eb",
                        }}
                      >
                        {renderCtaButtonGroups()}
                      </div>
                    )}

                    {/* Right-side additional link sections */}
                    {renderRightSideAdditionalLinkSections()}
                  </div>
                </div>
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
