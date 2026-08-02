"use client";

import { InventoryTab } from "@/components/InventoryTab";
import { gamesSchema } from "@/lib/schemas/games";

export default function GamesPage() {
  return <InventoryTab schema={gamesSchema} />;
}
