import type { Rule } from "@sanity/validation"

export default {
  name: "otherItem",
  title: "Other Item",
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
      description: "Toggle to hide this item",
      initialValue: false,
    },
    {
      name: "itemType",
      title: "Item Type",
      type: "string",
      options: {
        list: [
          { title: "Action Button", value: "actionButton" },
          { title: "Secondary Nav Link", value: "secondaryNavLink" },
          { title: "Job Board Button", value: "jobBoardButton" },
          // Add other types here if needed in the future
        ],
      },
      initialValue: "actionButton",
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "buttonText",
      title: "Button Text",
      type: "string",
      description: "Text to display on the button",
      hidden: ({ parent }) => parent?.itemType !== "actionButton" && parent?.itemType !== "jobBoardButton",
    },
    {
      name: "buttonUrl",
      title: "URL",
      type: "url",
      description: "URL for the button or link",
    },
    {
      name: "placement",
      title: "Placement",
      type: "string",
      options: {
        list: [
          { title: "Header - Main Navigation", value: "headerMain" },
          { title: "Header - Secondary Navigation", value: "headerSecondary" },
          { title: "Header - Double Height (Both Navs)", value: "headerDoubleHeight" },
          { title: "Footer - Right Side", value: "footer" },
        ],
      },
      initialValue: "headerMain",
      description: "Where to display this item",
    },
    {
      name: "order",
      title: "Order",
      type: "number",
      description: "Used to determine the order of items (lower numbers appear first)",
    },
  ],
  preview: {
    select: {
      title: "title",
      itemType: "itemType",
      buttonText: "buttonText",
      placement: "placement",
      hidden: "hidden",
    },
    prepare(value) {
      const { title, itemType, buttonText, placement, hidden } = value

      let typeLabel = "Unknown"
      if (itemType === "actionButton") typeLabel = "Action Button"
      if (itemType === "secondaryNavLink") typeLabel = "Secondary Nav Link"
      if (itemType === "jobBoardButton") typeLabel = "Job Board Button"

      let placementLabel = "Unknown"
      if (placement === "headerMain") placementLabel = "Header - Main Nav"
      if (placement === "headerSecondary") placementLabel = "Header - Secondary Nav"
      if (placement === "headerDoubleHeight") placementLabel = "Header - Double Height"
      if (placement === "footer") placementLabel = "Footer"

      return {
        title: `${title || "Untitled"}${hidden ? " (Hidden)" : ""}`,
        subtitle: `${typeLabel}${buttonText ? `: "${buttonText}"` : ""} | ${placementLabel}`,
      }
    },
  },
}
