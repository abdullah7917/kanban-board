"use client";

import { useEffect, useState } from "react";
import { nhost } from "@/lib/nhost";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // simple: signed in = has session
  const [signedIn, setSignedIn] = useState(false);

  async function refreshSession() {
    try {
      const session = await nhost.auth.getSession();
      setSignedIn(Boolean(session));
    } catch {
      setSignedIn(false);
    }
  }

  useEffect(() => {
    // check once on mount
    refreshSession();
  }, []);

  async function signUp() {
    setLoading(true);
    setError(null);

    const res = await nhost.auth.signUpEmailPassword({
      email,
      password,
    });

    // nhost-js v4 returns FetchResponse<T>
    const { data, error } = res as unknown as {
      data: any;
      error: { message: string } | null;
    };

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If "Require Verified Emails" is ON, you may not get a session immediately.
    // We'll refresh session; if still not signed in, user must verify email.
    await refreshSession();

    if (!data?.session) {
      setError("Check your email to verify your account, then sign in.");
    }

    setLoading(false);
  }

  async function signIn() {
    setLoading(true);
    setError(null);

    const res = await nhost.auth.signInEmailPassword({
      email,
      password,
    });

    const { data, error } = res as unknown as {
      data: any;
      error: { message: string } | null;
    };

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSignedIn(Boolean(data?.session));
    setLoading(false);
  }

  async function signOut() {
    setLoading(true);
    setError(null);

    try {
      await nhost.auth.signOut();
      setSignedIn(false);
    } catch (e: any) {
      setError(e?.message ?? "Sign out failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 rounded border p-6">
        <h1 className="text-xl font-semibold">Auth</h1>

        {signedIn ? (
          <>
            <p className="text-sm text-green-600">Signed in ✅</p>
            <button
              className="w-full rounded border px-4 py-2"
              onClick={signOut}
              disabled={loading}
            >
              {loading ? "Signing out..." : "Sign out"}
            </button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <input
                className="w-full rounded border p-2"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <input
                className="w-full rounded border p-2"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <button
                className="flex-1 rounded border px-4 py-2"
                onClick={signIn}
                disabled={loading || !email || !password}
              >
                {loading ? "Loading..." : "Sign in"}
              </button>
              <button
                className="flex-1 rounded border px-4 py-2"
                onClick={signUp}
                disabled={loading || !email || !password}
              >
                {loading ? "Loading..." : "Sign up"}
              </button>
            </div>

            <p className="text-xs text-gray-500">
              If email verification is enabled in Nhost, after Sign up you must
              verify your email, then Sign in.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
