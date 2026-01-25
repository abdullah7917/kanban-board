"use client";

import type {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from "@hello-pangea/dnd";

// ✅ Allow dynamic columns (like "Review", "Blocked", etc.)
export type ColumnId = string;

type KanbanCardProps = {
  title: string;

  // edit UI (state is owned by page)
  isEditing: boolean;
  editValue: string;

  // actions (owned by page)
  onStartEdit: () => void;
  onEditChange: (next: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;

  // DnD wiring (provided by Draggable in column)
  innerRef: (element: HTMLElement | null) => void;
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
};

export default function KanbanCard({
  title,
  isEditing,
  editValue,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  innerRef,
  draggableProps,
  dragHandleProps,
}: KanbanCardProps) {
  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      className="group relative rounded-lg bg-white px-3 py-3 text-sm text-slate-900 shadow-md ring-1 ring-black/5"
    >
      {isEditing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSaveEdit();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              onCancelEdit();
            }
          }}
          onBlur={onSaveEdit}
          className="w-full rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-900 outline-none ring-2 ring-slate-200 focus:ring-slate-300"
        />
      ) : (
        <div className="pr-16">{title}</div>
      )}

      <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 gap-1">
        <button
          type="button"
          aria-label="Edit card"
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit();
          }}
          className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-200"
        >
          ✏️
        </button>

        <button
          type="button"
          aria-label="Delete card"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-700 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
