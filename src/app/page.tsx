"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

type ColumnId = "stuck" | "not_started" | "working_on_it" | "done" | "test";

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
  {
    id: "done",
    title: "Done",
    cards: [{ id: "c4", title: "Project setup" }],
  },
  {
    id: "test",
    title: "Test",
    cards: [],
  },
];

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function HomePage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;

    // same column reorder
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

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold">Kanban Board</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div
              key={col.id}
              className="w-72 shrink-0 rounded-lg bg-gray-800 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {col.title}{" "}
                  <span className="text-sm text-gray-300">
                    / {col.cards.length}
                  </span>
                </h2>
              </div>

              <Droppable droppableId={col.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3"
                  >
                    {col.cards.map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={card.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="rounded-md bg-gray-700 px-3 py-2 text-sm text-white shadow"
                          >
                            {card.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </main>
  );
}
