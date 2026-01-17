"use client";

import { useRouter } from "next/navigation";
import { nhost } from "@/lib/nhost";

export default function SignOutButton() {
  const router = useRouter();

  const onSignOut = async () => {
    await nhost.auth.signOut();
    router.replace("/auth");
    router.refresh();
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
