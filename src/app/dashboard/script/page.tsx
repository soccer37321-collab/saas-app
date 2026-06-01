import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ScriptGenerator from "./ScriptGenerator";

export default async function ScriptPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← ダッシュボード
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            YouTube 台本ジェネレーター
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">台本を生成する</h2>
          <p className="mt-1 text-sm text-gray-500">
            テーマ・動画の長さ・言語を入力すると、Claude AI が台本を自動生成します。
          </p>
        </div>

        <ScriptGenerator />
      </main>
    </div>
  );
}
