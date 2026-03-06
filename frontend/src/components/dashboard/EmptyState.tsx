"use client";

export default function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="mb-6 text-7xl">{"\u{1F9CB}"}</div>
      <p className="max-w-xs text-center font-serif text-lg italic text-accent">
        I&apos;m just here waiting for your charming notes...
      </p>
    </div>
  );
}
