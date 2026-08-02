import { TabSchema } from "./types";

export const booksSchema: TabSchema = {
  table: "book_items",
  title: "Books",
  itemLabel: "Book",
  titleField: "title",
  columns: [
    { key: "title", label: "Title", sortable: true },
    { key: "author", label: "Author", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "age_rating", label: "Age Rating", sortable: true },
  ],
  fields: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "author", label: "Author", type: "text" },
    { key: "category", label: "Category", type: "autocomplete" },
    { key: "age_rating", label: "Age Rating", type: "autocomplete" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  autocompleteFields: ["category", "age_rating"],
  defaultSort: { key: "title", direction: "asc" },
};
