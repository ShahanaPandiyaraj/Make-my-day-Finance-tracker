 // api/finance-ai.js
// Vercel serverless function — the ONLY place the Gemini key ever lives.
// Set GEMINI_API_KEY in Vercel Project Settings → Environment Variables.
// Never put the key in any file under src/.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "Server misconfigured: GEMINI_API_KEY missing" });
  }

  try {
    const { systemInstruction, contents, generationConfig } = req.body;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemInstruction, contents, generationConfig }),
      }
    );

    const data = await geminiRes.json();
    return res.status(geminiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}