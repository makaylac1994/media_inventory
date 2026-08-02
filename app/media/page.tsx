"use client";

import { InventoryTab } from "@/components/InventoryTab";
import { mediaSchema } from "@/lib/schemas/media";

export default function MediaPage() {
  return <InventoryTab schema={mediaSchema} />;
}
