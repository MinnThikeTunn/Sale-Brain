import { supabase } from "../utils/supabase";

export async function invokeApi<T = unknown>(
  action: string,
  body: Record<string, unknown> = {},
  query?: Record<string, string>
): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const { data, error } = await supabase.functions.invoke("api", {
    body: { action, ...body, ...query },
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error) throw error;
  return data as T;
}
