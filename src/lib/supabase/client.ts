import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  if (typeof window !== "undefined") {
    console.log("✅ SUPABASE URL (deployed):", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "✅ SUPABASE KEY PREFIX (deployed):",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 25)
    );
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}