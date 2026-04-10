export const MAX_FREE_ANNIVERSARIES = 3;

export const ANNIVERSARY_CATEGORIES = [
  { value: "birthday", label: "생일" },
  { value: "dating", label: "사귄 날" },
  { value: "wedding", label: "결혼 / 기념" },
  { value: "etc", label: "기타" },
] as const;

export type AnniversaryCategory = (typeof ANNIVERSARY_CATEGORIES)[number]["value"];

export const REPEAT_TYPES = [
  { value: "yearly", label: "매년 반복" },
  { value: "once", label: "1회성" },
] as const;

export type RepeatType = (typeof REPEAT_TYPES)[number]["value"];

export function anniversaryCategoryLabel(value: string): string {
  return (
    ANNIVERSARY_CATEGORIES.find((c) => c.value === value)?.label ?? value
  );
}
