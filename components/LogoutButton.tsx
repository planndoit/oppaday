"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="text-sm text-zinc-600 underline-offset-4 hover:text-foreground hover:underline dark:text-zinc-400"
    >
      로그아웃
    </button>
  );
}
