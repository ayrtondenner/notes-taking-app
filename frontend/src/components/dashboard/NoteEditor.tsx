"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Category, Note } from "@/types";
import { getNote, updateNote } from "@/lib/api";
import { formatLastEdited } from "@/lib/utils";
import CategoryDropdown from "./CategoryDropdown";

interface NoteEditorProps {
  noteId: number;
  categories: Category[];
  onClose: () => void;
}

export default function NoteEditor({
  noteId,
  categories,
  onClose,
}: NoteEditorProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [lastEdited, setLastEdited] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef(false);

  useEffect(() => {
    getNote(noteId).then((data) => {
      setNote(data);
      setTitle(data.title);
      setContent(data.content);
      setCategoryId(data.category.id);
      setLastEdited(data.updated_at);
    });
  }, [noteId]);

  const saveNote = useCallback(
    (newTitle: string, newContent: string, newCategoryId: number) => {
      pendingSaveRef.current = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        try {
          const updated = await updateNote(noteId, {
            title: newTitle,
            content: newContent,
            category_id: newCategoryId,
          });
          setLastEdited(updated.updated_at);
          setNote(updated);
          pendingSaveRef.current = false;
        } catch {
          pendingSaveRef.current = false;
        }
      }, 300);
    },
    [noteId]
  );

  function handleTitleChange(value: string) {
    setTitle(value);
    saveNote(value, content, categoryId);
  }

  function handleContentChange(value: string) {
    setContent(value);
    saveNote(title, value, categoryId);
  }

  function handleCategoryChange(newCategoryId: number) {
    setCategoryId(newCategoryId);
    saveNote(title, content, newCategoryId);
  }

  function handleClose() {
    // Flush pending save
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      if (pendingSaveRef.current) {
        updateNote(noteId, {
          title,
          content,
          category_id: categoryId,
        }).catch(() => {});
      }
    }
    onClose();
  }

  const currentCategory = categories.find((c) => c.id === categoryId);
  const bgColor = currentCategory?.color || "#EF9C66";

  if (!note) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="rounded-2xl bg-cream p-10 text-accent">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        className="relative flex h-[80vh] w-full max-w-2xl flex-col rounded-2xl p-8"
        style={{ backgroundColor: bgColor }}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <CategoryDropdown
            categories={categories}
            selectedCategoryId={categoryId}
            onChange={handleCategoryChange}
          />
          <button
            onClick={handleClose}
            className="text-accent transition-colors hover:text-accent/70"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Timestamp */}
        <p className="mb-4 text-xs text-dark/60">
          {formatLastEdited(lastEdited)}
        </p>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note Title"
          className="mb-4 bg-transparent font-serif text-2xl font-bold text-dark outline-none placeholder:text-dark/40"
        />

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Pour your heart out..."
          className="flex-1 resize-none bg-transparent text-dark leading-relaxed outline-none placeholder:text-dark/40"
        />
      </div>
    </div>
  );
}
