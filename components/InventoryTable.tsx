"use client";

import { ItemRecord, TabSchema } from "@/lib/schemas/types";

interface InventoryTableProps {
  schema: TabSchema;
  rows: ItemRecord[];
  sortKey: string;
  sortDirection: "asc" | "desc";
  onSortChange: (key: string) => void;
  onEdit: (row: ItemRecord) => void;
  onDelete: (row: ItemRecord) => void;
}

export function InventoryTable({
  schema,
  rows,
  sortKey,
  sortDirection,
  onSortChange,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        No {schema.title.toLowerCase()} yet. Add your first one to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            {schema.columns.map((column) => (
              <th key={column.key} className="px-3 py-2 font-medium text-gray-600">
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => onSortChange(column.key)}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    {column.label}
                    {sortKey === column.key && (
                      <span aria-hidden>{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
              {schema.columns.map((column) => (
                <td key={column.key} className="px-3 py-2 text-gray-800">
                  {column.render ? column.render(row) : (row[column.key] ?? "")}
                </td>
              ))}
              <td className="px-3 py-2 text-right whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  className="mr-3 text-gray-500 hover:text-gray-900"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(row)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
