import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="max-w-2xl px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          SaaS App
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          シンプルで使いやすいチーム管理ツール
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/auth/register"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500"
          >
            無料で始める
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            ログイン
          </Link>
        </div>
      </div>
    </main>
  );
}
