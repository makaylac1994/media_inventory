"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ManagedOptionsEditorProps {
  tab: string;
  fieldKey: string;
  label: string;
}

export function ManagedOptionsEditor({ tab, fieldKey, label }: ManagedOptionsEditorProps) {
  const supabase = useMemo(() => createClient(), []);
  const [options, setOptions] = useState<{ id: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("field_options")
      .select("id, value")
      .eq("tab", tab)
      .eq("field_key", fieldKey)
      .order("value");
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      setOptions(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is intentional here
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, fieldKey]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const value = newValue.trim();
    if (!value) return;
    const { error } = await supabase.from("field_options").insert({ tab, field_key: fieldKey, value });
    if (error) {
      setError(error.message);
      return;
    }
    setNewValue("");
    await load();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("field_options").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-gray-700">{label}</h3>
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <ul className="mb-3 flex flex-wrap gap-2">
          {options.map((opt) => (
            <li
              key={opt.id}
              className="flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-sm"
            >
              {opt.value}
              <button
                type="button"
                onClick={() => handleDelete(opt.id)}
                aria-label={`Remove ${opt.value}`}
                className="text-gray-400 hover:text-red-600"
              >
                ×
              </button>
            </li>
          ))}
          {options.length === 0 && (
            <li className="text-sm text-gray-500">No values yet.</li>
          )}
        </ul>
      )}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Add a value…"
          className="w-full max-w-xs rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
        >
          Add
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
