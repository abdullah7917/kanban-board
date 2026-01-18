"use client";

import Link from "next/link";
import SignOutButton from "@/app/components/SignOutButton";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useAuthenticationStatus } from "@nhost/nextjs";

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

/**
 * Creates a board + default columns in ONE mutation (nested insert).
 * This only works if Hasura relationships are set:
 * boards -> columns (array relationship)
 */
const INSERT_BOARD_WITH_COLUMNS = gql`
  mutation InsertBoardWithColumns($boardName: String!) {
    insert_boards_one(
      object: {
        name: $boardName
        columns: {
          data: [
            { name: "Stuck", position: 1 }
            { name: "Not Started", position: 2 }
            { name: "Working on it", position: 3 }
            { name: "Done", position: 4 }
            { name: "Test", position: 5 }
          ]
        }
      }
    ) {
      id
      name
    }
  }
`;

export default function BoardsListPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();

  const { data, loading, error } = useQuery<BoardsQueryData>(BOARDS, {
    skip: authLoading || !isAuthenticated,
    fetchPolicy: "cache-first",
  });

  const [insertBoard, { loading: creating }] = useMutation(
    INSERT_BOARD_WITH_COLUMNS,
    {
      refetchQueries: [{ query: BOARDS }],
    },
  );

  const onCreateBoard = async () => {
    const name = prompt("Board name?");
    if (!name) return;

    try {
      await insertBoard({
        variables: { boardName: name },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert("Create board failed: " + msg);
    }
  };

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

  const boards = data?.boards ?? [];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Boards</h1>
          <p className="mt-1 text-sm text-white/70">
            Click a board to open it.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCreateBoard}
            disabled={creating}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-60"
          >
            {creating ? "Creating…" : "New board"}
          </button>
          <SignOutButton />
        </div>
      </div>

      {boards.length === 0 ? (
        <div className="mt-8 space-y-3 text-white/70">
          <p>No boards found.</p>
          <button
            type="button"
            onClick={onCreateBoard}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Create your first board
          </button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {boards.map((b) => (
            <li key={b.id}>
              <Link
                href={`/boards/${b.id}`}
                className="block rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10"
              >
                <div className="font-medium">{b.name}</div>
                <div className="mt-1 text-xs text-white/60">{b.id}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
