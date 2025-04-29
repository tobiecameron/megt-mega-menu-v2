import type { Rule } from "@sanity/validation"

export default {
  name: "menuList",
  title: "Menu List",
  type: "object", // Changed from "document" to "object" since this is embedded in menuItem
  fields: [
    {
      name: "heading",
      title: "List Heading",
      type: "string",
      description: "The heading for this list (not linked)",
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: "contentHeading",
      title: "Content Area Heading",
      type: "string",
      description:
        "Optional custom heading for the content area (defaults to 'Learn about [list heading]' if not provided)",
    },
    {
      name: "hasCustomContent",
      title: "Add Custom Content",
      type: "boolean",
      description: "Enable to add custom content to this menu list",
      initialValue: false,
    },
    {
      name: "customContent",
      title: "Custom Content",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                  },
                ],
              },
            ],
          },
        },
      ],
      description: "Add custom content to display in the menu list",
      hidden: ({ parent }) => !parent?.hasCustomContent,
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
      // Make links optional
      validation: (Rule: Rule) => Rule,
      options: {
        sortable: true, // Enable drag-to-reorder functionality
      },
    },
    {
      name: "primaryButton",
      title: "Primary Button (Below Links)",
      type: "object",
      description: "Add a yellow button that appears directly below the links section",
      fields: [
        {
          name: "text",
          title: "Button Text",
          type: "string",
          validation: (Rule: Rule) => Rule.required(),
        },
        {
          name: "url",
          title: "URL",
          type: "url",
          description: "URL for the button (optional)",
        },
        {
          name: "hidden",
          title: "Hide this button",
          type: "boolean",
          description: "Toggle to hide this button",
          initialValue: false,
        },
      ],
    },
    {
      name: "additionalLinkSections",
      title: "Additional Link Sections",
      type: "array",
      of: [
        {
          type: "object",
          name: "linkSection",
          fields: [
            {
              name: "sectionHeading",
              title: "Section Heading",
              type: "string",
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: "sectionContentHeading",
              title: "Section Content Heading",
              type: "string",
              description: "Optional non-clickable heading displayed below the section heading",
            },
            {
              name: "position",
              title: "Position",
              type: "string",
              options: {
                list: [
                  { title: "Below Primary Links", value: "below" },
                  { title: "Right Side (RHS)", value: "right" },
                ],
              },
              initialValue: "below",
              description: "Choose where to display this section",
            },
            {
              name: "hidden",
              title: "Hide this section",
              type: "boolean",
              description: "Toggle to hide this section",
              initialValue: false,
            },
            {
              name: "displayStyle",
              title: "Display Style",
              type: "string",
              options: {
                list: [
                  { title: "Default (Text with Chevron)", value: "default" },
                  { title: "Locations (Gray Buttons)", value: "locations" },
                ],
              },
              initialValue: "default",
              description: "Choose how to display the links in this section",
            },
            {
              name: "links",
              title: "Section Links",
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
              // Remove the required validation
              validation: (Rule: Rule) => Rule,
              options: {
                sortable: true,
              },
            },
            {
              name: "sectionButton",
              title: "Section Button",
              type: "object",
              description: "Add a button for this section (optional)",
              fields: [
                {
                  name: "text",
                  title: "Button Text",
                  type: "string",
                  description: "Leave empty to hide the button",
                },
                {
                  name: "url",
                  title: "URL",
                  type: "url",
                  description: "URL for the button (optional)",
                },
                {
                  name: "hidden",
                  title: "Hide this button",
                  type: "boolean",
                  description: "Toggle to hide this button",
                  initialValue: false,
                },
              ],
            },
            {
              name: "subSections",
              title: "Sub Sections",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "subSection",
                  fields: [
                    {
                      name: "heading",
                      title: "Sub Section Heading",
                      type: "string",
                      description: "Non-clickable heading for this sub-section",
                      validation: (Rule: Rule) => Rule.required(),
                    },
                    {
                      name: "hidden",
                      title: "Hide this sub-section",
                      type: "boolean",
                      description: "Toggle to hide this sub-section",
                      initialValue: false,
                    },
                    {
                      name: "url",
                      title: "URL",
                      type: "url",
                      description: "URL for the subsection heading (used when there are no links)",
                    },
                    {
                      name: "displayStyle",
                      title: "Display Style",
                      type: "string",
                      options: {
                        list: [
                          { title: "Default (Text with Chevron)", value: "default" },
                          { title: "Locations (Gray Buttons)", value: "locations" },
                        ],
                      },
                      initialValue: "default",
                      description: "Choose how to display the links in this sub-section",
                    },
                    {
                      name: "links",
                      title: "Sub Section Links",
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
                      description: "Select Child Menu items to include in this sub-section (optional)",
                      validation: (Rule: Rule) => Rule,
                      options: {
                        sortable: true,
                      },
                    },
                  ],
                },
              ],
              description: "Add multiple sub-sections with their own headings within this section",
              options: {
                sortable: true,
              },
            },
          ],
        },
      ],
      description:
        "Add multiple sections of links, each with their own heading. You can add as many sections as needed, and each will be displayed as a separate group in the mega menu.",
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
            {
              name: "imageLinks",
              title: "Image Links",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "imageLink",
                  fields: [
                    {
                      name: "title",
                      title: "Title",
                      type: "string",
                      validation: (Rule: Rule) => Rule.required(),
                    },
                    {
                      name: "description",
                      title: "Description",
                      type: "string",
                      description: "Optional short description text",
                    },
                    {
                      name: "url",
                      title: "URL",
                      type: "url",
                      description: "URL for the image link",
                      validation: (Rule: Rule) => Rule.required(),
                    },
                    {
                      name: "image",
                      title: "Image",
                      type: "image",
                      description: "Image to display with the link",
                      validation: (Rule: Rule) => Rule.required(),
                      options: {
                        hotspot: true,
                      },
                    },
                    {
                      name: "imageWidth",
                      title: "Image Width",
                      type: "number",
                      description: "Width of the image in pixels (default: 80)",
                      initialValue: 80,
                    },
                    {
                      name: "imageHeight",
                      title: "Image Height",
                      type: "number",
                      description: "Height of the image in pixels (default: 80)",
                      initialValue: 80,
                    },
                    {
                      name: "hidden",
                      title: "Hide this image link",
                      type: "boolean",
                      description: "Toggle to hide this image link",
                      initialValue: false,
                    },
                  ],
                  preview: {
                    select: {
                      title: "title",
                      media: "image",
                      hidden: "hidden",
                    },
                    prepare({ title, media, hidden }) {
                      return {
                        title: `${title || "Untitled Image Link"}${hidden ? " (Hidden)" : ""}`,
                        media,
                      }
                    },
                  },
                },
              ],
              description: "Add image-based links that will appear below the buttons in this group",
              options: {
                sortable: true,
              },
            },
          ],
          preview: {
            select: {
              heading: "heading",
              buttonCount: "buttons.length",
              imageLinkCount: "imageLinks.length",
              hidden: "hidden",
            },
            prepare({ heading, buttonCount, imageLinkCount, hidden }) {
              return {
                title: `${heading || "Untitled Group"}${hidden ? " (Hidden)" : ""}`,
                subtitle: `${buttonCount || 0} buttons, ${imageLinkCount || 0} image links`,
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
    {
      name: "imageLinks",
      title: "Image Links",
      type: "array",
      of: [
        {
          type: "object",
          name: "imageLink",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: "description",
              title: "Description",
              type: "string",
              description: "Optional short description text",
            },
            {
              name: "url",
              title: "URL",
              type: "url",
              description: "URL for the image link",
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: "image",
              title: "Image",
              type: "image",
              description: "Image to display with the link",
              validation: (Rule: Rule) => Rule.required(),
              options: {
                hotspot: true,
              },
            },
            {
              name: "imageWidth",
              title: "Image Width",
              type: "number",
              description: "Width of the image in pixels (default: 80)",
              initialValue: 80,
            },
            {
              name: "imageHeight",
              title: "Image Height",
              type: "number",
              description: "Height of the image in pixels (default: 80)",
              initialValue: 80,
            },
            {
              name: "group",
              title: "Button Group",
              type: "string",
              description: "Group name for organizing image links with CTA buttons (leave empty for default group)",
            },
            {
              name: "hidden",
              title: "Hide this image link",
              type: "boolean",
              description: "Toggle to hide this image link",
              initialValue: false,
            },
          ],
          preview: {
            select: {
              title: "title",
              media: "image",
              hidden: "hidden",
            },
            prepare({ title, media, hidden }) {
              return {
                title: `${title || "Untitled Image Link"}${hidden ? " (Hidden)" : ""}`,
                media,
              }
            },
          },
        },
      ],
      description: "Add image-based links that will appear below the CTA buttons",
      options: {
        sortable: true,
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
      hasPrimaryButton: "primaryButton",
      hasCustomContent: "hasCustomContent",
      hidden: "hidden",
    },
    prepare(value) {
      const {
        heading,
        linksCount,
        buttonGroupsCount,
        subListsCount,
        additionalLinksCount,
        hasPrimaryButton,
        hasCustomContent,
        hidden,
      } = value
      return {
        title: `${heading || "Untitled List"}${hidden ? " (Hidden)" : ""}`,
        subtitle: `${linksCount || 0} links${hasPrimaryButton ? ", Has Primary Button" : ""}${
          hasCustomContent ? ", Has Custom Content" : ""
        }, ${buttonGroupsCount || 0} button groups, ${subListsCount || 0} sub-lists, ${
          additionalLinksCount || 0
        } additional links`,
      }
    },
  },
}
