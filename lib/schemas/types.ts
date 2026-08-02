import type { ReactNode } from "react";

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "url"
  | "select"
  | "autocomplete";

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
  defaultSort: { key: string; direction: "asc" | "desc" };
}

export type ItemRecord = Record<string, string | null> & { id: string };
