"use client";

import { useState } from "react";
import { useHibpCheck } from "@/hooks/useHibpCheck";

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { status: hibpStatus, pwnCount, check: hibpCheck, reset: hibpReset } = useHibpCheck();

  const handleNewPasswordChange = (val: string) => {
    setNewPassword(val);
    hibpCheck(val);
  };

  const canSubmit =
    !loading &&
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword === newPassword &&
    hibpStatus !== "pwned" &&
    hibpStatus !== "checking";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("新しいパスワードが一致しません。");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "パスワードの変更に失敗しました。");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    hibpReset();
    setLoading(false);
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">パスワード変更</h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-sm">
        {/* Current password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            現在のパスワード
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* New password + HIBP indicator */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            新しいパスワード（8文字以上）
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={e => handleNewPasswordChange(e.target.value)}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
              hibpStatus === "pwned"
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : hibpStatus === "safe"
                ? "border-green-400 focus:border-green-500 focus:ring-green-500"
                : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            }`}
          />
          <HibpFeedback status={hibpStatus} pwnCount={pwnCount} />
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            新しいパスワード（確認）
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {confirmPassword.length > 0 && confirmPassword !== newPassword && (
            <p className="mt-1 text-xs text-red-600">パスワードが一致しません。</p>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            パスワードを変更しました。
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "変更中..." : "パスワードを変更"}
        </button>
      </form>
    </div>
  );
}

function HibpFeedback({ status, pwnCount }: { status: string; pwnCount: number }) {
  if (status === "checking") {
    return <p className="mt-1 text-xs text-gray-500">漏洩データベースを確認中...</p>;
  }
  if (status === "pwned") {
    return (
      <p className="mt-1 text-xs text-red-600">
        このパスワードは過去のデータ漏洩で{pwnCount.toLocaleString()}回使用されています。別のパスワードを設定してください。
      </p>
    );
  }
  if (status === "safe") {
    return <p className="mt-1 text-xs text-green-600">漏洩データベースに登録されていません。</p>;
  }
  return null;
}
