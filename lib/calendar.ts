import type { RepeatType } from "@/lib/constants";

export type AnniversaryCalendarRow = {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  category: string;
  description: string;
  repeat_type: RepeatType;
  created_at: string;
  nickname: string;
};

export function eventMatchesDay(
  row: AnniversaryCalendarRow,
  year: number,
  month: number,
  day: number
): boolean {
  const d = new Date(`${row.event_date}T12:00:00`);
  if (row.repeat_type === "once") {
    return (
      d.getFullYear() === year &&
      d.getMonth() + 1 === month &&
      d.getDate() === day
    );
  }
  return d.getMonth() + 1 === month && d.getDate() === day;
}

export function groupByDay(
  rows: AnniversaryCalendarRow[],
  year: number,
  month: number
): Map<number, AnniversaryCalendarRow[]> {
  const map = new Map<number, AnniversaryCalendarRow[]>();
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const list = rows
      .filter((r) => eventMatchesDay(r, year, month, day))
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    if (list.length > 0) {
      map.set(day, list);
    }
  }
  return map;
}
