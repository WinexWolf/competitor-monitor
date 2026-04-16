import crypto from 'crypto'

export async function scrapePage(url: string) {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 15000)

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CompetitorMonitor/1.0)',
        'Accept': 'text/html',
      },
      signal: ctrl.signal,
      redirect: 'follow',
    })
    clearTimeout(t)

    if ([403, 429, 503].includes(res.status))
      return { ok: false, blocked: true, error: `HTTP ${res.status} — bot protection` }

    if (!res.ok)
      return { ok: false, error: `HTTP ${res.status}` }

    const html = await res.text()

    // Bail on obvious bot walls
    if (html.length < 5000 && /captcha|cf-chl|access denied/i.test(html))
      return { ok: false, blocked: true, error: 'Bot protection detected' }

    const content = clean(html)
    if (content.length < 50)
      return { ok: false, error: 'Too little text returned' }

    return {
      ok: true,
      content,
      hash: crypto.createHash('sha256').update(content).digest('hex').slice(0, 16),
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: msg.includes('abort') ? 'Timed out' : msg }
  }
}

function clean(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .split('\n').map(l => l.trim()).filter(l => l.length > 3).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 50000)
}
