"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, clearToken } from "@/lib/auth";
import { getCategories, getNotes, createNote } from "@/lib/api";
import type { Category, Note } from "@/types";
import Sidebar from "@/components/dashboard/Sidebar";
import NotesGrid from "@/components/dashboard/NotesGrid";
import NoteEditor from "@/components/dashboard/NoteEditor";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = useCallback(async () => {
    try {
      const [cats, notesData] = await Promise.all([
        getCategories(),
        getNotes(selectedCategoryId ?? undefined),
      ]);
      setCategories(cats);
      setNotes(notesData);
    } catch {
      // If fetch fails (e.g. token expired), redirect to login
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (!loading) {
      fetchData();
    }
  }, [selectedCategoryId, fetchData, loading]);

  async function handleNewNote() {
    const defaultCategory = categories[0];
    if (!defaultCategory) return;

    try {
      const note = await createNote(defaultCategory.id);
      setEditingNoteId(note.id);
    } catch {
      // handle error
    }
  }

  function handleEditorClose() {
    setEditingNoteId(null);
    fetchData();
  }

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-serif text-lg text-accent">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <Sidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Main content */}
      <main className="flex-1 px-8 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-dark">Notes</h1>
          <div className="flex items-center gap-3">
            <Button onClick={handleNewNote}>+ New Note</Button>
            <button
              onClick={handleLogout}
              className="text-sm text-accent/60 transition-colors hover:text-accent"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Notes grid */}
        <NotesGrid
          notes={notes}
          onNoteClick={(id) => setEditingNoteId(id)}
        />
      </main>

      {/* Note editor modal */}
      {editingNoteId && (
        <NoteEditor
          noteId={editingNoteId}
          categories={categories}
          onClose={handleEditorClose}
        />
      )}
    </div>
  );
}
