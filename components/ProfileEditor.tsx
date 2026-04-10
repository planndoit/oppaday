"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateProfile } from "@/app/actions/profile";

type Profile = {
  nickname: string;
  profile_image_url: string | null;
};

export function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const result = await updateProfile(fd);
    setPending(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
      <h2 className="text-lg font-semibold">프로필</h2>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <label htmlFor="nickname" className="text-sm font-medium">
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          required
          maxLength={40}
          defaultValue={profile.nickname}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="profile_image_file" className="text-sm font-medium">
          프로필 사진 (선택)
        </label>
        <input
          id="profile_image_file"
          name="profile_image_file"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            setSelectedFileName(file?.name ?? "");
          }}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          모바일에서는 사진첩에서 고르거나 카메라 촬영 후 업로드할 수 있어요.
        </p>
        {selectedFileName ? (
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            선택한 파일: {selectedFileName}
          </p>
        ) : null}
        {profile.profile_image_url ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            새 파일을 선택하지 않으면 현재 프로필 사진을 유지합니다.
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {pending ? "저장 중…" : "저장"}
      </button>
    </form>
  );
}
