import { client, isSanityConfigured } from "./client"

// Sample data to use when Sanity is not configured
const sampleMenuData = {
  items: [
    {
      _id: "sample-1",
      title: "Services",
      slug: "services",
      order: 1,
      hidden: false,
      menuLists: [
        {
          heading: "Our Services",
          contentHeading: "Explore Our Services",
          order: 1,
          hidden: false,
          hasCustomContent: false,
          primaryButton: {
            text: "View All Services",
            url: "/services",
            hidden: false,
          },
          links: [
            {
              _id: "link-1",
              title: "Apprenticeships",
              url: "/apprenticeships",
              order: 1,
              hidden: false,
            },
            {
              _id: "link-2",
              title: "Traineeships",
              url: "/traineeships",
              order: 2,
              hidden: false,
            },
          ],
          additionalLinkSections: [
            {
              sectionHeading: "Popular Services",
              position: "below",
              hidden: false,
              links: [
                {
                  _id: "add-link-1",
                  title: "Career Guidance",
                  url: "/career-guidance",
                  order: 1,
                  hidden: false,
                },
                {
                  _id: "add-link-2",
                  title: "Skills Assessment",
                  url: "/skills-assessment",
                  order: 2,
                  hidden: false,
                },
              ],
              sectionButton: {
                text: "View All",
                url: "/services",
                hidden: false,
              },
            },
          ],
          ctaButtons: [
            {
              text: "Learn More",
              url: "/services",
              hidden: false,
            },
          ],
          ctaButtonGroups: [
            {
              heading: "Quick Actions",
              hidden: false,
              buttons: [
                {
                  text: "Get Started",
                  url: "/get-started",
                  hidden: false,
                },
              ],
            },
          ],
          subLists: [
            {
              heading: "Information About",
              hidden: false,
              links: [
                {
                  _id: "sublink-1",
                  title: "Apprenticeship Info",
                  url: "/info/apprenticeships",
                  order: 1,
                  hidden: false,
                },
              ],
            },
          ],
          additionalLinks: [
            {
              text: "View All Services",
              url: "/all-services",
              hidden: false,
            },
          ],
        },
      ],
    },
    {
      _id: "sample-2",
      title: "About",
      slug: "about",
      order: 2,
      hidden: false,
      menuLists: [
        {
          heading: "About Us",
          order: 1,
          hidden: false,
          links: [
            {
              _id: "link-3",
              title: "Our Story",
              url: "/about/story",
              order: 1,
              hidden: false,
            },
            {
              _id: "link-4",
              title: "Team",
              url: "/about/team",
              order: 2,
              hidden: false,
            },
          ],
        },
      ],
    },
  ],
  otherItems: [
    {
      _id: "other-1",
      title: "Action Button",
      itemType: "actionButton",
      buttonText: "Get Started",
      buttonUrl: "/get-started",
      placement: "headerMain",
      order: 1,
      hidden: false,
    },
    {
      _id: "job-board",
      title: "Job Board Button",
      itemType: "jobBoardButton",
      buttonText: "Job Board",
      buttonUrl: "/jobs",
      placement: "headerMain",
      order: 2,
      hidden: false,
    },
  ],
}

