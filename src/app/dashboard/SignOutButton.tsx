"use client";

import { createClient } from "@/lib/supabase/client";
import { clearSessionKeys } from "@/components/SessionGuard";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (user) clearSessionKeys(user.id);

    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 transition-colors"
    >
      {loading ? "..." : "ログアウト"}
    </button>
  );
}
