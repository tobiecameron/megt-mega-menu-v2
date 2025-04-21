"use client"

import { useState, useEffect } from "react"
import { useClient } from "sanity"

// Action to set a menu as active and deactivate all others
export const setActiveMenuAction = (props) => {
  const { draft, published, id } = props
  const client = useClient({ apiVersion: "2023-05-03" })
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get the document we're working with (draft or published)
  const doc = draft || published

  // Check if this menu is already active
  useEffect(() => {
    if (doc?.isActive) {
      setIsActive(true)
    } else {
      setIsActive(false)
    }
  }, [doc])

  return {
    label: isActive ? "Deactivate Menu" : "Set as Active Menu",
    onHandle: async () => {
      setIsLoading(true)

      try {
        if (!isActive) {
          // First, deactivate all other menus
          await client
            .patch({ query: `*[_type == "menu" && _id != $id && isActive == true]`, params: { id } })
            .set({ isActive: false })
            .commit()

          // Then activate this menu
          await client.patch(id).set({ isActive: true }).commit()

          setIsActive(true)
        } else {
          // Just deactivate this menu
          await client.patch(id).set({ isActive: false }).commit()

          setIsActive(false)
        }
      } catch (err) {
        console.error("Error updating menu status:", err)
        // Add more detailed error logging
        if (err instanceof Error) {
          console.error("Error message:", err.message)
          console.error("Error stack:", err.stack)
        }
      } finally {
        setIsLoading(false)
      }
    },
    disabled: isLoading,
  }
}