const sampleFooterData = {
  items: [
    {
      _id: "footer-1",
      title: "Company",
      order: 1,
      hidden: false,
      children: [
        {
          title: "About Us",
          itemType: "link",
          url: "/about",
          hidden: false,
        },
        {
          title: "Careers",
          itemType: "link",
          url: "/careers",
          hidden: false,
        },
      ],
      contactButton: {
        show: true,
        text: "Contact Us",
        url: "/contact",
        hidden: false,
      },
    },
    {
      _id: "footer-2",
      title: "Resources",
      order: 2,
      hidden: false,
      children: [
        {
          title: "Blog",
          itemType: "link",
          url: "/blog",
          hidden: false,
        },
        {
          title: "Support",
          itemType: "link",
          url: "/support",
          hidden: false,
        },
      ],
    },
  ],
  columns: [
    {
      _id: "column-1",
      title: "Social Media",
      order: 1,
      hidden: false,
      links: [
        {
          title: "LinkedIn",
          url: "https://linkedin.com",
          hasIcon: true,
          iconWidth: 24,
          iconHeight: 24,
          hidden: false,
        },
        {
          title: "Twitter",
          url: "https://twitter.com",
          hasIcon: true,
          iconWidth: 24,
          iconHeight: 24,
          hidden: false,
        },
      ],
    },
    {
      _id: "column-2",
      title: "Compliance",
      order: 2,
      hidden: false,
      links: [
        {
          title: "ISO Certified",
          url: "#",
          hasIcon: true,
          iconWidth: 40,
          iconHeight: 30,
          hidden: false,
        },
        {
          title: "Industry Partner",
          url: "#",
          hasIcon: true,
          iconWidth: 40,
          iconHeight: 30,
          hidden: false,
        },
      ],
    },
  ],
  otherItems: [
    {
      _id: "other-2",
      title: "Footer Action",
      itemType: "actionButton",
      buttonText: "Apply Now",
      buttonUrl: "/apply",
      placement: "footer",
      order: 1,
      hidden: false,
    },
  ],
  policyLinks: [
    {
      title: "Corporate Governance",
      url: "/corporate-governance",
    },
    {
      title: "Privacy Policy",
      url: "/privacy-policy",
    },
  ],
}

export async function getMenuData() {
  // If Sanity is not configured, return sample data
  if (!isSanityConfigured()) {
    console.warn("Sanity is not configured. Using sample menu data.")
    return sampleMenuData
  }

  // Get the active menu and its items
  const query = `{
    "activeMenu": *[_type == "menu" && isActive == true][0] {
      _id,
      title,
      "items": items[]-> {
        _id,
        title,
        "slug": slug.current,
        url,
        order,
        hidden,
        "menuLists": menuLists[] {
          heading,
          contentHeading,
          order,
          hidden,
          hasCustomContent,
          customContent,
          ctaSectionTitle,
          "primaryButton": primaryButton {
            text,
            url,
            hidden
          },
          "links": links[]-> {
            _id,
            title,
            "slug": slug.current,
            url,
            order,
            hidden
          },
          "imageLinks": imageLinks[] {
            title,
            description,
            url,
            "image": image.asset->url,
            imageWidth,
            imageHeight,
            group,
            hidden
          },
          "additionalLinkSections": additionalLinkSections[] {
            sectionHeading,
            sectionContentHeading,
            position,
            hidden,
            displayStyle,
            "links": links[]-> {
              _id,
              title,
              "slug": slug.current,
              url,
              order,
              hidden
            },
            "sectionButton": sectionButton {
              text,
              url,
              hidden
            },
            "subSections": subSections[] {
              heading,
              hidden,
              url,
              "links": links[]-> {
                _id,
                title,
                "slug": slug.current,
                url,
                order,
                hidden
              }
            }
          },
          "ctaButtons": ctaButtons[] {
            text,
            url,
            group,
            hidden
          },
          "ctaButtonGroups": ctaButtonGroups[] {
            heading,
            hidden,
            "buttons": buttons[] {
              text,
              url,
              hidden
            },
            "imageLinks": imageLinks[] {
              title,
              description,
              url,
              "image": image.asset->url,
              imageWidth,
              imageHeight,
              hidden
            }
          },
          "subLists": subLists[] {
            heading,
            hidden,
            "links": links[]-> {
              _id,
              title,
              "slug": slug.current,
              url,
              order,
              hidden,
              "image": image.asset->url,
              imageWidth,
              imageHeight
            }
          },
          "additionalLinks": additionalLinks[] {
            text,
            url,
            hidden
          }
        }
      }
    },
    "otherItems": *[_type == "otherItem" && (placement == "headerMain" || placement == "headerSecondary" || placement == "headerDoubleHeight")] | order(order asc) {
      _id,
      title,
      itemType,
      buttonText,
      buttonUrl,
      placement,
      order,
      hidden
    }
  }`

  try {
    const data = await client.fetch(query)

    // If no active menu is found or it has no items, fall back to all top-level items
    if (!data.activeMenu || !data.activeMenu.items || data.activeMenu.items.length === 0) {
      console.warn("No active menu found or active menu has no items. Falling back to all top-level items.")
      const fallbackQuery = `{
  "items": *[_type == "menuItem" && isTopLevel == true] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    url,
    order,
    hidden,
    "menuLists": menuLists[] {
      heading,
      contentHeading,
      order,
      hidden,
      hasCustomContent,
      customContent,
      ctaSectionTitle,
      "primaryButton": primaryButton {
        text,
        url,
        hidden
      },
      "links": links[]-> {
        _id,
        title,
        "slug": slug.current,
        url,
        order,
        hidden
      },
      "imageLinks": imageLinks[] {
        title,
        description,
        url,
        "image": image.asset->url,
        imageWidth,
        imageHeight,
        group,
        hidden
      },
      "additionalLinkSections": additionalLinkSections[] {
        sectionHeading,
        sectionContentHeading,
        position,
        hidden,
        displayStyle,
        "links": links[]-> {
          _id,
          title,
          "slug": slug.current,
          url,
          order,
          hidden
        },
        "sectionButton": sectionButton {
          text,
          url,
          hidden
        },
        "subSections": subSections[] {
          heading,
          hidden,
          url,
          "links": links[]-> {
            _id,
            title,
            "slug": slug.current,
            url,
            order,
            hidden
          }
        }
      },
      "ctaButtons": ctaButtons[] {
        text,
        url,
        group,
        hidden
      },
      "ctaButtonGroups": ctaButtonGroups[] {
        heading,
        hidden,
        "buttons": buttons[] {
          text,
          url,
          hidden
        },
        "imageLinks": imageLinks[] {
          title,
          description,
          url,
          "image": image.asset->url,
          imageWidth,
          imageHeight,
          hidden
        }
      },
      "subLists": subLists[] {
        heading,
        hidden,
        "links": links[]-> {
          _id,
          title,
          "slug": slug.current,
          url,
          order,
          hidden,
          "image": image.asset->url,
          imageWidth,
          imageHeight
        }
      },
      "additionalLinks": additionalLinks[] {
        text,
        url,
        hidden
      }
    }
  },
  "otherItems": *[_type == "otherItem" && (placement == "headerMain" || placement == "headerSecondary" || placement == "headerDoubleHeight")] | order(order asc) {
    _id,
    title,
    itemType,
    buttonText,
    buttonUrl,
    placement,
    order,
    hidden
  }
}`

      const fallbackData = await client.fetch(fallbackQuery)
      return fallbackData || sampleMenuData
    }

    // Return the items from the active menu
    return {
      items: data.activeMenu.items || [],
      otherItems: data.otherItems || [],
    }
  } catch (error) {
    console.error("Error fetching menu data:", error)
    return sampleMenuData
  }
}

