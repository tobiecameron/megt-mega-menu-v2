import type { Rule } from "@sanity/validation"

export default {
  name: "menuList",
  title: "Menu List",
  type: "document",
  fields: [
    {
      name: "heading",
      title: "List Heading",
      type: "string",
      description: "The heading for this list (not linked)",
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "hidden",
      title: "Hide this list",
      type: "boolean",
      description: "Toggle to hide this entire list from the menu",
      initialValue: false,
    },
    {
      name: "order",
      title: "Order",
      type: "number",
      description: "Used to determine the order of lists (lower numbers appear first)",
    },
    {
      name: "links",
      title: "Links",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "menuItem" }],
          options: {
            filter: "isTopLevel != true",
          },
        },
      ],
      description: "Select Child Menu items to include in this list",
      validation: (Rule: Rule) => Rule.required(),
      options: {
        sortable: true, // Enable drag-to-reorder functionality
      },
    },
    {
      name: "ctaButtonGroups",
      title: "Call to Action Button Groups",
      type: "array",
      of: [
        {
          type: "object",
          name: "ctaButtonGroup",
          fields: [
            {
              name: "heading",
              title: "Group Heading",
              type: "string",
              description: "Heading for this group of buttons",
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: "hidden",
              title: "Hide this group",
              type: "boolean",
              description: "Toggle to hide this entire group of buttons",
              initialValue: false,
            },
            {
              name: "buttons",
              title: "Buttons",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "ctaButton",
                  fields: [
                    {
                      name: "text",
                      title: "Button Text",
                      type: "string",
                      validation: (Rule: Rule) => Rule.required(),
                    },
                    {
                      name: "hidden",
                      title: "Hide this button",
                      type: "boolean",
                      description: "Toggle to hide this button",
                      initialValue: false,
                    },
                    {
                      name: "url",
                      title: "URL",
                      type: "url",
                      description: "Optional URL for the button",
                    },
                  ],
                },
              ],
              validation: (Rule: Rule) => Rule.required().min(1),
              description: "Add buttons to this group",
              options: {
                sortable: true, // Enable drag-to-reorder functionality
              },
            },
          ],
          preview: {
            select: {
              heading: "heading",
              buttonCount: "buttons.length",
              hidden: "hidden",
            },
            prepare({ heading, buttonCount, hidden }) {
              return {
                title: `${heading || "Untitled Group"}${hidden ? " (Hidden)" : ""}`,
                subtitle: `${buttonCount || 0} buttons`,
              }
            },
          },
        },
      ],
      description: "Add groups of call-to-action buttons that will appear on the right side of the menu",
      options: {
        sortable: true, // Enable drag-to-reorder functionality
      },
    },
    {
      name: "ctaButtons",
      title: "Call to Action Buttons (Legacy)",
      type: "array",
      of: [
        {
          type: "object",
          name: "ctaButton",
          fields: [
            {
              name: "text",
              title: "Button Text",
              type: "string",
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: "hidden",
              title: "Hide this button",
              type: "boolean",
              description: "Toggle to hide this button from the menu",
              initialValue: false,
            },
            {
              name: "url",
              title: "URL",
              type: "url",
              description: "Optional URL for the button",
            },
            {
              name: "group",
              title: "Button Group",
              type: "string",
              description: "Group name for organizing buttons with headings (leave empty for default group)",
            },
          ],
        },
      ],
      description:
        "DEPRECATED: Please use 'Call to Action Button Groups' instead. This field is kept for backward compatibility.",
      options: {
        sortable: true, // Enable drag-to-reorder functionality
      },
    },
    {
      name: "subLists",
      title: "Sub Lists",
      type: "array",
      of: [
        {
          type: "object",
          name: "subList",
          fields: [
            {
              name: "heading",
              title: "Sub List Heading",
              type: "string",
              description: "The heading for this sub-list (not linked)",
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: "hidden",
              title: "Hide this sub-list",
              type: "boolean",
              description: "Toggle to hide this sub-list from the menu",
              initialValue: false,
            },
            {
              name: "links",
              title: "Sub List Links",
              type: "array",
              of: [
                {
                  type: "reference",
                  to: [{ type: "menuItem" }],
                  options: {
                    filter: "isTopLevel != true",
                  },
                },
              ],
              description: "Select Child Menu items to include in this sub-list",
              validation: (Rule: Rule) => Rule.required(),
              options: {
                sortable: true, // Enable drag-to-reorder functionality
              },
            },
          ],
        },
      ],
      description: "Add sub-lists that will appear below the CTA buttons",
      options: {
        sortable: true, // Enable drag-to-reorder functionality
      },
    },
    {
      name: "additionalLinks",
      title: "Additional Links",
      type: "array",
      of: [
        {
          type: "object",
          name: "additionalLink",
          fields: [
            {
              name: "text",
              title: "Link Text",
              type: "string",
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: "hidden",
              title: "Hide this link",
              type: "boolean",
              description: "Toggle to hide this link from the menu",
              initialValue: false,
            },
            {
              name: "url",
              title: "URL",
              type: "url",
              description: "Optional URL for the link",
            },
          ],
        },
      ],
      description: "Add additional links that will appear after all sub-lists",
      options: {
        sortable: true, // Enable drag-to-reorder functionality
      },
    },
  ],
  preview: {
    select: {
      heading: "heading",
      linksCount: "links.length",
      buttonGroupsCount: "ctaButtonGroups.length",
      subListsCount: "subLists.length",
      additionalLinksCount: "additionalLinks.length",
      hidden: "hidden",
    },
    prepare(value) {
      const { heading, linksCount, buttonGroupsCount, subListsCount, additionalLinksCount, hidden } = value
      return {
        title: `${heading || "Untitled List"}${hidden ? " (Hidden)" : ""}`,
        subtitle: `${linksCount || 0} links, ${buttonGroupsCount || 0} button groups, ${subListsCount || 0} sub-lists, ${additionalLinksCount || 0} additional links`,
      }
    },
  },
}
