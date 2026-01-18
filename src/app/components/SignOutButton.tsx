"use client";

import { nhost } from "@/lib/nhost";

export default function SignOutButton() {
  const onSignOut = async () => {
    try {
      await nhost.auth.signOut();
    } finally {
      // Hard redirect = always works (no router/hydration race)
      window.location.assign("/auth?next=/boards");
    }
  };

  return (
    <button
      type="button"
      onClick={onSignOut}
      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
    >
      Sign out
    </button>
  );
}
