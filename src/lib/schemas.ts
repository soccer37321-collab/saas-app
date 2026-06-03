import { z } from "zod";

export const generateScriptSchema = z.object({
  theme: z
    .string()
    .trim()
    .min(1, "テーマを入力してください")
    .max(200, "テーマは200文字以内で入力してください"),
  duration: z.number().int().min(1).max(60),
  language: z.enum(["ja", "en"]),
});

export type GenerateScriptInput = z.infer<typeof generateScriptSchema>;
