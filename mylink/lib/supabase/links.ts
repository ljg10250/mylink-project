import { createClient } from "@/lib/supabase/client";
import { validateLink } from "@/lib/link-validation";

export type ManagedLink = {
  id: string;
  title: string;
  url: string;
};

const linkColumns = "id,title,url";

export async function loadLinks(userId: string): Promise<ManagedLink[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("links")
    .select(linkColumns)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return data;
}

export async function saveLink(title: string, url: string): Promise<ManagedLink> {
  const errors = validateLink(title, url);
  if (errors.title || errors.url) {
    throw new Error(errors.title ?? errors.url);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("links")
    .insert({ title: title.trim(), url: url.trim() })
    .select(linkColumns)
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function updateLink(
  id: string,
  title: string,
  url: string,
): Promise<ManagedLink> {
  const errors = validateLink(title, url);
  if (errors.title || errors.url) {
    throw new Error(errors.title ?? errors.url);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("links")
    .update({ title: title.trim(), url: url.trim() })
    .eq("id", id)
    .select(linkColumns)
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function deleteLink(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    throw error;
  }
}
