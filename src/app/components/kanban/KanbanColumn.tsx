"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import KanbanCard, { ColumnId } from "./KanbanCard";

type Card = { id: string; title: string };

type KanbanColumnProps = {
  columnId: ColumnId;
  title: string;
  cards: Card[];

  // editing state from page
  editingCardId: string | null;
  editValue: string;

  // actions from page
  onAddCard: () => void;
  onDeleteCard: (cardId: string) => void;

  onStartEdit: (cardId: string, currentTitle: string) => void;
  onEditChange: (next: string) => void;
  onSaveEdit: (cardId: string) => void;
  onCancelEdit: () => void;
};

// Column container colors (screenshot vibe)
const columnShell: Record<ColumnId, string> = {
  stuck: "bg-pink-600/80",
  not_started: "bg-blue-600/80",
  working_on_it: "bg-orange-500/80",
  done: "bg-emerald-500/80",
  test: "bg-purple-600/80",
};

export default function KanbanColumn({
  columnId,
  title,
  cards,
  editingCardId,
  editValue,
  onAddCard,
  onDeleteCard,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
}: KanbanColumnProps) {
  return (
    <div
      className={[
        "min-w-0 w-full rounded-xl shadow-lg ring-1 ring-white/10",
        columnShell[columnId],
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <h2 className="text-sm font-semibold text-white">
          {title}{" "}
          <span className="font-normal text-white/80">/ {cards.length}</span>
        </h2>
      </div>

      {/* Inner surface */}
      <div className="px-3 pb-4">
        <Droppable droppableId={columnId}>
          {(droppableProvided, snapshot) => (
            <div
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
              className={[
                "rounded-lg p-2",
                "min-h-[110px]",
                snapshot.isDraggingOver ? "bg-black/20" : "bg-black/10",
              ].join(" ")}
            >
              <div className="space-y-3">
                {cards.map((card, index) => {
                  const isEditing = editingCardId === card.id;

                  return (
                    <Draggable
                      key={card.id}
                      draggableId={card.id}
                      index={index}
                      isDragDisabled={isEditing}
                    >
                      {(provided) => (
                        <KanbanCard
                          title={card.title}
                          isEditing={isEditing}
                          editValue={editValue}
                          onStartEdit={() => onStartEdit(card.id, card.title)}
                          onEditChange={onEditChange}
                          onSaveEdit={() => onSaveEdit(card.id)}
                          onCancelEdit={onCancelEdit}
                          onDelete={() => onDeleteCard(card.id)}
                          innerRef={provided.innerRef}
                          draggableProps={provided.draggableProps}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      )}
                    </Draggable>
                  );
                })}
              </div>

              {droppableProvided.placeholder}

              {/* Link-style add */}
              <button
                onClick={onAddCard}
                className="mt-3 w-full rounded-md px-2 py-2 text-left text-sm font-medium text-white/90 hover:bg-white/10"
              >
                + Add card
              </button>
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
