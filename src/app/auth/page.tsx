"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthenticationStatus, useSignInEmailPassword } from "@nhost/nextjs";
import { nhost } from "@/lib/nhost";

type View = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/boards";

  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();
  const {
    signInEmailPassword,
    isLoading: signInLoading,
    error: signInError,
  } = useSignInEmailPassword();

  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    setMsg("");
  }, [view]);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await signInEmailPassword(email, password);
    if (res.error) return; // message shown below
    router.replace(next); // ✅ after successful sign in, go to boards (or next)
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
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-md space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
        <h1 className="text-2xl font-semibold">Auth</h1>

        {authLoading ? (
          <p>Checking session…</p>
        ) : isAuthenticated ? (
          <div className="space-y-3">
            <p>
              Status: <b>Signed in ✅</b>
            </p>
            <div className="flex gap-3">
              <button
                className="rounded-md bg-white/10 px-3 py-2 hover:bg-white/15"
                onClick={() => router.push("/boards")}
              >
                Go to boards
              </button>
              <button
                className="rounded-md bg-red-500/20 px-3 py-2 hover:bg-red-500/30"
                onClick={onSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-3 text-sm">
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
                className="w-full rounded-md bg-white/10 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white/30"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <input
                className="w-full rounded-md bg-white/10 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white/30"
                placeholder="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  view === "signin" ? "current-password" : "new-password"
                }
              />

              <button
                className="w-full rounded-md bg-white/15 px-3 py-2 hover:bg-white/20"
                type="submit"
                disabled={signInLoading}
              >
                {view === "signin" ? "Sign in" : "Sign up"}
              </button>
            </form>

            {signInError ? (
              <p className="text-sm text-red-300">{signInError.message}</p>
            ) : msg ? (
              <p className="text-sm text-white/80">{msg}</p>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
