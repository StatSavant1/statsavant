"use client";

import { supabaseBrowserClient } from "@/lib/supabaseBrowser";

export default async function TestSupabase() {
  const supabase = supabaseBrowserClient();

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .limit(5);

  if (error) {
    return <pre>{error.message}</pre>;
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}


