"use client";

import { createClient } from "@/lib/supabase/client";
import TurnstileWidget from "@/components/TurnstileWidget";
import { useHibpCheck } from "@/hooks/useHibpCheck";
import Link from "next/link";
import { useCallback, useState } from "react";

export default function RegisterPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [widgetKey, setWidgetKey] = useState(0);

  const handleToken  = useCallback((t: string) => setTurnstileToken(t), []);
  const handleExpire = useCallback(() => setTurnstileToken(null), []);
  const { status: hibpStatus, pwnCount, check: hibpCheck } = useHibpCheck();

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    hibpCheck(val);
  };

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
    if (hibpStatus === "pwned") {
      setError(`このパスワードは過去のデータ漏洩で${pwnCount.toLocaleString()}回使用されています。別のパスワードを設定してください。`);
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

    // 2. Sign up with Supabase
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      resetWidget();
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow text-center">
          <h2 className="text-xl font-bold text-gray-900">確認メールを送信しました</h2>
          <p className="mt-2 text-sm text-gray-600">
            {email} に確認メールを送りました。メール内のリンクをクリックしてアカウントを有効化してください。
          </p>
          <Link
            href="/auth/login"
            className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
          >
            ログインページへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">新規登録</h1>
        <p className="mt-1 text-sm text-gray-500">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/auth/login" className="text-indigo-600 hover:underline">
            ログイン
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              お名前
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
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
              パスワード（8文字以上）
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                hibpStatus === "pwned"
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : hibpStatus === "safe"
                  ? "border-green-400 focus:border-green-500 focus:ring-green-500"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              }`}
            />
            {hibpStatus === "checking" && (
              <p className="mt-1 text-xs text-gray-500">漏洩データベースを確認中...</p>
            )}
            {hibpStatus === "pwned" && (
              <p className="mt-1 text-xs text-red-600">
                このパスワードは過去のデータ漏洩で{pwnCount.toLocaleString()}回使用されています。別のパスワードを設定してください。
              </p>
            )}
            {hibpStatus === "safe" && (
              <p className="mt-1 text-xs text-green-600">漏洩データベースに登録されていません。</p>
            )}
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
            disabled={loading || !turnstileToken || hibpStatus === "pwned" || hibpStatus === "checking"}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "登録中..." : "アカウントを作成"}
          </button>
        </form>
      </div>
    </div>
  );
}
