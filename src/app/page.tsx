import Link from "next/link";

const features = [
  {
    icon: "🤖",
    title: "AIによる台本自動生成",
    desc: "テーマを入力するだけで、フック・本編・まとめまで揃ったプロ品質の台本を即座に生成します。",
  },
  {
    icon: "📋",
    title: "実績ある構成テンプレート",
    desc: "視聴者を最後まで引きつける構成をAIが自動適用。再生維持率の向上に直結します。",
  },
  {
    icon: "🌍",
    title: "日本語・英語に対応",
    desc: "日本語はもちろん英語でも生成可能。海外向けチャンネルや多言語展開にも対応します。",
  },
  {
    icon: "⚡",
    title: "最短30秒で完成",
    desc: "アイデアが浮かんだらすぐ台本化。撮影準備から公開までのサイクルを大幅に短縮します。",
  },
];

const steps = [
  {
    num: "1",
    title: "テーマを入力",
    desc: "動画にしたいテーマや伝えたいメッセージを短く入力するだけ。",
  },
  {
    num: "2",
    title: "AIが台本を生成",
    desc: "フック・イントロ・本編・CTAを含む完成度の高い台本が数十秒で自動生成されます。",
  },
  {
    num: "3",
    title: "コピーして撮影へ",
    desc: "生成された台本をそのままコピーして、すぐに動画制作に取りかかれます。",
  },
];

const freeFeatures = [
  "月3回まで台本生成",
  "日本語・英語対応",
  "全セクション（フック〜CTA）生成",
  "コピー＆ペーストで即使用",
];

const proFeatures = [
  "無制限の台本生成",
  "日本語・英語対応",
  "全セクション（フック〜CTA）生成",
  "コピー＆ペーストで即使用",
  "優先サポート",
];

const faqs = [
  {
    q: "無料プランでどこまで使えますか？",
    a: "無料プランでは月3回まで台本を生成できます。機能制限はなく、有料プランと同じ品質の台本が得られます。まずは気軽にお試しください。",
  },
  {
    q: "生成された台本はそのまま使えますか？",
    a: "はい、生成された台本は商用利用を含め自由にお使いいただけます。著作権はお客様に帰属します。",
  },
  {
    q: "クレジットカードなしで試せますか？",
    a: "無料プランはクレジットカード登録不要です。メールアドレスだけで今すぐ始められます。",
  },
  {
    q: "解約はいつでもできますか？",
    a: "はい、マイページのお支払い管理からいつでも解約できます。解約後は次回更新日まで引き続きご利用いただけます。",
  },
  {
    q: "どんなジャンルの台本でも対応できますか？",
    a: "ビジネス・エンタメ・教育・Vlog・料理・ゲームなど、あらゆるジャンルに対応しています。テーマを入力するだけでそのジャンルに最適な台本を生成します。",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── ナビゲーション ── */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold text-indigo-600">ScriptGen AI</span>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="#pricing"
              className="hidden text-sm text-gray-600 hover:text-gray-900 sm:block"
            >
              料金
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ログイン
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              無料で始める
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="border-b">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center md:py-32">
          <span className="inline-block rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-medium text-indigo-700">
            AIによるYouTube台本自動生成
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            AIが台本を。<br />あなたが動画を。
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 md:text-xl">
            テーマを入力するだけで、プロ品質のYouTube台本をAIが瞬時に生成。
            台本作りにかかる時間を90%削減します。
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="w-full rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-500 sm:w-auto"
            >
              無料で始める
            </Link>
            <Link
              href="#pricing"
              className="w-full rounded-lg border border-gray-300 px-8 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              料金を見る
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            クレジットカード不要 · 月3回まで無料
          </p>
        </div>
      </section>

      {/* ── 課題提起 ── */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            台本作りに、毎回3〜4時間かけていませんか？
          </h2>
          <p className="mt-3 text-gray-600">
            多くのYouTuberが抱えるこんな悩み…
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { emoji: "😓", text: "ネタを考えるだけで時間が溶ける" },
              { emoji: "😰", text: "構成がバラバラで視聴者が離脱する" },
              { emoji: "😤", text: "書いても書いても完成しない" },
            ].map(({ emoji, text }) => (
              <div key={text} className="rounded-xl border bg-white p-5">
                <div className="text-3xl">{emoji}</div>
                <p className="mt-2 text-sm font-medium text-gray-700">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-base font-semibold text-indigo-600">
            ScriptGen AI がこの問題をすべて解決します。
          </p>
        </div>
      </section>

      {/* ── 機能紹介 ── */}
      <section className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              ScriptGen AI の特徴
            </h2>
            <p className="mt-2 text-gray-600">台本作りをここまで変える</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-3 text-base font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 使い方 ── */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              使い方はたった3ステップ
            </h2>
            <p className="mt-2 text-gray-600">登録から台本完成まで最短5分</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                  {num}
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/auth/register"
              className="inline-block rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              今すぐ試してみる
            </Link>
          </div>
        </div>
      </section>

      {/* ── 料金 ── */}
      <section id="pricing" className="scroll-mt-16 border-b">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              シンプルな料金プラン
            </h2>
            <p className="mt-2 text-gray-600">
              いつでもアップグレード・解約可能
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-2xl gap-6 sm:grid-cols-2">

            {/* フリープラン */}
            <div className="rounded-xl border bg-white p-8">
              <h3 className="text-lg font-semibold text-gray-900">フリープラン</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">¥0</span>
                <span className="text-sm text-gray-500">/月</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">クレジットカード不要</p>
              <ul className="mt-6 space-y-3">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-gray-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="mt-8 block rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                無料で始める
              </Link>
            </div>

            {/* プロプラン */}
            <div className="relative rounded-xl border-2 border-indigo-600 bg-white p-8">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                おすすめ
              </span>
              <h3 className="text-lg font-semibold text-gray-900">プロプラン</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">¥1,980</span>
                <span className="text-sm text-gray-500">/月</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">いつでも解約可能</p>
              <ul className="mt-6 space-y-3">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-indigo-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="mt-8 block rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-500"
              >
                プロプランを始める
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold text-gray-900 md:text-3xl">
            よくある質問
          </h2>
          <div className="mt-10 space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="rounded-xl border bg-white p-6">
                <h3 className="font-semibold text-gray-900">Q. {q}</h3>
                <p className="mt-2 text-sm text-gray-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 最終CTA ── */}
      <section className="border-b">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            今すぐ台本作りの悩みを解消しましょう
          </h2>
          <p className="mt-4 text-gray-600">
            月3回まで無料。クレジットカード不要。<br />
            30秒で登録完了、すぐに使い始められます。
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="w-full rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-500 sm:w-auto"
            >
              無料アカウントを作成
            </Link>
            <Link
              href="/auth/login"
              className="w-full rounded-lg border border-gray-300 px-8 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              ログインはこちら
            </Link>
          </div>
        </div>
      </section>

      {/* ── フッター ── */}
      <footer className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="font-bold text-indigo-600">ScriptGen AI</span>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="#pricing" className="hover:text-gray-700">料金</Link>
              <Link href="/auth/login" className="hover:text-gray-700">ログイン</Link>
              <Link href="/auth/register" className="hover:text-gray-700">新規登録</Link>
            </div>
            <p className="text-xs text-gray-400">© 2025 ScriptGen AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
