import { createPublicClient } from "@/lib/supabase/public-client";
import { validateUsername } from "@/lib/profile-validation";

export type PublicProfile = {
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
};

export async function loadPublicProfile(username: string): Promise<PublicProfile | null> {
  if (validateUsername(username)) {
    return null;
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id,username,display_name,bio")
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
}
