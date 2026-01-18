"use client";

import { nhost } from "@/lib/nhost";

export default function SignOutButton() {
  const onSignOut = async () => {
    // ✅ tell /auth page: do NOT auto-redirect while we’re signing out
    sessionStorage.setItem("mycritters_signing_out", "1");

    try {
      await nhost.auth.signOut();
    } finally {
      // ✅ hard redirect
      window.location.replace("/auth?next=/boards");
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
