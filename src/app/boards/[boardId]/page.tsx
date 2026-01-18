"use client";

import { useEffect, useMemo, useState } from "react";
import SignOutButton from "@/app/components/SignOutButton";
import { useParams } from "next/navigation";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
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
} from "@/graphql/__generated__/graphql";

/* ---------- helpers ---------- */

const NAME_TO_COLUMN_ID: Record<string, ColumnId> = {
  Stuck: "stuck",
  "Not Started": "not_started",
  "Working on it": "working_on_it",
  Done: "done",
  Test: "test",
};

function toColumnIdFromName(name: string): ColumnId {
  return NAME_TO_COLUMN_ID[name] ?? "stuck";
}

type CardUI = {
  id: string;
  title: string;
  status: ColumnId;
  position: number;
};

export default function BoardPage() {
  const params = useParams();
  const raw = params?.boardId;
  const boardId = Array.isArray(raw) ? raw[0] : (raw ?? "");

  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();

  // ✅ If signed out, force leaving the board page
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.replace("/auth");
    }
  }, [authLoading, isAuthenticated]);

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  /* ---------- LOCAL optimistic state ---------- */
  const [localCards, setLocalCards] = useState<CardUI[]>([]);

  /* ---------- realtime subscription ---------- */
  const { data, loading, error } = useSubscription<
    BoardLiveSubscription,
    BoardLiveSubscriptionVariables
  >(BoardLiveDocument, {
    variables: { boardId },
    skip: !boardId || authLoading || !isAuthenticated,
  });

  const board = data?.boards_by_pk ?? null;

  /* ---------- rebuild local state from subscription ---------- */
  useEffect(() => {
    if (!board?.cards) return;

    setLocalCards(
      board.cards.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status as ColumnId,
        position: c.position ?? 1,
      })),
    );
  }, [board?.cards]);

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

  /* ---------- derived UI ---------- */
  const columns = useMemo(() => {
    const cols = board?.columns ?? [];
    return cols.map((c) => ({
      id: toColumnIdFromName(c.name),
      title: c.name,
    }));
  }, [board?.columns]);

  const cardsByColumn = (columnId: ColumnId) =>
    localCards
      .filter((c) => c.status === columnId)
      .sort((a, b) => a.position - b.position)
      .map(({ id, title }) => ({ id, title }));

  /* ---------- actions ---------- */
  const onAddCard = async (columnId: ColumnId) => {
    if (!boardId) return;
    const title = prompt("Card title?");
    if (!title) return;

    const current = localCards.filter((c) => c.status === columnId);
    const nextPos =
      current.length === 0
        ? 1
        : Math.max(...current.map((c) => c.position)) + 1;

    await insertCard({
      variables: {
        object: {
          board_id: boardId,
          title,
          status: columnId,
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
      variables: {
        id: cardId,
        _set: { title: next },
      },
    });

    onCancelEdit();
  };

  /* ---------- DRAG & DROP ---------- */
  const onDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const toCol = destination.droppableId as ColumnId;

    // 1️⃣ optimistic UI
    setLocalCards((prev) => {
      const next = [...prev];

      const fromIndex = next.findIndex((c) => c.id === draggableId);
      if (fromIndex === -1) return prev;

      const [dragged] = next.splice(fromIndex, 1);
      dragged.status = toCol;
      next.splice(destination.index, 0, dragged);

      return next.map((c, i) => ({
        ...c,
        position: i + 1,
      }));
    });

    // 2️⃣ persist (NOTE: your original logic uses old localCards; leaving as-is)
    const updates = localCards.map((c, i) =>
      updateCard({
        variables: {
          id: c.id,
          _set: {
            position: i + 1,
            status: c.status,
          },
        },
      }),
    );

    await Promise.all(updates);
  };

  /* ---------- UI ---------- */
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

              <SignOutButton />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {columns.map((col) => (
                <KanbanColumn
                  key={col.id}
                  columnId={col.id}
                  title={col.title}
                  cards={cardsByColumn(col.id)}
                  editingCardId={editingCardId}
                  editValue={editValue}
                  onAddCard={() => onAddCard(col.id)}
                  onDeleteCard={onDeleteCard}
                  onStartEdit={onStartEdit}
                  onEditChange={setEditValue}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </DragDropContext>
  );
}
