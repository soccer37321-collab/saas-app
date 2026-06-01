import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "./SignOutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPro = sub?.plan === "pro" && sub?.status === "active";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">SaaS App</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/billing"
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isPro
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {isPro ? "プロ" : "フリー"}
            </Link>
            <span className="text-sm text-gray-500">
              {profile?.full_name ?? user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900">
          ようこそ、{profile?.full_name ?? "ユーザー"}さん
        </h2>
        <p className="mt-2 text-gray-600">ダッシュボードです。</p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "プロジェクト", value: "0" },
            { label: "メンバー", value: "1" },
            { label: "タスク", value: "0" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ツール</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/dashboard/script"
              className="flex items-start gap-4 rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xl">
                🎬
              </div>
              <div>
                <p className="font-semibold text-gray-900">YouTube 台本ジェネレーター</p>
                <p className="mt-1 text-sm text-gray-500">
                  Claude AI がテーマ・長さ・言語から台本を自動生成
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/billing"
              className="flex items-start gap-4 rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-xl">
                💳
              </div>
              <div>
                <p className="font-semibold text-gray-900">プラン・お支払い</p>
                <p className="mt-1 text-sm text-gray-500">
                  現在:{" "}
                  <span className={isPro ? "text-indigo-600 font-medium" : ""}>
                    {isPro ? "プロプラン" : "フリープラン"}
                  </span>
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
