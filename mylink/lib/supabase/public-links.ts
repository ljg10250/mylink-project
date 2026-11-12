import { createPublicClient } from "@/lib/supabase/public-client";

export type PublicLink = {
  id: string;
  title: string;
  url: string;
};

// 공개 여부를 확인한 프로필의 user_id로만 호출합니다.
export async function loadPublicLinks(userId: string): Promise<PublicLink[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("links")
    .select("id,title,url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return data;
}

export async function recordLinkClick(linkId: string): Promise<void> {
  const supabase = createPublicClient();
  const { error } = await supabase.rpc("record_link_click", { p_link_id: linkId });
  if (error) {
    throw error;
  }
}
