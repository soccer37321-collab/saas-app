"use client";

import { useState } from "react";

const ALLOWED_STRIPE_HOSTS = ["billing.stripe.com", "checkout.stripe.com"];

function isStripeUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && ALLOWED_STRIPE_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

export default function PortalButton() {
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-portal", { method: "POST" });
      const { url } = await res.json();
      if (url && isStripeUrl(url)) {
        window.location.href = url;
      } else {
        alert("エラーが発生しました。");
      }
    } catch {
      alert("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePortal}
      disabled={loading}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
    >
      {loading ? "処理中..." : "お支払い管理（Stripe）"}
    </button>
  );
}
