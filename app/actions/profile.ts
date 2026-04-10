"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const PROFILE_IMAGE_BUCKET = "profile-images";
const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const nickname = String(formData.get("nickname") ?? "").trim();
  const profileImageFile = formData.get("profile_image_file");

  if (nickname.length < 1) {
    return { error: "닉네임을 입력해 주세요." };
  }
  if (nickname.length > 40) {
    return { error: "닉네임은 40자 이하여야 합니다." };
  }

  const { data: currentProfile, error: profileReadError } = await supabase
    .from("profiles")
    .select("profile_image_url")
    .eq("id", user.id)
    .single();

  if (profileReadError) {
    return { error: profileReadError.message };
  }

  let nextProfileImageUrl = currentProfile?.profile_image_url ?? null;

  if (profileImageFile instanceof File && profileImageFile.size > 0) {
    if (!profileImageFile.type.startsWith("image/")) {
      return { error: "이미지 파일만 업로드할 수 있어요." };
    }
    if (profileImageFile.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      return { error: "프로필 사진은 5MB 이하만 업로드할 수 있어요." };
    }

    const ext = profileImageFile.name.includes(".")
      ? profileImageFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
      : "jpg";
    const filePath = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(PROFILE_IMAGE_BUCKET)
      .upload(filePath, profileImageFile, {
        upsert: false,
        contentType: profileImageFile.type,
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(PROFILE_IMAGE_BUCKET)
      .getPublicUrl(filePath);

    nextProfileImageUrl = publicUrlData.publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      nickname,
      profile_image_url: nextProfileImageUrl,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/me");
  revalidatePath("/");

  return { success: true as const };
}
