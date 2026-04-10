"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAnniversary } from "@/app/actions/anniversary";

export function DeleteAnniversaryButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!globalThis.confirm("이 기념일을 삭제할까요?")) {
      return;
    }
    setPending(true);
    const result = await deleteAnniversary(id);
    setPending(false);
    if ("error" in result && result.error) {
      globalThis.alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={pending}
      className="text-sm text-red-600 underline-offset-2 hover:underline disabled:opacity-50 dark:text-red-400"
    >
      {pending ? "삭제 중…" : "삭제"}
    </button>
  );
}
