"use client";

import { FormEvent, useEffect, useState } from "react";
import { ItemRecord, TabSchema } from "@/lib/schemas/types";

interface ItemFormModalProps {
  schema: TabSchema;
  initialValues: ItemRecord | null;
  autocompleteOptions: Record<string, string[]>;
  onClose: () => void;
  onSave: (values: Record<string, string>) => Promise<void>;
}

function emptyValues(schema: TabSchema): Record<string, string> {
  return Object.fromEntries(schema.fields.map((field) => [field.key, ""]));
}

export function ItemFormModal({
  schema,
  initialValues,
  autocompleteOptions,
  onClose,
  onSave,
}: ItemFormModalProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const base = emptyValues(schema);
    if (!initialValues) return base;
    for (const field of schema.fields) {
      const raw = initialValues[field.key];
      if (raw != null) base[field.key] = raw;
    }
    return base;
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const missingRequired = schema.fields.find(
      (field) => field.required && !values[field.key]?.trim(),
    );
    if (missingRequired) {
      setError(`${missingRequired.label} is required.`);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">
          {initialValues ? `Edit ${schema.title.slice(0, -1) || schema.title}` : `Add to ${schema.title}`}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {schema.fields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  }
                  rows={3}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                />
              ) : field.type === "select" ? (
                <select
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  }
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                >
                  <option value="">—</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type={
                      field.type === "date"
                        ? "date"
                        : field.type === "url"
                          ? "url"
                          : "text"
                    }
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.key]: e.target.value }))
                    }
                    list={
                      field.type === "autocomplete" ? `${field.key}-options` : undefined
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                  />
                  {field.type === "autocomplete" && (
                    <datalist id={`${field.key}-options`}>
                      {(autocompleteOptions[field.key] ?? []).map((opt) => (
                        <option key={opt} value={opt} />
                      ))}
                    </datalist>
                  )}
                </>
              )}
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
