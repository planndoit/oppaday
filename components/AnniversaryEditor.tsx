"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ANNIVERSARY_CATEGORIES,
  REPEAT_TYPES,
} from "@/lib/constants";
import {
  createAnniversary,
  updateAnniversary,
} from "@/app/actions/anniversary";

type Mode = "create" | "edit";

type Initial = {
  id: string;
  title: string;
  event_date: string;
  category: string;
  description: string;
  repeat_type: string;
};

export function AnniversaryEditor(props: {
  mode: Mode;
  initial?: Initial;
  canCreate: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);

    const result =
      props.mode === "create"
        ? await createAnniversary(fd)
        : await updateAnniversary(props.initial!.id, fd);

    setPending(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    router.push("/me");
    router.refresh();
  }

  if (props.mode === "create" && !props.canCreate) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
        무료 등록 한도(3개)에 도달했습니다. 기존 기념일을 삭제한 뒤 다시 시도해
        주세요.
      </p>
    );
  }

  const i = props.initial;

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-lg space-y-4 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800"
    >
      <h1 className="text-xl font-semibold">
        {props.mode === "create" ? "기념일 등록" : "기념일 수정"}
      </h1>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          제목
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={80}
          defaultValue={i?.title}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="event_date" className="text-sm font-medium">
          날짜
        </label>
        <input
          id="event_date"
          name="event_date"
          type="date"
          required
          defaultValue={i?.event_date}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="category" className="text-sm font-medium">
          카테고리
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={i?.category ?? "birthday"}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          {ANNIVERSARY_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          설명 (선택)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={i?.description ?? ""}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">반복</legend>
        <div className="flex flex-wrap gap-4">
          {REPEAT_TYPES.map((r) => (
            <label key={r.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="repeat_type"
                value={r.value}
                defaultChecked={
                  i ? i.repeat_type === r.value : r.value === "yearly"
                }
              />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {pending ? "처리 중…" : props.mode === "create" ? "등록" : "수정"}
      </button>
    </form>
  );
}
