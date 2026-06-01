"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", { method: "POST" });
      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert("エラーが発生しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="mt-8 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? "処理中..." : "プロにアップグレード"}
    </button>
  );
}
