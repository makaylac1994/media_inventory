"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FieldConfig, ItemRecord, TabSchema } from "@/lib/schemas/types";
import { createClient } from "@/lib/supabase/client";

interface ItemFormModalProps {
  schema: TabSchema;
  initialValues: ItemRecord | null;
  autocompleteOptions: Record<string, string[]>;
  managedOptions: Record<string, string[]>;
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
  managedOptions,
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
  const [coverUrl, setCoverUrl] = useState(initialValues?.cover_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function optionsFor(field: FieldConfig): string[] {
    const base = managedOptions[field.key] ?? [];
    const current = values[field.key];
    if (current && !base.includes(current)) return [current, ...base];
    return base;
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${schema.table}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("covers").upload(path, file);
      if (uploadError) throw new Error(uploadError.message);
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      setCoverUrl(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

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
      await onSave({ ...values, cover_url: coverUrl });
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
          {initialValues ? `Edit ${schema.itemLabel}` : `Add ${schema.itemLabel}`}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Cover</label>
            <div className="flex items-center gap-3">
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverUrl}
                  alt=""
                  className="h-20 w-14 rounded object-cover bg-gray-100"
                />
              ) : (
                <div className="h-20 w-14 rounded bg-gray-100" />
              )}
              <div className="flex flex-col gap-1">
                <label className="cursor-pointer text-sm text-blue-600 hover:underline">
                  {uploading ? "Uploading…" : coverUrl ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {coverUrl && (
                  <button
                    type="button"
                    onClick={() => setCoverUrl("")}
                    className="text-left text-sm text-gray-500 hover:text-red-600"
                  >
                    Remove cover
                  </button>
                )}
              </div>
            </div>
          </div>
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
              ) : field.type === "managed-select" ? (
                <select
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  }
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                >
                  <option value="">—</option>
                  {optionsFor(field).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "year" ? (
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  step={1}
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  }
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                />
              ) : (
                <>
                  <input
                    type={field.type === "url" ? "url" : "text"}
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
              disabled={saving || uploading}
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
