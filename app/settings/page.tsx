"use client";

import { TabNav } from "@/components/TabNav";
import { ManagedOptionsEditor } from "@/components/ManagedOptionsEditor";
import { TabSchema } from "@/lib/schemas/types";
import { mediaSchema } from "@/lib/schemas/media";
import { gamesSchema } from "@/lib/schemas/games";
import { booksSchema } from "@/lib/schemas/books";

const schemas: TabSchema[] = [mediaSchema, gamesSchema, booksSchema];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <TabNav />
      <h1 className="mb-6 text-lg font-semibold">Settings</h1>
      <div className="space-y-8">
        {schemas.map((schema) => (
          <section key={schema.table}>
            <h2 className="mb-3 border-b border-gray-200 pb-2 text-base font-semibold">
              {schema.title}
            </h2>
            <div className="space-y-5">
              {schema.managedFields.map((fieldKey) => {
                const field = schema.fields.find((f) => f.key === fieldKey);
                if (!field) return null;
                return (
                  <ManagedOptionsEditor
                    key={fieldKey}
                    tab={schema.table}
                    fieldKey={fieldKey}
                    label={field.label}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
