import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnniversaryEditor } from "@/components/AnniversaryEditor";

type Props = { params: Promise<{ id: string }> };

export default async function EditAnniversaryPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: row, error } = await supabase
    .from("anniversaries")
    .select("id, user_id, title, event_date, category, description, repeat_type")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  if (row.user_id !== user.id) {
    notFound();
  }

  return (
    <main className="px-4 py-10">
      <AnniversaryEditor
        mode="edit"
        canCreate
        initial={{
          id: row.id,
          title: row.title,
          event_date: row.event_date,
          category: row.category,
          description: row.description ?? "",
          repeat_type: row.repeat_type,
        }}
      />
    </main>
  );
}
