"use client";

import { useState, useRef, useEffect } from "react";
import type { Category } from "@/types";

interface CategoryDropdownProps {
  categories: Category[];
  selectedCategoryId: number;
  onChange: (categoryId: number) => void;
}

export default function CategoryDropdown({
  categories,
  selectedCategoryId,
  onChange,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c.id === selectedCategoryId);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border-2 border-accent px-4 py-2 text-sm transition-colors hover:bg-accent/10"
      >
        {selected && (
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: selected.color }}
          />
        )}
        <span>{selected?.name || "Select category"}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 min-w-[200px] rounded-lg border border-accent/20 bg-cream shadow-lg">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onChange(cat.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent/10 ${
                cat.id === selectedCategoryId ? "bg-accent/5 font-medium" : ""
              }`}
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
