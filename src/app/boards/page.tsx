"use client";

import { useEffect } from "react";
import Link from "next/link";
import SignOutButton from "@/app/components/SignOutButton";
import { gql, useQuery } from "@apollo/client";
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

export default function BoardsListPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();

  // ✅ If signed out, force leaving /boards (fixes "stuck on boards list" issue)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.replace("/auth");
    }
  }, [authLoading, isAuthenticated]);

  const { data, loading, error } = useQuery<BoardsQueryData>(BOARDS, {
    skip: authLoading || !isAuthenticated,
    fetchPolicy: "cache-first",
  });

  if (authLoading) return <p className="p-6">Checking session…</p>;

  // While redirecting, show a simple message (avoids flicker)
  if (!isAuthenticated) return <p className="p-6">Redirecting to sign in…</p>;

  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6">Error: {error.message}</p>;

  const boards = data?.boards ?? [];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Boards</h1>
          <p className="mt-1 text-sm text-white/70">
            Click a board to open it.
          </p>
        </div>
        <SignOutButton />
      </div>

      {boards.length === 0 ? (
        <p className="mt-6 text-white/70">No boards found.</p>
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
