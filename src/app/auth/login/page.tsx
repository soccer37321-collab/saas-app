"use client";

import { createClient } from "@/lib/supabase/client";
import { sessionStartKey } from "@/components/SessionGuard";
import TurnstileWidget from "@/components/TurnstileWidget";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, Suspense } from "react";

const TIMEOUT_MESSAGES: Record<string, string> = {
  inactivity:  "30分間操作がなかったため、セキュリティのため自動的にログアウトしました。",
  max_session: "セッション有効期限（24時間）を超えたため、再度ログインしてください。",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [error, setError]               = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [widgetKey, setWidgetKey]       = useState(0);

  const handleToken    = useCallback((t: string) => setTurnstileToken(t), []);
  const handleExpire   = useCallback(() => setTurnstileToken(null), []);

  const resetWidget = () => {
    setTurnstileToken(null);
    setWidgetKey(k => k + 1);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!turnstileToken) {
      setError("CAPTCHAを完了してください。");
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Verify Turnstile token server-side
    const verifyRes = await fetch("/api/auth/verify-turnstile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: turnstileToken }),
    });

    if (!verifyRes.ok) {
      const { error: msg } = await verifyRes.json().catch(() => ({}));
      setError(msg ?? "CAPTCHA認証に失敗しました。ページを更新して再試行してください。");
      setLoading(false);
      resetWidget();
      return;
    }

    // 2. Sign in with Supabase
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      resetWidget();
      return;
    }

    if (data.user) {
      localStorage.setItem(sessionStartKey(data.user.id), String(Date.now()));
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
        <p className="mt-1 text-sm text-gray-500">
          アカウントをお持ちでない方は{" "}
          <Link href="/auth/register" className="text-indigo-600 hover:underline">
            新規登録
          </Link>
        </p>

        {reason && TIMEOUT_MESSAGES[reason] && (
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            {TIMEOUT_MESSAGES[reason]}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <TurnstileWidget
            key={widgetKey}
            onToken={handleToken}
            onExpire={handleExpire}
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !turnstileToken}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
