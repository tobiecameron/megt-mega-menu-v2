export const structure = (S) => {
  return S.list()
    .title("Content")
    .items([
      // Menu document type - Updated label to "Main Menus"
      S.listItem()
        .title("Main Menus")
        .schemaType("menu")
        .child(S.documentTypeList("menu").title("Main Menus")),

      // Top-level Menu Items
      S.listItem()
        .title("Menu Items")
        .schemaType("menuItem")
        .child(
          S.documentTypeList("menuItem")
            .title("Menu Items")
            .filter('_type == "menuItem" && isTopLevel == true')
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),

      // Child Menu Items
      S.listItem()
        .title("Child Menu Items")
        .schemaType("menuItem")
        .child(
          S.documentTypeList("menuItem")
            .title("Child Menu Items")
            .filter('_type == "menuItem" && (isTopLevel == false || !defined(isTopLevel))')
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),

      // Other Items (Action Button, etc.)
      S.listItem()
        .title("Other Items")
        .schemaType("otherItem")
        .child(
          S.documentTypeList("otherItem")
            .title("Other Items")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),

      // Footer Items
      S.listItem()
        .title("Footer Items")
        .schemaType("footerItem")
        .child(
          S.documentTypeList("footerItem")
            .title("Footer Items")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),

      // Footer Columns
      S.listItem()
        .title("Footer Columns")
        .schemaType("footerColumn")
        .child(
          S.documentTypeList("footerColumn")
            .title("Footer Columns")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
    ])
}

