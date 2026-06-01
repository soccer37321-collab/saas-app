import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { theme, duration, language } = await req.json();

  if (!theme || !duration || !language) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const isJapanese = language === "ja";

  const systemPrompt = isJapanese
    ? "あなたはプロのYouTube台本ライターです。視聴者を最後まで引き込む、構成が明確で魅力的な台本を作成してください。"
    : "You are a professional YouTube script writer. Create clear, engaging scripts that keep viewers watching until the end.";

  const userPrompt = isJapanese
    ? `テーマ「${theme}」について、約${duration}分のYouTube動画の台本を作成してください。

以下の構成で書いてください：

## 🎬 フック（0:00〜0:30）
視聴者を最初の30秒で引き込む強力な冒頭

## 📋 イントロダクション（0:30〜1:30）
動画の概要と視聴するメリット

## 📌 メインコンテンツ
テーマに沿った詳細な内容（${duration}分に合わせてセクションを分けてください）

## ✅ まとめ・CTA
重要ポイントの整理と視聴者へのアクション促進（チャンネル登録・いいね等）

ナレーション形式で、自然に話せるように書いてください。`
    : `Create a YouTube script about "${theme}" for approximately ${duration} minutes.

Use the following structure:

## 🎬 Hook (0:00–0:30)
A powerful opening to grab viewers in the first 30 seconds

## 📋 Introduction (0:30–1:30)
Overview of the video and why viewers should keep watching

## 📌 Main Content
Detailed content aligned with the theme (divide into sections appropriate for ${duration} minutes)

## ✅ Conclusion & CTA
Recap of key points and call-to-action (subscribe, like, comment)

Write in a natural conversational tone suitable for narration.`;

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: "claude-opus-4-8",
          max_tokens: 4096,
          thinking: { type: "adaptive" },
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
