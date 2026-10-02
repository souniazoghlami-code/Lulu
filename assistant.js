// Vercel Serverless Function: leitet Anfragen des Cockpits an OpenAI weiter.
// Benötigte Umgebungsvariablen in Vercel (Settings → Environment Variables):
//   OPENAI_API_KEY    – dein OpenAI-Schlüssel
//   COCKPIT_PASSWORD  – ein Passwort, das nur du kennst (schützt deinen Schlüssel)
//   OPENAI_MODEL      – optional, z. B. ein aktuelles Modell; Standard siehe unten

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Nur POST" });

  const pass = req.headers["x-cockpit-pass"] || "";
  if (!process.env.COCKPIT_PASSWORD || pass !== process.env.COCKPIT_PASSWORD) {
    return res.status(401).json({ error: "Falsches Passwort" });
  }
  if (!process.env.OPENAI_API_KEY) return res.status(501).json({ error: "OPENAI_API_KEY fehlt" });

  const { messages, json } = req.body || {};
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: "messages fehlt" });

  // Erste Nachricht des Cockpits enthält Rolle + Tageskontext → als System-Nachricht senden.
  const [first, ...rest] = messages;
  const chat = [{ role: "system", content: String(first.content) }, ...rest.map(m => ({
    role: m.role === "assistant" ? "assistant" : "user", content: String(m.content)
  }))];
  if (!rest.length) chat.push({ role: "user", content: "Los geht's." });

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: chat,
      ...(json ? { response_format: { type: "json_object" } } : {})
    })
  });
  if (r.status === 429) return res.status(429).json({ error: "Zu viele Anfragen" });
  if (!r.ok) return res.status(502).json({ error: "KI nicht erreichbar" });
  const data = await r.json();
  return res.status(200).json({ text: data.choices?.[0]?.message?.content || "" });
}
