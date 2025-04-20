import type { Rule } from "@sanity/validation"

export default {
  name: "footerColumn",
  title: "Footer Column",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      description: "Optional column title (can be left empty)",
    },
    {
      name: "hidden",
      title: "Hide this column",
      type: "boolean",
      description: "Toggle to hide this column from the footer",
      initialValue: false,
    },
    {
      name: "order",
      title: "Order",
      type: "number",
      description: "Used to determine the order of columns (lower numbers appear first)",
    },
    {
      name: "links",
      title: "Links",
      type: "array",
      of: [
        {
          type: "object",
          name: "link",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: "hidden",
              title: "Hide this link",
              type: "boolean",
              description: "Toggle to hide this link",
              initialValue: false,
            },
            {
              name: "url",
              title: "URL",
              type: "url",
              description: "URL for the link (optional)",
              // Removed the validation rule to make it optional
            },
            {
              name: "hasIcon",
              title: "Has Icon/Image",
              type: "boolean",
              description: "Toggle if this link has an icon or image",
              initialValue: false,
            },
            {
              name: "isSocialIcons",
              title: "Is Social Media Icons",
              type: "boolean",
              description: "Toggle if this is a set of social media icons",
              initialValue: false,
              hidden: ({ parent }) => parent?.hasIcon, // Hide if it has an icon already
            },
            {
              name: "icon",
              title: "Icon/Image",
              type: "image",
              description: "Icon or image to display next to the link",
              hidden: ({ parent }) => !parent?.hasIcon,
              options: {
                hotspot: true,
              },
            },
            {
              name: "iconWidth",
              title: "Icon Width (px)",
              type: "number",
              description: "Width of the icon in pixels",
              hidden: ({ parent }) => !parent?.hasIcon,
              initialValue: 24,
            },
            {
              name: "iconHeight",
              title: "Icon Height (px)",
              type: "number",
              description: "Height of the icon in pixels",
              hidden: ({ parent }) => !parent?.hasIcon,
              initialValue: 24,
            },
          ],
        },
      ],
      description: "Links to display in this column",
      options: {
        sortable: true, // Enable drag-to-reorder functionality
      },
    },
  ],
  preview: {
    select: {
      title: "title",
      order: "order",
      linksCount: "links.length",
      hidden: "hidden",
    },
    prepare(value) {
      const { title, order, linksCount, hidden } = value
      return {
        title: `${order !== undefined ? order : "?"} - ${title || "Untitled Column"}${hidden ? " (Hidden)" : ""}`,
        subtitle: `${linksCount || 0} links`,
      }
    },
  },
}

