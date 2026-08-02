import { TabSchema } from "./types";

export const mediaSchema: TabSchema = {
  table: "media_items",
  title: "Media",
  itemLabel: "Media Item",
  titleField: "title",
  columns: [
    { key: "title", label: "Title", sortable: true },
    {
      key: "media_type",
      label: "Type",
      sortable: true,
      render: (row) =>
        row.media_type === "movie" ? "Movie" : row.media_type === "tv" ? "TV" : "",
    },
    { key: "release_date", label: "Date", sortable: true },
    { key: "age_rating", label: "Age Rating", sortable: true },
    { key: "category", label: "Category", sortable: true },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true },
    {
      key: "media_type",
      label: "Type",
      type: "select",
      options: [
        { value: "movie", label: "Movie" },
        { value: "tv", label: "TV" },
      ],
    },
    { key: "release_date", label: "Date", type: "date" },
    { key: "age_rating", label: "Age Rating", type: "autocomplete" },
    { key: "category", label: "Category", type: "autocomplete" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  autocompleteFields: ["age_rating", "category"],
  defaultSort: { key: "title", direction: "asc" },
};
