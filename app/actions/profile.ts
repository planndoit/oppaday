"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const nickname = String(formData.get("nickname") ?? "").trim();
  const profileImageUrl = String(formData.get("profile_image_url") ?? "").trim();

  if (nickname.length < 1) {
    return { error: "닉네임을 입력해 주세요." };
  }
  if (nickname.length > 40) {
    return { error: "닉네임은 40자 이하여야 합니다." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      nickname,
      profile_image_url: profileImageUrl.length > 0 ? profileImageUrl : null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/me");
  revalidatePath("/");

  return { success: true as const };
}
