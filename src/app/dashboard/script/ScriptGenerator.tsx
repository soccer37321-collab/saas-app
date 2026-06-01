"use client";

import { useState } from "react";

const DURATION_OPTIONS = [3, 5, 10, 15] as const;

export default function ScriptGenerator() {
  const [theme, setTheme] = useState("");
  const [duration, setDuration] = useState<number>(5);
  const [language, setLanguage] = useState<"ja" | "en">("ja");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!theme.trim()) {
      setError(language === "ja" ? "テーマを入力してください" : "Please enter a theme");
      return;
    }

    setError("");
    setScript("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: theme.trim(), duration, language }),
      });

      if (!res.ok || !res.body) {
        throw new Error("台本生成に失敗しました");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setScript((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(script);
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === "ja" ? "テーマ・トピック" : "Theme / Topic"}
          </label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder={
              language === "ja"
                ? "例: AIの仕事への影響、筋トレの始め方..."
                : "e.g. How AI is changing jobs, Beginner's guide to investing..."
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === "ja" ? "動画の長さ" : "Video Length"}
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} {language === "ja" ? "分" : "min"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === "ja" ? "言語" : "Language"}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "ja" | "en")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading
            ? language === "ja"
              ? "生成中..."
              : "Generating..."
            : language === "ja"
            ? "台本を生成する"
            : "Generate Script"}
        </button>
      </div>

      {/* Output */}
      {(script || loading) && (
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              {language === "ja" ? "生成された台本" : "Generated Script"}
            </h2>
            {script && !loading && (
              <button
                onClick={handleCopy}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {language === "ja" ? "コピー" : "Copy"}
              </button>
            )}
          </div>
          <div className="relative">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed max-h-[600px] overflow-y-auto rounded-lg bg-gray-50 p-4">
              {script}
              {loading && (
                <span className="inline-block h-4 w-1 bg-indigo-600 animate-pulse ml-0.5" />
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
