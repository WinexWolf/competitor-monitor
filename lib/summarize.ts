export async function summarizePage(content: string, url: string, label: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) return ''

  // Trim content to ~3000 chars to keep prompt small and fast
  const trimmed = content.slice(0, 3000)

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are summarizing a competitor's web page for a product marketer.

Page: ${label} (${url})

Content:
${trimmed}

Write 2-3 sentences summarizing what this page is about. Focus on: pricing tiers and prices if present, key features, any notable offers or changes. Be specific with numbers. Be concise. No fluff.`
            }]
          }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.2 }
        })
      }
    )

    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
  } catch {
    return ''
  }
}
