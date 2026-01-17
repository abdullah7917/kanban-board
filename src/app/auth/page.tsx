"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { nhost } from "@/lib/nhost";

type View = "signin" | "signup";

function AuthInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") ?? "/boards";

  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"loading" | "signed_in" | "signed_out">(
    "loading",
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");

  async function refreshSession() {
    const session = await nhost.auth.getSession();
    const isIn = !!session;
    setStatus(isIn ? "signed_in" : "signed_out");

    const user = nhost.auth.getUser();
    setUserEmail(user?.email ?? null);

    // If already signed in, go where we want (usually /boards)
    if (isIn) router.replace(next);
  }

  useEffect(() => {
    refreshSession();

    const unsubscribe = nhost.auth.onAuthStateChanged(() => {
      refreshSession();
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await nhost.auth.signIn({ email, password });
    if (res.error) setMsg(res.error.message);
    // success redirect happens via refreshSession()
  }

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await nhost.auth.signUp({ email, password });
    if (res.error) setMsg(res.error.message);
    else setMsg("Signed up! Check your email if verification is enabled.");
  }

  async function onSignOut() {
    setMsg("");
    await nhost.auth.signOut();
    router.replace("/auth");
  }

  return (
    <main className="p-6 max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Auth</h1>

      {status === "loading" ? (
        <p>Checking session…</p>
      ) : status === "signed_in" ? (
        <div className="space-y-2">
          <p>
            Status: <b>Signed in ✅</b>
          </p>
          <p>Email: {userEmail ?? "(unknown)"}</p>

          <div className="flex gap-3">
            <button
              className="border px-3 py-2"
              onClick={() => router.push("/boards")}
            >
              Go to Boards
            </button>
            <button className="border px-3 py-2" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-3">
            <button
              className={
                view === "signin" ? "font-semibold underline" : "underline"
              }
              onClick={() => setView("signin")}
              type="button"
            >
              Sign in
            </button>
            <button
              className={
                view === "signup" ? "font-semibold underline" : "underline"
              }
              onClick={() => setView("signup")}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form
            onSubmit={view === "signin" ? onSignIn : onSignUp}
            className="space-y-3"
          >
            <input
              className="border p-2 w-full"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              className="border p-2 w-full"
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                view === "signin" ? "current-password" : "new-password"
              }
            />
            <button className="border px-3 py-2" type="submit">
              {view === "signin" ? "Sign in" : "Sign up"}
            </button>
          </form>

          {msg ? <p className="text-sm">{msg}</p> : null}
        </div>
      )}
    </main>
  );
}

export default function AuthPage() {
  // This is the key fix for Vercel build:
  // useSearchParams must be inside Suspense.
  return (
    <Suspense fallback={<main className="p-6">Loading…</main>}>
      <AuthInner />
    </Suspense>
  );
}
