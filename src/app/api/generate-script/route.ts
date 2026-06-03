import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generateScriptSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { apiError } from "@/lib/errors";
import { getClientIp, trackIpAccess } from "@/lib/ip-rate-limit";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const ip = getClientIp(req);
  const { count: ipCount, suspicious, maskedIp } = await trackIpAccess(ip, "generate-script");
  if (suspicious) {
    void logAudit(user.id, "suspicious_ip_generate_script", "generate-script", {
      masked_ip: maskedIp,
      count: ipCount,
    });
  }

  const { allowed, remaining } = await checkRateLimit(user.id, "generate-script");
  if (!allowed) {
    void logAudit(user.id, "rate_limit_exceeded", "generate-script");
    return NextResponse.json(
      { error: "リクエスト上限（1時間に10回）を超えました。しばらくしてから再試行してください。" },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = generateScriptSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }
  const { theme, duration, language } = parsed.data;

  void logAudit(user.id, "generate_script", "generate-script", {
    theme_length: theme.length,
    duration,
    language,
    remaining_quota: remaining,
  });

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
        console.error("[generate-script] stream error:", err);
        void logAudit(user.id, "generate_script_error", "generate-script");
        controller.error(new Error("生成中にエラーが発生しました"));
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-RateLimit-Remaining": String(remaining),
    },
  });
}
