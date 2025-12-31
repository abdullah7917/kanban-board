"use client";

import { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import KanbanColumn from "./components/kanban/KanbanColumn";
import type { ColumnId } from "./components/kanban/KanbanCard";

type Card = { id: string; title: string };

type Column = {
  id: ColumnId;
  title: string;
  cards: Card[];
};

const initialColumns: Column[] = [
  {
    id: "stuck",
    title: "Stuck",
    cards: [{ id: "c1", title: "Fix login bug" }],
  },
  {
    id: "not_started",
    title: "Not Started",
    cards: [{ id: "c2", title: "Design homepage" }],
  },
  {
    id: "working_on_it",
    title: "Working on it",
    cards: [{ id: "c3", title: "Build Kanban UI" }],
  },
  { id: "done", title: "Done", cards: [{ id: "c4", title: "Project setup" }] },
  { id: "test", title: "Test", cards: [] },
];

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function HomePage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  // inline edit (one card at a time)
  const [editing, setEditing] = useState<{
    columnId: ColumnId;
    cardId: string;
  } | null>(null);

  const [editValue, setEditValue] = useState("");

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;

    // reorder within same column
    if (source.droppableId === destination.droppableId) {
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id !== source.droppableId) return col;
          return {
            ...col,
            cards: reorder(col.cards, source.index, destination.index),
          };
        })
      );
      return;
    }

    // move between columns
    setColumns((prev) => {
      const next = prev.map((c) => ({ ...c, cards: [...c.cards] }));
      const sourceCol = next.find((c) => c.id === source.droppableId)!;
      const destCol = next.find((c) => c.id === destination.droppableId)!;

      const [moved] = sourceCol.cards.splice(source.index, 1);
      destCol.cards.splice(destination.index, 0, moved);

      return next;
    });
  }

  function addCard(columnId: ColumnId) {
    const title = prompt("Card title?");
    if (!title) return;

    setColumns((prev) =>
      prev.map((c) =>
        c.id === columnId
          ? { ...c, cards: [...c.cards, { id: crypto.randomUUID(), title }] }
          : c
      )
    );
  }

  function deleteCard(columnId: ColumnId, cardId: string) {
    // if deleting currently edited card, exit edit mode
    setEditing((cur) =>
      cur && cur.columnId === columnId && cur.cardId === cardId ? null : cur
    );

    setColumns((prev) =>
      prev.map((c) =>
        c.id === columnId
          ? { ...c, cards: c.cards.filter((card) => card.id !== cardId) }
          : c
      )
    );
  }

  function startEdit(columnId: ColumnId, cardId: string, currentTitle: string) {
    setEditing({ columnId, cardId });
    setEditValue(currentTitle);
  }

  function cancelEdit() {
    setEditing(null);
    setEditValue("");
  }

  function saveEdit(columnId: ColumnId, cardId: string) {
    const nextTitle = editValue.trim();
    if (!nextTitle) {
      cancelEdit();
      return;
    }

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          cards: col.cards.map((card) =>
            card.id === cardId ? { ...card, title: nextTitle } : card
          ),
        };
      })
    );

    cancelEdit();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#070A16] via-[#0B1030] to-[#070A16] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                columnId={col.id}
                title={col.title}
                cards={col.cards}
                editingCardId={
                  editing?.columnId === col.id ? editing.cardId : null
                }
                editValue={editValue}
                onAddCard={() => addCard(col.id)}
                onDeleteCard={(cardId) => deleteCard(col.id, cardId)}
                onStartEdit={(cardId, currentTitle) =>
                  startEdit(col.id, cardId, currentTitle)
                }
                onEditChange={setEditValue}
                onSaveEdit={(cardId) => saveEdit(col.id, cardId)}
                onCancelEdit={cancelEdit}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </main>
  );
}
