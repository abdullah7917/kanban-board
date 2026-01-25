"use client";

import { useEffect, useState } from "react";
import SignOutButton from "@/app/components/SignOutButton";
import { useParams } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useMutation, useSubscription } from "@apollo/client";
import { useAuthenticationStatus } from "@nhost/nextjs";

import KanbanColumn from "@/app/components/kanban/KanbanColumn";
import type { ColumnId } from "@/app/components/kanban/KanbanCard";

import {
  BoardLiveDocument,
  type BoardLiveSubscription,
  type BoardLiveSubscriptionVariables,
  InsertCardDocument,
  type InsertCardMutation,
  type InsertCardMutationVariables,
  UpdateCardDocument,
  type UpdateCardMutation,
  type UpdateCardMutationVariables,
  DeleteCardDocument,
  type DeleteCardMutation,
  type DeleteCardMutationVariables,
  InsertColumnDocument,
  type InsertColumnMutation,
  type InsertColumnMutationVariables,
  UpdateColumnDocument,
  type UpdateColumnMutation,
  type UpdateColumnMutationVariables,
  DeleteColumnDocument,
  type DeleteColumnMutation,
  type DeleteColumnMutationVariables,
  RenameCardsStatusDocument,
  type RenameCardsStatusMutation,
  type RenameCardsStatusMutationVariables,
  DeleteCardsInColumnDocument,
  type DeleteCardsInColumnMutation,
  type DeleteCardsInColumnMutationVariables,
  UpdateColumnPositionDocument,
  type UpdateColumnPositionMutation,
  type UpdateColumnPositionMutationVariables,
} from "@/graphql/__generated__/graphql";

type CardUI = {
  id: string;
  title: string;
  status: ColumnId; // status is column name string
  position: number;
};

type ColumnUI = {
  dbId: string;
  name: string;
  position: number;
};

const COLUMNS_DROPPABLE_ID = "columns-row";

