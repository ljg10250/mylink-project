import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LinkManager } from "@/components/link-manager";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "내 링크 관리 | MyLink",
};

export default async function MyPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login");
  }

  return <LinkManager userId={data.user.id} />;
}
