"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ItemRecord, TabSchema } from "@/lib/schemas/types";
import { TabNav } from "@/components/TabNav";
import { InventoryTable } from "@/components/InventoryTable";
import { ItemFormModal } from "@/components/ItemFormModal";

export function InventoryTab({ schema }: { schema: TabSchema }) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState(schema.defaultSort.key);
  const [sortDirection, setSortDirection] = useState(schema.defaultSort.direction);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ItemRecord | null>(null);

  async function loadRows() {
    const { data, error } = await supabase.from(schema.table).select("*");
    if (error) {
      setLoadError(error.message);
    } else {
      setLoadError(null);
      setRows(data as ItemRecord[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is intentional here
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema.table]);

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const aVal = (a[sortKey] ?? "").toString().toLowerCase();
      const bVal = (b[sortKey] ?? "").toString().toLowerCase();
      if (aVal === "" && bVal !== "") return 1;
      if (bVal === "" && aVal !== "") return -1;
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sortKey, sortDirection]);

  const autocompleteOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    for (const field of schema.autocompleteFields) {
      const values = new Set<string>();
      for (const row of rows) {
        const val = row[field];
        if (val) values.add(val);
      }
      options[field] = Array.from(values).sort();
    }
    return options;
  }, [rows, schema.autocompleteFields]);

  function handleSortChange(key: string) {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  function handleAdd() {
    setEditingRow(null);
    setModalOpen(true);
  }

  function handleEdit(row: ItemRecord) {
    setEditingRow(row);
    setModalOpen(true);
  }

  async function handleDelete(row: ItemRecord) {
    const label = row[schema.titleField] || "this item";
    if (!window.confirm(`Delete "${label}"? This can't be undone.`)) return;
    const { error } = await supabase.from(schema.table).delete().eq("id", row.id);
    if (error) {
      window.alert(`Failed to delete: ${error.message}`);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  }

  async function handleSave(values: Record<string, string>) {
    const payload = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value === "" ? null : value]),
    );
    if (editingRow) {
      const { error } = await supabase
        .from(schema.table)
        .update(payload)
        .eq("id", editingRow.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from(schema.table).insert(payload);
      if (error) throw new Error(error.message);
    }
    setModalOpen(false);
    setEditingRow(null);
    await loadRows();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <TabNav />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{schema.title}</h1>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
        >
          + Add
        </button>
      </div>
      {loading ? (
        <p className="py-12 text-center text-sm text-gray-500">Loading…</p>
      ) : loadError ? (
        <p className="py-12 text-center text-sm text-red-600">{loadError}</p>
      ) : (
        <InventoryTable
          schema={schema}
          rows={sortedRows}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {modalOpen && (
        <ItemFormModal
          schema={schema}
          initialValues={editingRow}
          autocompleteOptions={autocompleteOptions}
          onClose={() => {
            setModalOpen(false);
            setEditingRow(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
