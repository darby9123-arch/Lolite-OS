// Lolite AI uses the keyless free-tier LLM7 endpoint referenced by InferenceMesh's
// provider registry. This direct adapter keeps the deployment dependency-free;
// the full InferenceMesh router itself is not published on npm yet.
const requestBuckets = new Map();

function allowRequest(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string'
    ? forwarded.split(',').map(x => x.trim()).filter(Boolean).at(-1)
    : req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const bucket = requestBuckets.get(ip);
  if (bucket && now - bucket.start < 60_000) {
    if (bucket.count >= 8) return false;
    bucket.count += 1;
  } else {
    requestBuckets.set(ip, { start: now, count: 1 });
  }
  if (requestBuckets.size > 1000) {
    for (const [key, value] of requestBuckets) {
      if (now - value.start >= 60_000) requestBuckets.delete(key);
    }
  }
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      service: 'Lolite AI API',
      configured: true,
      provider: 'LLM7 free tier (InferenceMesh registry)',
      keyRequired: false,
      note: 'Free-tier availability and limits may change.'
    });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Send a POST request.' });
  }
  if (!allowRequest(req)) {
    return res.status(429).json({ error: 'Lolite AI is receiving too many requests. Please wait a minute and try again.' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: 'Invalid JSON request body.' });
  }

  const message = String(body.message || '').trim().slice(0, 8000);
  if (!message) return res.status(400).json({ error: 'Type a message before sending it.' });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const upstream = await fetch('https://api.llm7.io/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // LLM7 documents `unused` as the placeholder credential for anonymous access.
        Authorization: 'Bearer unused'
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'minimax-m2.7',
        messages: [
          {
            role: 'system',
            content: 'You are Lolite AI, the friendly built-in assistant for Lolite OS. Be concise, helpful and age-appropriate. Help with Lolite OS, coding, games, school-safe questions and creative ideas. Never claim to have performed actions you did not perform.'
          },
          { role: 'user', content: message }
        ],
        max_tokens: 1000
      })
    });

    const raw = await upstream.text();
    let data = {};
    try { data = JSON.parse(raw); } catch {}
    if (!upstream.ok) {
      return res.status(upstream.status === 429 ? 429 : 502).json({
        error: upstream.status === 429
          ? 'The free AI service has reached its current limit. Please wait a bit and try again.'
          : 'The free AI provider is temporarily unavailable. Please try again shortly.'
      });
    }

    const output = data.choices?.[0]?.message?.content;
    const text = typeof output === 'string'
      ? output
      : Array.isArray(output)
        ? output.map(part => part.text || '').join('')
        : '';
    if (!text.trim()) {
      return res.status(502).json({ error: 'The free AI provider returned an empty response. Please try again.' });
    }
    return res.status(200).json({ output: text, provider: 'LLM7 free tier' });
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    return res.status(timedOut ? 504 : 503).json({
      error: timedOut
        ? 'The free AI request took too long. Please try again.'
        : 'Could not reach the free AI provider. Please try again shortly.'
    });
  } finally {
    clearTimeout(timer);
  }
}
