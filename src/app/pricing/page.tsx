import Link from "next/link";
import { PLANS } from "@/lib/stripe";
import UpgradeButton from "./UpgradeButton";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← ダッシュボード
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">プラン・料金</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">シンプルな料金プラン</h2>
          <p className="mt-3 text-gray-500">まずは無料でお試しください。いつでもアップグレード可能です。</p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 max-w-2xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{PLANS.free.name}</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">¥0</span>
              <span className="text-gray-500 ml-1">/ 月</span>
            </div>
            <ul className="mt-6 space-y-3">
              {PLANS.free.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="mt-8 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              現在のプラン
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-indigo-600 bg-white p-8 shadow-sm relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                おすすめ
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{PLANS.pro.name}</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">¥{PLANS.pro.price.toLocaleString()}</span>
              <span className="text-gray-500 ml-1">/ 月</span>
            </div>
            <ul className="mt-6 space-y-3">
              {PLANS.pro.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-indigo-600">✓</span> {f}
                </li>
              ))}
            </ul>
            <UpgradeButton />
          </div>
        </div>
      </main>
    </div>
  );
}
