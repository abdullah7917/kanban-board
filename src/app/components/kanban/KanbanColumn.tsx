"use client";

import { useState } from "react";
import KanbanCard from "./KanbanCard";

type KanbanColumnProps = {
  title: string;
  initialCards?: string[];
};

export default function KanbanColumn({
  title,
  initialCards = [],
}: KanbanColumnProps) {
  const [cards, setCards] = useState<string[]>(initialCards);

  function addCard() {
    const name = prompt("Card title?");
    if (!name) return;
    setCards((prev) => [...prev, name]);
  }

  return (
    <div className="w-72 rounded-lg bg-gray-800 p-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {title}{" "}
          <span className="text-sm text-gray-300">/ {cards.length}</span>
        </h2>
      </div>

      <div className="space-y-3">
        {cards.map((c, idx) => (
          <KanbanCard key={`${title}-${idx}`} title={c} />
        ))}
      </div>

      <button
        onClick={addCard}
        className="mt-3 w-full rounded-md bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600"
      >
        + Add card
      </button>
    </div>
  );
}
