import { createClient } from "next-sanity"

// Define a placeholder project ID for development
const PLACEHOLDER_PROJECT_ID = "placeholder-project-id"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || PLACEHOLDER_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2023-05-03"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Create a client with proper error handling
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  // Only use token auth in server context
  token: !isBrowser ? process.env.SANITY_API_TOKEN : undefined,
})

// Helper function to check if Sanity is properly configured
export const isSanityConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== PLACEHOLDER_PROJECT_ID
  )
}

export const hasSanityToken = () => {
  return !!process.env.SANITY_API_TOKEN
}

