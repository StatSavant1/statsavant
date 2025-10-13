import { supabase } from "../lib/supabaseClient";

export default async function TestSupabase() {
  // query public.players directly
  const { data, error } = await supabase
    .from("players") // table name
    .select("id, name, team, position");

  console.log("Supabase data:", data, "error:", error);

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Supabase Connection Test</h1>

      {error && <p className="text-red-400">❌ {error.message}</p>}

      {!error && (
        <div className="text-left">
          <p className="text-green-400 mb-4">✅ Connected successfully!</p>
          {data && data.length > 0 ? (
            <pre className="bg-gray-900 p-4 rounded text-green-300 text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          ) : (
            <p className="text-yellow-400">⚠️ No player data returned.</p>
          )}
        </div>
      )}
    </main>
  );
}

