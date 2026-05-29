import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">SaaS App</h1>
          <span className="text-sm text-gray-500">
            {profile?.full_name ?? user.email}
          </span>
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
      </main>
    </div>
  );
}
