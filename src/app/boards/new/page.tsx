"use client";

import { useRouter } from "next/navigation";
import { gql, useMutation } from "@apollo/client";
import { useAuthenticationStatus } from "@nhost/nextjs";

const CREATE_BOARD = gql`
  mutation CreateBoard($name: String!) {
    insert_boards_one(object: { name: $name }) {
      id
      name
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

export default function NewBoardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();

  const [createBoard, { loading: creating }] = useMutation(CREATE_BOARD);
  const [createColumns] = useMutation(CREATE_DEFAULT_COLUMNS);

  const onCreate = async () => {
    const name = prompt("Board name?")?.trim();
    if (!name) return;

    const res = await createBoard({ variables: { name } });
    const boardId = res.data?.insert_boards_one?.id;
    if (!boardId) return;

    // default columns for every new board
    const objects = [
      { board_id: boardId, name: "Stuck", position: 1 },
      { board_id: boardId, name: "Not Started", position: 2 },
      { board_id: boardId, name: "Working on it", position: 3 },
      { board_id: boardId, name: "Done", position: 4 },
      { board_id: boardId, name: "Test", position: 5 },
    ];

    await createColumns({ variables: { objects } });

    router.push(`/boards/${boardId}`);
  };

  if (authLoading)
    return <main className="p-6 text-white">Checking session…</main>;
  if (!isAuthenticated)
    return <main className="p-6 text-white">Please sign in.</main>;

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <h1 className="text-2xl font-semibold">New board</h1>
      <p className="mt-2 text-white/70">Create a board with default columns.</p>

      <button
        type="button"
        onClick={onCreate}
        disabled={creating}
        className="mt-6 rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 disabled:opacity-60"
      >
        {creating ? "Creating…" : "Create board"}
      </button>
    </main>
  );
}
