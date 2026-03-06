"use client";

import type { Category } from "@/types";

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export default function Sidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 px-6 py-6">
      <button
        onClick={() => onSelectCategory(null)}
        className={`mb-4 w-full text-left font-serif text-lg font-bold text-dark transition-colors ${
          selectedCategoryId === null ? "text-accent" : ""
        }`}
      >
        All Categories
      </button>

      <div className="space-y-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              selectedCategoryId === cat.id
                ? "bg-accent/10"
                : "hover:bg-accent/5"
            }`}
          >
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            <span className="flex-1 text-dark">{cat.name}</span>
            <span className="text-xs text-accent/60">{cat.note_count}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
