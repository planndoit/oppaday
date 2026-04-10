import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/me");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-8 px-4">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Google 계정으로 로그인하고 기념일을 등록해 보세요. 무료로 3개까지
          등록할 수 있어요.
        </p>
      </div>
      <GoogleLoginButton />
      <p className="text-center text-sm">
        <Link href="/" className="text-zinc-600 underline underline-offset-2 dark:text-zinc-400">
          달력만 구경하기
        </Link>
      </p>
    </main>
  );
}
