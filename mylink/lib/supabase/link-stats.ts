import { createClient } from "@/lib/supabase/client";

export type LinkStat = {
  link_id: string;
  click_count: number;
};

export async function loadLinkStats(linkIds: string[]): Promise<LinkStat[]> {
  if (linkIds.length === 0) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("link_stats")
    .select("link_id,click_count")
    .in("link_id", linkIds)
    .order("click_count", { ascending: false });

  if (error) {
    throw error;
  }
  return data;
}
