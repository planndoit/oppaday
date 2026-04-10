"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnniversaryCalendarRow } from "@/lib/calendar";
import { groupByDay } from "@/lib/calendar";
import { anniversaryCategoryLabel } from "@/lib/constants";

type Props = {
  year: number;
  month: number;
  rows: AnniversaryCalendarRow[];
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function PublicCalendar({ year, month, rows }: Props) {
  const router = useRouter();
  const [openDay, setOpenDay] = useState<number | null>(null);

  const byDay = useMemo(
    () => groupByDay(rows, year, month),
    [rows, year, month]
  );

  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const leading = Array.from({ length: firstWeekday }, (_, i) => (
    <div key={`lead-${i}`} className="min-h-24 border border-transparent p-1" />
  ));

  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const list = byDay.get(day) ?? [];
    const count = list.length;
    const preview = list.slice(0, 2);
    const extra = count - preview.length;

    return (
      <button
        key={day}
        type="button"
        onClick={() => setOpenDay(day)}
        className="flex min-h-24 flex-col gap-1 rounded-lg border border-zinc-100 bg-white p-1.5 text-left transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/80"
      >
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
          {day}
        </span>
        {count === 0 ? (
          <span className="text-[11px] text-zinc-400 dark:text-zinc-600">—</span>
        ) : (
          <div className="flex flex-col gap-0.5 text-[11px] leading-snug">
            {preview.map((ev) => (
              <span
                key={ev.id}
                className="truncate text-zinc-700 dark:text-zinc-300"
              >
                {ev.title}
              </span>
            ))}
            {extra > 0 ? (
              <span className="font-medium text-rose-600 dark:text-rose-400">
                +{extra}개
              </span>
            ) : null}
          </div>
        )}
      </button>
    );
  });

  function shiftMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    router.push(`/?y=${y}&m=${m}`);
  }

  const panelDay = openDay;
  const panelList =
    panelDay != null ? (byDay.get(panelDay) ?? []) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm dark:border-zinc-700"
          aria-label="이전 달"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold tracking-tight">
          {year}년 {month}월
        </h2>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm dark:border-zinc-700"
          aria-label="다음 달"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {leading}
        {cells}
      </div>

      {panelDay != null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="day-panel-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="닫기"
            onClick={() => setOpenDay(null)}
          />
          <div className="relative z-10 flex max-h-[min(80vh,520px)] w-full max-w-md flex-col rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-900">
            <div className="mb-3 flex items-start justify-between gap-2">
              <h3 id="day-panel-title" className="text-base font-semibold">
                {month}월 {panelDay}일 기념일
              </h3>
              <button
                type="button"
                className="rounded-full px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setOpenDay(null)}
              >
                닫기
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {panelList.length === 0 ? (
                <p className="text-sm text-zinc-500">이 날에는 등록된 기념일이 없어요.</p>
              ) : (
                panelList.map((ev) => (
                  <article
                    key={ev.id}
                    className="rounded-xl border border-zinc-100 p-3 dark:border-zinc-800"
                  >
                    <p className="font-medium text-foreground">{ev.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {ev.nickname} · {anniversaryCategoryLabel(ev.category)}
                    </p>
                    {ev.description ? (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {ev.description}
                      </p>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
