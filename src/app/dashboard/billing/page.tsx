import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PortalButton from "./PortalButton";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const plan = sub?.plan ?? "free";
  const isPro = plan === "pro" && sub?.status === "active";
  const { success } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← ダッシュボード
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">プラン・お支払い</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 space-y-6">
        {success === "true" && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            🎉 プロプランへのアップグレードが完了しました！
          </div>
        )}

        {/* 現在のプラン */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">現在のプラン</h2>
          <div className="mt-3 flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
              isPro
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {isPro ? "プロ" : "フリー"}
            </span>
            {isPro && sub?.current_period_end && (
              <span className="text-sm text-gray-500">
                次回更新:{" "}
                {new Date(sub.current_period_end).toLocaleDateString("ja-JP")}
              </span>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            {isPro ? (
              <PortalButton />
            ) : (
              <Link
                href="/pricing"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                プロにアップグレード
              </Link>
            )}
          </div>
        </div>

        {/* 機能一覧 */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            プランの機能
          </h2>
          <div className="space-y-3 text-sm">
            {[
              { label: "YouTube 台本生成", free: "月3回", pro: "無制限" },
              { label: "対応言語", free: "日本語・英語", pro: "日本語・英語" },
              { label: "サポート", free: "メール", pro: "優先メール" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-gray-600">{row.label}</span>
                <div className="flex gap-8 text-right">
                  <span className={isPro ? "text-gray-400" : "font-medium text-gray-900"}>{row.free}</span>
                  <span className={isPro ? "font-medium text-indigo-600" : "text-gray-400"}>{row.pro}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-8 text-xs text-gray-400 pr-0">
            <span>フリー</span>
            <span>プロ</span>
          </div>
        </div>
      </main>
    </div>
  );
}
