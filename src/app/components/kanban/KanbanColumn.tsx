"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import KanbanCard, { ColumnId } from "./KanbanCard";
import { Pencil, X, Check } from "lucide-react";

type Card = { id: string; title: string };

type KanbanColumnProps = {
  // DB id needed for rename/delete
  dbColumnId: string;

  // DnD id (we use column name)
  columnId: ColumnId;

  title: string;
  cards: Card[];

  // card editing state from page
  editingCardId: string | null;
  editValue: string;

  // column editing state from page
  isEditingColumn: boolean;
  columnDraft: string;

  // actions from page
  onAddCard: () => void;
  onDeleteCard: (cardId: string) => void;

  onStartEdit: (cardId: string, currentTitle: string) => void;
  onEditChange: (next: string) => void;
  onSaveEdit: (cardId: string) => void;
  onCancelEdit: () => void;

  // column actions from page
  onStartEditColumn: () => void;
  onChangeColumnDraft: (next: string) => void;
  onSaveColumn: () => void;
  onCancelColumn: () => void;
  onDeleteColumn: () => void;

  // ✅ NEW: makes header the drag handle for column DnD
  columnDragHandleProps?: DraggableProvidedDragHandleProps | null;
};

// default colors for known columns; custom columns get fallback
const columnShell: Record<string, string> = {
  stuck: "bg-pink-600/80",
  not_started: "bg-blue-600/80",
  working_on_it: "bg-yellow-500/100",
  done: "bg-emerald-500/80",
  test: "bg-red-600/80",
};

function toShellKey(columnId: string) {
  return columnId.trim().toLowerCase().replace(/\s+/g, "_");
}

export default function KanbanColumn({
  dbColumnId,
  columnId,
  title,
  cards,
  editingCardId,
  editValue,
  isEditingColumn,
  columnDraft,
  onAddCard,
  onDeleteCard,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onStartEditColumn,
  onChangeColumnDraft,
  onSaveColumn,
  onCancelColumn,
  onDeleteColumn,
  columnDragHandleProps, // ✅ NEW
}: KanbanColumnProps) {
  const shellKey = toShellKey(columnId);
  const shellClass = columnShell[shellKey] ?? "bg-white/10";

  return (
    <div
      className={[
        "group min-w-0 w-full rounded-xl shadow-lg ring-1 ring-white/10",
        shellClass,
      ].join(" ")}
    >
      {/* Header (drag handle) */}
      <div
        className={[
          "flex items-center justify-between px-4 pb-2 pt-4",
          // ✅ subtle UX: show grab cursor when draggable
          !isEditingColumn && columnDragHandleProps
            ? "cursor-grab active:cursor-grabbing"
            : "",
        ].join(" ")}
        // ✅ THIS is the key step: allow dragging column by header
        {...(!isEditingColumn ? columnDragHandleProps : undefined)}
      >
        {isEditingColumn ? (
          <div className="flex w-full items-center gap-2">
            <input
              autoFocus
              value={columnDraft}
              onChange={(e) => onChangeColumnDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveColumn();
                if (e.key === "Escape") onCancelColumn();
              }}
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              placeholder="Column name"
            />

            <button
              onClick={onSaveColumn}
              className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
              title="Save"
              type="button"
            >
              <Check size={18} />
            </button>

            <button
              onClick={onCancelColumn}
              className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
              title="Cancel"
              type="button"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              {title}{" "}
              <span className="font-normal text-white/80">
                / {cards.length}
              </span>
            </h2>

            {/* Hover actions (same behavior as cards) */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  // ✅ prevent header drag from triggering when clicking buttons
                  e.stopPropagation();
                  onStartEditColumn();
                }}
                className="rounded-md bg-black/20 px-2 py-1 text-xs text-white/80 hover:bg-black/30"
                title="Rename column"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteColumn();
                }}
                className="rounded-md bg-black/20 px-2 py-1 text-xs font-bold text-white/80 hover:bg-black/30 hover:text-red-200"
                title="Delete column"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
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

              <button
                onClick={onAddCard}
                className="mt-3 w-full rounded-md px-2 py-2 text-left text-sm font-medium text-white/90 hover:bg-white/10"
                type="button"
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
