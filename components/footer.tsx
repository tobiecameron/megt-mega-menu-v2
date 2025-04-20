"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus, Minus, ChevronRight, Mail, ArrowRight, Facebook, Linkedin, Instagram, Youtube } from "lucide-react"
import { useMenuInteractions } from "./menu-interaction-context"

type FooterChildItem = {
  title: string
  itemType: "link" | "content" | "social"
  url?: string
  content?: string
  hidden?: boolean
  socialType?: string
}

type ContactButton = {
  show: boolean
  text?: string
  url?: string
  hidden?: boolean
}

type FooterItem = {
  _id: string
  title: string
  order?: number
  hidden?: boolean
  children?: FooterChildItem[]
  contactButton?: ContactButton
}

type FooterColumnLink = {
  title: string
  url?: string
  hasIcon?: boolean
  icon?: string
  iconWidth?: number
  iconHeight?: number
  hidden?: boolean
  isSocialIcons?: boolean // New property to identify social media icon sets
}

type FooterColumn = {
  _id: string
  title?: string
  order?: number
  hidden?: boolean
  links: FooterColumnLink[]
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

type PolicyLink = {
  title: string
  url: string
}

type SocialMediaIcon = {
  name: string
  icon: React.ReactNode
  url: string
}

type FooterProps = {
  footerItems: FooterItem[]
  otherItems: OtherItem[]
  columns?: FooterColumn[]
  policyLinks?: PolicyLink[]
}

export function Footer({ footerItems, otherItems, columns = [], policyLinks = [] }: FooterProps) {
  // Filter out hidden footer items
  const visibleFooterItems = footerItems.filter((item) => !item.hidden)

  // Filter out hidden footer columns
  const visibleColumns = columns.filter((column) => !column.hidden)

  // Filter out footer action buttons
  const footerActionButtons = otherItems.filter(
    (item) => !item.hidden && item.placement === "footer" && item.itemType === "actionButton",
  )

  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({})
  const [columnWidth, setColumnWidth] = useState<string>("auto")
  const firstColumnRef = useRef<HTMLDivElement>(null)
  const secondColumnRef = useRef<HTMLDivElement>(null)
  const titleRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({})
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const { addInteraction, showNotification, currentNotification } = useMenuInteractions()
  const [notificationVisible, setNotificationVisible] = useState(false)
  const [notificationFading, setNotificationFading] = useState(false)
  const [notificationText, setNotificationText] = useState("")

  // Social media icons configuration
  const socialMediaIcons: SocialMediaIcon[] = [
    { name: "Facebook", icon: <Facebook size={16} />, url: "https://facebook.com" },
    { name: "LinkedIn", icon: <Linkedin size={16} />, url: "https://linkedin.com" },
    { name: "Instagram", icon: <Instagram size={16} />, url: "https://instagram.com" },
    { name: "YouTube", icon: <Youtube size={16} />, url: "https://youtube.com" },
  ]

  // Add a new function to handle footer interactions with parent context
  const handleFooterInteraction = (title: string, url: string, parentTitle?: string) => {
    // Format the title with hierarchical information
    let formattedTitle = title

    if (parentTitle) {
      // Format as: "footer: Parent > Title"
      formattedTitle = `footer: ${parentTitle} > ${title}`
    } else {
      // Format as: "footer: Title"
      formattedTitle = `footer: ${title}`
    }

    addInteraction(formattedTitle, url)
    showNotification(formattedTitle)
  }

  // Handle social media icon click
  const handleSocialMediaClick = (name: string, url: string, parentTitle?: string) => {
    // Format the title with hierarchical information
    let formattedTitle

    if (parentTitle) {
      // Format as: "Social: Parent > Name"
      formattedTitle = `Social: ${parentTitle} > ${name}`
    } else {
      // Format as: "Social: Name"
      formattedTitle = `Social: ${name}`
    }

    addInteraction(formattedTitle, url)
    showNotification(formattedTitle)
  }

  // Handle action button click
  const handleActionButtonClick = (text: string, url?: string) => {
    addInteraction(`Action Button: ${text} (clicked)`, url || "#")
    showNotification(`Action Button: ${text} (clicked)`)
  }

  // Handle policy link click
  const handlePolicyLinkClick = (title: string, url: string) => {
    addInteraction(`Policy: ${title} (clicked)`, url)
    showNotification(`Policy: ${title} (clicked)`)
  }

  // Update the toggleItem function to log interactions and maintain scroll position
  const toggleItem = (id: string, title: string, hasChildren: boolean) => {
    // If there are no children, just log a click and return
    if (!hasChildren) {
      handleFooterInteraction(`${title} (clicked)`, `#footer-${id}`)
      return
    }

    const isExpanding = !expandedItems[id]
    const isClosing = expandedItems[id]

    // Get the current position of the item before expanding
    const itemElement = itemRefs.current[id]
    let itemPosition = 0

    if (itemElement && isExpanding) {
      // Get the current position relative to the viewport
      const rect = itemElement.getBoundingClientRect()
      itemPosition = rect.top
    }

    // Update the expanded state
    setExpandedItems((prev) => ({
      ...prev,
      [id]: isExpanding,
    }))

    // Log the interaction when opening or closing
    if (isExpanding) {
      handleFooterInteraction(`${title} (opened)`, `#footer-${id}`)
    } else if (isClosing) {
      handleFooterInteraction(`${title} (closed)`, `#footer-${id}`)
    }

    // If expanding, wait for the DOM to update and then scroll to maintain position
    if (isExpanding) {
      setTimeout(() => {
        if (itemElement) {
          // Get the new position after expansion
          const newRect = itemElement.getBoundingClientRect()
          // Calculate how much the position has changed
          const offset = newRect.top - itemPosition
          // Scroll the window to maintain the original position
          window.scrollBy({
            top: offset,
            behavior: "auto", // Use 'auto' for immediate scrolling without animation
          })
        }
      }, 0)
    }
  }

  // Split footer items into two columns
  const splitFooterItems = () => {
    if (!visibleFooterItems || visibleFooterItems.length === 0) return [[], []]

    const midpoint = Math.ceil(visibleFooterItems.length / 2)
    const firstColumn = visibleFooterItems.slice(0, midpoint)
    const secondColumn = visibleFooterItems.slice(midpoint)

    return [firstColumn, secondColumn]
  }

  const [firstColumnItems, secondColumnItems] = splitFooterItems()

  // Calculate the width based on the widest title
  useEffect(() => {
    const calculateColumnWidth = () => {
      // Get all title elements
      const titleElements = Object.values(titleRefs.current).filter(Boolean)

      if (titleElements.length === 0) return

      // Find the widest title
      let maxWidth = 0
      titleElements.forEach((element) => {
        if (element) {
          const width = element.getBoundingClientRect().width
          maxWidth = Math.max(maxWidth, width)
        }
      })

      // Add padding for the plus/minus icon and some extra space
      const finalWidth = maxWidth + 40 // 16px for icon + 24px for padding/margins

      setColumnWidth(`${finalWidth}px`)
    }

    // Wait a bit for the DOM to be fully rendered
    setTimeout(calculateColumnWidth, 100)

    // Recalculate on window resize
    window.addEventListener("resize", calculateColumnWidth)
    return () => window.removeEventListener("resize", calculateColumnWidth)
  }, [visibleFooterItems])

  // Update notification handling
  useEffect(() => {
    if (currentNotification) {
      // Store the notification text
      setNotificationText(currentNotification)
      // Show the notification
      setNotificationVisible(true)
      setNotificationFading(false)

      // Start fading after 2 seconds
      const fadeTimer = setTimeout(() => {
        setNotificationFading(true)
      }, 2000)

      // Hide completely after 3 seconds (after fade completes)
      const hideTimer = setTimeout(() => {
        setNotificationVisible(false)
      }, 3000)

      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [currentNotification])

  // Render action buttons
  const renderActionButtons = () => {
    if (!footerActionButtons || footerActionButtons.length === 0) return null

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {footerActionButtons.map((item) => (
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
              fontSize: "0.92rem",
              textDecoration: "none",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
            onClick={(e) => {
              e.preventDefault() // Prevent actual navigation for testing
              handleActionButtonClick(item.buttonText || "Action", item.buttonUrl)
            }}
          >
            <span>{item.buttonText || "Action"}</span>
            <ArrowRight size={16} color="#ffb612" /> {/* Yellow arrow */}
          </Link>
        ))}
      </div>
    )
  }

  // Render social media icons as a footer list item
  const renderSocialMediaItem = (socialItems: FooterChildItem[], parentTitle?: string) => {
    if (!socialItems || socialItems.length === 0) return null

    return (
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        {socialItems.map((item, index) => {
          // Determine which icon to use based on socialType
          let icon = <Facebook size={16} />
          let name = "Facebook"
          let url = item.url || "https://facebook.com"

          if (item.socialType === "linkedin") {
            icon = <Linkedin size={16} />
            name = "LinkedIn"
            url = item.url || "https://linkedin.com"
          } else if (item.socialType === "instagram") {
            icon = <Instagram size={16} />
            name = "Instagram"
            url = item.url || "https://instagram.com"
          } else if (item.socialType === "youtube") {
            icon = <Youtube size={16} />
            name = "YouTube"
            url = item.url || "https://youtube.com"
          }

          return (
            <Link
              key={index}
              href={url}
              style={{
                color: "#ffffff",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s ease",
              }}
              onClick={(e) => {
                e.preventDefault() // Prevent actual navigation for testing
                handleSocialMediaClick(name, url, parentTitle)
              }}
              aria-label={`Visit our ${name} page`}
            >
              {icon}
            </Link>
          )
        })}
      </div>
    )
  }

  // Render social media icons for footer columns
  const renderColumnSocialIcons = (parentTitle?: string) => {
    return (
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        {socialMediaIcons.map((social, index) => (
          <Link
            key={index}
            href={social.url}
            style={{
              color: "#ffffff",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s ease",
            }}
            onClick={(e) => {
              e.preventDefault() // Prevent actual navigation for testing
              handleSocialMediaClick(social.name, social.url, parentTitle)
            }}
            aria-label={`Visit our ${social.name} page`}
          >
            {social.icon}
          </Link>
        ))}
      </div>
    )
  }

  // Render a footer column
  const renderFooterColumn = (column: FooterColumn) => {
    const visibleLinks = column.links.filter((link) => !link.hidden)

    if (visibleLinks.length === 0) return null

    return (
      <div
        key={column._id}
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: "140px",
          marginLeft: "3rem", // Changed from 1.5rem to 3rem to double the spacing
        }}
      >
        {column.title && (
          <h3
            style={{
              fontSize: "0.92rem", // Reduced size to match content
              fontWeight: "bold",
              margin: "0 0 0.75rem 0",
              color: "#ffffff",
            }}
          >
            {column.title}
          </h3>
        )}

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
          {visibleLinks.map((link, index) => (
            <li key={index}>
              {link.isSocialIcons ? (
                // Render social media icons as a set with parent context
                renderColumnSocialIcons(column.title || "Footer Column")
              ) : link.hasIcon && link.icon ? (
                // Render as image only (no chevron) if it has an icon
                <Link
                  href={link.url || "#"} // Use "#" as fallback if no URL
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "rgba(255, 255, 255, 0.8)",
                    textDecoration: "none",
                    fontSize: "0.92rem",
                  }}
                  onClick={(e) => {
                    e.preventDefault() // Prevent actual navigation for testing
                    handleFooterInteraction(
                      `${link.title} (clicked)`,
                      link.url || "#",
                      column.title || "Footer Column", // Pass parent title
                    )
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Image
                      src={link.icon || "/placeholder.svg"}
                      alt={link.title || "Footer image"}
                      width={link.iconWidth || 80} // Default to a larger width for images
                      height={link.iconHeight || 40}
                      style={{ maxWidth: "100%" }}
                    />
                    {/* Title is not displayed but still used for tracking */}
                  </div>
                </Link>
              ) : (
                // Render as text link with chevron if no icon
                <Link
                  href={link.url || "#"} // Use "#" as fallback if no URL
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "rgba(255, 255, 255, 0.8)",
                    textDecoration: "none",
                    fontSize: "0.92rem",
                    justifyContent: "space-between", // Space between content and chevron
                  }}
                  onClick={(e) => {
                    e.preventDefault() // Prevent actual navigation for testing
                    handleFooterInteraction(
                      `${link.title} (clicked)`,
                      link.url || "#",
                      column.title || "Footer Column", // Pass parent title
                    )
                  }}
                >
                  <span>{link.title}</span>
                  <ChevronRight size={12} style={{ flexShrink: 0, paddingLeft: "10px" }} />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Render additional columns container
  const renderAdditionalColumns = () => {
    if (visibleColumns.length === 0) return null

    return (
      <div
        style={{
          display: "flex",
          marginLeft: "auto", // Push to the right
          alignItems: "flex-start", // Align to the top
          paddingTop: "0", // Align with the top of the footer
        }}
      >
        {/* Additional Columns */}
        {visibleColumns.map((column) => renderFooterColumn(column))}
      </div>
    )
  }

  return (
    <footer
      style={{
        backgroundColor: "#003087",
        color: "#ffffff",
        width: "100%",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          paddingLeft: "10px",
          paddingRight: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Logo section - now at the top */}
        <div style={{ minWidth: "150px", maxWidth: "120px", marginLeft: "5px", marginTop: "1.8rem" }}>
          <Image
            src="/logo-neg.svg"
            alt="MEGT Logo"
            width={80}
            height={40}
            style={{ height: "3.2rem", width: "auto" }}
          />
        </div>

        {/* Main footer content with left and right sections */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between", // Space between main columns and additional columns
            width: "100%",
          }}
        >
          {/* Left section with main footer items */}
          <div
            style={{
              display: "flex",
              gap: "2.5rem", // Increased gap between columns
              flexWrap: "wrap", // Allow wrapping on smaller screens
            }}
          >
            {/* First column */}
            <div
              ref={firstColumnRef}
              style={{
                width: columnWidth,
                minWidth: "140px", // Reduced minimum width for small screens
              }}
            >
              {firstColumnItems.map((item) => {
                // Filter out hidden children
                const visibleChildren = item.children?.filter((child) => !child.hidden) || []
                const hasChildren = visibleChildren.length > 0

                return (
                  <div
                    key={item._id}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                    ref={(el) => (itemRefs.current[item._id] = el)}
                  >
                    <button
                      onClick={() => toggleItem(item._id, item.title, hasChildren)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "none",
                        border: "none",
                        color: "#ffffff",
                        fontSize: "0.92rem", // Reduced from 0.9rem to match content
                        fontWeight: "bold",
                        padding: "0.5rem 0",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                      }}
                      aria-expanded={expandedItems[item._id]}
                    >
                      <span>
                        {hasChildren ? expandedItems[item._id] ? <Minus size={16} /> : <Plus size={16} /> : null}
                      </span>
                      <span ref={(el) => (titleRefs.current[`first-${item._id}`] = el)}>{item.title}</span>
                    </button>

                    {expandedItems[item._id] && hasChildren && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column", // Changed to column to stack items vertically
                          paddingLeft: "1.5rem",
                          marginTop: "0.5rem",
                          gap: "1rem", // Add gap between child items and contact button
                        }}
                      >
                        {/* Child items */}
                        {visibleChildren.length > 0 && (
                          <ul
                            style={{
                              listStyle: "none",
                              padding: "0",
                              margin: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.5rem",
                              width: "100%",
                            }}
                          >
                            {visibleChildren.map((child, index) => (
                              <li key={index}>
                                {child.itemType === "social" ? (
                                  // Render social media icons with parent context
                                  renderSocialMediaItem([child], item.title)
                                ) : child.itemType === "link" ? (
                                  <Link
                                    href={child.url || "#"}
                                    style={{
                                      color: "rgba(255, 255, 255, 0.8)",
                                      textDecoration: "none",
                                      fontSize: "0.92rem",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.25rem",
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault() // Prevent actual navigation for testing
                                      handleFooterInteraction(
                                        `${child.title || "Untitled Link"} (clicked)`,
                                        child.url || "#",
                                        item.title, // Pass parent title
                                      )
                                    }}
                                  >
                                    <span>{child.title}</span>
                                    <ChevronRight size={12} style={{ flexShrink: 0, paddingLeft: "10px" }} />
                                  </Link>
                                ) : (
                                  <div>
                                    {child.title && (
                                      <h4
                                        style={{
                                          margin: "0 0 0.25rem 0",
                                          fontSize: "0.8rem",
                                          fontWeight: "bold",
                                          color: "rgba(255, 255, 255, 0.9)",
                                        }}
                                      >
                                        {child.title}
                                      </h4>
                                    )}
                                    {child.content && (
                                      <p
                                        style={{
                                          margin: 0,
                                          fontSize: "0.8rem",
                                          color: "rgba(255, 255, 255, 0.8)",
                                          lineHeight: "1.4",
                                        }}
                                      >
                                        {child.content}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Contact button - now positioned below child items */}
                        {item.contactButton && item.contactButton.show && !item.contactButton.hidden && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                            }}
                          >
                            <Link
                              href={item.contactButton.url || "#"}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                backgroundColor: "#ffb612",
                                color: "#000000",
                                padding: "0.5rem 1rem",
                                borderRadius: "0.375rem",
                                fontSize: "0.92rem",
                                fontWeight: "500",
                                textDecoration: "none",
                                whiteSpace: "nowrap",
                              }}
                              onClick={(e) => {
                                e.preventDefault() // Prevent actual navigation for testing
                                handleFooterInteraction(
                                  `${item.contactButton.text || "Contact Us"} (clicked)`,
                                  item.contactButton.url || "#",
                                  item.title, // Pass parent title
                                )
                              }}
                            >
                              <Mail size={16} />
                              <span>{item.contactButton.text || "Contact Us"}</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Second column */}
            <div
              ref={secondColumnRef}
              style={{
                width: columnWidth,
                minWidth: "140px", // Reduced minimum width for small screens
              }}
            >
              {secondColumnItems.map((item) => {
                // Filter out hidden children
                const visibleChildren = item.children?.filter((child) => !child.hidden) || []
                const hasChildren = visibleChildren.length > 0

                // Check if this is a social media item with all social type children
                const isSocialItem = visibleChildren.every((child) => child.itemType === "social")

                return (
                  <div
                    key={item._id}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                    ref={(el) => (itemRefs.current[item._id] = el)}
                  >
                    <button
                      onClick={() => toggleItem(item._id, item.title, hasChildren)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "none",
                        border: "none",
                        color: "#ffffff",
                        fontSize: "0.92rem", // Reduced from 0.9rem to match content
                        fontWeight: "bold",
                        padding: "0.5rem 0",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                      }}
                      aria-expanded={expandedItems[item._id]}
                    >
                      <span>
                        {hasChildren ? expandedItems[item._id] ? <Minus size={16} /> : <Plus size={16} /> : null}
                      </span>
                      <span ref={(el) => (titleRefs.current[`second-${item._id}`] = el)}>{item.title}</span>
                    </button>

                    {expandedItems[item._id] && hasChildren && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column", // Changed to column to stack items vertically
                          paddingLeft: "1.5rem",
                          marginTop: "0.5rem",
                          gap: "1rem", // Add gap between child items and contact button
                        }}
                      >
                        {/* Child items */}
                        {visibleChildren.length > 0 && (
                          <ul
                            style={{
                              listStyle: "none",
                              padding: "0",
                              margin: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.5rem",
                              width: "100%",
                            }}
                          >
                            {/* Special handling for social media items */}
                            {isSocialItem ? (
                              <li>{renderSocialMediaItem(visibleChildren, item.title)}</li>
                            ) : (
                              // Regular items
                              visibleChildren.map((child, index) => (
                                <li key={index}>
                                  {child.itemType === "social" ? (
                                    // Render social media icons with parent context
                                    renderSocialMediaItem([child], item.title)
                                  ) : child.itemType === "link" ? (
                                    <Link
                                      href={child.url || "#"}
                                      style={{
                                        color: "rgba(255, 255, 255, 0.8)",
                                        textDecoration: "none",
                                        fontSize: "0.92rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.25rem",
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault() // Prevent actual navigation for testing
                                        handleFooterInteraction(
                                          `${child.title || "Untitled Link"} (clicked)`,
                                          child.url || "#",
                                          item.title, // Pass parent title
                                        )
                                      }}
                                    >
                                      <span>{child.title}</span>
                                      <ChevronRight size={12} style={{ flexShrink: 0, paddingLeft: "10px" }} />
                                    </Link>
                                  ) : (
                                    <div>
                                      {child.title && (
                                        <h4
                                          style={{
                                            margin: "0 0 0.25rem 0",
                                            fontSize: "0.8rem",
                                            fontWeight: "bold",
                                            color: "rgba(255, 255, 255, 0.9)",
                                          }}
                                        >
                                          {child.title}
                                        </h4>
                                      )}
                                      {child.content && (
                                        <p
                                          style={{
                                            margin: 0,
                                            fontSize: "0.8rem",
                                            color: "rgba(255, 255, 255, 0.8)",
                                            lineHeight: "1.4",
                                          }}
                                        >
                                          {child.content}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </li>
                              ))
                            )}
                          </ul>
                        )}

                        {/* Contact button - now positioned below child items */}
                        {item.contactButton && item.contactButton.show && !item.contactButton.hidden && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                            }}
                          >
                            <Link
                              href={item.contactButton.url || "#"}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                backgroundColor: "#ffb612",
                                color: "#000000",
                                padding: "0.5rem 1rem",
                                borderRadius: "0.375rem",
                                fontSize: "0.92rem",
                                fontWeight: "500",
                                textDecoration: "none",
                                whiteSpace: "nowrap",
                              }}
                              onClick={(e) => {
                                e.preventDefault() // Prevent actual navigation for testing
                                handleFooterInteraction(
                                  `${item.contactButton.text || "Contact Us"} (clicked)`,
                                  item.contactButton.url || "#",
                                  item.title, // Pass parent title
                                )
                              }}
                            >
                              <Mail size={16} />
                              <span>{item.contactButton.text || "Contact Us"}</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right section with additional columns */}
          {renderAdditionalColumns()}
        </div>

        {/* Action buttons - now in a separate row */}
        {footerActionButtons.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end", // Align to the right
              paddingTop: "0.5rem",
            }}
          >
            {renderActionButtons()}
          </div>
        )}

        {/* Bottom section with copyright and policy links */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            paddingTop: "1rem",
            paddingBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            position: "relative", // Add this for positioning the notification
            minHeight: "2.5rem", // Add minimum height to maintain consistent spacing
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <p style={{ margin: 0, fontSize: "0.805rem" }}>
              &copy; {new Date().getFullYear()} MEGT. All rights reserved.
            </p>

            {/* Studio link - moved to left side */}
            <Link
              href="/studio"
              style={{
                textDecoration: "none",
                fontSize: "0.805rem",
                padding: "0.35rem 0.75rem",
                backgroundColor: "#003087", // Blue background
                color: "#add8e6", // Light blue text
                borderRadius: "0.375rem",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                // Still log the interaction but allow navigation to proceed
                handleFooterInteraction("Edit Mega Menu (clicked)", "/studio")
              }}
            >
              Edit Mega Menu (Log In Required)
            </Link>
          </div>

          {/* Notification - only render when visible */}
          {notificationVisible && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                color: "#ffb612", // Yellow text
                fontWeight: "500",
                fontSize: "0.92rem",
                textAlign: "center",
                transition: "opacity 1s ease-out",
                opacity: notificationFading ? 0 : 1,
                pointerEvents: "none", // Prevent interaction with the notification
              }}
              aria-live="polite"
            >
              Link clicked: {notificationText}
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {/* Policy links (yellow buttons) */}
            {policyLinks.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                className="btn-primary"
                style={{
                  textDecoration: "none",
                  fontSize: "0.805rem",
                  padding: "0.35rem 0.75rem",
                  backgroundColor: "#ffb612",
                  color: "#000000",
                  borderRadius: "0.375rem",
                }}
                onClick={(e) => {
                  e.preventDefault() // Prevent actual navigation for testing
                  handlePolicyLinkClick(link.title, link.url)
                }}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

