"use client";

import Link from "next/link";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useAuthenticationStatus } from "@nhost/nextjs";
import SignOutButton from "@/app/components/SignOutButton";

type DbBoard = {
  id: string;
  name: string;
};

type BoardsQueryData = { boards: DbBoard[] };

const BOARDS = gql`
  query Boards {
    boards(order_by: { created_at: desc }) {
      id
      name
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

export default function BoardsListPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();

  const { data, loading, error } = useQuery<BoardsQueryData>(BOARDS, {
    skip: authLoading || !isAuthenticated,
  });

  const [deleteBoard] = useMutation(DELETE_BOARD, {
    refetchQueries: [{ query: BOARDS }],
  });

  if (authLoading) return <p className="p-6">Checking session…</p>;
  if (!isAuthenticated)
    return (
      <main className="p-6">
        <p className="mb-3">Please sign in</p>
        <Link className="underline" href="/auth">
          Go to Sign In
        </Link>
      </main>
    );

  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6">Error: {error.message}</p>;

  const boards = data?.boards ?? [];

  const onDelete = async (id: string, name: string) => {
    const ok = confirm(`Delete board "${name}"? This cannot be undone.`);
    if (!ok) return;

    await deleteBoard({ variables: { id } });
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Boards</h1>
          <p className="mt-1 text-sm text-white/70">
            Click a board to open it.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/boards/new"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            New board
          </Link>
          <SignOutButton />
        </div>
      </div>

      {boards.length === 0 ? (
        <p className="mt-6 text-white/70">No boards found.</p>
      ) : (
        <ul className="space-y-3">
          {boards.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            >
              <Link href={`/boards/${b.id}`} className="flex-1 hover:underline">
                <div className="font-medium">{b.name}</div>
                <div className="text-xs text-white/50">{b.id}</div>
              </Link>

              {/* 🗑️ Delete button */}
              <button
                onClick={() => onDelete(b.id, b.name)}
                className="ml-4 text-white/60 hover:text-red-400"
                title="Delete board"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
