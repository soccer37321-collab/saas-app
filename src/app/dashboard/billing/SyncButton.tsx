"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/sync", { method: "POST" });
      const { plan } = await res.json();
      router.refresh();
      if (plan === "pro") {
        // 同期成功・プラン更新
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
      title="Stripeからプラン状態を同期"
    >
      {loading ? "同期中..." : "↻ 同期"}
    </button>
  );
}
