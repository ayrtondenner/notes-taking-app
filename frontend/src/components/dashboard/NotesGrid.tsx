"use client";

import type { Note } from "@/types";
import NoteCard from "./NoteCard";
import EmptyState from "./EmptyState";

interface NotesGridProps {
  notes: Note[];
  onNoteClick: (noteId: number) => void;
}

export default function NotesGrid({ notes, onNoteClick }: NotesGridProps) {
  if (notes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onClick={() => onNoteClick(note.id)}
        />
      ))}
    </div>
  );
}
