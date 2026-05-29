import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OrgPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!org) notFound();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("role, profiles(id, full_name, email)")
    .eq("organization_id", org.id);

  const currentMembership = memberships?.find((m) => {
    const p = m.profiles as unknown as { id: string } | null;
    return p?.id === user.id;
  });

  if (!currentMembership) notFound();

  const isOwnerOrAdmin =
    currentMembership.role === "owner" || currentMembership.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">組織</p>
            <h1 className="text-lg font-semibold text-gray-900">{org.name}</h1>
          </div>
          <a href="/dashboard" className="text-sm text-indigo-600 hover:underline">
            ダッシュボードへ
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-8">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">メンバー一覧</h2>
            {isOwnerOrAdmin && (
              <button
                disabled
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white opacity-50 cursor-not-allowed"
              >
                メンバーを招待
              </button>
            )}
          </div>

          <div className="mt-4 divide-y rounded-xl border bg-white shadow-sm">
            {memberships?.map((m) => {
              const profile = m.profiles as unknown as {
                id: string;
                full_name: string | null;
                email: string;
              } | null;
              return (
                <div
                  key={profile?.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.full_name ?? profile?.email}
                    </p>
                    {profile?.full_name && (
                      <p className="text-xs text-gray-400">{profile.email}</p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      m.role === "owner"
                        ? "bg-indigo-100 text-indigo-700"
                        : m.role === "admin"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {m.role}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {isOwnerOrAdmin && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900">組織設定</h2>
            <div className="mt-4 rounded-xl border bg-white p-6 shadow-sm space-y-3 text-sm">
              <div className="flex gap-4">
                <dt className="w-28 text-gray-500">組織名</dt>
                <dd className="text-gray-900">{org.name}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-28 text-gray-500">スラッグ</dt>
                <dd className="font-mono text-gray-900">{org.slug}</dd>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
