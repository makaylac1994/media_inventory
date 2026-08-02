"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  { href: "/media", label: "Media" },
  { href: "/games", label: "Games" },
  { href: "/books", label: "Books" },
];

export function TabNav() {
  const pathname = usePathname();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  return (
    <div className="mb-6 flex items-center justify-between border-b border-gray-200">
      <nav className="flex gap-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 px-4 py-3 text-sm font-medium ${
                active
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={handleSignOut}
        className="mb-2 text-sm text-gray-400 hover:text-gray-700"
      >
        Sign out
      </button>
    </div>
  );
}
