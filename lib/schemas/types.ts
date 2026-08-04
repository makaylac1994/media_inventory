import { createElement, type ReactNode } from "react";

export type FieldType =
  | "text"
  | "textarea"
  | "year"
  | "url"
  | "select"
  | "autocomplete"
  | "managed-select";

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: ItemRecord) => ReactNode;
}

export interface TabSchema {
  table: string;
  title: string;
  itemLabel: string;
  titleField: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  autocompleteFields: string[];
  managedFields: string[];
  defaultSort: { key: string; direction: "asc" | "desc" };
}

export type ItemRecord = Record<string, string | null> & { id: string };

export function coverColumn(): ColumnConfig {
  return {
    key: "cover_url",
    label: "",
    sortable: false,
    render: (row) =>
      row.cover_url
        ? createElement("img", {
            src: row.cover_url,
            alt: "",
            className: "h-14 w-10 rounded object-cover bg-gray-100",
          })
        : createElement("div", { className: "h-14 w-10 rounded bg-gray-100" }),
  };
}
