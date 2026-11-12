import { createClient } from "@/lib/supabase/client";
import { validateUsername } from "@/lib/profile-validation";

export type ProfileValues = {
  username: string;
  display_name: string;
  bio: string;
  is_public: boolean;
};

export type SavedProfile = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  is_public: boolean | null;
};

const profileColumns = "user_id,username,display_name,bio,is_public";

export async function loadProfile(userId: string): Promise<SavedProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(profileColumns)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
}

export async function saveProfile(
  userId: string,
  values: ProfileValues,
): Promise<SavedProfile> {
  const usernameError = validateUsername(values.username);
  if (usernameError) {
    throw new Error(usernameError);
  }

  // 재시도나 다른 탭의 첫 저장을 반영하도록 저장 직전에 본인 프로필을 확인합니다.
  const existingProfile = await loadProfile(userId);
  const supabase = createClient();
  const changes = {
    username: values.username.trim(),
    display_name: values.display_name.trim(),
    bio: values.bio.trim(),
    is_public: values.is_public,
  };
  const mutation = existingProfile
    ? supabase.from("profiles").update(changes).eq("user_id", userId)
    : supabase.from("profiles").insert(changes);
  const { data, error } = await mutation.select(profileColumns).single();

  if (error) {
    throw error;
  }
  return data;
}
