"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { gql, useMutation, useSubscription } from "@apollo/client";
import { useAuthenticationStatus, useUserId } from "@nhost/nextjs";
import SignOutButton from "@/app/components/SignOutButton";

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

type DbBoard = {
  id: string;
  name: string;
  user_id?: string | null;
  position?: number | null;
};

type BoardsSubData = { boards: DbBoard[] };

const BOARDS_LIVE = gql`
  subscription BoardsLive($userId: uuid!) {
    boards(where: { user_id: { _eq: $userId } }, order_by: { position: asc }) {
      id
      name
      user_id
      position
    }
  }
`;

const CREATE_BOARD = gql`
  mutation CreateBoard($name: String!, $position: Int!) {
    insert_boards_one(object: { name: $name, position: $position }) {
      id
      name
      position
    }
  }
`;

const CREATE_DEFAULT_COLUMNS = gql`
  mutation CreateDefaultColumns($objects: [columns_insert_input!]!) {
    insert_columns(objects: $objects) {
      affected_rows
    }
  }
`;

const DELETE_BOARD = gql`
  mutation DeleteBoard($id: uuid!) {
    delete_boards_by_pk(id: $id) {
      id
    }
  }
`;

const UPDATE_BOARD = gql`
  mutation UpdateBoard($id: uuid!, $_set: boards_set_input!) {
    update_boards_by_pk(pk_columns: { id: $id }, _set: $_set) {
      id
      name
      position
    }
  }
`;

