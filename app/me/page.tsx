import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditor } from "@/components/ProfileEditor";
import { DeleteAnniversaryButton } from "@/components/DeleteAnniversaryButton";
import { MAX_FREE_ANNIVERSARIES } from "@/lib/constants";
import { anniversaryCategoryLabel } from "@/lib/constants";

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("nickname, profile_image_url")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-red-600">
          프로필을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      </main>
    );
  }

  const { data: anniversaries } = await supabase
    .from("anniversaries")
    .select("id, title, event_date, category, repeat_type, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const list = anniversaries ?? [];
  const remaining = Math.max(0, MAX_FREE_ANNIVERSARIES - list.length);

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          {profile.profile_image_url ? (
            <Image
              src={profile.profile_image_url}
              alt=""
              width={96}
              height={96}
              className="h-24 w-24 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
              unoptimized
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-zinc-300 bg-zinc-100 text-sm text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900">
              사진 없음
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-bold">{profile.nickname}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
        </div>
      </div>

      <ProfileEditor profile={profile} />

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold">내 기념일</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              {list.length} / {MAX_FREE_ANNIVERSARIES} 사용 · 남은 슬롯 {remaining}
            </span>
            {remaining > 0 ? (
              <Link
                href="/anniversaries/new"
                className="rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background"
              >
                새로 등록
              </Link>
            ) : null}
          </div>
        </div>

        {list.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            아직 등록한 기념일이 없어요.
          </p>
        ) : (
          <ul className="space-y-3">
            {list.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800"
              >
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-zinc-500">
                    {a.event_date} · {anniversaryCategoryLabel(a.category)} ·{" "}
                    {a.repeat_type === "yearly" ? "매년" : "1회"}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Link
                    href={`/anniversaries/${a.id}/edit`}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    수정
                  </Link>
                  <DeleteAnniversaryButton id={a.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
