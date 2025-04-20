import type { Rule } from "@sanity/validation"

export default {
  name: "menu",
  title: "Main Menu",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
      },
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "isActive",
      title: "Active Menu",
      type: "boolean",
      description: "Set this menu as the active menu for the site.",
      initialValue: false,
      validation: (Rule: Rule) =>
        Rule.custom(async (isActive, context) => {
          // Only validate when setting to active
          if (!isActive) return true

          // Get the current document ID
          const documentId = context.document._id

          // Check if there are other active menus
          const client = context.getClient({ apiVersion: "2023-05-03" })
          const query = `count(*[_type == "menu" && _id != $id && isActive == true])`
          const count = await client.fetch(query, { id: documentId })

          // If there are other active menus, show a warning
          if (count > 0) {
            return 'Warning: There are other active menus. Using the "Set as Active Menu" action is recommended to ensure only one menu is active.'
          }

          return true
        }),
    },
    {
      name: "items",
      title: "Menu Items",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "menuItem" }],
        },
      ],
      description: "Menu items",
    },
  ],
  preview: {
    select: {
      title: "title",
      isActive: "isActive",
    },
    prepare({ title, isActive }) {
      return {
        title: title || "Untitled Menu",
        subtitle: isActive ? "✓ Active" : "Inactive",
      }
    },
  },
}

