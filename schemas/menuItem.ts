import type { Rule } from "@sanity/validation"

export default {
  name: "menuItem",
  title: "Menu Item",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "hidden",
      title: "Hide this item",
      type: "boolean",
      description: "Toggle to hide this item from the menu",
      initialValue: false,
    },
    {
      name: "isTopLevel",
      title: "Is Top Level Item",
      type: "boolean",
      description: "Check this if this is a main navigation item",
      initialValue: false,
      readOnly: ({ document }) => !!document?._id, // Make read-only after creation
    },
    {
      name: "order",
      title: "Order",
      type: "number",
      description: "Used to determine the order of menu items (lower numbers appear first)",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
      },
    },
    {
      name: "url",
      title: "URL",
      type: "url",
      description: "External URL (optional)",
    },
    {
      name: "menuLists",
      title: "Menu Lists",
      type: "array",
      of: [{ type: "menuList" }],
      description: "Add up to 3 lists with headings and links (only available for top-level menu items)",
      validation: (Rule: Rule) => Rule.max(3).warning("You can add up to 3 lists"),
      hidden: ({ parent }) => !parent?.isTopLevel, // Hide this field if not a top-level item
    },
  ],
  preview: {
    select: {
      title: "title",
      isTopLevel: "isTopLevel",
      order: "order",
      listsCount: "menuLists.length",
      hidden: "hidden",
    },
    prepare(value) {
      const { title, isTopLevel, order, listsCount, hidden } = value
      return {
        title: `${order !== undefined ? order : "?"} - ${title || "Untitled"}${hidden ? " (Hidden)" : ""}`,
        subtitle: `${isTopLevel ? "Top Level Item" : "Child Item"} ${isTopLevel && listsCount ? `(${listsCount} lists)` : ""}`,
      }
    },
  },
}

