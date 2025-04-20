import type { Rule } from "@sanity/validation"

export default {
  name: "footerItem",
  title: "Footer Item",
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
      description: "Toggle to hide this item from the footer",
      initialValue: false,
    },
    {
      name: "order",
      title: "Order",
      type: "number",
      description: "Used to determine the order of footer items (lower numbers appear first)",
    },
    {
      name: "children",
      title: "Child Items",
      type: "array",
      of: [
        {
          type: "object",
          name: "childItem",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
            },
            {
              name: "hidden",
              title: "Hide this child item",
              type: "boolean",
              description: "Toggle to hide this child item",
              initialValue: false,
            },
            {
              name: "itemType",
              title: "Item Type",
              type: "string",
              options: {
                list: [
                  { title: "Link", value: "link" },
                  { title: "Content", value: "content" },
                ],
              },
              initialValue: "link",
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: "url",
              title: "URL",
              type: "url",
              description: "URL for the link (optional)",
              hidden: ({ parent }) => parent?.itemType !== "link",
            },
            {
              name: "content",
              title: "Content",
              type: "text",
              description: "Text content to display",
              hidden: ({ parent }) => parent?.itemType !== "content",
            },
          ],
        },
      ],
      description: "Add child items that will be shown when this footer item is expanded",
    },
    {
      name: "contactButton",
      title: "Contact Us Button",
      type: "object",
      fields: [
        {
          name: "show",
          title: "Show Contact Button",
          type: "boolean",
          initialValue: false,
        },
        {
          name: "text",
          title: "Button Text",
          type: "string",
          initialValue: "Contact Us",
          hidden: ({ parent }) => !parent?.show,
        },
        {
          name: "url",
          title: "Button URL",
          type: "url",
          initialValue: "/contact",
          description: "Optional URL for the contact button",
          hidden: ({ parent }) => !parent?.show,
        },
        {
          name: "hidden",
          title: "Hide this button",
          type: "boolean",
          description: "Toggle to hide this contact button",
          initialValue: false,
          hidden: ({ parent }) => !parent?.show,
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      order: "order",
      childrenCount: "children.length",
      hasContactButton: "contactButton.show",
      hidden: "hidden",
    },
    prepare(value) {
      const { title, order, childrenCount, hasContactButton, hidden } = value
      return {
        title: `${order !== undefined ? order : "?"} - ${title || "Untitled"}${hidden ? " (Hidden)" : ""}`,
        subtitle: `${childrenCount || 0} child items${hasContactButton ? ", Has Contact Button" : ""}`,
      }
    },
  },
}

