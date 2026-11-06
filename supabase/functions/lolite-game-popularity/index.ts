import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const allowedOrigins = new Set([
  "https://darby9123-arch.github.io",
  "https://lolite-os.vercel.app"
]);
const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
const adminKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const admin = adminKey && supabaseUrl
  ? createClient(supabaseUrl, adminKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

// Ephemeral deduplication only: this map isn't written to storage and holds
// random per-page tokens, never names, login IDs, device IDs or IP addresses.
const recent = new Map<string, number>();
const VALID_KEY = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const VALID_SESSION = /^[a-f0-9-]{30,40}$/i;
const restrictedKey = /casino|blackjack|roulette|poker|lottery|gambl|wager|sportsbet|slotmachine/i;

function headers(origin: string | null): HeadersInit {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin)
      ? origin : "https://darby9123-arch.github.io",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey",
    "Access-Control-Max-Age": "600"
  };
}
function json(value: unknown, status = 200, origin: string | null = null): Response {
  return new Response(JSON.stringify(value), { status, headers: headers(origin) });
}
Deno.serve(async req => {
  const origin = req.headers.get("origin");
  if (origin && !allowedOrigins.has(origin))
    return json({ error: "Origin not allowed" }, 403, origin);
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: headers(origin) });
  if (!admin) return json({ error: "Popularity service unavailable" }, 503, origin);
  try {
    if (req.method === "GET") {
      const { data, error } = await admin.rpc("lolite_get_popular_games", { p_days: 30 });
      if (error) throw error;
      const games = (data || []).filter((item: {game_key?: string; launches?: number}) =>
        VALID_KEY.test(item.game_key || "") &&
        !restrictedKey.test(item.game_key || "") &&
        Number.isFinite(Number(item.launches)) && Number(item.launches) > 0
      ).map((item: {game_key: string; launches: number}) => ({
        file: item.game_key,
        plays: Number(item.launches)
      }));
      return json({ periodDays: 30, games }, 200, origin);
    }
    if (req.method === "POST") {
      // Only accept launch reports from the official hosted client.
      if (!origin || !allowedOrigins.has(origin))
        return json({ error: "Play reporting requires the Lolite website" }, 403, origin);
      if (Number(req.headers.get("content-length") || "0") > 2048)
        return json({ error: "Payload too large" }, 413, origin);
      const body = await req.json().catch(() => null);
      const file = typeof body?.file === "string" ? body.file : "";
      const session = typeof body?.session === "string" ? body.session : "";
      if (!VALID_KEY.test(file) || restrictedKey.test(file) || !VALID_SESSION.test(session))
        return json({ error: "Invalid game launch" }, 400, origin);
      const now = Date.now();
      const token = session + "|" + file;
      if ((recent.get(token) || 0) > now)
        return json({ recorded: false, reason: "duplicate" }, 200, origin);
      const { error } = await admin.rpc("lolite_record_game_launch", { p_game_key: file });
      if (error) throw error;
      if (recent.size > 5000) {
        for (const [k, until] of recent) if (until <= now) recent.delete(k);
        if (recent.size > 5000) recent.clear();
      }
      recent.set(token, now + 180_000);
      return json({ recorded: true }, 200, origin);
    }
    return json({ error: "Method not allowed" }, 405, origin);
  } catch (err) {
    console.error("Game popularity storage error", err instanceof Error ? err.message : "Unknown");
    return json({ error: "Popularity service temporarily unavailable" }, 503, origin);
  }
});