export async function getFooterItems() {
  // If Sanity is not configured, return sample data
  if (!isSanityConfigured()) {
    console.warn("Sanity is not configured. Using sample footer data.")
    return sampleFooterData
  }

  const query = `{
    "items": *[_type == "footerItem"] | order(order asc) {
      _id,
      title,
      order,
      hidden,
      children[] {
        title,
        itemType,
        url,
        content,
        hidden
      },
      contactButton {
        show,
        text,
        url,
        hidden
      }
    },
    "columns": *[_type == "footerColumn"] | order(order asc) {
      _id,
      title,
      order,
      hidden,
      links[] {
        title,
        url,
        hasIcon,
        isSocialIcons,
        "icon": icon.asset->url,
        iconWidth,
        iconHeight,
        hidden
      }
    },
    "otherItems": *[_type == "otherItem" && placement == "footer"] | order(order asc) {
      _id,
      title,
      itemType,
      buttonText,
      buttonUrl,
      placement,
      order,
      hidden
    },
    "policyLinks": [
      {"title": "Corporate Governance", "url": "/corporate-governance"},
      {"title": "Privacy Policy", "url": "/privacy-policy"}
    ]
  }`

  try {
    const data = await client.fetch(query)
    return data || sampleFooterData
  } catch (error) {
    console.error("Error fetching footer items:", error)
    return sampleFooterData
  }
}
