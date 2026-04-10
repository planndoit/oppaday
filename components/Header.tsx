import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-zinc-200 bg-background/80 backdrop-blur dark:border-zinc-800">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight text-foreground">
          오빠 오늘 무슨 날인지 몰라?
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link
                href="/me"
                className="text-zinc-600 hover:text-foreground dark:text-zinc-400"
              >
                마이페이지
              </Link>
              <Link
                href="/anniversaries/new"
                className="rounded-full bg-foreground px-3 py-1.5 font-medium text-background hover:opacity-90"
              >
                기념일 등록
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full bg-foreground px-3 py-1.5 font-medium text-background hover:opacity-90"
              >
                로그인
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
