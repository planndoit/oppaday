import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-foreground">로그인에 실패했어요</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        인증 코드가 만료되었거나 잘못되었을 수 있어요. 다시 시도해 주세요.
      </p>
      <Link
        href="/login"
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
      >
        로그인으로 돌아가기
      </Link>
    </main>
  );
}