export default function BoardPage() {
  const params = useParams();
  const raw = params?.boardId;
  const boardId = Array.isArray(raw) ? raw[0] : (raw ?? "");

  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.replace("/auth");
    }
  }, [authLoading, isAuthenticated]);

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // column editing state
  const [editingColumnDbId, setEditingColumnDbId] = useState<string | null>(
    null,
  );
  const [editingColumnOldName, setEditingColumnOldName] = useState<string>("");
  const [columnDraft, setColumnDraft] = useState<string>("");

  // local state
  const [localCards, setLocalCards] = useState<CardUI[]>([]);
  const [localColumns, setLocalColumns] = useState<ColumnUI[]>([]);

  const { data, loading, error } = useSubscription<
    BoardLiveSubscription,
    BoardLiveSubscriptionVariables
  >(BoardLiveDocument, {
    variables: { boardId },
    skip: !boardId || authLoading || !isAuthenticated,
  });

  const board = data?.boards_by_pk ?? null;

  // sync local cards from subscription
  useEffect(() => {
    if (!board?.cards) return;
    setLocalCards(
      board.cards.map((c) => ({
        id: c.id,
        title: c.title,
        status: String(c.status),
        position: c.position ?? 1,
      })),
    );
  }, [board?.cards]);

  // sync local columns from subscription
  useEffect(() => {
    if (!board?.columns) return;
    const cols =
      board.columns
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((c) => ({
          dbId: c.id,
          name: c.name,
          position: c.position ?? 0,
        })) ?? [];
    setLocalColumns(cols);
  }, [board?.columns]);

  /* ---------- mutations ---------- */
  const [insertCard] = useMutation<
    InsertCardMutation,
    InsertCardMutationVariables
  >(InsertCardDocument);

  const [updateCard] = useMutation<
    UpdateCardMutation,
    UpdateCardMutationVariables
  >(UpdateCardDocument);

  const [deleteCard] = useMutation<
    DeleteCardMutation,
    DeleteCardMutationVariables
  >(DeleteCardDocument);

  const [insertColumn, { loading: creatingColumn }] = useMutation<
    InsertColumnMutation,
    InsertColumnMutationVariables
  >(InsertColumnDocument);

  const [updateColumn] = useMutation<
    UpdateColumnMutation,
    UpdateColumnMutationVariables
  >(UpdateColumnDocument);

  const [deleteColumn] = useMutation<
    DeleteColumnMutation,
    DeleteColumnMutationVariables
  >(DeleteColumnDocument);

  const [renameCardsStatus] = useMutation<
    RenameCardsStatusMutation,
    RenameCardsStatusMutationVariables
  >(RenameCardsStatusDocument);

  const [deleteCardsInColumn] = useMutation<
    DeleteCardsInColumnMutation,
    DeleteCardsInColumnMutationVariables
  >(DeleteCardsInColumnDocument);

  const [updateColumnPosition] = useMutation<
    UpdateColumnPositionMutation,
    UpdateColumnPositionMutationVariables
  >(UpdateColumnPositionDocument);

  /* ---------- helpers ---------- */
  const cardsByColumn = (columnName: ColumnId) =>
    localCards
      .filter((c) => c.status === columnName)
      .sort((a, b) => a.position - b.position)
      .map(({ id, title }) => ({ id, title }));

  /* ---------- card actions ---------- */
  const onAddCard = async (columnName: ColumnId) => {
    if (!boardId) return;
    const title = prompt("Card title?");
    if (!title?.trim()) return;

    const current = localCards.filter((c) => c.status === columnName);
    const nextPos =
      current.length === 0
        ? 1
        : Math.max(...current.map((c) => c.position)) + 1;

    await insertCard({
      variables: {
        object: {
          board_id: boardId,
          title: title.trim(),
          status: columnName,
          position: nextPos,
        },
      },
    });
  };

  const onDeleteCard = async (cardId: string) => {
    await deleteCard({ variables: { id: cardId } });
  };

  const onStartEdit = (cardId: string, title: string) => {
    setEditingCardId(cardId);
    setEditValue(title);
  };

  const onCancelEdit = () => {
    setEditingCardId(null);
    setEditValue("");
  };

  const onSaveEdit = async (cardId: string) => {
    const next = editValue.trim();
    if (!next) return onCancelEdit();

    await updateCard({
      variables: { id: cardId, _set: { title: next } },
    });

    onCancelEdit();
  };

  /* ---------- column actions ---------- */
  const onAddColumn = async () => {
    if (!boardId) return;

    const name = prompt("New column name?");
    if (!name?.trim()) return;
    const clean = name.trim();

    const exists = localColumns.some(
      (c) => c.name.toLowerCase() === clean.toLowerCase(),
    );
    if (exists) {
      alert("That column name already exists. Choose a different name.");
      return;
    }

    const nextPosition = localColumns.length;

    await insertColumn({
      variables: { boardId, name: clean, position: nextPosition },
    });
  };

  const startEditColumn = (dbId: string, currentName: string) => {
    setEditingColumnDbId(dbId);
    setEditingColumnOldName(currentName);
    setColumnDraft(currentName);
  };

  const cancelEditColumn = () => {
    setEditingColumnDbId(null);
    setEditingColumnOldName("");
    setColumnDraft("");
  };

  const saveEditColumn = async (dbId: string) => {
    if (!boardId) return;

    const nextName = columnDraft.trim();
    if (!nextName) return;

    const oldName = editingColumnOldName;

    if (nextName === oldName) {
      cancelEditColumn();
      return;
    }

    const exists = localColumns.some(
      (c) => c.name.toLowerCase() === nextName.toLowerCase(),
    );
    if (exists) {
      alert("That column name already exists. Choose a different name.");
      return;
    }

    await updateColumn({
      variables: { id: dbId, _set: { name: nextName } },
    });

    await renameCardsStatus({
      variables: { boardId, from: oldName, to: nextName },
    });

    setLocalCards((prev) =>
      prev.map((c) => (c.status === oldName ? { ...c, status: nextName } : c)),
    );

    setLocalColumns((prev) =>
      prev.map((c) => (c.dbId === dbId ? { ...c, name: nextName } : c)),
    );

    cancelEditColumn();
  };

  const onDeleteColumn = async (dbId: string, name: string) => {
    if (!boardId) return;

    const ok = confirm(
      `Delete column "${name}"?\n\nThis will also delete all cards inside it.`,
    );
    if (!ok) return;

    await deleteCardsInColumn({ variables: { boardId, status: name } });
    await deleteColumn({ variables: { id: dbId } });

    setLocalCards((prev) => prev.filter((c) => c.status !== name));
    setLocalColumns((prev) => prev.filter((c) => c.dbId !== dbId));
    if (editingColumnDbId === dbId) cancelEditColumn();
  };

  /* ---------- DnD ---------- */
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;

    // ✅ 1) COLUMN DRAG
    if (type === "COLUMN") {
      if (destination.index === source.index) return;

      const nextCols = Array.from(localColumns);
      const [moved] = nextCols.splice(source.index, 1);
      nextCols.splice(destination.index, 0, moved);

      const withPos = nextCols.map((c, i) => ({ ...c, position: i }));
      setLocalColumns(withPos);

      await Promise.all(
        withPos.map((c) =>
          updateColumnPosition({
            variables: { id: c.dbId, position: c.position },
          }),
        ),
      );

      return;
    }

    // ⚠️ Your existing card logic is still here (unchanged)
    const toCol = destination.droppableId as ColumnId;

    let nextCardsSnapshot: CardUI[] = [];

    setLocalCards((prev) => {
      const next = [...prev];

      const fromIndex = next.findIndex((c) => c.id === draggableId);
      if (fromIndex === -1) {
        nextCardsSnapshot = prev;
        return prev;
      }

      const [dragged] = next.splice(fromIndex, 1);
      dragged.status = toCol;
      next.splice(destination.index, 0, dragged);

      const rePos = next.map((c, i) => ({ ...c, position: i + 1 }));
      nextCardsSnapshot = rePos;
      return rePos;
    });

    await Promise.all(
      nextCardsSnapshot.map((c) =>
        updateCard({
          variables: {
            id: c.id,
            _set: { position: c.position, status: c.status },
          },
        }),
      ),
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        {authLoading && <div>Checking session…</div>}
        {!authLoading && !isAuthenticated && <div>Redirecting to sign in…</div>}
        {!authLoading && isAuthenticated && loading && <div>Loading…</div>}
        {!authLoading && isAuthenticated && error && (
          <div className="text-red-300">Error: {error.message}</div>
        )}

        {!authLoading && isAuthenticated && board && (
          <>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="mb-1 text-2xl font-bold">Kanban Board</h1>
                <p className="text-sm text-white/70">Board: {board.name}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onAddColumn}
                  disabled={creatingColumn}
                  className="rounded-md bg-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/15 hover:text-white disabled:opacity-50"
                  title="Add column"
                >
                  + Column
                </button>
                <SignOutButton />
              </div>
            </div>

            <Droppable
              droppableId={COLUMNS_DROPPABLE_ID}
              direction="horizontal"
              type="COLUMN"
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-4 overflow-x-auto pb-2"
                >
                  {localColumns.map((col, index) => (
                    <Draggable
                      key={col.dbId}
                      draggableId={col.dbId}
                      index={index}
                      isDragDisabled={editingColumnDbId === col.dbId} // ✅ FIX
                    >
                      {(dragProvided) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className="min-w-[280px] md:min-w-[0] md:flex-1"
                        >
                          <KanbanColumn
                            dbColumnId={col.dbId}
                            columnId={col.name}
                            title={col.name}
                            cards={cardsByColumn(col.name)}
                            editingCardId={editingCardId}
                            editValue={editValue}
                            onAddCard={() => onAddCard(col.name)}
                            onDeleteCard={onDeleteCard}
                            onStartEdit={onStartEdit}
                            onEditChange={setEditValue}
                            onSaveEdit={onSaveEdit}
                            onCancelEdit={onCancelEdit}
                            isEditingColumn={editingColumnDbId === col.dbId}
                            columnDraft={columnDraft}
                            onStartEditColumn={() =>
                              startEditColumn(col.dbId, col.name)
                            }
                            onChangeColumnDraft={setColumnDraft}
                            onSaveColumn={() => saveEditColumn(col.dbId)}
                            onCancelColumn={cancelEditColumn}
                            onDeleteColumn={() =>
                              onDeleteColumn(col.dbId, col.name)
                            }
                            columnDragHandleProps={dragProvided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </>
        )}
      </main>
    </DragDropContext>
  );
}