// Bulk update positions after drag-and-drop
const UPDATE_BOARD_POSITIONS = gql`
  mutation UpdateBoardPositions($updates: [boards_updates!]!) {
    update_boards_many(updates: $updates) {
      affected_rows
    }
  }
`;

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function BoardsListPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();
  const userId = useUserId();

  // Prevent hydration mismatch flicker on auth-dependent UI
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ----- EDIT STATE -----
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState<string>("");
  const [busy, setBusy] = useState(false);

  // Local list state for instant DnD UX
  const [localBoards, setLocalBoards] = useState<DbBoard[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Hooks MUST be called unconditionally
  const canRun = mounted && !authLoading && !!isAuthenticated && !!userId;

  const { data, loading, error } = useSubscription<BoardsSubData>(BOARDS_LIVE, {
    variables: { userId: (userId ?? "") as any },
    skip: !canRun,
  });

  const [createBoard, { loading: creating }] = useMutation(CREATE_BOARD);
  const [createDefaultColumns] = useMutation(CREATE_DEFAULT_COLUMNS);
  const [deleteBoard] = useMutation(DELETE_BOARD);
  const [updateBoard] = useMutation(UPDATE_BOARD);
  const [updateBoardPositions] = useMutation(UPDATE_BOARD_POSITIONS);

  const boardsFromServer = useMemo(() => data?.boards ?? [], [data]);

  // Key that changes even when Apollo updates items "in place"
  const boardsKey = useMemo(
    () =>
      boardsFromServer
        .map((b) => `${b.id}:${b.position ?? 0}:${b.name}`)
        .join("|"),
    [boardsFromServer],
  );

  // Keep localBoards in sync with server boards (but not while dragging or renaming)
  useEffect(() => {
    if (editingId) return;
    if (isDragging) return;
    setLocalBoards(boardsFromServer);
  }, [boardsKey, editingId, isDragging, boardsFromServer]);

  // ----- EARLY RENDERING (after hooks are defined) -----
  if (!mounted) return <p className="p-6">Loading…</p>;
  if (authLoading) return <p className="p-6">Checking session…</p>;

  if (!isAuthenticated) {
    return (
      <main className="p-6">
        <p className="mb-3">Please sign in</p>
        <Link className="underline" href="/auth">
          Go to Sign In
        </Link>
      </main>
    );
  }

  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6">Error: {error.message}</p>;

  // ----- ACTIONS -----
  const onCreateBoard = async () => {
    const name = prompt("Board name?");
    const trimmed = name?.trim();
    if (!trimmed) return;

    const nextPos =
      localBoards.length === 0
        ? 0
        : Math.max(...localBoards.map((b) => b.position ?? 0)) + 1;

    setBusy(true);
    try {
      // Create board
      const res = await createBoard({
        variables: { name: trimmed, position: nextPos },
      });

      const newBoardId = res.data?.insert_boards_one?.id;
      if (!newBoardId) return;

      // Create default columns
      const defaults = [
        { name: "Stuck", position: 0 },
        { name: "Not Started", position: 1 },
        { name: "Working on it", position: 2 },
        { name: "Done", position: 3 },
        { name: "Test", position: 4 },
      ];

      await createDefaultColumns({
        variables: {
          objects: defaults.map((c) => ({
            board_id: newBoardId,
            name: c.name,
            position: c.position,
          })),
        },
      });

      // No refetch needed: subscription will push the new board automatically
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string, name: string) => {
    const ok = confirm(`Delete board "${name}"? This cannot be undone.`);
    if (!ok) return;

    setBusy(true);
    try {
      await deleteBoard({ variables: { id } });
      // local update (snappier)
      setLocalBoards((prev) => prev.filter((b) => b.id !== id));
      // subscription will also update
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (b: DbBoard) => {
    setEditingId(b.id);
    setDraftName(b.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName("");
  };

  const saveEdit = async (id: string) => {
    const trimmed = draftName.trim();
    if (!trimmed) return;

    setBusy(true);
    try {
      await updateBoard({
        variables: { id, _set: { name: trimmed } },
      });
      cancelEdit();
      // subscription will update other tabs too
    } finally {
      setBusy(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    setIsDragging(false);

    if (!result.destination) return;

    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;

    // Don’t allow drag while renaming (keeps UX clean)
    if (editingId) return;

    const next = reorder(localBoards, from, to);

    // Update UI immediately
    setLocalBoards(next);

    // Persist positions (0..n-1)
    const updates = next.map((b, index) => ({
      where: { id: { _eq: b.id } },
      _set: { position: index },
    }));

    setBusy(true);
    try {
      await updateBoardPositions({ variables: { updates } });
      // subscription will update other tabs
    } catch (e) {
      // fallback to server truth (subscription data)
      setLocalBoards(boardsFromServer);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Boards</h1>
          <p className="mt-1 text-sm text-white/70">
            Click a board to open it.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCreateBoard}
            disabled={creating || busy}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-60"
          >
            {creating ? "Creating..." : "New board"}
          </button>
          <SignOutButton />
        </div>
      </div>

      {localBoards.length === 0 ? (
        <p className="mt-6 text-white/70">No boards found.</p>
      ) : (
        <DragDropContext
          onDragStart={() => setIsDragging(true)}
          onDragEnd={onDragEnd}
        >
          <Droppable droppableId="boards-list">
            {(dropProvided) => (
              <ul
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className="space-y-3"
              >
                {localBoards.map((b, index) => {
                  const isEditing = editingId === b.id;

                  return (
                    <Draggable
                      key={b.id}
                      draggableId={b.id}
                      index={index}
                      isDragDisabled={busy || isEditing}
                    >
                      {(dragProvided, dragSnapshot) => (
                        <li
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={[
                            "flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3",
                            dragSnapshot.isDragging ? "bg-white/10" : "",
                          ].join(" ")}
                        >
                          <div className="flex flex-1 items-center gap-3">
                            {/* Drag handle */}
                            <div
                              {...dragProvided.dragHandleProps}
                              className="cursor-grab select-none text-white/30 hover:text-white/60"
                              title="Drag to reorder"
                            >
                              ⋮⋮
                            </div>

                            <div className="flex-1">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    value={draftName}
                                    onChange={(e) =>
                                      setDraftName(e.target.value)
                                    }
                                    className="w-full max-w-md rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                                    placeholder="Board name"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveEdit(b.id);
                                      if (e.key === "Escape") cancelEdit();
                                    }}
                                  />

                                  <button
                                    onClick={() => saveEdit(b.id)}
                                    disabled={busy}
                                    className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-60"
                                    title="Save"
                                  >
                                    <Check size={18} />
                                  </button>

                                  <button
                                    onClick={cancelEdit}
                                    disabled={busy}
                                    className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-60"
                                    title="Cancel"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              ) : (
                                <Link
                                  href={`/boards/${b.id}`}
                                  className="block hover:underline"
                                >
                                  <div className="font-medium">{b.name}</div>
                                  <div className="text-xs text-white/50">
                                    {b.id}
                                  </div>
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="ml-4 flex items-center gap-2">
                            {!isEditing && (
                              <button
                                onClick={() => startEdit(b)}
                                disabled={busy}
                                className="rounded-md p-1 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-60"
                                title="Rename board"
                              >
                                <Pencil size={18} />
                              </button>
                            )}

                            <button
                              onClick={() => onDelete(b.id, b.name)}
                              disabled={busy}
                              className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-red-400 disabled:opacity-60"
                              title="Delete board"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {dropProvided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </main>
  );
}
