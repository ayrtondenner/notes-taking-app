"use client";

import type { Note } from "@/types";
import { formatNoteDate, truncateText, darkenColor } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl p-5 text-left transition-transform hover:scale-[1.02]"
      style={{
        backgroundColor: note.category.color,
        border: `1px solid ${darkenColor(note.category.color)}`,
      }}
    >
      <div className="mb-2 flex items-center gap-2 text-sm">
        <span className="font-bold">{formatNoteDate(note.updated_at)}</span>
        <span>{note.category.name}</span>
      </div>

      <h3 className="mb-2 font-serif text-xl font-bold">
        {note.title || "Note Title"}
      </h3>

      <p className="text-sm leading-relaxed opacity-80">
        {truncateText(note.content || "Pour your heart out...", 120)}
      </p>
    </button>
  );
}
