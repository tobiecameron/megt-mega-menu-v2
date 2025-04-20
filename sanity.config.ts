import { defineConfig } from "sanity"
import { deskTool } from "sanity/desk"
import { visionTool } from "@sanity/vision"
import { schemaTypes } from "./schemas"
import { structure } from "./deskStructure"
import { setActiveMenuAction } from "./actions/setActiveMenuAction"

// Define a placeholder project ID for development
const PLACEHOLDER_PROJECT_ID = "placeholder-project-id"

export default defineConfig({
  name: "megt-mega-menu",
  title: "MEGT Mega Menu",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || PLACEHOLDER_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",

  plugins: [
    deskTool({
      structure,
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, context) => {
      if (context.schemaType === "menu") {
        return [...prev, setActiveMenuAction]
      }
      return prev
    },
  },

  basePath: "/studio",
})

