import { NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";

export function apiError(message: string, status: number, err?: unknown): NextResponse {
  if (err != null) {
    console.error(`[API ${status}]`, isDev ? err : (err instanceof Error ? err.message : String(err)));
  }
  return NextResponse.json({ error: message }, { status });
}
