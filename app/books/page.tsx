"use client";

import { InventoryTab } from "@/components/InventoryTab";
import { booksSchema } from "@/lib/schemas/books";

export default function BooksPage() {
  return <InventoryTab schema={booksSchema} />;
}
