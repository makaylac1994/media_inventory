import { TabSchema } from "./types";
import { createElement } from "react";

export const gamesSchema: TabSchema = {
  table: "game_items",
  title: "Games",
  itemLabel: "Game",
  titleField: "title",
  columns: [
    { key: "title", label: "Title", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "age_rating", label: "Age Rating", sortable: true },
    {
      key: "instructions_url",
      label: "Instructions",
      sortable: false,
      render: (row) =>
        row.instructions_url
          ? createElement(
              "a",
              {
                href: row.instructions_url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-blue-600 underline",
              },
              "Link",
            )
          : "",
    },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "category", label: "Category", type: "autocomplete" },
    { key: "age_rating", label: "Age Rating", type: "autocomplete" },
    { key: "instructions_url", label: "Instructions Link", type: "url" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  autocompleteFields: ["category", "age_rating"],
  defaultSort: { key: "title", direction: "asc" },
};
