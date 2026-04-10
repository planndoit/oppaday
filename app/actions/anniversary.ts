"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { MAX_FREE_ANNIVERSARIES } from "@/lib/constants";
import type { AnniversaryCategory, RepeatType } from "@/lib/constants";

const CATEGORIES = new Set<AnniversaryCategory>([
  "birthday",
  "dating",
  "wedding",
  "etc",
]);
const REPEATS = new Set<RepeatType>(["yearly", "once"]);

function parseForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const eventDate = String(formData.get("event_date") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const repeatType = String(formData.get("repeat_type") ?? "").trim();

  if (title.length < 1) {
    return { error: "기념일 제목을 입력해 주세요." as const };
  }
  if (title.length > 80) {
    return { error: "제목은 80자 이하여야 합니다." as const };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return { error: "날짜 형식이 올바르지 않습니다." as const };
  }
  if (!CATEGORIES.has(category as AnniversaryCategory)) {
    return { error: "카테고리를 선택해 주세요." as const };
  }
  if (!REPEATS.has(repeatType as RepeatType)) {
    return { error: "반복 유형을 선택해 주세요." as const };
  }
  if (description.length > 2000) {
    return { error: "설명은 2000자 이하여야 합니다." as const };
  }

  return {
    value: {
      title,
      event_date: eventDate,
      category: category as AnniversaryCategory,
      description,
      repeat_type: repeatType as RepeatType,
      is_public: true,
    },
  };
}

export async function createAnniversary(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const parsed = parseForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { count, error: countError } = await supabase
    .from("anniversaries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    return { error: countError.message };
  }
  if (count != null && count >= MAX_FREE_ANNIVERSARIES) {
    return { error: `무료 등록은 ${MAX_FREE_ANNIVERSARIES}개까지 가능합니다.` };
  }

  const { error } = await supabase.from("anniversaries").insert({
    user_id: user.id,
    ...parsed.value,
  });

  if (error) {
    if (error.message.includes("anniversary_limit_exceeded")) {
      return { error: `무료 등록은 ${MAX_FREE_ANNIVERSARIES}개까지 가능합니다.` };
    }
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/me");

  return { success: true as const };
}

export async function updateAnniversary(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const parsed = parseForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase
    .from("anniversaries")
    .update(parsed.value)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/me");

  return { success: true as const };
}

export async function deleteAnniversary(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await supabase
    .from("anniversaries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/me");

  return { success: true as const };
}
