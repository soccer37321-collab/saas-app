import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PasswordForm from "./PasswordForm";

export default async function SettingsPage() {
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
        <h1 className="text-lg font-semibold text-gray-900">設定</h1>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 space-y-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">プロフィール</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex gap-4">
              <dt className="w-32 text-gray-500">名前</dt>
              <dd className="text-gray-900">{profile?.full_name ?? "—"}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-32 text-gray-500">メール</dt>
              <dd className="text-gray-900">{user.email}</dd>
            </div>
          </dl>
        </div>

        <PasswordForm />
      </main>
    </div>
  );
}
