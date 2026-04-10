import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnniversaryEditor } from "@/components/AnniversaryEditor";
import { MAX_FREE_ANNIVERSARIES } from "@/lib/constants";

export default async function NewAnniversaryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { count } = await supabase
    .from("anniversaries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const canCreate =
    count == null ? true : count < MAX_FREE_ANNIVERSARIES;

  return (
    <main className="px-4 py-10">
      <AnniversaryEditor mode="create" canCreate={canCreate} />
    </main>
  );
}
