import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PublicCalendar } from "@/components/PublicCalendar";
import type { AnniversaryCalendarRow } from "@/lib/calendar";

type SearchParams = { y?: string; m?: string };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const yearRaw = sp.y != null ? Number.parseInt(sp.y, 10) : now.getFullYear();
  const monthRaw =
    sp.m != null ? Number.parseInt(sp.m, 10) : now.getMonth() + 1;
  const year =
    Number.isFinite(yearRaw) && yearRaw >= 1900 && yearRaw <= 2100
      ? yearRaw
      : now.getFullYear();
  const month =
    Number.isFinite(monthRaw) && monthRaw >= 1 && monthRaw <= 12
      ? monthRaw
      : now.getMonth() + 1;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("anniversaries_for_month", {
    p_year: year,
    p_month: month,
  });

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          달력 데이터를 불러오지 못했습니다. Supabase 마이그레이션 적용과 환경
          변수를 확인해 주세요.
          <span className="mt-2 block font-mono text-xs opacity-80">
            {error.message}
          </span>
        </p>
      </main>
    );
  }

  const rows = (data ?? []) as AnniversaryCalendarRow[];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="mb-8 space-y-3 text-center sm:text-left">
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
          공개 기념일 캘린더
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          오빠 오늘 무슨 날인지 몰라?
        </h1>
        <p className="w-full text-base text-zinc-600 dark:text-zinc-400">
          누구나 달력을 구경할 수 있어요. 로그인하면{" "}
          <strong>무료로 3개</strong>까지 기념일을 올릴 수 있어요. 연인, 가족,
          친구의 생일과 기념일을 가볍게 모아 보세요.
        </p>
        <p className="text-sm">
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            구경만 하다가 → 로그인하고 등록하기
          </Link>
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-6">
        <PublicCalendar year={year} month={month} rows={rows} />
      </section>
    </main>
  );
}
